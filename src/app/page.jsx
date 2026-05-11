'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InsightsPanel from '../components/InsightsPanel';
import MemoryPanel from '../components/MemoryPanel';
import JobTracker from '../components/JobTracker';
import OnboardingPrep from '../components/OnboardingPrep';
import InterviewPrep from '../components/InterviewPrep';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [section,          setSection]         = useState('chat');
  const [conversations,    setConversations]    = useState([]);
  const [currentSessionId, setCurrentSessionId]= useState(null);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      setConversations(await res.json());
    } catch {}
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const handleDeleteConv = (sessionId) => {
    setConversations(prev => prev.filter(c => c.sessionId !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setSection('chat');
    }
  };

  const TITLES = {
    chat:       { title: 'Chat',           sub: currentSessionId ? 'Talking to Ren' : 'Start a new conversation' },
    insights:   { title: 'Agent insights', sub: 'What each agent has been working on' },
    memory:     { title: 'Memory',         sub: 'What Ren knows about you' },
    jobs:       { title: 'Job tracker',    sub: 'Arc uses this to give you better career advice' },
    onboarding:  { title: 'Chewy prep',      sub: 'Your personalized co-op onboarding pack' },
    interview:   { title: 'Interview prep',   sub: 'Practice behavioral, coding, and system design questions' },
  };

  const { title, sub } = TITLES[section] || TITLES.chat;

  return (
    <div className="flex h-screen bg-pk-bg overflow-hidden">
      <Sidebar
        conversations={conversations}
        currentSessionId={currentSessionId}
        section={section}
        onSelectConv={(id) => { setCurrentSessionId(id); setSection('chat'); }}
        onNewChat={() => { setCurrentSessionId(null); setSection('chat'); setSidebarOpen(false); }}
        onDeleteConv={handleDeleteConv}
        onSetSection={setSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-pk-border flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-pk-text2 hover:text-pk-accent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-medium text-pk-text">{title}</h1>
            <p className="text-xs text-pk-text3">{sub}</p>
          </div>
        </header>

        {section === 'chat'       && <ChatWindow sessionId={currentSessionId} onNewSession={id => { setCurrentSessionId(id); loadConversations(); }} onConversationUpdate={loadConversations} />}
        {section === 'insights'   && <InsightsPanel />}
        {section === 'memory'     && <MemoryPanel />}
        {section === 'jobs'       && <JobTracker />}
        {section === 'onboarding'  && <OnboardingPrep />}
        {section === 'interview'   && <InterviewPrep />}
      </main>
    </div>
  );
}