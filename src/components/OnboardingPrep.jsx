'use client';
import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SECTIONS = [
  { key: 'firstWeek',     label: 'First week',       icon: '🗓' },
  { key: 'companyIntel',  label: 'Company intel',     icon: '🏢' },
  { key: 'learningPlan',  label: 'Learning plan',     icon: '📚' },
  { key: 'ninetyDayPlan', label: '30-60-90 day plan', icon: '📈' },
];

export default function OnboardingPrep() {
  const [status,   setStatus]   = useState('idle'); // idle | loading | done | error
  const [progress, setProgress] = useState('');
  const [result,   setResult]   = useState(null);
  const [activeTab, setActiveTab] = useState('firstWeek');

  const run = async () => {
    setStatus('loading');
    setProgress('Starting up...');
    setResult(null);

    try {
      const res = await fetch(`${API}/onboarding/chewy`);
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.type === 'progress') setProgress(parsed.payload);
            if (parsed.type === 'result') { setResult(parsed.payload); setStatus('done'); }
            if (parsed.type === 'error')  setStatus('error');
          } catch {}
        }
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">

      {status === 'idle' && (
        <div className="max-w-lg mx-auto mt-8">
          <div className="bg-white border border-pk-border rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🐾</div>
            <h2 className="text-base font-medium text-pk-text mb-2">Chewy co-op prep</h2>
            <p className="text-sm text-pk-text2 mb-6 leading-relaxed">
              Cleo will research Chewy engineering, Lex will build your learning plan,
              Arc will map your first 90 days, and Ren will put it all together.
              Takes about 30 seconds.
            </p>
            <button
              onClick={run}
              className="px-6 py-2.5 bg-pk-accent text-white rounded-lg text-sm font-medium hover:bg-pk-accent-dk transition-colors"
            >
              Build my prep pack
            </button>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="max-w-lg mx-auto mt-8">
          <div className="bg-white border border-pk-border rounded-xl p-6 text-center">
            <div className="flex gap-1.5 justify-center mb-4">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-pk-accent animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
            <p className="text-sm text-pk-text2">{progress}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-lg mx-auto mt-8">
          <div className="bg-white border border-pk-border rounded-xl p-6 text-center">
            <p className="text-sm text-pk-text2 mb-4">Something went wrong. Make sure the Ren server is running.</p>
            <button onClick={() => setStatus('idle')} className="text-xs text-pk-accent hover:underline">Try again</button>
          </div>
        </div>
      )}

      {status === 'done' && result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-pk-text">Your Chewy prep pack</p>
              <p className="text-xs text-pk-text3">Generated {new Date(result.generatedAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => { setStatus('idle'); setResult(null); }}
              className="text-xs text-pk-text3 hover:text-pk-text border border-pk-border rounded-lg px-3 py-1.5"
            >
              Regenerate
            </button>
          </div>

          {/* Tab nav */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {SECTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveTab(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${activeTab === s.key
                    ? 'bg-pk-accent text-white'
                    : 'bg-white border border-pk-border text-pk-text2 hover:border-pk-accent hover:text-pk-accent'}`}
              >
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white border border-pk-border rounded-xl p-5">
            <MarkdownRenderer content={result[activeTab]} />
          </div>
        </div>
      )}
    </div>
  );
}