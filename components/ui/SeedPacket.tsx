import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The core card of the site: a printed seed packet. A solid kale band across
 * the top carries the catalogue number, a hairline keyline bounds the stock,
 * and a radish rule separates the blurb from the call to action. Depth comes
 * from the keyline and the band, not from a drop shadow.
 *
 * With no `href` the packet renders as an unlinked stock card — used for a
 * tool whose calculator and written content are not both finished yet, so the
 * site never links to a page that does not exist.
 */
export function SeedPacket({
  no,
  title,
  children,
  href,
  action = 'Open',
  compact = false,
}: {
  no?: string;
  title: string;
  children?: ReactNode;
  href?: string;
  action?: string;
  compact?: boolean;
}) {
  return (
    <article
      // The background is always solid, so a packet reads as paper stock
      // wherever it sits.
      className={`bg-paper relative flex h-full flex-col border ${
        href ? 'border-ink/25' : 'border-ink/15'
      }`}
    >
      <div
        className={`flex items-baseline justify-between px-3 py-1.5 ${
          href ? 'bg-kale text-paper' : 'bg-kale/45 text-paper'
        }`}
      >
        <span className="font-display text-sm">{no ?? ''}</span>
        <span aria-hidden="true" className={`h-2 w-8 ${href ? 'bg-radish' : 'bg-radish/40'}`} />
      </div>
      <div className={`flex flex-1 flex-col ${compact ? 'gap-1 p-3' : 'gap-2 p-4'}`}>
        <h3 className={compact ? 'text-base' : 'text-lg'}>
          {href ? (
            <Link href={href} className="hover:text-radish text-ink no-underline">
              {title}
            </Link>
          ) : (
            <span className="text-ink/75">{title}</span>
          )}
        </h3>
        {children ? <p className="text-ink/80 flex-1 text-sm">{children}</p> : null}
        <div aria-hidden="true" className={`mt-1 h-px w-10 ${href ? 'bg-radish' : 'bg-rule'}`} />
        <p className={`text-sm font-semibold ${href ? 'text-kale' : 'text-ink/55'}`}>
          {href ? action : 'Being built'}
        </p>
      </div>
      {/* The whole packet is clickable; the visible link above keeps the
          accessible name and keyboard focus on real text. */}
      {href ? (
        <Link href={href} className="absolute inset-0" tabIndex={-1} aria-hidden="true" />
      ) : null}
    </article>
  );
}
