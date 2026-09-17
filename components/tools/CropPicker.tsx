'use client';

import { crops } from '@/data/crops';

/**
 * A checkbox list of crops. Used by the planting date calculator, where the
 * reader wants several crops at once and a multi-select dropdown on a phone is
 * miserable.
 */
export function CropPicker({
  selected,
  onChange,
  legend,
}: {
  selected: readonly string[];
  onChange: (slugs: string[]) => void;
  legend: string;
}) {
  function toggle(slug: string) {
    onChange(
      selected.includes(slug)
        ? selected.filter((candidate) => candidate !== slug)
        : [...selected, slug],
    );
  }

  return (
    <fieldset>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <legend className="text-sm font-semibold">{legend}</legend>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-kale text-xs font-semibold underline"
          >
            Clear all
          </button>
        ) : null}
      </div>
      <div className="border-ink/15 mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto border p-1.5">
        {crops.map((crop) => {
          const checked = selected.includes(crop.slug);
          return (
            <label
              key={crop.slug}
              className={`cursor-pointer border px-2 py-1 text-sm ${
                checked ? 'border-kale bg-kale text-paper font-semibold' : 'border-ink/40 text-ink'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(crop.slug)}
                className="sr-only"
              />
              {crop.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
