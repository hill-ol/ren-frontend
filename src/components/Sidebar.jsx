'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const AGENT_COLORS = {
  lex: '#4A7FB5', sol: '#4A9B6F', cleo: '#B57A30', sage: '#6A4AB5', arc: '#B54A70',
};

const NAV = [
  { id: 'chat',       label: 'Chat',        path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'insights',   label: 'Insights',    path: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'memory',     label: 'Memory',      path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'jobs',       label: 'Job tracker', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'onboarding', label: 'Chewy prep',    path: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'interview',  label: 'Interview prep', path: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function Sidebar({
  conversations, currentSessionId, section,
  onSelectConv, onNewChat, onSetSection,
  onDeleteConv, isOpen, onClose,
}) {
  const [search,      setSearch]      = useState('');
  const [confirmDel,  setConfirmDel]  = useState(null); // sessionId to confirm delete

  const filtered = conversations.filter(c =>
    (c.title || c.preview).toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 3600)   return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (confirmDel !== sessionId) { setConfirmDel(sessionId); return; }
    try {
      await fetch(`${API}/conversations/${sessionId}`, { method: 'DELETE' });
      onDeleteConv(sessionId);
      setConfirmDel(null);
    } catch {}
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30
        w-[210px] flex-shrink-0 flex flex-col
        bg-pk-sidebar border-r border-pk-border
        transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo + new chat */}
        <div className="px-4 pt-4 pb-3">
          <div className="font-serif text-xl text-pk-accent tracking-tight mb-3">ren</div>
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-1.5 bg-white border border-pk-border2 rounded-lg text-xs font-medium text-pk-text hover:bg-pk-accent hover:text-white hover:border-pk-accent transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-pk-border rounded-lg text-pk-text placeholder-pk-text3 outline-none focus:border-pk-accent"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-pk-text3 text-center mt-6 px-2">
              {search ? 'No chats match your search' : 'No conversations yet'}
            </p>
          ) : (
            filtered.map(c => {
              const isActive = currentSessionId === c.sessionId && section === 'chat';
              const isConfirming = confirmDel === c.sessionId;
              return (
                <div
                  key={c.sessionId}
                  onClick={() => { onSelectConv(c.sessionId); onClose(); setConfirmDel(null); }}
                  className={`relative px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer group transition-colors
                    ${isActive ? 'bg-white border border-pk-border2' : 'hover:bg-pk-accent'}`}
                >
                  <p className={`text-xs truncate mb-0.5 pr-5 transition-colors
                    ${isActive ? 'text-pk-text' : 'text-pk-text group-hover:text-white'}`}>
                    {c.title || c.preview}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {c.agent && AGENT_COLORS[c.agent] && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: AGENT_COLORS[c.agent] }} />
                    )}
                    <span className={`text-[10px] transition-colors
                      ${isActive ? 'text-pk-text3' : 'text-pk-text3 group-hover:text-white/70'}`}>
                      {fmt(c.updatedAt)}
                    </span>
                  </div>

                  {/* Delete button — shown on hover */}
                  <button
                    onClick={(e) => handleDelete(e, c.sessionId)}
                    className={`absolute right-2 top-2 transition-opacity
                      ${isConfirming
                        ? 'opacity-100 text-red-400'
                        : 'opacity-0 group-hover:opacity-100 text-white/70 hover:text-white'}`}
                    title={isConfirming ? 'Click again to confirm' : 'Delete'}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom nav */}
        <div className="p-2 border-t border-pk-border">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => onSetSection(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium mb-0.5 transition-colors
                ${section === item.id
                  ? 'bg-white text-pk-text border border-pk-border2'
                  : 'text-pk-text hover:bg-pk-accent hover:text-white'}`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}