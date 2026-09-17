'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateFertilizer, type Nutrient } from '@/lib/calculators/fertilizer';

const PARAMS = {
  area: 'a',
  n: 'n',
  p: 'p',
  k: 'k',
  nutrient: 'nu',
  targetRate: 'r',
} as const;

const KINDS: Record<string, FieldKind> = {
  area: 'area',
  targetRate: 'rate',
};

const IMPERIAL = {
  area: '400',
  n: '10',
  p: '10',
  k: '10',
  nutrient: 'nitrogen',
  targetRate: '1',
};

const NUTRIENTS = [
  { value: 'nitrogen', label: 'Nitrogen (the first number)' },
  { value: 'phosphate', label: 'Phosphate (the second number)' },
  { value: 'potash', label: 'Potash (the third number)' },
];

const NUTRIENT_NAMES: Record<Nutrient, string> = {
  nitrogen: 'nitrogen',
  phosphate: 'phosphate',
  potash: 'potash',
};

export function FertilizerCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset } = useToolState({
    imperialDefaults: IMPERIAL,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const nutrient = (NUTRIENTS.map((option) => option.value) as string[]).includes(
    values.nutrient ?? '',
  )
    ? (values.nutrient as Nutrient)
    : 'nitrogen';

  const result = useMemo(
    () =>
      calculateFertilizer({
        units,
        area: num(values, 'area'),
        label: { n: num(values, 'n'), p: num(values, 'p'), k: num(values, 'k') },
        nutrient,
        targetRate: num(values, 'targetRate'),
      }),
    [units, values, nutrient],
  );

  const errors = errorMap(result, values);
  // The calculator names label fields label.n / label.p / label.k.
  const labelErrors: Record<string, string | undefined> = result.ok
    ? {}
    : Object.fromEntries(
        result.errors
          .filter((error) => error.field.startsWith('label.'))
          .map((error) => [error.field.slice(6), error.message]),
      );

  const output = result.ok ? result.value : null;
  const headline = output ? (imperial ? output.productPounds : output.productKilograms) : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'lb of product' : 'kg of product'}
      sentence={
        output ? (
          <p>
            Spread{' '}
            <strong>
              {imperial
                ? `${output.productPounds} pounds (${output.productOunces} ounces)`
                : `${output.productKilograms} kilograms`}
            </strong>{' '}
            of your {values.n}-{values.p}-{values.k} fertilizer over{' '}
            {imperial
              ? `${output.areaSquareFeet} square feet`
              : `${output.areaSquareMeters} square meters`}{' '}
            to deliver {values.targetRate} {imperial ? 'lb per 1,000 sq ft' : 'kg per 100 m²'} of{' '}
            {NUTRIENT_NAMES[nutrient]}. Weigh it rather than guessing — a cup of one product is not
            a cup of another.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.productPounds} lb (${output.productKilograms} kg) of ${values.n}-${values.p}-${values.k} over ${output.areaSquareFeet} sq ft. Calculated at soilsums.com`
          : ''
      }
      extra={
        output ? (
          <ResultTable
            caption="What that dose actually supplies"
            columns={[
              'Nutrient',
              'On the label',
              imperial ? 'Pounds' : 'Kilograms',
              'Per 1,000 sq ft',
            ]}
            rows={output.supplied.map((entry) => ({
              key: entry.nutrient,
              cells: [
                NUTRIENT_NAMES[entry.nutrient],
                `${entry.labelPercent}%`,
                imperial ? entry.pounds : entry.kilograms,
                imperial ? `${entry.lbPer1000SqFt} lb` : `${entry.kgPer100SqM} kg / 100 m²`,
              ],
            }))}
          />
        ) : null
      }
    >
      <NumberField
        label="Area to feed"
        value={values.area ?? ''}
        onChange={(value) => setValue('area', value)}
        suffix={imperial ? 'sq ft' : 'm²'}
        error={errors.area}
      />

      <NumberField
        label={imperial ? 'Target rate, lb per 1,000 sq ft' : 'Target rate, kg per 100 m²'}
        value={values.targetRate ?? ''}
        onChange={(value) => setValue('targetRate', value)}
        error={errors.targetRate}
        hint="One pound of nitrogen per 1,000 sq ft is a common figure for vegetables"
      />

      <div className="col-span-2">
        <p className="text-sm font-semibold">The three numbers on the bag</p>
        <div className="mt-1 grid grid-cols-3 gap-3">
          <NumberField
            label="N"
            value={values.n ?? ''}
            onChange={(value) => setValue('n', value)}
            suffix="%"
            error={labelErrors.n}
          />
          <NumberField
            label="P"
            value={values.p ?? ''}
            onChange={(value) => setValue('p', value)}
            suffix="%"
            error={labelErrors.p}
          />
          <NumberField
            label="K"
            value={values.k ?? ''}
            onChange={(value) => setValue('k', value)}
            suffix="%"
            error={labelErrors.k}
          />
        </div>
      </div>

      <div className="col-span-2">
        <SelectField
          label="Which nutrient are you aiming at?"
          value={nutrient}
          onChange={(value) => setValue('nutrient', value)}
          options={NUTRIENTS}
          hint="Most vegetable recommendations are written as a nitrogen rate"
        />
      </div>
    </CalculatorFrame>
  );
}
