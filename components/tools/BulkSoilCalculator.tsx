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
import { COMPOST_SOURCE } from '@/data/densities';

/**
 * Bulk soil and compost by the cubic yard.
 *
 * The volume half is exact arithmetic and behaves like every other calculator
 * here. The weight half is honest about what is published: compost gets a
 * range with its reason, because Oregon State publishes weight per cubic yard
 * as supplied. For soil there is no published delivered weight — it is a
 * property of one supplier's pile on one day — so the tool prints no weight
 * unless the reader enters their supplier's own figure per cubic yard.
 */

const PARAMS = {
  mode: 'mo',
  area: 'a',
  length: 'l',
  width: 'w',
  depth: 'd',
  material: 'm',
  supplier: 's',
  truck: 'tr',
} as const;

const KINDS: Record<string, FieldKind> = {
  area: 'area',
  length: 'span',
  width: 'span',
  depth: 'short',
  supplier: 'none',
  truck: 'none',
};

const IMPERIAL = {
  mode: 'rectangle',
  area: '200',
  length: '20',
  width: '10',
  depth: '3',
  material: 'soil',
  supplier: '',
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
  const supplierRaw = values.supplier?.trim() ?? '';
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
        ...(supplierRaw === '' ? {} : { supplierLbPerCubicYard: num(values, 'supplier') }),
        ...(truckRaw === '' ? {} : { truckCubicYards: num(values, 'truck') }),
      }),
    [units, mode, material, values, supplierRaw, truckRaw],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const weight = output?.weight ?? null;

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
            {weight === null ? (
              <p>
                There is <strong>no published weight</strong> for delivered topsoil — it depends on
                your supplier&apos;s pile and how wet it is, so no calculator can honestly print
                one. If your supplier quotes a weight per cubic yard, enter it above and the total
                appears here.
              </p>
            ) : weight.supplierFigure ? (
              <p>
                At your supplier&apos;s figure of <strong>{lb(weight.lowLbPerCubicYard)} lb per
                cubic yard</strong>, that is about <strong>{lb(weight.lowLb)} lb</strong> (
                {weight.lowTons} tons). Their figure is the only one that describes their pile.
              </p>
            ) : (
              <p>
                <strong>
                  It will weigh somewhere between {lb(weight.lowLb)} and {lb(weight.highLb)}
                  {weight.highOpenEnded ? '+' : ''} lb
                </strong>{' '}
                ({weight.lowTons} to {weight.highTons}
                {weight.highOpenEnded ? '+' : ''} tons), and that range is the honest answer
                rather than a hedge — see below for why no calculator can give you one number.
              </p>
            )}
          </>
        ) : null
      }
      copyText={
        output
          ? weight === null
            ? `${output.cubicYards} cubic yards (${output.cubicFeet} cu ft) of ${material}. No published delivered weight — ask your supplier. Calculated at soilsums.com`
            : `${output.cubicYards} cubic yards (${output.cubicFeet} cu ft) of ${material}, weighing roughly ${lb(weight.lowLb)}-${lb(weight.highLb)}${weight.highOpenEnded ? '+' : ''} lb. Calculated at soilsums.com`
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
              : 'No published weight for delivered soil — enter your supplier\u2019s figure below if you have one'
          }
        />
      </div>

      {material === 'soil' ? (
        <div className="col-span-2">
          <NumberField
            label="Supplier's weight, in lb per cubic yard (optional)"
            value={values.supplier ?? ''}
            onChange={(next) => setValue('supplier', next)}
            error={errors.supplierLbPerCubicYard}
            hint="Ask your supplier what their screened topsoil weighs per cubic yard — it varies by pile and by how wet it is"
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

          {weight !== null ? (
            <ResultTable
              caption={
                weight.supplierFigure
                  ? "Weight, from your supplier's figure"
                  : 'Weight, as a range with its reason'
              }
              columns={['Measure', weight.supplierFigure ? 'Amount' : 'Range']}
              rows={[
                {
                  key: 'peryard',
                  cells: [
                    'Pounds per cubic yard',
                    weight.supplierFigure
                      ? lb(weight.lowLbPerCubicYard)
                      : `${lb(weight.lowLbPerCubicYard)} to ${lb(weight.highLbPerCubicYard)}${weight.highOpenEnded ? '+' : ''}`,
                  ],
                },
                {
                  key: 'total',
                  cells: [
                    'Total weight',
                    weight.supplierFigure
                      ? `${lb(weight.lowLb)} lb`
                      : `${lb(weight.lowLb)} to ${lb(weight.highLb)}${weight.highOpenEnded ? '+' : ''} lb`,
                  ],
                },
                {
                  key: 'tons',
                  cells: [
                    'Tons (US short)',
                    weight.supplierFigure
                      ? String(weight.lowTons)
                      : `${weight.lowTons} to ${weight.highTons}${weight.highOpenEnded ? '+' : ''}`,
                  ],
                },
                {
                  key: 'yardsperton',
                  cells: [
                    'Cubic yards you get per ton',
                    weight.supplierFigure
                      ? String(weight.lowYardsPerTon)
                      : weight.highOpenEnded
                        ? `${weight.lowYardsPerTon} to ${weight.highYardsPerTon}, fewer when very wet`
                        : `${weight.lowYardsPerTon} to ${weight.highYardsPerTon}`,
                  ],
                },
                ...(weight.typicalLbPerCubicYard === undefined
                  ? []
                  : [
                      {
                        key: 'typical',
                        cells: [
                          'Rule of thumb, screened at 50% moisture',
                          `${lb(weight.typicalLbPerCubicYard)} lb per cubic yard`,
                        ],
                      },
                    ]),
              ]}
            />
          ) : null}

          <div className="border-ochre bg-paper border-l-4 px-3 py-2">
            <p className="text-sm font-semibold">
              {material === 'compost'
                ? 'Why this is a range'
                : weight !== null
                  ? "Why this is your supplier's figure"
                  : 'Why there is no weight here'}
            </p>
            {material === 'compost' ? (
              <p className="text-ink/90 mt-1 text-sm">
                Oregon State publishes this range for screened compost because moisture, particle
                size and compaction genuinely move it by a factor of two. The &ldquo;+&rdquo; on
                the high end is load-bearing: Oregon State&apos;s published range runs
                &ldquo;800 to more than 1,600&rdquo;, so 1,600 is where their range stops, not
                where compost stops — very wet composts exceed it on their own. Where the weight
                matters, ask your supplier what theirs weighs, and check your vehicle&apos;s
                payload rating before hauling: this range is not a safe-load figure.
              </p>
            ) : weight !== null ? (
              <p className="text-ink/90 mt-1 text-sm">
                This is your supplier&apos;s figure multiplied by your cubic yards — the only
                weight that describes their pile. It is not a published average and not an upper
                bound: a wetter pile weighs more, and no table of soil textures can tell you what
                a delivered load weighs.
              </p>
            ) : (
              <p className="text-ink/90 mt-1 text-sm">
                No extension service publishes a weight per cubic yard for delivered topsoil,
                because it is not a property of soil — it is a property of one supplier&apos;s
                pile on one day: the batch, the screening, and above all how wet it is. Figures
                you may have seen elsewhere come from root-growth thresholds for undisturbed soil
                in the ground, which describe compaction rather than weight and are measured
                without the water a delivered pile carries. Where the weight matters — a truck
                payload, a structural loading, an order priced by the ton — ask your supplier what
                their material weighs, and enter it above.
              </p>
            )}
            <p className="text-ink/80 mt-2 text-xs">
              {material === 'compost' ? (
                <>
                  Figures from{' '}
                  <a href={COMPOST_SOURCE.url} rel="nofollow">
                    {COMPOST_SOURCE.institution}
                  </a>
                  , {COMPOST_SOURCE.title}.
                </>
              ) : null}{' '}
              The volume arithmetic above is exact and needs no source: 27 cubic feet to the cubic
              yard, and 324 divided by the depth in inches for coverage.
            </p>
          </div>
        </div>
      ) : null}
    </CalculatorFrame>
  );
}
