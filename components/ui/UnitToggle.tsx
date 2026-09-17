'use client';

import type { UnitSystem } from '@/lib/calculators/shared/units';

/**
 * Imperial or metric. Switching converts the values already in the form, so
 * the physical quantity stays the same, and the choice is remembered for every
 * tool on the site.
 */
export function UnitToggle({
  units,
  onChange,
}: {
  units: UnitSystem;
  onChange: (units: UnitSystem) => void;
}) {
  // Generic labels, because not every tool measures a length — some are in
  // gallons, pounds or quarts.
  const options: { value: UnitSystem; label: string; full: string }[] = [
    { value: 'imperial', label: 'Imperial', full: 'Imperial: feet, inches, pounds, gallons' },
    { value: 'metric', label: 'Metric', full: 'Metric: meters, centimeters, kilograms, liters' },
  ];

  return (
    <div role="group" aria-label="Units" className="border-kale inline-flex border-2">
      {options.map((option) => {
        const active = option.value === units;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={option.full}
            className={`px-3 py-1 text-sm ${
              active ? 'bg-kale text-paper font-semibold' : 'text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
