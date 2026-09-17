import type { ReactNode } from 'react';

/**
 * A pencil rule across the page with the section name sitting on it, the way a
 * heading is written across a notebook line. Sentence case, never uppercase.
 */
export function SectionRule({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="mt-12 mb-5 flex items-center gap-3 font-sans text-sm font-semibold tracking-normal"
    >
      <span className="whitespace-nowrap">{children}</span>
      <span aria-hidden="true" className="bg-rule h-px flex-1" />
    </h2>
  );
}
