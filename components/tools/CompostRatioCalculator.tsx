'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import {
  calculateCompostRatio,
  type AmountMode,
  type CompostEntry,
} from '@/lib/calculators/compost-ratio';
import { Estimate } from '@/components/ui/Estimate';
import { compostMaterials } from '@/data/compost-materials';
import { poundsToKilograms } from '@/lib/calculators/shared/units';
import { toSignificant } from '@/lib/calculators/shared/round';

const PARAMS = { mode: 'mo', pile: 'pi' } as const;
const KINDS: Record<string, FieldKind> = {};
const DEFAULTS = { mode: 'volume', pile: 'dry-leaves:30|grass-clippings:10' };

/**
 * The pile travels in one query parameter as `slug:amount|slug:amount`, so a
 * whole recipe fits in a shareable link.
 */
function decode(raw: string): CompostEntry[] {
  return raw
    .split('|')
    .filter(Boolean)
    .map((part) => {
      const [materialSlug = '', amount = ''] = part.split(':');
      return { materialSlug, amount: amount === '' ? Number.NaN : Number(amount) };
    });
}

function encode(entries: readonly CompostEntry[]): string {
  return entries
    .map((entry) => `${entry.materialSlug}:${Number.isFinite(entry.amount) ? entry.amount : ''}`)
    .join('|');
}

export function CompostRatioCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: DEFAULTS,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const mode: AmountMode = values.mode === 'weight' ? 'weight' : 'volume';
  const entries = decode(values.pile ?? '');

  function update(index: number, patch: Partial<CompostEntry>) {
    const next = entries.map((entry, position) =>
      position === index ? { ...entry, ...patch } : entry,
    );
    setValue('pile', encode(next));
  }

  function addRow() {
    setValue('pile', encode([...entries, { materialSlug: 'straw', amount: 10 }]));
  }

  function removeRow(index: number) {
    setValue('pile', encode(entries.filter((_, position) => position !== index)));
  }

  const result = useMemo(
    () => calculateCompostRatio({ units, mode, entries }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units, mode, values.pile],
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

  const amountUnit = mode === 'weight' ? (imperial ? 'lb' : 'kg') : imperial ? 'gal' : 'L';

  const verdictWord =
    output?.verdict === 'in-range'
      ? 'about right'
      : output?.verdict === 'too-much-carbon'
        ? 'too much carbon'
        : 'too much nitrogen';

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      resultFirst
      inputsLabel="What is going in the pile"
      waitingMessage="Add the materials going into your pile to see its carbon to nitrogen ratio."
      headline={output ? `${output.cnRatio}:1` : null}
      sentence={
        output ? (
          <>
            <p>
              <strong>{verdictWord.charAt(0).toUpperCase() + verdictWord.slice(1)}.</strong>{' '}
              {output.advice}
            </p>
            {output.suggestion ? (
              <p className="mt-2">
                Adding about{' '}
                <strong>
                  {imperial
                    ? `${output.suggestion.asIsPounds} lb (${output.suggestion.gallons} gallons)`
                    : `${output.suggestion.kilograms} kg (${output.suggestion.liters} liters)`}
                </strong>{' '}
                of {output.suggestion.name.toLowerCase()} would bring it into the {output.targetMin}
                –{output.targetMax}:1 range.
              </p>
            ) : null}
          </>
        ) : null
      }
      copyText={
        output
          ? `Compost pile C:N ratio ${output.cnRatio}:1 (${verdictWord}). Calculated at soilsums.com`
          : ''
      }
      extra={
        output ? (
          <>
            <ResultTable
              caption="What each material contributes"
              columns={['Material', 'Own C:N', 'Weight', 'Carbon', 'Nitrogen', 'Share of N']}
              rows={output.contributions.map((entry, index) => ({
                key: `${entry.materialSlug}-${index}`,
                cells: [
                  `${entry.name} (${entry.category})`,
                  <span key="cn">
                    {entry.range ? `${entry.range[0]}–${entry.range[1]}:1` : `${entry.cnRatio}:1`}
                    {entry.verified ? null : <Estimate what={entry.name.toLowerCase()} />}
                  </span>,
                  imperial
                    ? `${entry.asIsPounds} lb`
                    : `${toSignificant(poundsToKilograms(entry.asIsPounds), 3)} kg`,
                  `${entry.carbonPounds} lb`,
                  `${entry.nitrogenPounds} lb`,
                  `${entry.shareOfNitrogenPercent}%`,
                ],
              }))}
            />
            <p className="text-ink/75 mt-2 text-sm">
              The C:N column shows the published spread, not a single value. Cornell&rsquo;s own
              wording is that its figures &ldquo;should be viewed as representative ranges, not as
              universal values&rdquo;, and Nebraska calls its table &ldquo;only guidelines&rdquo;.
              The arithmetic above uses the middle of each range; a pile built from the top of one
              range and the bottom of another will land somewhere else, which is why the target is a
              band rather than a number.
            </p>
            <p className="text-ink/70 mt-2 text-xs">
              Ratios from the Cornell Waste Management Institute composting tables and the
              University of Nebraska-Lincoln, Garden Compost G2222. Materials marked as estimates
              appear in no allowed source.
            </p>
          </>
        ) : null
      }
    >
      <div className="col-span-2">
        <RadioGroup
          legend="How are you measuring?"
          value={mode}
          onChange={(value) => setValue('mode', value)}
          options={[
            { value: 'volume', label: imperial ? 'By the bucket (gallons)' : 'By volume (liters)' },
            { value: 'weight', label: imperial ? 'By weight (pounds)' : 'By weight (kilograms)' },
          ]}
        />
      </div>

      <div className="col-span-2 space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="border-ink/20 border-t pt-4 first:border-t-0 first:pt-0">
            <div className="grid grid-cols-[2fr_1fr] items-end gap-2 sm:grid-cols-[2fr_1fr_auto]">
              <SelectField
                label={`Material ${index + 1}`}
                value={entry.materialSlug}
                onChange={(value) => update(index, { materialSlug: value })}
                options={compostMaterials.map((material) => ({
                  value: material.slug,
                  label: `${material.name} — ${
                    material.range
                      ? `${material.range[0]}–${material.range[1]}:1`
                      : `${material.cnRatio}:1`
                  }${material.verified ? '' : ' (estimate)'}`,
                }))}
              />
              <NumberField
                label="Amount"
                value={Number.isFinite(entry.amount) ? String(entry.amount) : ''}
                onChange={(value) =>
                  update(index, { amount: value === '' ? Number.NaN : Number(value) })
                }
                suffix={amountUnit}
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
          Add another material
        </button>
      </div>
    </CalculatorFrame>
  );
}
