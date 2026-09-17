'use client';

import { useEffect, useState } from 'react';

/** Copies the result text. Falls back silently if the clipboard is blocked. */
export function CopyButton({ text, disabled = false }: { text: string; disabled?: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      className="border-kale text-kale border-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
    >
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : 'Copy result'}
      </span>
    </button>
  );
}
