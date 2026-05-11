'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="bg-white border border-pk-border rounded-[14px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-pk-text3 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-pk-text3 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-pk-text3 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}