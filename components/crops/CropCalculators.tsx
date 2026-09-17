'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { NumberField } from '@/components/ui/NumberField';
import { UnitToggle } from '@/components/ui/UnitToggle';
import { useUnits } from '@/lib/hooks/useUnits';
import { calculatePlantSpacing } from '@/lib/calculators/plant-spacing';
import { calculatePlantingDates } from '@/lib/calculators/planting-date';
import { calculateGardenYield } from '@/lib/calculators/garden-yield';
import { inchesToCentimeters } from '@/lib/calculators/shared/units';
import type { Crop } from '@/data/crops';

/**
 * The three calculators that matter for a single crop, in miniature and
 * already filled in for it: how many fit, when to sow, what you will harvest.
 *
 * They call the same pure functions as the full tools in lib/calculators, so a
 * crop page and a tool page can never disagree. Each panel links to the full
 * tool for anyone who wants the rest of its options.
 */
function readable(iso: string | null): string {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

function toNumber(raw: string): number {
  if (raw.trim() === '') return Number.NaN;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function CropCalculators({ crop }: { crop: Crop }) {
  const [units, setUnits] = useUnits();
  const imperial = units === 'imperial';

  const [bedLength, setBedLength] = useState(imperial ? '8' : '2.4');
  const [bedWidth, setBedWidth] = useState(imperial ? '4' : '1.2');
  const [frostDate, setFrostDate] = useState('');
  const [plants, setPlants] = useState('6');

  function changeUnits(next: typeof units) {
    if (next === units) return;
    // Keep the bed the same size rather than relabelling the numbers.
    const toMetric = next === 'metric';
    const convert = (raw: string) => {
      const value = toNumber(raw);
      if (!Number.isFinite(value)) return raw;
      const converted = toMetric ? value * 0.3048 : value / 0.3048;
      return String(Math.round(converted * 100) / 100);
    };
    setBedLength(convert(bedLength));
    setBedWidth(convert(bedWidth));
    setUnits(next);
  }

  const spacing = useMemo(
    () =>
      calculatePlantSpacing({
        units,
        bedLength: toNumber(bedLength),
        bedWidth: toNumber(bedWidth),
        plantSpacing: imperial
          ? crop.spacingInches
          : Math.round(inchesToCentimeters(crop.spacingInches)),
        rowSpacing: imperial
          ? crop.rowSpacingInches
          : Math.round(inchesToCentimeters(crop.rowSpacingInches)),
        layout: 'square',
      }),
    [units, imperial, bedLength, bedWidth, crop],
  );

  const dates = useMemo(
    () =>
      calculatePlantingDates({
        lastFrostDate: frostDate,
        cropSlugs: [crop.slug],
      }),
    [frostDate, crop.slug],
  );

  const yields = useMemo(
    () =>
      calculateGardenYield({
        units,
        entries: [{ cropSlug: crop.slug, mode: 'plants', quantity: toNumber(plants) }],
      }),
    [units, plants, crop.slug],
  );

  const schedule = dates.ok ? dates.value.schedules[0] : undefined;
  const line = yields.ok ? yields.value.lines[0] : undefined;
  const lowerName = crop.name.toLowerCase();

  return (
    <div className="graph-paper border-ink/20 border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Work it out for your garden</h2>
        <UnitToggle units={units} onChange={changeUnits} />
      </div>

      <div className="divide-ink/15 divide-y">
        <section className="pb-4">
          <h3 className="font-display text-base">How many {lowerName} plants fit in your bed?</h3>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <NumberField
              label="Bed length"
              value={bedLength}
              onChange={setBedLength}
              suffix={imperial ? 'ft' : 'm'}
              error={
                !spacing.ok
                  ? spacing.errors.find((error) => error.field === 'bedLength')?.message
                  : undefined
              }
            />
            <NumberField
              label="Bed width"
              value={bedWidth}
              onChange={setBedWidth}
              suffix={imperial ? 'ft' : 'm'}
              error={
                !spacing.ok
                  ? spacing.errors.find((error) => error.field === 'bedWidth')?.message
                  : undefined
              }
            />
          </div>
          <p className="mt-2 text-sm" aria-live="polite">
            {spacing.ok ? (
              <>
                <strong className="tabular text-lg">{spacing.value.totalPlants}</strong> plants at{' '}
                {crop.spacingInches} inch spacing — {spacing.value.rows} row
                {spacing.value.rows === 1 ? '' : 's'} of {spacing.value.plantsPerRow}.{' '}
                <Link
                  href={`/tools/plant-spacing-calculator/?c=${crop.slug}`}
                  className="font-semibold"
                >
                  Try staggered rows
                </Link>
              </>
            ) : (
              'Enter your bed size.'
            )}
          </p>
        </section>

        <section className="py-4">
          <h3 className="font-display text-base">Sowing dates for {lowerName}</h3>
          <div className="mt-2">
            <label className="block text-sm font-semibold" htmlFor="crop-frost-date">
              Your average last spring frost
            </label>
            <input
              id="crop-frost-date"
              type="date"
              value={frostDate}
              onChange={(event) => setFrostDate(event.target.value)}
              className="bg-paper text-ink border-kale focus:border-radish mt-1 w-full max-w-xs border-2 px-2 py-2 text-base focus:outline-none"
            />
          </div>
          <div className="mt-2 text-sm" aria-live="polite">
            {schedule ? (
              <ul className="space-y-1">
                {crop.timingNote ? (
                  <li className="text-ochre">{crop.timingNote}</li>
                ) : (
                  <>
                    <li>
                      Start indoors: <strong>{readable(schedule.sowIndoors)}</strong>
                    </li>
                    <li>
                      Transplant out: <strong>{readable(schedule.transplant)}</strong>
                    </li>
                    <li>
                      Direct sow: <strong>{readable(schedule.directSow)}</strong>
                    </li>
                    {schedule.harvestStart ? (
                      <li>
                        Likely harvest:{' '}
                        <strong>
                          {readable(schedule.harvestStart)} to {readable(schedule.harvestEnd)}
                        </strong>
                      </li>
                    ) : null}
                  </>
                )}
              </ul>
            ) : (
              <p>
                Enter your frost date for {lowerName} sowing dates, or use the{' '}
                <Link
                  href={`/tools/planting-date-calculator/?c=${crop.slug}`}
                  className="font-semibold"
                >
                  full planting date calculator
                </Link>{' '}
                for a whole season.
              </p>
            )}
          </div>
        </section>

        <section className="pt-4">
          <h3 className="font-display text-base">What will you harvest?</h3>
          <div className="mt-2 max-w-[10rem]">
            <NumberField
              label={`${crop.name} plants`}
              value={plants}
              onChange={setPlants}
              error={
                !yields.ok
                  ? yields.errors.find((error) => error.field.endsWith('quantity'))?.message
                  : undefined
              }
            />
          </div>
          <p className="mt-2 text-sm" aria-live="polite">
            {line ? (
              <>
                <strong className="tabular text-lg">
                  {imperial ? `${line.lowLb}–${line.highLb} lb` : `${line.lowKg}–${line.highKg} kg`}
                </strong>{' '}
                over the season, from {line.perPlantLowLb}–{line.perPlantHighLb} lb per plant.{' '}
                <Link
                  href={`/tools/garden-yield-estimator/?pl=${crop.slug}:${plants}`}
                  className="font-semibold"
                >
                  Add other crops
                </Link>
              </>
            ) : (
              'Enter how many plants you are growing.'
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
