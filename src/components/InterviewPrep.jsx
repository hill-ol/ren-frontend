'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORIES = [
  {
    id:    'behavioral',
    label: 'Behavioral',
    icon:  '💬',
    desc:  'STAR-method questions based on your actual projects and experience',
    color: '#B54A70',
    bg:    '#FBF0F4',
  },
  {
    id:    'coding',
    label: 'Coding',
    icon:  '💻',
    desc:  'Medium-difficulty problems calibrated to your stack and skill level',
    color: '#4A7FB5',
    bg:    '#EEF4FB',
  },
  {
    id:    'system_design',
    label: 'System design',
    icon:  '🏗',
    desc:  'Architecture questions scoped for a junior SWE — 20-30 minute problems',
    color: '#6A4AB5',
    bg:    '#F3EEFB',
  },
];

const SCORE_LABELS = {
  1: { label: 'Needs work',  color: '#E24B4A' },
  2: { label: 'Developing',  color: '#BA7517' },
  3: { label: 'Adequate',    color: '#B890A0' },
  4: { label: 'Strong',      color: '#4A9B6F' },
  5: { label: 'Excellent',   color: '#C4607A' },
};

export default function InterviewPrep() {
  const [view,        setView]        = useState('home');   // home | session | history
  const [category,    setCategory]    = useState(null);
  const [sessionId,   setSessionId]   = useState(null);
  const [questionId,  setQuestionId]  = useState(null);
  const [question,    setQuestion]    = useState('');
  const [hint,        setHint]        = useState('');
  const [answer,      setAnswer]      = useState('');
  const [feedback,    setFeedback]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [showHint,    setShowHint]    = useState(false);
  const [history,     setHistory]     = useState(null);
  const [qCount,      setQCount]      = useState(0);

  const startSession = async (cat) => {
    setLoading(true);
    setCategory(cat);
    try {
      const res  = await fetch(`${API}/interview/session`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ category: cat }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setQuestionId(data.questionId);
      setQuestion(data.question);
      setHint(data.hint);
      setAnswer('');
      setFeedback(null);
      setShowHint(false);
      setQCount(1);
      setView('session');
    } catch {
      alert('Could not start session. Is the Ren server running?');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/interview/feedback`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId, questionId, question, answer, category }),
      });
      setFeedback(await res.json());
    } catch {
      alert('Could not get feedback. Is the Ren server running?');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/interview/question`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId, category }),
      });
      const data = await res.json();
      setQuestionId(data.questionId);
      setQuestion(data.question);
      setHint(data.hint);
      setAnswer('');
      setFeedback(null);
      setShowHint(false);
      setQCount(n => n + 1);
    } catch {
      alert('Could not load next question.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/interview/history`);
      setHistory(await res.json());
      setView('history');
    } catch {} finally {
      setLoading(false);
    }
  };

  const cat = CATEGORIES.find(c => c.id === category);

  // ── Home ──────────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-pk-text3">
            Questions are generated fresh each time using your actual projects and skill level.
            Nothing is repeated.
          </p>
          <button
            onClick={loadHistory}
            className="text-xs text-pk-text2 border border-pk-border rounded-lg px-3 py-1.5 hover:border-pk-accent hover:text-pk-accent transition-colors flex-shrink-0 ml-4"
          >
            View history
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => startSession(c.id)}
              disabled={loading}
              className="bg-white border border-pk-border rounded-xl p-5 text-left hover:border-pk-accent transition-colors group disabled:opacity-50"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: c.bg }}
                >
                  {c.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-pk-text">{c.label}</p>
                    <svg
                      className="w-4 h-4 text-pk-text3 group-hover:text-pk-accent transition-colors"
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <p className="text-xs text-pk-text3 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-pk-accent animate-bounce"
                  style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Session ───────────────────────────────────────────────────────────────
  if (view === 'session') {
    return (
      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">{cat?.icon}</span>
            <span className="text-xs font-medium text-pk-text">{cat?.label}</span>
            <span className="text-[10px] text-pk-text3 bg-pk-bg border border-pk-border px-2 py-0.5 rounded-full">
              Question {qCount}
            </span>
          </div>
          <button
            onClick={() => { setView('home'); setFeedback(null); setAnswer(''); }}
            className="text-xs text-pk-text3 hover:text-pk-text"
          >
            End session
          </button>
        </div>

        {/* Question */}
        <div className="bg-white border border-pk-border rounded-xl p-5 mb-4">
          <p className="text-sm leading-relaxed text-pk-text font-serif">{question}</p>
          {hint && (
            <div className="mt-3 pt-3 border-t border-pk-border">
              {showHint ? (
                <p className="text-xs text-pk-text3 leading-relaxed italic">Hint: {hint}</p>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-pk-text3 hover:text-pk-accent transition-colors"
                >
                  Show hint
                </button>
              )}
            </div>
          )}
        </div>

        {/* Answer input — only show if no feedback yet */}
        {!feedback && (
          <div className="mb-4">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={
                category === 'coding'
                  ? 'Write your solution here — code, pseudocode, or explanation...'
                  : category === 'system_design'
                  ? 'Describe your system design — components, data flow, tradeoffs...'
                  : 'Answer using the STAR method — Situation, Task, Action, Result...'
              }
              rows={8}
              className="w-full border border-pk-border2 rounded-xl p-4 text-sm text-pk-text bg-white outline-none focus:border-pk-accent resize-none leading-relaxed font-sans"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                className="px-5 py-2 bg-pk-accent text-white rounded-lg text-xs font-medium hover:bg-pk-accent-dk disabled:opacity-40 transition-colors"
              >
                {loading ? 'Evaluating...' : 'Submit answer'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="space-y-3">
            {/* Score */}
            <div className="bg-white border border-pk-border rounded-xl p-4 flex items-center gap-4">
              <div className="text-center flex-shrink-0">
                <div className="text-2xl font-medium" style={{ color: SCORE_LABELS[feedback.score]?.color }}>
                  {feedback.score}/5
                </div>
                <div className="text-[10px] font-medium mt-0.5" style={{ color: SCORE_LABELS[feedback.score]?.color }}>
                  {SCORE_LABELS[feedback.score]?.label}
                </div>
              </div>
              <div className="flex-1 border-l border-pk-border pl-4">
                <p className="text-xs leading-relaxed text-pk-text2 font-serif">{feedback.feedback}</p>
              </div>
            </div>

            {/* Strengths + improvements */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-pk-border rounded-xl p-4">
                <p className="text-[10px] font-medium text-pk-text3 uppercase tracking-wider mb-2">What worked</p>
                <p className="text-xs text-pk-text2 leading-relaxed">{feedback.strengths}</p>
              </div>
              <div className="bg-white border border-pk-border rounded-xl p-4">
                <p className="text-[10px] font-medium text-pk-text3 uppercase tracking-wider mb-2">To improve</p>
                <p className="text-xs text-pk-text2 leading-relaxed">{feedback.improvements}</p>
              </div>
            </div>

            {/* Model answer */}
            {feedback.modelAnswer && (
              <div className="bg-pk-accent-lt border border-pk-border2 rounded-xl p-4">
                <p className="text-[10px] font-medium text-pk-accent-dk uppercase tracking-wider mb-2">
                  Strong answer would cover
                </p>
                <p className="text-xs text-pk-text2 leading-relaxed">{feedback.modelAnswer}</p>
              </div>
            )}

            {/* Your answer (collapsed) */}
            <details className="bg-white border border-pk-border rounded-xl">
              <summary className="px-4 py-3 text-xs text-pk-text3 cursor-pointer hover:text-pk-text">
                Your answer
              </summary>
              <div className="px-4 pb-4">
                <p className="text-xs text-pk-text2 leading-relaxed whitespace-pre-wrap font-mono">{answer}</p>
              </div>
            </details>

            {/* Next question */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={nextQuestion}
                disabled={loading}
                className="flex-1 py-2.5 bg-pk-accent text-white rounded-lg text-xs font-medium hover:bg-pk-accent-dk disabled:opacity-40 transition-colors"
              >
                {loading ? 'Loading...' : 'Next question'}
              </button>
              <button
                onClick={() => { setView('home'); setFeedback(null); setAnswer(''); }}
                className="px-4 py-2.5 border border-pk-border rounded-lg text-xs text-pk-text2 hover:border-pk-accent hover:text-pk-accent transition-colors"
              >
                End session
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── History ───────────────────────────────────────────────────────────────
  if (view === 'history') {
    const { sessions = [], stats = {} } = history || {};
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-pk-text3">{stats.total || 0} questions practiced</p>
          <button onClick={() => setView('home')} className="text-xs text-pk-text2 hover:text-pk-accent">
            Back
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {CATEGORIES.map(c => (
            <div key={c.id} className="bg-white border border-pk-border rounded-xl p-3 text-center">
              <div className="text-lg mb-1">{c.icon}</div>
              <div className="text-lg font-medium text-pk-text">{stats[c.id] || 0}</div>
              <div className="text-[10px] text-pk-text3">{c.label}</div>
            </div>
          ))}
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white border border-pk-border rounded-xl p-8 text-center">
            <p className="text-sm text-pk-text3">No sessions yet. Start practicing above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s._id} className="bg-white border border-pk-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{CATEGORIES.find(c => c.id === s.category)?.icon}</span>
                    <span className="text-xs font-medium text-pk-text capitalize">
                      {s.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-pk-text3">
                      {s.questions.length} question{s.questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-pk-text3">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {s.questions.map((q, i) => (
                  <div key={i} className="border-t border-pk-border pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
                    <p className="text-xs text-pk-text2 mb-1 line-clamp-2">{q.question}</p>
                    {q.score && (
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: SCORE_LABELS[q.score]?.color }}
                      >
                        {q.score}/5 — {SCORE_LABELS[q.score]?.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}