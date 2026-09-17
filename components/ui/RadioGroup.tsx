'use client';

import { useId } from 'react';

export type RadioOption = { value: string; label: string };

/**
 * A small set of choices, shown as segments rather than dots so they stay easy
 * to hit with a thumb. The selected segment is filled kale; the unselected
 * ones carry a kale border, which keeps every boundary above 3:1.
 */
export function RadioGroup({
  legend,
  value,
  onChange,
  options,
  name,
}: {
  legend: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly RadioOption[];
  name?: string;
}) {
  const id = useId();
  const groupName = name ?? id;

  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`cursor-pointer border-2 px-3 py-1.5 text-sm ${
                checked ? 'border-kale bg-kale text-paper font-semibold' : 'border-kale text-ink'
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
