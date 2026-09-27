'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { ResultTable } from '@/components/ui/ResultTable';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import {
  calculateBulkSoil,
  type BulkSoilEntryMode,
  type BulkSoilMaterial,
} from '@/lib/calculators/bulk-soil';
import {
  COMPOST_SOURCE,
  SOIL_SOURCE,
  SOIL_TEXTURES,
  WEIGHT_CAVEAT,
  getSoilTexture,
} from '@/data/densities';

/**
 * Bulk soil and compost by the cubic yard.
 *
 * The volume half is exact arithmetic and behaves like every other calculator
 * here. The weight half deliberately does not: it gives a range with its reason
 * and tells the reader to ask their supplier where the number matters. Every
 * competing calculator prints one confident figure, and for delivered material
 * that figure is wrong for most readers, because a yard of topsoil has no fixed
 * weight — it is a property of one supplier's pile on one day.
 */

const PARAMS = {
  mode: 'mo',
  area: 'a',
  length: 'l',
  width: 'w',
  depth: 'd',
  material: 'm',
  texture: 't',
  truck: 'tr',
} as const;

const KINDS: Record<string, FieldKind> = {
  area: 'area',
  length: 'span',
  width: 'span',
  depth: 'short',
  truck: 'none',
};

const IMPERIAL = {
  mode: 'rectangle',
  area: '200',
  length: '20',
  width: '10',
  depth: '3',
  material: 'soil',
  texture: 'sandy-loam',
  truck: '',
};

const METRIC = { ...IMPERIAL, area: '18.6', length: '6', width: '3', depth: '7.5' };

const MATERIALS = [
  { value: 'soil', label: 'Topsoil or garden soil' },
  { value: 'compost', label: 'Compost' },
];

function lb(value: number): string {
  return value.toLocaleString('en-US');
}

export function BulkSoilCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    metricDefaults: METRIC,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const mode: BulkSoilEntryMode = values.mode === 'area' ? 'area' : 'rectangle';
  const material: BulkSoilMaterial = values.material === 'compost' ? 'compost' : 'soil';
  const truckRaw = values.truck?.trim() ?? '';

  const result = useMemo(
    () =>
      calculateBulkSoil({
        units,
        mode,
        material,
        area: num(values, 'area'),
        length: num(values, 'length'),
        width: num(values, 'width'),
        depth: num(values, 'depth'),
        texture: values.texture,
        ...(truckRaw === '' ? {} : { truckCubicYards: num(values, 'truck') }),
      }),
    [units, mode, material, values, truckRaw],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const texture = getSoilTexture(values.texture ?? '');
  const source = material === 'compost' ? COMPOST_SOURCE : SOIL_SOURCE;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={output ? String(output.cubicYards) : null}
      headlineUnit={output ? (output.cubicYards === 1 ? 'cubic yard' : 'cubic yards') : undefined}
      sentence={
        output ? (
          <>
            <p>
              You need <strong>{output.cubicYards} cubic yards</strong> — that is {output.cubicFeet}{' '}
              cubic feet — to cover {output.squareFeet} square feet at {output.depthInches} inches
              deep. One cubic yard covers about {output.coveragePerYard} square feet at that depth.
            </p>
            <p>
              <strong>
                It will weigh somewhere between {lb(output.weight.lowLb)} and{' '}
                {lb(output.weight.highLb)} lb
              </strong>{' '}
              ({output.weight.lowTons} to {output.weight.highTons} tons), and that range is the
              honest answer rather than a hedge — see below for why no calculator can give you one
              number.
            </p>
          </>
        ) : null
      }
      copyText={
        output
          ? `${output.cubicYards} cubic yards (${output.cubicFeet} cu ft) of ${material}, weighing roughly ${lb(output.weight.lowLb)}-${lb(output.weight.highLb)} lb. Calculated at soilsums.com`
          : ''
      }
    >
      <div className="col-span-2">
        <RadioGroup
          legend="What do you know about the area?"
          value={mode}
          onChange={(next) => setValue('mode', next)}
          options={[
            { value: 'rectangle', label: 'Length and width' },
            { value: 'area', label: 'Total area' },
          ]}
        />
      </div>

      {mode === 'rectangle' ? (
        <>
          <NumberField
            label={imperial ? 'Length (ft)' : 'Length (m)'}
            value={values.length ?? ''}
            onChange={(next) => setValue('length', next)}
            error={errors.length}
          />
          <NumberField
            label={imperial ? 'Width (ft)' : 'Width (m)'}
            value={values.width ?? ''}
            onChange={(next) => setValue('width', next)}
            error={errors.width}
          />
        </>
      ) : (
        <NumberField
          label={imperial ? 'Area (sq ft)' : 'Area (m²)'}
          value={values.area ?? ''}
          onChange={(next) => setValue('area', next)}
          error={errors.area}
        />
      )}

      <NumberField
        label={imperial ? 'Depth (in)' : 'Depth (cm)'}
        value={values.depth ?? ''}
        onChange={(next) => setValue('depth', next)}
        error={errors.depth}
        hint="Three inches is a typical topdressing; six or more for a new bed"
      />

      <div className="col-span-2">
        <SelectField
          label="What are you buying?"
          value={material}
          onChange={(next) => setValue('material', next)}
          options={MATERIALS}
          hint={
            material === 'compost'
              ? 'Compost is published by weight per cubic yard, so its range is a real answer'
              : 'Soil weight is published by texture, for soil in the ground — read the note below'
          }
        />
      </div>

      {material === 'soil' ? (
        <div className="col-span-2">
          <SelectField
            label="Soil texture"
            value={values.texture ?? 'sandy-loam'}
            onChange={(next) => setValue('texture', next)}
            options={SOIL_TEXTURES.map((item) => ({ value: item.slug, label: item.name }))}
            hint="Changes the weight range only. It does not change the volume you need."
          />
        </div>
      ) : null}

      <div className="col-span-2">
        <NumberField
          label="Your truck or trailer, in cubic yards (optional)"
          value={values.truck ?? ''}
          onChange={(next) => setValue('truck', next)}
          error={errors.truckCubicYards}
          hint="Measure the bed: length × width × loaded depth in feet, divided by 27"
        />
      </div>

      {output ? (
        <div className="col-span-2 space-y-4">
          <ResultTable
            caption="The same quantity, every way it is sold"
            columns={['Measure', 'Amount']}
            rows={[
              { key: 'cuyd', cells: ['Cubic yards', String(output.cubicYards)] },
              { key: 'cuft', cells: ['Cubic feet', String(output.cubicFeet)] },
              {
                key: 'cover',
                cells: [
                  `Square feet one yard covers at ${output.depthInches} in`,
                  String(output.coveragePerYard),
                ],
              },
              ...output.bags.map((bag) => ({
                key: `bag-${bag.cubicFeet}`,
                cells: [`Bags at ${bag.cubicFeet} cu ft`, String(bag.count)],
              })),
              ...(output.truckLoads === undefined
                ? []
                : [
                    {
                      key: 'truck',
                      cells: [
                        'Truck loads, by volume',
                        `${output.truckLoads} — check your payload rating, which is what actually limits a load`,
                      ],
                    },
                  ]),
            ]}
          />

          <ResultTable
            caption="Weight, as a range with its reason"
            columns={['Measure', 'Range']}
            rows={[
              {
                key: 'peryard',
                cells: [
                  'Pounds per cubic yard',
                  `${lb(output.weight.lowLbPerCubicYard)} to ${lb(output.weight.highLbPerCubicYard)}`,
                ],
              },
              {
                key: 'total',
                cells: [
                  'Total weight',
                  `${lb(output.weight.lowLb)} to ${lb(output.weight.highLb)} lb`,
                ],
              },
              {
                key: 'tons',
                cells: ['Tons (US short)', `${output.weight.lowTons} to ${output.weight.highTons}`],
              },
              {
                key: 'yardsperton',
                cells: [
                  'Cubic yards you get per ton',
                  `${output.weight.lowYardsPerTon} to ${output.weight.highYardsPerTon}`,
                ],
              },
              ...(output.weight.typicalLbPerCubicYard === undefined
                ? []
                : [
                    {
                      key: 'typical',
                      cells: [
                        'Rule of thumb, screened at 50% moisture',
                        `${lb(output.weight.typicalLbPerCubicYard)} lb per cubic yard`,
                      ],
                    },
                  ]),
            ]}
          />

          <div className="border-ochre bg-paper border-l-4 px-3 py-2">
            <p className="text-sm font-semibold">
              {output.weight.inPlaceOnly
                ? 'Why this is a range, and an upper bound at that'
                : 'Why this is a range'}
            </p>
            {output.weight.inPlaceOnly ? (
              <p className="text-ink/90 mt-1 text-sm">
                {WEIGHT_CAVEAT} The figures above span{' '}
                {texture ? texture.name.toLowerCase() : 'this texture'} from the density the NRCS
                calls ideal for root growth up to the density at which roots are restricted — in
                other words from well-structured to compacted.
              </p>
            ) : (
              <p className="text-ink/90 mt-1 text-sm">
                Oregon State publishes this range for screened compost because moisture, particle
                size and compaction genuinely move it by a factor of two. Wet compost can exceed
                1,500 lb per cubic yard on its own. Where the weight matters, ask your supplier what
                theirs weighs.
              </p>
            )}
            <p className="text-ink/80 mt-2 text-xs">
              Figures from{' '}
              <a href={source.url} rel="nofollow">
                {source.institution}
              </a>
              , {source.title}. The volume arithmetic above is exact and needs no source: 27 cubic
              feet to the cubic yard, and 324 divided by the depth in inches for coverage.
            </p>
          </div>
        </div>
      ) : null}
    </CalculatorFrame>
  );
}
