'use client';

import { useId, type ReactNode } from 'react';

/**
 * A date input styled to match NumberField: the same bottom rule, the same
 * type size, the same focus treatment. A browser's own date control arrives
 * with a box border and its own font, which looked like an unfinished form
 * next to the other fields.
 *
 * The border is the control's only outline, so it uses --color-kale at 9.34:1
 * rather than the decorative --color-rule, per WCAG 1.4.11.
 */
export function DateField({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
}) {
  const id = useId();
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`bg-paper text-ink tabular mt-1 w-full border-b-2 px-1 py-1.5 text-lg focus:outline-none ${
          error ? 'border-radish' : 'border-kale focus:border-radish'
        }`}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-ink/70 mt-1 text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-radish mt-1 text-sm font-semibold">
          {error}
        </p>
      ) : null}
    </div>
  );
}
