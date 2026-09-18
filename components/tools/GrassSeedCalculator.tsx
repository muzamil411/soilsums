'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateGrassSeed, type SeedingPurpose } from '@/lib/calculators/grass-seed';
import { grassSeedRates } from '@/data/grass-seed-rates';

const PARAMS = { area: 'a', grass: 'g', purpose: 'pu' } as const;
const KINDS: Record<string, FieldKind> = { area: 'area' };
const IMPERIAL = { area: '5000', grass: 'tall-fescue', purpose: 'new-lawn' };

export function GrassSeedCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const purpose: SeedingPurpose = values.purpose === 'overseed' ? 'overseed' : 'new-lawn';

  const result = useMemo(
    () =>
      calculateGrassSeed({
        units,
        area: num(values, 'area'),
        grassSlug: values.grass ?? '',
        purpose,
      }),
    [units, values, purpose],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const headline = output ? (imperial ? output.pounds : output.kilograms) : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'lb of seed' : 'kg of seed'}
      sentence={
        output ? (
          <p>
            Buy about{' '}
            <strong>
              {imperial ? `${output.pounds} pounds` : `${output.kilograms} kilograms`}
            </strong>{' '}
            of {output.grassName.toLowerCase()} seed for{' '}
            {imperial
              ? `${output.areaSquareFeet} square feet`
              : `${output.areaSquareMeters} square meters`}
            . That is the {purpose === 'new-lawn' ? 'full establishment' : 'overseeding'} rate of{' '}
            {output.rateLbPer1000SqFt} lb per 1,000 sq ft
            {imperial ? '' : ` (${output.rateKgPer100SqM} kg per 100 m²)`}. Sow half in one
            direction and half at right angles to it — that covers the gaps a single pass leaves.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.pounds} lb (${output.kilograms} kg) of ${output.grassName} seed for ${output.areaSquareFeet} sq ft. Calculated at soilsums.com`
          : ''
      }
      notes={output ? [output.note] : []}
    >
      <NumberField
        label="Lawn area"
        value={values.area ?? ''}
        onChange={(value) => setValue('area', value)}
        suffix={imperial ? 'sq ft' : 'm²'}
        error={errors.area}
      />

      <SelectField
        label="Grass type"
        value={values.grass ?? ''}
        onChange={(value) => setValue('grass', value)}
        options={grassSeedRates.map((rate) => ({
          value: rate.slug,
          label: `${rate.name} — ${rate.season} season`,
        }))}
        error={errors.grass}
      />

      <div className="col-span-2">
        <RadioGroup
          legend="What are you doing?"
          value={purpose}
          onChange={(value) => setValue('purpose', value)}
          options={[
            { value: 'new-lawn', label: 'Seeding bare soil' },
            { value: 'overseed', label: 'Overseeding existing grass' },
          ]}
        />
      </div>
    </CalculatorFrame>
  );
}
