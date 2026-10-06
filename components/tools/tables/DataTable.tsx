import type { ReactNode } from 'react';

/**
 * The shared shell for every table that is generated from a data file.
 *
 * MDX tables get their scroll container from the `table` override in
 * mdx-components.tsx. These components render their own `<table>`, so they
 * have to carry the same wrapper or they would be the only tables on the site
 * that overflow a phone screen instead of scrolling.
 *
 * A wide table with `table-layout: auto` can force page-level horizontal
 * overflow in some browsers even inside an `overflow-x: auto` wrapper, because
 * the auto layout's content-driven width leaks into the document's scroll
 * width. Passing `widths` switches the table to `table-layout: fixed` with
 * explicit column widths, which keeps the table scrollable inside its own
 * container without affecting the page.
 */
export function DataTable({
  columns,
  align = [],
  widths = [],
  children,
  scrollLabel,
}: {
  columns: readonly string[];
  /** Per-column alignment; anything omitted is left-aligned. */
  align?: readonly ('left' | 'right')[];
  /**
   * Fixed column widths (e.g. ['112px', '64px']). Implies table-layout: fixed,
   * which prevents wide content from forcing page-level overflow on narrow
   * screens. Omit for the default auto layout.
   */
  widths?: readonly string[];
  /**
   * Accessible label for the scrollable region, e.g. "Seeding rates by grass
   * type". Makes the container focusable so keyboard users can scroll it.
   */
  scrollLabel?: string;
  children: ReactNode;
}) {
  const fixed = widths.length > 0;
  return (
    <div
      className="my-5 overflow-x-auto"
      {...(scrollLabel
        ? { role: 'region', 'aria-label': scrollLabel, tabIndex: 0 }
        : {})}
    >
      <table
        className={fixed ? 'table-fixed' : undefined}
        // Contain layout so a wide table's content-driven width does not leak
        // into the document's scroll width on narrow screens (Firefox quirk).
        style={fixed ? { contain: 'layout' } : undefined}
      >
        {fixed ? (
          <colgroup>
            {widths.map((width, index) => (
              <col key={columns[index] ?? index} style={{ width }} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={column} style={{ textAlign: align[index] ?? 'left' }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/**
 * A cell whose figure is absent for a reason.
 *
 * `short` renders a dash with the reason available to a screen reader and on
 * hover. A wide table of crops needs it: spelling out "not transplanted — sow
 * where it will grow" in every blank cell makes the table unreadable on a
 * phone, and the crop's own page carries the reasons in full.
 */
export function NotApplicable({ reason, short = false }: { reason: string; short?: boolean }) {
  if (short) {
    return (
      <span className="text-ink/60" title={reason}>
        <span aria-hidden="true">&mdash;</span>
        <span className="sr-only">{reason}</span>
      </span>
    );
  }
  return <span className="text-ink/60 text-sm">{reason}</span>;
}
