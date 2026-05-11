'use client';

/**
 * MarkdownRenderer.jsx
 *
 * Lightweight markdown renderer for agent outputs.
 * Handles: h1/h2/h3, bold, horizontal rules, bullet lists, code blocks, paragraphs.
 * No external dependencies — keeps the bundle small.
 */

function parseBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function parseInline(text) {
  // bold + inline code
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-pk-bg border border-pk-border rounded px-1 py-0.5 text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const lines  = content.split('\n');
  const output = [];
  let   i      = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      output.push(
        <pre key={i} className="bg-pk-surface2 border border-pk-border rounded-lg p-3 my-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      output.push(
        <h1 key={i} className="text-base font-semibold text-pk-text mt-5 mb-2 first:mt-0">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++; continue;
    }

    // H2
    if (line.startsWith('## ')) {
      output.push(
        <h2 key={i} className="text-sm font-semibold text-pk-text mt-4 mb-1.5 first:mt-0">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith('### ')) {
      output.push(
        <h3 key={i} className="text-xs font-semibold text-pk-text2 uppercase tracking-wider mt-3 mb-1 first:mt-0">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      output.push(<hr key={i} className="border-pk-border my-4" />);
      i++; continue;
    }

    // Bullet list — collect consecutive items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      output.push(
        <ul key={i} className="my-2 space-y-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-pk-accent mt-1.5 flex-shrink-0 text-[8px]">●</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list — collect consecutive items
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      let   num   = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      output.push(
        <ol key={i} className="my-2 space-y-1 list-none">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-pk-accent font-medium flex-shrink-0 text-xs mt-0.5 min-w-[16px]">{j+1}.</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line — skip (spacing handled by margins)
    if (line.trim() === '') {
      i++; continue;
    }

    // Regular paragraph
    output.push(
      <p key={i} className="text-sm leading-relaxed text-pk-text my-1.5">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className={className}>{output}</div>;
}