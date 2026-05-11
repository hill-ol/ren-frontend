'use client';
import { useEffect, useState } from 'react';
import { getAgentActivity } from '../lib/api';

const AGENTS = [
  { id: 'lex',  name: 'Lex',  role: 'Coding mentor',    icon: '🎓', color: '#4A7FB5', bg: '#EEF4FB' },
  { id: 'sol',  name: 'Sol',  role: 'Life & creativity', icon: '🧭', color: '#4A9B6F', bg: '#EEF7F2' },
  { id: 'cleo', name: 'Cleo', role: 'Research curator',  icon: '🔖', color: '#B57A30', bg: '#FBF5EE' },
  { id: 'sage', name: 'Sage', role: 'Academic tutor',    icon: '📐', color: '#6A4AB5', bg: '#F3EEFB' },
  { id: 'arc',  name: 'Arc',  role: 'Career strategy',   icon: '📈', color: '#B54A70', bg: '#FBF0F4' },
  { id: 'ren',  name: 'Ren',  role: 'Orchestrator',      icon: '👑', color: '#7A6050', bg: '#F7F2F0' },
];

export default function InsightsPanel() {
  const [activity, setActivity] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getAgentActivity()
      .then(data => setActivity(data))
      .catch(() => setActivity(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map(a => {
          const data = activity?.[a.id] || {};
          return (
            <div key={a.id} className="bg-white border border-pk-border rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: a.bg }}
                >
                  {a.icon}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-pk-text">{a.name}</p>
                  <p className="text-[11px] text-pk-text3">{a.role}</p>
                </div>
              </div>
              <p className="text-[11px] text-pk-text2 mb-2">
                {loading ? '...' : `${data.count ?? 0} interactions this month`}
              </p>
              <div className="flex flex-wrap gap-1">
                {(data.topics || a.defaultTopics || []).map(t => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-pk-border bg-pk-bg text-pk-text2"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}