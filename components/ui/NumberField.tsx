'use client';

import { useId } from 'react';

/**
 * A numeric input.
 *
 * The border is the control's only outline, so it uses --color-kale at 9.34:1
 * rather than the decorative --color-rule, which would fail WCAG 1.4.11 for a
 * component boundary. inputmode="decimal" brings up a number pad on a phone
 * without the spinner buttons and scroll-wheel surprises of type="number".
 */
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  error,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Unit shown inside the field, e.g. "ft" or "in". */
  suffix?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
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
      <div className="mt-1 flex items-baseline gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`bg-paper text-ink tabular w-full min-w-0 border-b-2 px-1 py-1.5 text-lg focus:outline-none ${
            error ? 'border-radish' : 'border-kale focus:border-radish'
          }`}
        />
        {suffix ? (
          <span aria-hidden="true" className="text-ink/70 shrink-0 text-sm">
            {suffix}
          </span>
        ) : null}
      </div>
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
