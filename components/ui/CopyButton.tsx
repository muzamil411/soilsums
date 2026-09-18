'use client';

import { useEffect, useState } from 'react';

/**
 * Copies text to the clipboard. Falls back to a "press Ctrl+C" hint when the
 * clipboard is blocked, which is what a page served over plain http gets.
 *
 * `text` may be a function, for text that is only worth building when the
 * reader actually asks for it — the share link, which reads `window.location`.
 */
export function CopyButton({
  text,
  label = 'Copy result',
  disabled = false,
}: {
  text: string | (() => string);
  label?: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
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
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : label}
      </span>
    </button>
  );
}
