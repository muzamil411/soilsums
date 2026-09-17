'use client';

import { useId } from 'react';

export type SelectOption = { value: string; label: string };

/** A dropdown. Border colour follows the same 3:1 rule as NumberField. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  error?: string;
  hint?: string;
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
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`bg-paper text-ink mt-1 w-full border-2 px-2 py-2 text-base focus:outline-none ${
          error ? 'border-radish' : 'border-kale focus:border-radish'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
