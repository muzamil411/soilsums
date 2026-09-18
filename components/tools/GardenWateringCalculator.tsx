'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { ResultTable } from '@/components/ui/ResultTable';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateGardenWatering } from '@/lib/calculators/garden-watering';

const PARAMS = { area: 'a', waterPerWeek: 'wk', rainfall: 'rn' } as const;

const KINDS: Record<string, FieldKind> = {
  area: 'area',
  waterPerWeek: 'rainfall',
  rainfall: 'rainfall',
};

const IMPERIAL = { area: '100', waterPerWeek: '1', rainfall: '0' };
const METRIC = { area: '9.3', waterPerWeek: '25', rainfall: '0' };

export function GardenWateringCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    metricDefaults: METRIC,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';

  const result = useMemo(
    () =>
      calculateGardenWatering({
        units,
        area: num(values, 'area'),
        waterPerWeek: num(values, 'waterPerWeek'),
        rainfall: num(values, 'rainfall'),
      }),
    [units, values],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const headline = output ? (imperial ? output.gallons : output.liters) : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'gallons this week' : 'liters this week'}
      sentence={
        output ? (
          output.rainfallCoveredIt ? (
            <p>
              <strong>No watering needed this week.</strong> The rain you have recorded already
              meets the target. Push a finger a few inches into the soil before you decide — a heavy
              shower on dry ground can run straight off.
            </p>
          ) : (
            <p>
              Give the bed about{' '}
              <strong>{imperial ? `${output.gallons} gallons` : `${output.liters} liters`}</strong>{' '}
              over the week — that is {output.netInches} inches of water after rainfall, or roughly{' '}
              {imperial
                ? `${output.gallonsPerSession} gallons`
                : `${output.litersPerSession} liters`}{' '}
              in each of two deep soakings. Two soakings a week wet the soil six inches down, where
              roots will follow it; daily sprinkling keeps them in the top inch.
            </p>
          )
        ) : null
      }
      copyText={
        output
          ? `${output.gallons} gallons (${output.liters} L) this week for ${output.areaSquareFeet} sq ft. Calculated at soilsums.com`
          : ''
      }
      notes={output ? output.notes : []}
      extra={
        output ? (
          <ResultTable
            caption="How the figure breaks down"
            columns={['', 'Amount']}
            rows={[
              {
                key: 'target',
                cells: [
                  'Weekly target',
                  imperial ? `${values.waterPerWeek} in` : `${values.waterPerWeek} mm`,
                ],
              },
              {
                key: 'rain',
                cells: [
                  'Rain already received',
                  imperial ? `${values.rainfall} in` : `${values.rainfall} mm`,
                ],
              },
              {
                key: 'net',
                cells: [
                  'Still to give',
                  imperial ? `${output.netInches} in` : `${output.netMillimeters} mm`,
                ],
              },
              {
                key: 'total',
                cells: [
                  'Water needed',
                  imperial ? `${output.gallons} US gal` : `${output.liters} L`,
                ],
              },
              {
                key: 'per',
                cells: [
                  'Per soaking, twice a week',
                  imperial ? `${output.gallonsPerSession} US gal` : `${output.litersPerSession} L`,
                ],
              },
            ]}
          />
        ) : null
      }
    >
      <NumberField
        label="Garden area"
        value={values.area ?? ''}
        onChange={(value) => setValue('area', value)}
        suffix={imperial ? 'sq ft' : 'm²'}
        error={errors.area}
      />

      <NumberField
        label="Water per week"
        value={values.waterPerWeek ?? ''}
        onChange={(value) => setValue('waterPerWeek', value)}
        suffix={imperial ? 'in' : 'mm'}
        error={errors.waterPerWeek}
        hint={
          imperial ? 'One inch a week suits most vegetables' : '25 mm a week suits most vegetables'
        }
      />

      <NumberField
        label="Rain so far this week"
        value={values.rainfall ?? ''}
        onChange={(value) => setValue('rainfall', value)}
        suffix={imperial ? 'in' : 'mm'}
        error={errors.rainfall}
        hint="A straight-sided jar in the open makes a serviceable rain gauge"
      />
    </CalculatorFrame>
  );
}
