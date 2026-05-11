'use client';
import MarkdownRenderer from './MarkdownRenderer';
import VenueCard from './VenueCard';

const AGENT_COLORS = {
  lex:  '#4A7FB5', sol:  '#4A9B6F', cleo: '#B57A30',
  sage: '#6A4AB5', arc:  '#B54A70', ren:  '#7A6050',
};

const AGENT_NAMES = {
  lex: 'Lex', sol: 'Sol', cleo: 'Cleo',
  sage: 'Sage', arc: 'Arc', ren: 'Ren',
};

export default function Message({ role, content, agent, venue }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-pk-accent text-white rounded-[14px] rounded-br-[4px] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  const agentColor = agent ? AGENT_COLORS[agent] : '#7A6050';
  const agentName  = agent ? AGENT_NAMES[agent]  : null;

  return (
    <div className="flex flex-col items-start mb-4">
      {agentName && (
        <span
          className="text-[10px] font-medium uppercase tracking-wider mb-1"
          style={{ color: agentColor }}
        >
          {agentName}
        </span>
      )}
      {/* Text bubble */}
      <div className="max-w-[75%] bg-white border border-pk-border rounded-[14px] rounded-bl-[4px] px-4 py-2.5 text-pk-text">
        <MarkdownRenderer content={content} />
      </div>
      {/* VenueCard sits OUTSIDE the bubble so it isn't constrained by the bubble's padding and max-width */}
      {venue && (
        <div className="w-[75%]">
          <VenueCard venue={venue} />
        </div>
      )}
    </div>
  );
}