'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateLime } from '@/lib/calculators/lime';
import { limeRates, type SoilTexture } from '@/data/lime-rates';

const PARAMS = { area: 'a', currentPh: 'cp', targetPh: 'tp', texture: 'tx' } as const;
const KINDS: Record<string, FieldKind> = { area: 'area' };
const IMPERIAL = { area: '400', currentPh: '5.5', targetPh: '6.5', texture: 'loam' };

export function LimeCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset } = useToolState({
    imperialDefaults: IMPERIAL,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const texture = (limeRates.map((rate) => rate.slug) as string[]).includes(values.texture ?? '')
    ? (values.texture as SoilTexture)
    : 'loam';

  const result = useMemo(
    () =>
      calculateLime({
        units,
        area: num(values, 'area'),
        currentPh: num(values, 'currentPh'),
        targetPh: num(values, 'targetPh'),
        texture,
      }),
    [units, values, texture],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const headline = output ? (imperial ? output.pounds : output.kilograms) : null;
  const selected = limeRates.find((rate) => rate.slug === texture);

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'lb of limestone' : 'kg of limestone'}
      sentence={
        output ? (
          <p>
            To move {texture} soil from pH {values.currentPh} to pH {values.targetPh} over{' '}
            {imperial
              ? `${output.areaSquareFeet} square feet`
              : `${output.areaSquareMeters} square meters`}
            , spread roughly{' '}
            <strong>
              {imperial
                ? `${output.pounds} pounds of ground limestone`
                : `${output.kilograms} kilograms of ground limestone`}
            </strong>{' '}
            — that is {output.lbPer1000SqFt} lb per 1,000 sq ft. Work it into the top six inches and
            expect six months to a year before the pH has fully moved.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.pounds} lb (${output.kilograms} kg) of ground limestone to raise ${texture} soil ${output.phChange} pH units over ${output.areaSquareFeet} sq ft. Calculated at soilsums.com`
          : ''
      }
      notes={output ? output.warnings : []}
      extra={
        <div className="border-ochre bg-paper border-l-4 py-3 pr-3 pl-4">
          <p className="font-display text-ochre text-base">A soil test beats this calculator</p>
          <p className="text-ink/90 mt-1 text-sm">
            How much lime a soil needs depends on its buffering capacity, which a pH reading cannot
            show — two soils reading pH 5.5 can need very different amounts. A test that reports
            buffer pH, or a direct lime recommendation from your extension service, is worth far
            more than the estimate above. Lime is also slow and hard to undo, so under-apply rather
            than over-apply and retest next season.
          </p>
        </div>
      }
    >
      <NumberField
        label="Area to treat"
        value={values.area ?? ''}
        onChange={(value) => setValue('area', value)}
        suffix={imperial ? 'sq ft' : 'm²'}
        error={errors.area}
      />

      <SelectField
        label="Soil texture"
        value={texture}
        onChange={(value) => setValue('texture', value)}
        options={limeRates.map((rate) => ({ value: rate.slug, label: rate.name }))}
        hint={selected?.description}
      />

      <NumberField
        label="Current pH"
        value={values.currentPh ?? ''}
        onChange={(value) => setValue('currentPh', value)}
        error={errors.currentPh}
        hint="From a soil test or a meter"
      />

      <NumberField
        label="Target pH"
        value={values.targetPh ?? ''}
        onChange={(value) => setValue('targetPh', value)}
        error={errors.targetPh}
        hint="Most vegetables are happy between 6.0 and 6.8"
      />
    </CalculatorFrame>
  );
}
