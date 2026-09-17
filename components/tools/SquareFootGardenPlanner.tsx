'use client';

import { useEffect, useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { CropLink } from './CropLink';
import type { ToolProps } from './registry';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { MAX_GRID_SIDE, calculateSquareFootGarden } from '@/lib/calculators/square-foot-garden';
import { crops, getCrop } from '@/data/crops';

const PARAMS = { rows: 'r', columns: 'c', grid: 'g', brush: 'br' } as const;
const KINDS: Record<string, FieldKind> = {};
// An example plan, so the page opens with something to read rather than an
// empty grid. Cleared by Reset or by "Empty the grid".
const EXAMPLE_PLAN = [
  'tomato',
  'tomato',
  'basil',
  'basil',
  'lettuce',
  'lettuce',
  'carrot',
  'carrot',
  'bean',
  'bean',
  'bean',
  'radish',
  'kale',
  'kale',
  'spinach',
  'spinach',
].join(',');

const DEFAULTS = { rows: '4', columns: '4', grid: EXAMPLE_PLAN, brush: 'tomato' };

const STORAGE_KEY = 'soilsums.square-foot-plan';

/** Two or three letters, so a square reads without relying on colour. */
function abbreviate(name: string): string {
  const words = name.split(/\s+/);
  if (words.length > 1) {
    return words
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }
  return name.slice(0, 3);
}

const SIZES = Array.from({ length: MAX_GRID_SIDE }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));

export function SquareFootGardenPlanner({ toolSlug, linkedCrops }: ToolProps) {
  const { values, units, setValue, setUnits, reset, ready } = useToolState({
    imperialDefaults: DEFAULTS,
    params: PARAMS,
    kinds: KINDS,
  });

  const rows = Math.min(Math.max(Math.round(Number(values.rows) || 4), 1), MAX_GRID_SIDE);
  const columns = Math.min(Math.max(Math.round(Number(values.columns) || 4), 1), MAX_GRID_SIDE);
  const total = rows * columns;

  const cells = useMemo(() => {
    const parsed = (values.grid ?? '').split(',');
    return Array.from({ length: total }, (_, index) => {
      const slug = parsed[index];
      return slug && getCrop(slug) ? slug : null;
    });
  }, [values.grid, total]);

  // Restore a saved plan on first load, unless the link already carries one.
  useEffect(() => {
    if (!ready || (values.grid ?? '') !== EXAMPLE_PLAN) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { rows?: number; columns?: number; grid?: string };
      if (typeof saved.rows === 'number') setValue('rows', String(saved.rows));
      if (typeof saved.columns === 'number') setValue('columns', String(saved.columns));
      if (typeof saved.grid === 'string') setValue('grid', saved.grid);
    } catch {
      // A corrupt or unavailable saved plan is not worth complaining about.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Keep the plan saved as it is edited.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rows, columns, grid: values.grid ?? '' }),
      );
    } catch {
      // Storage full or blocked: the plan still lives in the page address.
    }
  }, [ready, rows, columns, values.grid]);

  function paint(index: number) {
    const brush = values.brush ?? '';
    const next = [...cells];
    next[index] = next[index] === brush ? null : brush;
    setValue('grid', next.map((cell) => cell ?? '').join(','));
  }

  function clearPlan() {
    setValue('grid', '');
  }

  const result = useMemo(
    () => calculateSquareFootGarden({ rows, columns, cells }),
    [rows, columns, cells],
  );

  const output = result.ok ? result.value : null;
  const brushCrop = getCrop(values.brush ?? '');

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      onReset={() => {
        reset();
        clearPlan();
      }}
      resultFirst
      inputsLabel="Your grid"
      waitingMessage="Set a grid size and tap squares to fill them."
      headline={output ? String(output.totalPlants) : null}
      headlineUnit={output ? (output.totalPlants === 1 ? 'plant' : 'plants') : undefined}
      sentence={
        output ? (
          <p>
            A {rows} by {columns} grid is {output.totalSquares} square feet. You have planted{' '}
            {output.filledSquares} of them, which comes to{' '}
            <strong>
              {output.totalPlants} plant{output.totalPlants === 1 ? '' : 's'}
            </strong>
            {output.emptySquares > 0
              ? `, with ${output.emptySquares} square${output.emptySquares === 1 ? '' : 's'} still free`
              : ''}
            . Your plan is saved in this browser and travels in the page address, so you can send
            the link to yourself.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${rows}x${columns} square foot garden: ${output.totalPlants} plants across ${output.filledSquares} squares.\n` +
            output.crops
              .map((crop) => `${crop.name}: ${crop.squares} sq, ${crop.plants} plants`)
              .join('\n') +
            '\nPlanned at soilsums.com'
          : ''
      }
      notes={output ? output.crops.flatMap((crop) => (crop.note ? [crop.note] : [])) : []}
      extra={
        output && output.crops.length > 0 ? (
          <ResultTable
            caption="What is in the plan"
            columns={['Crop', 'Squares', 'Per square', 'Plants']}
            rows={output.crops.map((crop) => ({
              key: crop.slug,
              cells: [
                <CropLink key="name" slug={crop.slug} name={crop.name} linkedCrops={linkedCrops} />,
                crop.squares,
                crop.squaresPerPlant ? `1 per ${crop.squaresPerPlant} sq` : crop.plantsPerSquare,
                crop.plants,
              ],
            }))}
          />
        ) : null
      }
    >
      <SelectField
        label="Rows"
        value={String(rows)}
        onChange={(value) => setValue('rows', value)}
        options={SIZES}
      />
      <SelectField
        label="Columns"
        value={String(columns)}
        onChange={(value) => setValue('columns', value)}
        options={SIZES}
      />

      <div className="col-span-2">
        <SelectField
          label="Crop to place"
          value={values.brush ?? ''}
          onChange={(value) => setValue('brush', value)}
          options={crops.map((crop) => ({
            value: crop.slug,
            label: `${crop.name} — ${
              crop.plantsPerSquareFoot >= 1
                ? `${crop.plantsPerSquareFoot} per square`
                : `1 per ${Math.ceil(1 / crop.plantsPerSquareFoot)} squares`
            }`,
          }))}
          hint="Tap a square to plant it, again to clear it"
        />
      </div>

      <div className="col-span-2">
        <p className="text-sm font-semibold">
          Your grid
          {brushCrop ? ` — placing ${brushCrop.name.toLowerCase()}` : ''}
        </p>
        <div className="mt-2 overflow-x-auto">
          <div
            role="group"
            aria-label={`${rows} by ${columns} planting grid`}
            className="bg-paper border-ink inline-grid gap-px border-2"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(2.25rem, 1fr))` }}
          >
            {cells.map((cell, index) => {
              const crop = cell ? getCrop(cell) : undefined;
              const row = Math.floor(index / columns) + 1;
              const column = (index % columns) + 1;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => paint(index)}
                  aria-label={`Row ${row}, column ${column}: ${crop ? crop.name : 'empty'}`}
                  className={`border-rule flex aspect-square items-center justify-center border text-xs font-semibold ${
                    crop ? 'bg-kale text-paper' : 'bg-paper text-ink/30'
                  }`}
                >
                  {crop ? abbreviate(crop.name) : '+'}
                </button>
              );
            })}
          </div>
        </div>
        <div className="no-print mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearPlan}
            className="border-kale text-kale border-2 px-3 py-1.5 text-sm font-semibold"
          >
            Empty the grid
          </button>
        </div>
      </div>
    </CalculatorFrame>
  );
}
