'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateRaisedBedSoil } from '@/lib/calculators/raised-bed-soil';
import { defaultBedMix } from '@/data/bag-sizes';

const PARAMS = {
  shape: 'sh',
  length: 'l',
  width: 'w',
  diameter: 'dia',
  depth: 'd',
  beds: 'n',
  bagPreset: 'bp',
  bagSize: 'b',
  useMix: 'mix',
  mix0: 'm0',
  mix1: 'm1',
  mix2: 'm2',
} as const;

const KINDS: Record<string, FieldKind> = {
  length: 'span',
  width: 'span',
  diameter: 'span',
  depth: 'short',
  bagSize: 'volume',
};

const IMPERIAL = {
  shape: 'rectangle',
  length: '8',
  width: '4',
  diameter: '6',
  depth: '12',
  beds: '1',
  bagPreset: '1.5',
  bagSize: '1.5',
  useMix: 'no',
  mix0: '60',
  mix1: '30',
  mix2: '10',
};

const METRIC = {
  ...IMPERIAL,
  length: '2.4',
  width: '1.2',
  diameter: '1.8',
  depth: '30',
  bagPreset: '50',
  bagSize: '50',
};

const IMPERIAL_BAGS = [
  { value: '1', label: '1 cu ft' },
  { value: '1.5', label: '1.5 cu ft' },
  { value: '2', label: '2 cu ft' },
  { value: '3', label: '3 cu ft' },
  { value: 'custom', label: 'Other size' },
];

const METRIC_BAGS = [
  { value: '20', label: '20 L' },
  { value: '40', label: '40 L' },
  { value: '50', label: '50 L' },
  { value: '70', label: '70 L' },
  { value: 'custom', label: 'Other size' },
];

export function RaisedBedSoilCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    metricDefaults: METRIC,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const shape = values.shape === 'circle' ? 'circle' : 'rectangle';
  const custom = values.bagPreset === 'custom';
  const bagSize = custom ? num(values, 'bagSize') : Number(values.bagPreset);
  const useMix = values.useMix === 'yes';

  const result = useMemo(
    () =>
      calculateRaisedBedSoil({
        units,
        shape,
        length: num(values, 'length'),
        width: num(values, 'width'),
        diameter: num(values, 'diameter'),
        depth: num(values, 'depth'),
        beds: num(values, 'beds'),
        bagSize,
        mix: useMix
          ? defaultBedMix.map((component, index) => ({
              label: component.label,
              percent: num(values, `mix${index}`),
            }))
          : undefined,
      }),
    [units, shape, values, bagSize, useMix],
  );

  const errors = errorMap(result, values);
  const bagUnit = imperial ? 'cu ft' : 'L';
  const output = result.ok ? result.value : null;

  const sentence = output ? (
    <p>
      You need about <strong>{output.cubicFeet} cubic feet</strong> of soil
      {imperial ? '' : ` (${output.liters} liters)`} — that is{' '}
      <strong>
        {output.bags} bag{output.bags === 1 ? '' : 's'}
      </strong>{' '}
      of {output.bagSize} {bagUnit}, or {output.cubicYards} cubic yards loose.
      {num(values, 'beds') > 1 ? ` Each bed takes ${output.cubicFeetPerBed} cubic feet.` : ''} Buy
      about 10% extra — fresh mixes settle as they break down.
    </p>
  ) : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={output ? String(output.cubicFeet) : null}
      headlineUnit={output ? 'cu ft' : undefined}
      sentence={sentence}
      copyText={
        output
          ? `${output.cubicFeet} cu ft of soil (${output.cubicYards} cu yd, ${output.liters} L) — ${output.bags} bags of ${output.bagSize} ${bagUnit}. Calculated at soilsums.com`
          : ''
      }
      extra={
        <div>
          <RadioGroup
            legend="Split the total into a soil mix?"
            value={values.useMix ?? 'no'}
            onChange={(value) => setValue('useMix', value)}
            options={[
              { value: 'no', label: 'No, just the total' },
              { value: 'yes', label: 'Yes, split it up' },
            ]}
          />

          {useMix ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {defaultBedMix.map((component, index) => (
                  <NumberField
                    key={component.label}
                    label={component.label}
                    value={values[`mix${index}`] ?? ''}
                    onChange={(value) => setValue(`mix${index}`, value)}
                    suffix="%"
                    error={errors[`mix${index}`] ?? (index === 0 ? errors.mix : undefined)}
                  />
                ))}
              </div>

              {output && output.mix.length > 0 ? (
                <div className="mt-4">
                  <ResultTable
                    caption="Mix breakdown"
                    columns={['Component', 'Share', 'Volume', 'Bags']}
                    rows={output.mix.map((component) => ({
                      key: component.label,
                      cells: [
                        component.label,
                        `${component.percent}%`,
                        imperial ? `${component.cubicFeet} cu ft` : `${component.liters} L`,
                        component.bags,
                      ],
                    }))}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      }
    >
      <div className="col-span-2">
        <RadioGroup
          legend="Bed shape"
          value={shape}
          onChange={(value) => setValue('shape', value)}
          options={[
            { value: 'rectangle', label: 'Rectangle' },
            { value: 'circle', label: 'Circle' },
          ]}
        />
      </div>

      {shape === 'rectangle' ? (
        <>
          <NumberField
            label="Length"
            value={values.length ?? ''}
            onChange={(value) => setValue('length', value)}
            suffix={imperial ? 'ft' : 'm'}
            error={errors.length}
            hint="Measure inside the frame, not outside"
          />
          <NumberField
            label="Width"
            value={values.width ?? ''}
            onChange={(value) => setValue('width', value)}
            suffix={imperial ? 'ft' : 'm'}
            error={errors.width}
          />
        </>
      ) : (
        <NumberField
          label="Diameter"
          value={values.diameter ?? ''}
          onChange={(value) => setValue('diameter', value)}
          suffix={imperial ? 'ft' : 'm'}
          error={errors.diameter}
          hint="Across the widest point, inside the frame"
        />
      )}

      <NumberField
        label="Fill depth"
        value={values.depth ?? ''}
        onChange={(value) => setValue('depth', value)}
        suffix={imperial ? 'in' : 'cm'}
        error={errors.depth}
        hint="How deep you will actually fill, not the wall height"
      />

      <NumberField
        label="Number of beds"
        value={values.beds ?? ''}
        onChange={(value) => setValue('beds', value)}
        error={errors.beds}
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
