'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculatePlantSpacing, type SpacingLayout } from '@/lib/calculators/plant-spacing';
import { crops, getCrop } from '@/data/crops';
import { CropDataSource } from './DataSource';

const PARAMS = {
  bedLength: 'l',
  bedWidth: 'w',
  plantSpacing: 'ps',
  rowSpacing: 'rs',
  layout: 'la',
  crop: 'c',
} as const;

const KINDS: Record<string, FieldKind> = {
  bedLength: 'span',
  bedWidth: 'span',
  plantSpacing: 'short',
  rowSpacing: 'short',
};

const IMPERIAL = {
  bedLength: '8',
  bedWidth: '4',
  plantSpacing: '12',
  rowSpacing: '12',
  layout: 'square',
  crop: '',
};

const METRIC = {
  ...IMPERIAL,
  bedLength: '2.4',
  bedWidth: '1.2',
  plantSpacing: '30',
  rowSpacing: '30',
};

export function PlantSpacingCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    metricDefaults: METRIC,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const layout: SpacingLayout = values.layout === 'triangular' ? 'triangular' : 'square';

  // Picking a crop fills its published spacing in; both fields stay editable.
  function applyCrop(slug: string) {
    setValue('crop', slug);
    const crop = crops.find((candidate) => candidate.slug === slug);
    if (!crop) return;
    const scale = imperial ? 1 : 2.54;
    setValue('plantSpacing', String(Math.round(crop.spacingInches * scale * 10) / 10));
    setValue('rowSpacing', String(Math.round(crop.rowSpacingInches * scale * 10) / 10));
  }

  const result = useMemo(
    () =>
      calculatePlantSpacing({
        units,
        bedLength: num(values, 'bedLength'),
        bedWidth: num(values, 'bedWidth'),
        plantSpacing: num(values, 'plantSpacing'),
        rowSpacing: num(values, 'rowSpacing'),
        layout,
      }),
    [units, values, layout],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={output ? String(output.totalPlants) : null}
      headlineUnit={output ? (output.totalPlants === 1 ? 'plant' : 'plants') : undefined}
      sentence={
        output ? (
          <>
            <p>
              <strong>
                {output.totalPlants} plant{output.totalPlants === 1 ? '' : 's'}
              </strong>{' '}
              — {output.rows} row{output.rows === 1 ? '' : 's'} of {output.plantsPerRow}
              {layout === 'triangular' && output.plantsPerOffsetRow !== null
                ? `, alternating with rows of ${output.plantsPerOffsetRow}`
                : ''}
              , at {output.squareFeetPerPlant ?? 0} sq ft each.
            </p>
            <p className="mt-2">
              {output.limit.explanation}
              {output.limit.suggestion ? ` ${output.limit.suggestion}` : ''}
            </p>
          </>
        ) : null
      }
      copyText={
        output
          ? `${output.totalPlants} plants at ${values.plantSpacing} ${imperial ? 'in' : 'cm'} spacing in a ${values.bedLength} x ${values.bedWidth} ${imperial ? 'ft' : 'm'} bed (${layout} layout). Calculated at soilsums.com`
          : ''
      }
      notes={output ? output.notes : []}
      extra={
        output ? (
          <>
            <ResultTable
              caption="The two layouts compared, for this bed"
              columns={['Layout', 'Plants', 'Row pitch', 'Difference']}
              rows={[
                {
                  key: 'square',
                  cells: [
                    'Square grid',
                    output.squareLayoutPlants,
                    `${values.rowSpacing} ${imperial ? 'in' : 'cm'}`,
                    '—',
                  ],
                },
                {
                  key: 'triangular',
                  cells: [
                    'Staggered (triangular)',
                    output.triangularLayoutPlants,
                    `${Math.round(num(values, 'plantSpacing') * 0.866 * 10) / 10} ${imperial ? 'in' : 'cm'}`,
                    `${output.gainPercent > 0 ? '+' : ''}${output.gainPercent}%`,
                  ],
                },
              ]}
            />
            <CropDataSource
              crops={(() => {
                const chosen = getCrop(values.crop ?? '');
                return chosen ? [chosen] : crops;
              })()}
              what="Spacing"
            />
          </>
        ) : null
      }
    >
      <div className="col-span-2">
        <SelectField
          label="Start from a crop, or set the spacing yourself"
          value={values.crop ?? ''}
          onChange={applyCrop}
          options={[
            { value: '', label: 'Choose a crop to fill in its spacing' },
            ...crops.map((crop) => ({
              value: crop.slug,
              label: `${crop.name} — ${crop.spacingInches} in apart`,
            })),
          ]}
        />
      </div>

      <NumberField
        label="Bed length"
        value={values.bedLength ?? ''}
        onChange={(value) => setValue('bedLength', value)}
        suffix={imperial ? 'ft' : 'm'}
        error={errors.bedLength}
      />

      <NumberField
        label="Bed width"
        value={values.bedWidth ?? ''}
        onChange={(value) => setValue('bedWidth', value)}
        suffix={imperial ? 'ft' : 'm'}
        error={errors.bedWidth}
      />

      <NumberField
        label="Spacing between plants"
        value={values.plantSpacing ?? ''}
        onChange={(value) => setValue('plantSpacing', value)}
        suffix={imperial ? 'in' : 'cm'}
        error={errors.plantSpacing}
      />

      <NumberField
        label="Spacing between rows"
        value={values.rowSpacing ?? ''}
        onChange={(value) => setValue('rowSpacing', value)}
        suffix={imperial ? 'in' : 'cm'}
        error={errors.rowSpacing}
        hint={layout === 'triangular' ? 'Used for the square-grid comparison only' : undefined}
      />

      <div className="col-span-2">
        <RadioGroup
          legend="Layout"
          value={layout}
          onChange={(value) => setValue('layout', value)}
          options={[
            { value: 'square', label: 'Square grid' },
            { value: 'triangular', label: 'Staggered rows' },
          ]}
        />
      </div>
    </CalculatorFrame>
  );
}
