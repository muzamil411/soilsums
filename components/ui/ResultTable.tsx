import type { ReactNode } from 'react';

/**
 * A small results table. Hairlines use the decorative --color-rule, which is
 * legal here: a table border is decoration, not a control boundary.
 */
export function ResultTable({
  caption,
  columns,
  rows,
}: {
  caption?: string;
  columns: readonly string[];
  rows: readonly { key: string; cells: readonly ReactNode[] }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption ? (
          <caption className="mb-1 text-left text-sm font-semibold">{caption}</caption>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-rule border px-2 py-1 text-left font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) => (
                <td
                  key={index}
                  className={`border-rule border px-2 py-1 ${index === 0 ? '' : 'tabular'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
