'use client';
import { useEffect, useRef, useState } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import VenueCard from './VenueCard';
import { getMessages } from '../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const AGENT_COLORS = {
  lex: '#4A7FB5', sol: '#4A9B6F', cleo: '#B57A30', sage: '#6A4AB5', arc: '#B54A70',
};

export default function ChatWindow({ sessionId, onNewSession, onConversationUpdate }) {
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState('');
  const [isStreaming,    setIsStreaming]     = useState(false);
  const [streamingText,  setStreamingText]  = useState('');
  const [streamingAgent, setStreamingAgent] = useState(null);
  const [streamingVenue, setStreamingVenue] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const bottomRef         = useRef(null);
  const streamingAgentRef = useRef(null);
  const streamingVenueRef = useRef(null);

  useEffect(() => {
    if (!sessionId) { setMessages([]); return; }
    setLoading(true);
    getMessages(sessionId, 50)
      .then(data => setMessages(data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsStreaming(true);
    setStreamingText('');
    setStreamingAgent(null);
    setStreamingVenue(null);
    streamingAgentRef.current = null;
    streamingVenueRef.current = null;

    let fullText     = '';
    let newSessionId = sessionId;

    try {
      const res = await fetch(`${API}/chat/stream`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

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
            if (parsed.sessionId) newSessionId = parsed.sessionId;
            if (parsed.token) { fullText += parsed.token; setStreamingText(fullText); }
            if (parsed.agent) {
              streamingAgentRef.current = parsed.agent;
              setStreamingAgent(parsed.agent);
            }
            if (parsed.venue) {
              console.log('[ChatWindow] Venue received:', parsed.venue.name);
              streamingVenueRef.current = parsed.venue;
              setStreamingVenue(parsed.venue);
            }
          } catch (e) {
            if (raw !== '[DONE]') console.error('[ChatWindow] Parse error:', e.message);
          }
        }
      }

      // Capture refs BEFORE finally block clears them
      const finalAgent = streamingAgentRef.current;
      const finalVenue = streamingVenueRef.current;
      console.log('[ChatWindow] Finalizing. agent:', finalAgent, 'venue:', finalVenue?.name);

      if (fullText) {
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: fullText,
          agent:   finalAgent,
          venue:   finalVenue,
        }]);
      }
      if (!sessionId && newSessionId) onNewSession(newSessionId);
      onConversationUpdate();

    } catch (e) {
      console.error('[ChatWindow] Stream error:', e);
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: "Something went wrong. Make sure the Ren server is running on port 3000.",
      }]);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      setStreamingAgent(null);
      setStreamingVenue(null);
      streamingAgentRef.current = null;
      streamingVenueRef.current = null;
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!sessionId && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="font-serif text-3xl text-pk-accent">ren</div>
          <p className="text-xs text-pk-text3">What's on your mind?</p>
        </div>
        <InputBar input={input} setInput={setInput} handleKey={handleKey} send={send} isStreaming={isStreaming} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-pk-text3 animate-bounce"
              style={{ animationDelay: `${i*150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} agent={m.agent} venue={m.venue} />
        ))}

        {isStreaming && streamingText && (
          <div className="flex flex-col items-start mb-4">
            {streamingAgent && (
              <span
                className="text-[10px] font-medium uppercase tracking-wider mb-1"
                style={{ color: AGENT_COLORS[streamingAgent] || '#7A6050' }}
              >
                {streamingAgent.charAt(0).toUpperCase() + streamingAgent.slice(1)}
              </span>
            )}
            <div className="max-w-[75%] bg-white border border-pk-border rounded-[14px] rounded-bl-[4px] px-4 py-2.5 text-sm leading-relaxed text-pk-text">
              {streamingText}
              <span className="inline-block w-0.5 h-3.5 bg-pk-accent ml-0.5 animate-pulse align-middle" />
            </div>
            {streamingVenue && (
              <div className="w-[75%]">
                <VenueCard venue={streamingVenue} />
              </div>
            )}
          </div>
        )}

        {isStreaming && !streamingText && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <InputBar input={input} setInput={setInput} handleKey={handleKey} send={send} isStreaming={isStreaming} />
    </div>
  );
}

function InputBar({ input, setInput, handleKey, send, isStreaming }) {
  return (
    <div className="px-5 py-3.5 border-t border-pk-border bg-white flex-shrink-0">
      <div className="flex gap-2.5 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message Ren..."
          rows={1}
          className="flex-1 resize-none rounded-[20px] px-4 py-2.5 text-sm bg-pk-accent text-white placeholder-white/60 outline-none border border-pk-accent focus:border-pk-accent-dk min-h-[40px] max-h-[120px] font-sans leading-relaxed"
          style={{ overflowY: 'auto' }}
        />
        <button
          onClick={send}
          disabled={isStreaming || !input.trim()}
          className="w-9 h-9 rounded-full bg-pk-accent-dk text-white flex items-center justify-center flex-shrink-0 hover:bg-pk-text disabled:opacity-40 transition-colors"
        >
          {isStreaming ? (
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}