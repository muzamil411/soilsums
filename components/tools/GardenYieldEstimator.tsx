'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { CropLink } from './CropLink';
import type { ToolProps } from './registry';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import {
  calculateGardenYield,
  type YieldEntry,
  type YieldEntryMode,
} from '@/lib/calculators/garden-yield';
import { crops } from '@/data/crops';

const PARAMS = { mode: 'mo', plot: 'pl' } as const;
const KINDS: Record<string, FieldKind> = {};
const DEFAULTS = { mode: 'plants', plot: 'tomato:4|zucchini:2|lettuce:12' };

function decode(raw: string, mode: YieldEntryMode): YieldEntry[] {
  return raw
    .split('|')
    .filter(Boolean)
    .map((part) => {
      const [cropSlug = '', quantity = ''] = part.split(':');
      return { cropSlug, mode, quantity: quantity === '' ? Number.NaN : Number(quantity) };
    });
}

function encode(entries: readonly YieldEntry[]): string {
  return entries
    .map((entry) => `${entry.cropSlug}:${Number.isFinite(entry.quantity) ? entry.quantity : ''}`)
    .join('|');
}

export function GardenYieldEstimator({ toolSlug, linkedCrops }: ToolProps) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: DEFAULTS,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const mode: YieldEntryMode = values.mode === 'row-length' ? 'row-length' : 'plants';
  const entries = decode(values.plot ?? '', mode);

  function update(index: number, patch: Partial<YieldEntry>) {
    setValue(
      'plot',
      encode(
        entries.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)),
      ),
    );
  }

  function addRow() {
    setValue('plot', encode([...entries, { cropSlug: 'carrot', mode, quantity: 10 }]));
  }

  function removeRow(index: number) {
    setValue('plot', encode(entries.filter((_, position) => position !== index)));
  }

  const result = useMemo(
    () => calculateGardenYield({ units, entries }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units, mode, values.plot],
  );

  const output = result.ok ? result.value : null;
  const formError = result.ok
    ? undefined
    : result.errors.find((error) => error.field === 'entries')?.message;
  const rowErrors = result.ok
    ? {}
    : Object.fromEntries(
        result.errors
          .filter((error) => error.field.startsWith('entries.'))
          .map((error) => [error.field.split('.')[1], error.message]),
      );

  const allNotes = output ? [...new Set(output.lines.flatMap((line) => line.notes))] : [];
  const quantityUnit = mode === 'plants' ? undefined : imperial ? 'ft' : 'm';

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      resultFirst
      inputsLabel="What you are growing"
      waitingMessage="Add the crops you are growing and how many of each."
      headline={output ? `${output.totalLowLb}–${output.totalHighLb}` : null}
      headlineUnit={imperial ? 'lb of harvest' : undefined}
      sentence={
        output ? (
          <p>
            From {output.totalPlants} plant{output.totalPlants === 1 ? '' : 's'}, expect somewhere
            between{' '}
            <strong>
              {imperial
                ? `${output.totalLowLb} and ${output.totalHighLb} pounds`
                : `${output.totalLowKg} and ${output.totalHighKg} kilograms`}
            </strong>{' '}
            over the season. Plan against the low figure: the high one assumes a good variety, full
            sun and picking every two or three days, which is the single largest lever on the total.
          </p>
        ) : null
      }
      copyText={
        output
          ? `Estimated harvest: ${output.totalLowLb}–${output.totalHighLb} lb (${output.totalLowKg}–${output.totalHighKg} kg) from ${output.totalPlants} plants. Calculated at soilsums.com`
          : ''
      }
      notes={allNotes}
      extra={
        output && output.lines.length > 0 ? (
          <ResultTable
            caption="Crop by crop"
            columns={[
              'Crop',
              'Plants',
              'Per plant',
              imperial ? 'Low to high (lb)' : 'Low to high (kg)',
            ]}
            rows={output.lines.map((line, index) => ({
              key: `${line.cropSlug}-${index}`,
              cells: [
                <CropLink
                  key="name"
                  slug={line.cropSlug}
                  name={line.name}
                  linkedCrops={linkedCrops}
                />,
                line.plants,
                `${line.perPlantLowLb}–${line.perPlantHighLb} lb`,
                imperial ? `${line.lowLb}–${line.highLb}` : `${line.lowKg}–${line.highKg}`,
              ],
            }))}
          />
        ) : null
      }
    >
      <div className="col-span-2">
        <RadioGroup
          legend="How are you counting?"
          value={mode}
          onChange={(value) => setValue('mode', value)}
          options={[
            { value: 'plants', label: 'By the plant' },
            { value: 'row-length', label: imperial ? 'By row feet' : 'By row meters' },
          ]}
        />
      </div>

      <div className="col-span-2 space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="border-ink/20 border-t pt-4 first:border-t-0 first:pt-0">
            <div className="grid grid-cols-[2fr_1fr] items-end gap-2 sm:grid-cols-[2fr_1fr_auto]">
              <SelectField
                label={`Crop ${index + 1}`}
                value={entry.cropSlug}
                onChange={(value) => update(index, { cropSlug: value })}
                options={crops.map((crop) => ({
                  value: crop.slug,
                  label: `${crop.name} — ${crop.yieldPerPlantLb[0]}–${crop.yieldPerPlantLb[1]} lb each`,
                }))}
              />
              <NumberField
                label={mode === 'plants' ? 'How many plants' : 'Row length'}
                value={Number.isFinite(entry.quantity) ? String(entry.quantity) : ''}
                onChange={(value) =>
                  update(index, { quantity: value === '' ? Number.NaN : Number(value) })
                }
                suffix={quantityUnit}
                error={rowErrors[String(index)]}
              />
              {entries.length > 1 ? (
                <div className="col-span-2 text-right sm:col-span-1 sm:text-left">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-radish text-sm font-semibold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {formError ? <p className="text-radish text-sm font-semibold">{formError}</p> : null}

        <button
          type="button"
          onClick={addRow}
          className="border-kale text-kale border-2 px-3 py-1.5 text-sm font-semibold"
        >
          Add another crop
        </button>
      </div>
    </CalculatorFrame>
  );
}
