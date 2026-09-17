import type { ReactNode } from 'react';

/**
 * A stamped notice. `caution` carries the ochre ink used for soil-test and
 * unverified-data warnings; `note` is a plain aside.
 */
export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: 'note' | 'caution';
  title?: string;
  children: ReactNode;
}) {
  const border = tone === 'caution' ? 'border-ochre' : 'border-kale';
  const text = tone === 'caution' ? 'text-ochre' : 'text-kale';
  return (
    <aside className={`my-6 border-l-4 ${border} bg-paper py-3 pr-3 pl-4`}>
      {title ? <p className={`font-display text-base ${text}`}>{title}</p> : null}
      <div className="text-ink/90 text-sm [&>p+p]:mt-2">{children}</div>
    </aside>
  );
}
