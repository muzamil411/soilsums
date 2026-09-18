/**
 * Square foot garden planner.
 *
 * The pure part of the planner: given a grid and a crop assigned to each
 * square, work out how many plants that comes to.
 *
 * Density comes from one of two places, and the planner says which it used.
 * Where the Cornell CALS square foot gardening page names the crop, that
 * figure is used: it is the convention the whole method rests on, so a planner
 * that ignored it would not be planning a square foot garden. Where it does
 * not — kale, sweet corn, the winter vines, most herbs — the planner falls back
 * to the density implied by the crop's in-row spacing.
 *
 * A density below 1 means the crop needs several squares per plant rather than
 * several plants per square, so the planner reports the squares-per-plant
 * figure and says plainly when too few squares have been assigned to grow even
 * one.
 */
import { crops, getCrop, plantsPerSquareFoot } from '@/data/crops';
import { round } from './shared/round';
import {
  collect,
  fail,
  ok,
  requireRange,
  type Calculation,
  type FieldError,
} from './shared/validate';

export const MIN_GRID_SIDE = 1;
export const MAX_GRID_SIDE = 24;

export type SquareFootGardenInput = {
  readonly rows: number;
  readonly columns: number;
  /**
   * One entry per square, row by row from the top left. A crop slug, or null
   * for an empty square. Its length must equal rows x columns.
   */
  readonly cells: readonly (string | null)[];
};

export type PlannedCrop = {
  readonly slug: string;
  readonly name: string;
  readonly squares: number;
  readonly plantsPerSquare: number;
  /**
   * Where that density came from: the square foot gardening method, or the
   * crop's own row spacing. Shown on the page, because they are different
   * kinds of claim.
   */
  readonly densityBasis: 'sfg' | 'spacing';
  /** Whole plants those squares will grow. */
  readonly plants: number;
  /** Set when the crop needs more than one square per plant. */
  readonly squaresPerPlant: number | null;
  readonly note: string | null;
};

export type SquareFootGardenOutput = {
  readonly rows: number;
  readonly columns: number;
  readonly totalSquares: number;
  readonly filledSquares: number;
  readonly emptySquares: number;
  readonly crops: readonly PlannedCrop[];
  readonly totalPlants: number;
};

export function calculateSquareFootGarden(
  input: SquareFootGardenInput,
): Calculation<SquareFootGardenOutput> {
  const errors: FieldError[] = collect([
    requireRange(input.rows, MIN_GRID_SIDE, MAX_GRID_SIDE, 'rows', 'number of rows'),
    requireRange(input.columns, MIN_GRID_SIDE, MAX_GRID_SIDE, 'columns', 'number of columns'),
  ]);

  if (errors.length === 0 && (!Number.isInteger(input.rows) || !Number.isInteger(input.columns))) {
    errors.push({ field: 'rows', message: 'Grid size must be a whole number of squares' });
  }

  const totalSquares = input.rows * input.columns;
  if (errors.length === 0 && input.cells.length !== totalSquares) {
    errors.push({
      field: 'cells',
      message: `This grid has ${totalSquares} squares but ${input.cells.length} were supplied`,
    });
  }

  if (errors.length === 0) {
    const unknown = [
      ...new Set(input.cells.filter((cell): cell is string => cell !== null)),
    ].filter((slug) => !getCrop(slug));
    if (unknown.length > 0) {
      errors.push({
        field: 'cells',
        message: `Unknown crop${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`,
      });
    }
  }

  if (errors.length > 0) {
    return fail(errors);
  }

  const counts = new Map<string, number>();
  for (const cell of input.cells) {
    if (cell !== null) {
      counts.set(cell, (counts.get(cell) ?? 0) + 1);
    }
  }

  const planned: PlannedCrop[] = [...counts.entries()]
    .map(([slug, squares]) => {
      // Already validated above, so the crop is certain to exist.
      const crop = getCrop(slug) as (typeof crops)[number];
      const sfg = crop.sfgPlantsPerSquare;
      const density = sfg ?? plantsPerSquareFoot(crop);
      const densityBasis: 'sfg' | 'spacing' = sfg === null ? 'spacing' : 'sfg';
      const squaresPerPlant = density < 1 ? Math.ceil(1 / density) : null;
      const plants = density >= 1 ? Math.round(squares * density) : Math.floor(squares * density);

      let note: string | null = null;
      if (squaresPerPlant !== null && plants === 0) {
        note = `${crop.name} needs about ${squaresPerPlant} squares per plant. ${squares} square${squares === 1 ? '' : 's'} is not enough for one.`;
      } else if (squaresPerPlant !== null) {
        note = `${crop.name} spreads over about ${squaresPerPlant} squares per plant.`;
      }

      return {
        slug,
        name: crop.name,
        squares,
        plantsPerSquare: round(density, 2),
        densityBasis,
        plants,
        squaresPerPlant,
        note,
      };
    })
    .sort((a, b) => b.squares - a.squares || a.name.localeCompare(b.name));

  const filledSquares = [...counts.values()].reduce((sum, count) => sum + count, 0);

  return ok({
    rows: input.rows,
    columns: input.columns,
    totalSquares,
    filledSquares,
    emptySquares: totalSquares - filledSquares,
    crops: planned,
    totalPlants: planned.reduce((sum, crop) => sum + crop.plants, 0),
  });
}

/** An empty grid of the given size, for a fresh plan. */
export function emptyGrid(rows: number, columns: number): (string | null)[] {
  return Array.from({ length: rows * columns }, () => null);
}
