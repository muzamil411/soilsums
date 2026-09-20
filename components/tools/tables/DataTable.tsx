import type { ReactNode } from 'react';

/**
 * The shared shell for every table that is generated from a data file.
 *
 * MDX tables get their scroll container from the `table` override in
 * mdx-components.tsx. These components render their own `<table>`, so they
 * have to carry the same wrapper or they would be the only tables on the site
 * that overflow a phone screen instead of scrolling.
 */
export function DataTable({
  columns,
  align = [],
  children,
}: {
  columns: readonly string[];
  /** Per-column alignment; anything omitted is left-aligned. */
  align?: readonly ('left' | 'right')[];
  children: ReactNode;
}) {
  return (
    <div className="my-5 overflow-x-auto">
      <table>
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
