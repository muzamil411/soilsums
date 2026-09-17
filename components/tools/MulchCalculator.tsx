'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateMulch, type MulchEntryMode } from '@/lib/calculators/mulch';

const PARAMS = {
  mode: 'mo',
  area: 'a',
  length: 'l',
  width: 'w',
  diameter: 'dia',
  depth: 'd',
  bagPreset: 'bp',
  bagSize: 'b',
} as const;

const KINDS: Record<string, FieldKind> = {
  area: 'area',
  length: 'span',
  width: 'span',
  diameter: 'span',
  depth: 'short',
  bagSize: 'volume',
};

const IMPERIAL = {
  mode: 'rectangle',
  area: '200',
  length: '20',
  width: '10',
  diameter: '10',
  depth: '3',
  bagPreset: '2',
  bagSize: '2',
};

const METRIC = {
  ...IMPERIAL,
  area: '18.6',
  length: '6',
  width: '3',
  diameter: '3',
  depth: '7.5',
  bagPreset: '50',
  bagSize: '50',
};

const IMPERIAL_BAGS = [
  { value: '2', label: '2 cu ft' },
  { value: '3', label: '3 cu ft' },
  { value: '1', label: '1 cu ft' },
  { value: 'custom', label: 'Other size' },
];

const METRIC_BAGS = [
  { value: '50', label: '50 L' },
  { value: '60', label: '60 L' },
  { value: '70', label: '70 L' },
  { value: 'custom', label: 'Other size' },
];

export function MulchCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset } = useToolState({
    imperialDefaults: IMPERIAL,
    metricDefaults: METRIC,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const mode = (['area', 'rectangle', 'circle'] as const).includes(values.mode as MulchEntryMode)
    ? (values.mode as MulchEntryMode)
    : 'rectangle';
  const custom = values.bagPreset === 'custom';
  const bagSize = custom ? num(values, 'bagSize') : Number(values.bagPreset);

  const result = useMemo(
    () =>
      calculateMulch({
        units,
        mode,
        area: num(values, 'area'),
        length: num(values, 'length'),
        width: num(values, 'width'),
        diameter: num(values, 'diameter'),
        depth: num(values, 'depth'),
        bagSize,
      }),
    [units, mode, values, bagSize],
  );

  const errors = errorMap(result, values);
  const bagUnit = imperial ? 'cu ft' : 'L';
  const output = result.ok ? result.value : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      onReset={reset}
      headline={output ? String(output.bags) : null}
      headlineUnit={output ? (output.bags === 1 ? 'bag' : 'bags') : undefined}
      sentence={
        output ? (
          <p>
            You need about{' '}
            <strong>
              {output.bags} bag{output.bags === 1 ? '' : 's'}
            </strong>{' '}
            of {output.bagSize} {bagUnit} to cover{' '}
            {imperial
              ? `${output.areaSquareFeet} square feet`
              : `${output.areaSquareMeters} square meters`}{' '}
            at {values.depth} {imperial ? 'inches' : 'centimeters'} deep — that is{' '}
            {imperial
              ? `${output.cubicFeet} cubic feet, or ${output.cubicYards} cubic yards`
              : `${output.liters} liters, or ${output.cubicMeters} cubic meters`}{' '}
            if you buy it loose. One bag covers about {output.squareFeetPerBag} square feet at this
            depth.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.bags} bags of ${output.bagSize} ${bagUnit} of mulch (${output.cubicFeet} cu ft / ${output.liters} L). Calculated at soilsums.com`
          : ''
      }
    >
      <div className="col-span-2">
        <RadioGroup
          legend="What do you know about the bed?"
          value={mode}
          onChange={(value) => setValue('mode', value)}
          options={[
            { value: 'rectangle', label: 'Length and width' },
            { value: 'circle', label: 'A circle' },
            { value: 'area', label: 'The area' },
          ]}
        />
      </div>

      {mode === 'area' ? (
        <NumberField
          label="Area to cover"
          value={values.area ?? ''}
          onChange={(value) => setValue('area', value)}
          suffix={imperial ? 'sq ft' : 'm²'}
          error={errors.area}
        />
      ) : null}

      {mode === 'rectangle' ? (
        <>
          <NumberField
            label="Length"
            value={values.length ?? ''}
            onChange={(value) => setValue('length', value)}
            suffix={imperial ? 'ft' : 'm'}
            error={errors.length}
          />
          <NumberField
            label="Width"
            value={values.width ?? ''}
            onChange={(value) => setValue('width', value)}
            suffix={imperial ? 'ft' : 'm'}
            error={errors.width}
          />
        </>
      ) : null}

      {mode === 'circle' ? (
        <NumberField
          label="Diameter"
          value={values.diameter ?? ''}
          onChange={(value) => setValue('diameter', value)}
          suffix={imperial ? 'ft' : 'm'}
          error={errors.diameter}
        />
      ) : null}

      <NumberField
        label="Mulch depth"
        value={values.depth ?? ''}
        onChange={(value) => setValue('depth', value)}
        suffix={imperial ? 'in' : 'cm'}
        error={errors.depth}
        hint={
          imperial
            ? 'Two to three inches suits most beds'
            : 'Five to eight centimeters suits most beds'
        }
      />

      <SelectField
        label="Bag size"
        value={values.bagPreset ?? ''}
        onChange={(value) => setValue('bagPreset', value)}
        options={imperial ? IMPERIAL_BAGS : METRIC_BAGS}
      />

      {custom ? (
        <NumberField
          label="Bag size"
          value={values.bagSize ?? ''}
          onChange={(value) => setValue('bagSize', value)}
          suffix={bagUnit}
          error={errors.bagSize}
        />
      ) : null}
    </CalculatorFrame>
  );
}
