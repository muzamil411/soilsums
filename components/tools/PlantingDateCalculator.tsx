'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { CropLink } from './CropLink';
import { CropPicker } from './CropPicker';
import type { ToolProps } from './registry';
import { DateField } from '@/components/ui/DateField';
import { ResultTable } from '@/components/ui/ResultTable';
import { useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculatePlantingDates } from '@/lib/calculators/planting-date';

const PARAMS = { lastFrost: 'lf', fallFrost: 'ff', crops: 'c' } as const;
const KINDS: Record<string, FieldKind> = {};
const DEFAULTS = { lastFrost: '', fallFrost: '', crops: 'tomato,lettuce,carrot' };

/** Formats an ISO date for reading: 3 April 2026 becomes "Fri 3 Apr". */
function readable(iso: string | null, whyNot?: string | null): string {
  // A blank cell reads as missing data. Every crop that skips a step says why.
  if (!iso) return whyNot ?? 'Not used for this crop';
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
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: DEFAULTS,
    params: PARAMS,
    kinds: KINDS,
  });

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
      shareUrl={shareUrl}
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
            . An average last frost date is a midpoint, so roughly half of years have a frost after
            it — give anything tender a week or two beyond the dates below, and keep fleece to hand.
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
                readable(schedule.sowIndoors, schedule.sowIndoorsWhyNot),
                readable(schedule.transplant, schedule.transplantWhyNot),
                readable(schedule.directSow, schedule.directSowWhyNot),
                schedule.harvestStart
                  ? `${readable(schedule.harvestStart)} to ${readable(schedule.harvestEnd)}`
                  : 'No days-to-maturity figure for a perennial',
              ],
            }))}
          />
        ) : null
      }
    >
      <DateField
        label="Average last spring frost"
        value={values.lastFrost ?? ''}
        onChange={(value) => setValue('lastFrost', value)}
        error={(values.lastFrost ?? '') !== '' ? dateError : undefined}
        hint={<a href="#faq">Not sure? Where to find your frost date</a>}
      />

      <DateField
        label="Average first fall frost (optional)"
        value={values.fallFrost ?? ''}
        onChange={(value) => setValue('fallFrost', value)}
        error={fallError}
        hint="Adding it flags anything that will not ripen in time"
      />

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
