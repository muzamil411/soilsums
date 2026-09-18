'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculatePottingSoil, type ContainerShape } from '@/lib/calculators/potting-soil';
import { containerPresets, getContainerPreset } from '@/data/containers';

const PARAMS = {
  preset: 'p',
  shape: 'sh',
  width: 'w',
  length: 'l',
  depth: 'd',
  quantity: 'q',
  bagSize: 'b',
} as const;

const KINDS: Record<string, FieldKind> = {
  width: 'short',
  length: 'short',
  depth: 'short',
  bagSize: 'dry-volume',
};

const IMPERIAL = {
  preset: 'pot-12in',
  shape: 'round',
  width: '12',
  length: '24',
  depth: '10',
  quantity: '1',
  bagSize: '25',
};

const METRIC = {
  ...IMPERIAL,
  width: '30',
  length: '60',
  depth: '25',
  bagSize: '50',
};

const SHAPES = [
  { value: 'round', label: 'Round pot' },
  { value: 'square', label: 'Square planter' },
  { value: 'rectangular', label: 'Rectangular box' },
  { value: 'half-barrel', label: 'Half barrel' },
];

export function PottingSoilCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    metricDefaults: METRIC,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const shape = (SHAPES.map((option) => option.value) as string[]).includes(values.shape ?? '')
    ? (values.shape as ContainerShape)
    : 'round';

  // Choosing a preset fills the dimensions in, then they can be edited freely.
  function applyPreset(slug: string) {
    setValue('preset', slug);
    const preset = getContainerPreset(slug);
    if (!preset) return;
    const scale = imperial ? 1 : 2.54;
    setValue('shape', preset.shape);
    setValue('width', String(Math.round(preset.widthInches * scale * 10) / 10));
    setValue('depth', String(Math.round(preset.depthInches * scale * 10) / 10));
    if (preset.lengthInches !== undefined) {
      setValue('length', String(Math.round(preset.lengthInches * scale * 10) / 10));
    }
  }

  const result = useMemo(
    () =>
      calculatePottingSoil({
        units,
        shape,
        width: num(values, 'width'),
        length: num(values, 'length'),
        depth: num(values, 'depth'),
        quantity: num(values, 'quantity'),
        bagSize: num(values, 'bagSize'),
      }),
    [units, shape, values],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const shortUnit = imperial ? 'in' : 'cm';
  const bagUnit = imperial ? 'dry qt' : 'L';
  const headline = output ? (imperial ? output.dryQuarts : output.liters) : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'US dry quarts' : 'liters'}
      sentence={
        output ? (
          <p>
            {output.quantity === 1
              ? 'That container holds'
              : `Those ${output.quantity} containers hold`}{' '}
            about{' '}
            <strong>
              {imperial ? `${output.dryQuarts} US dry quarts` : `${output.liters} liters`}
            </strong>{' '}
            of mix —{' '}
            <strong>
              {output.bags} bag{output.bags === 1 ? '' : 's'}
            </strong>{' '}
            of {output.bagSize} {bagUnit}.
            {output.quantity > 1
              ? ` Each one takes about ${output.dryQuartsPerContainer} dry quarts.`
              : ''}{' '}
            Most pots taper, so a tapered one of this width holds ten to twenty per cent less than
            the figure above.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.dryQuarts} US dry quarts (${output.liters} L, ${output.cubicFeet} cu ft) of potting mix — ${output.bags} bags of ${output.bagSize} ${bagUnit}. Calculated at soilsums.com`
          : ''
      }
      extra={
        output ? (
          <ResultTable
            caption="The same volume in other units"
            columns={['Unit', 'Amount', 'Note']}
            rows={[
              {
                key: 'dry',
                cells: [
                  'US dry quarts',
                  output.dryQuarts,
                  'How bagged potting mix is sold in the US',
                ],
              },
              {
                key: 'liquid',
                cells: [
                  'US liquid quarts',
                  output.liquidQuarts,
                  'Not the figure on a mix bag — 16% larger',
                ],
              },
              { key: 'gal', cells: ['US liquid gallons', output.usGallons, 'For watering maths'] },
              { key: 'cuft', cells: ['Cubic feet', output.cubicFeet, 'For bulk or bagged soil'] },
              { key: 'l', cells: ['Liters', output.liters, 'How mix is sold outside the US'] },
            ]}
          />
        ) : null
      }
    >
      <div className="col-span-2">
        <SelectField
          label="Start from a common container"
          value={values.preset ?? ''}
          onChange={applyPreset}
          options={containerPresets.map((preset) => ({
            value: preset.slug,
            label: `${preset.name} — ${preset.note}`,
          }))}
        />
      </div>

      <SelectField
        label="Shape"
        value={shape}
        onChange={(value) => setValue('shape', value)}
        options={SHAPES}
      />

      <NumberField
        label={shape === 'round' || shape === 'half-barrel' ? 'Diameter across the top' : 'Width'}
        value={values.width ?? ''}
        onChange={(value) => setValue('width', value)}
        suffix={shortUnit}
        error={errors.width}
      />

      {shape === 'rectangular' ? (
        <NumberField
          label="Length"
          value={values.length ?? ''}
          onChange={(value) => setValue('length', value)}
          suffix={shortUnit}
          error={errors.length}
        />
      ) : null}

      <NumberField
        label="Soil depth"
        value={values.depth ?? ''}
        onChange={(value) => setValue('depth', value)}
        suffix={shortUnit}
        error={errors.depth}
        hint="An inch below the rim"
      />

      <NumberField
        label="How many containers"
        value={values.quantity ?? ''}
        onChange={(value) => setValue('quantity', value)}
        error={errors.quantity}
      />

      <NumberField
        label="Bag size"
        value={values.bagSize ?? ''}
        onChange={(value) => setValue('bagSize', value)}
        suffix={bagUnit}
        error={errors.bagSize}
      />
    </CalculatorFrame>
  );
}
