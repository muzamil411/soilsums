'use client';

import { useId, useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { CropLink } from './CropLink';
import { CropPicker } from './CropPicker';
import type { ToolProps } from './registry';
import { ResultTable } from '@/components/ui/ResultTable';
import { useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculatePlantingDates } from '@/lib/calculators/planting-date';

const PARAMS = { lastFrost: 'lf', fallFrost: 'ff', crops: 'c' } as const;
const KINDS: Record<string, FieldKind> = {};
const DEFAULTS = { lastFrost: '', fallFrost: '', crops: 'tomato,lettuce,carrot' };

/** Formats an ISO date for reading: 3 April 2026 becomes "Fri 3 Apr". */
function readable(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function PlantingDateCalculator({ toolSlug, linkedCrops }: ToolProps) {
  const { values, units, setValue, setUnits, reset } = useToolState({
    imperialDefaults: DEFAULTS,
    params: PARAMS,
    kinds: KINDS,
  });
  const lastFrostId = useId();
  const fallFrostId = useId();

  const selected = (values.crops ?? '').split(',').filter(Boolean);

  const result = useMemo(
    () =>
      calculatePlantingDates({
        lastFrostDate: values.lastFrost ?? '',
        firstFallFrostDate: values.fallFrost ?? '',
        cropSlugs: selected,
      }),
    [values.lastFrost, values.fallFrost, selected],
  );

  const output = result.ok ? result.value : null;
  const dateError = result.ok
    ? undefined
    : result.errors.find((error) => error.field === 'lastFrostDate')?.message;
  const fallError = result.ok
    ? undefined
    : result.errors.find((error) => error.field === 'firstFallFrostDate')?.message;
  const cropError = result.ok
    ? undefined
    : result.errors.find((error) => error.field === 'cropSlugs')?.message;

  const allNotes = output
    ? [...new Set(output.schedules.flatMap((schedule) => schedule.notes))]
    : [];

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      onReset={reset}
      resultFirst
      inputsLabel="Your frost dates and crops"
      waitingMessage="Enter your average last spring frost date and pick a crop or two."
      headline={output ? String(output.schedules.length) : null}
      headlineUnit={
        output ? (output.schedules.length === 1 ? 'crop planned' : 'crops planned') : undefined
      }
      sentence={
        output ? (
          <p>
            Working from a last frost of {readable(output.lastFrostDate)}
            {output.growingSeasonDays
              ? `, and a first fall frost of ${readable(output.firstFallFrostDate)} — a ${output.growingSeasonDays} day season`
              : ''}
            . Treat these as a starting point: an average last frost date is a midpoint, so about
            half of years are later than it. Watch the forecast before anything tender goes out.
          </p>
        ) : null
      }
      copyText={
        output
          ? output.schedules
              .map(
                (schedule) =>
                  `${schedule.name}: sow indoors ${schedule.sowIndoors ?? '—'}, transplant ${schedule.transplant ?? '—'}, direct sow ${schedule.directSow ?? '—'}`,
              )
              .join('\n') + '\nCalculated at soilsums.com'
          : ''
      }
      notes={allNotes}
      extra={
        output && output.schedules.length > 0 ? (
          <ResultTable
            caption="Your planting calendar"
            columns={['Crop', 'Start indoors', 'Transplant out', 'Direct sow', 'Likely harvest']}
            rows={output.schedules.map((schedule) => ({
              key: schedule.slug,
              cells: [
                <CropLink
                  key="name"
                  slug={schedule.slug}
                  name={schedule.name}
                  linkedCrops={linkedCrops}
                />,
                readable(schedule.sowIndoors),
                readable(schedule.transplant),
                readable(schedule.directSow),
                schedule.harvestStart
                  ? `${readable(schedule.harvestStart)} to ${readable(schedule.harvestEnd)}`
                  : '—',
              ],
            }))}
          />
        ) : null
      }
    >
      <div>
        <label htmlFor={lastFrostId} className="block text-sm font-semibold">
          Average last spring frost
        </label>
        <input
          id={lastFrostId}
          type="date"
          value={values.lastFrost ?? ''}
          onChange={(event) => setValue('lastFrost', event.target.value)}
          aria-invalid={dateError ? true : undefined}
          className={`bg-paper text-ink mt-1 w-full border-2 px-2 py-2 text-base focus:outline-none ${
            dateError ? 'border-radish' : 'border-kale focus:border-radish'
          }`}
        />
        <p className="text-ink/70 mt-1 text-xs">
          Not sure? <a href="#faq">Where to find your frost date</a>
        </p>
        {dateError && (values.lastFrost ?? '') !== '' ? (
          <p className="text-radish mt-1 text-sm font-semibold">{dateError}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fallFrostId} className="block text-sm font-semibold">
          Average first fall frost (optional)
        </label>
        <input
          id={fallFrostId}
          type="date"
          value={values.fallFrost ?? ''}
          onChange={(event) => setValue('fallFrost', event.target.value)}
          aria-invalid={fallError ? true : undefined}
          className={`bg-paper text-ink mt-1 w-full border-2 px-2 py-2 text-base focus:outline-none ${
            fallError ? 'border-radish' : 'border-kale focus:border-radish'
          }`}
        />
        <p className="text-ink/70 mt-1 text-xs">
          Adding it flags anything that will not ripen in time
        </p>
        {fallError ? <p className="text-radish mt-1 text-sm font-semibold">{fallError}</p> : null}
      </div>

      <div className="col-span-2">
        <CropPicker
          legend="Which crops?"
          selected={selected}
          onChange={(slugs) => setValue('crops', slugs.join(','))}
        />
        {cropError ? <p className="text-radish mt-2 text-sm font-semibold">{cropError}</p> : null}
      </div>
    </CalculatorFrame>
  );
}
