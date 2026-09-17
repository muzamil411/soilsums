/**
 * Plant spacing calculator.
 *
 * How many plants fit in a bed, in either a square grid or a triangular
 * (staggered, hexagonal) layout.
 *
 * The triangular figure is computed, not fudged. Triangular planting is often
 * quoted as fitting "about 15% more plants", and the reason is geometric: if
 * every plant must stay at least distance d from its neighbours, staggering
 * alternate rows lets the rows sit d x sqrt(3)/2 apart — about 0.866d — instead
 * of a full d. Squeezing the rows closer by that factor is where 1 / 0.866 =
 * 1.155, the 15%, comes from.
 *
 * Two consequences the flat-percentage version hides, and this one reports:
 *  - In a triangular layout the ROW PITCH is derived from the plant spacing,
 *    so the row spacing input applies to the square layout only.
 *  - The gain is not always 15%. Rows and plants come in whole numbers, so a
 *    shallow bed may fit no extra row at all, and staggered rows lose a plant
 *    at the end when there is no room for the half-spacing offset. In a small
 *    bed triangular can even come out slightly behind.
 */
import {
  INCHES_PER_FOOT,
  lengthToFeet,
  spacingToInches,
  squareFeetToSquareMeters,
  type UnitSystem,
} from './shared/units';
import { round, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requirePositive,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type SpacingLayout = 'square' | 'triangular';

export type PlantSpacingInput = {
  readonly units: UnitSystem;
  /** Feet (imperial) or meters (metric). */
  readonly bedLength: number;
  readonly bedWidth: number;
  /** Inches (imperial) or centimeters (metric) between plants within a row. */
  readonly plantSpacing: number;
  /** Inches or centimeters between rows. Used by the square layout only. */
  readonly rowSpacing: number;
  readonly layout: SpacingLayout;
};

export type PlantSpacingOutput = {
  readonly layout: SpacingLayout;
  readonly areaSquareFeet: number;
  readonly areaSquareMeters: number;
  readonly rows: number;
  readonly rowPitchInches: number;
  /** Plants in a full row, and in an offset row for triangular layouts. */
  readonly plantsPerRow: number;
  readonly plantsPerOffsetRow: number | null;
  readonly totalPlants: number;
  /** The same bed in the other layout, for comparison. */
  readonly squareLayoutPlants: number;
  readonly triangularLayoutPlants: number;
  /** Percentage more (or fewer) plants than the square layout gives. */
  readonly gainPercent: number;
  readonly squareFeetPerPlant: number | null;
  readonly notes: readonly string[];
};

/** The sqrt(3)/2 row-pitch factor that makes triangular packing tighter. */
export const TRIANGULAR_ROW_FACTOR = Math.sqrt(3) / 2;

/**
 * Plants that fit along a span, with half the spacing left at each end so the
 * outermost plants are not jammed against the sides of the bed.
 */
function fitAlong(spanInches: number, spacingInches: number): number {
  return Math.floor(spanInches / spacingInches);
}

function squareLayout(
  lengthInches: number,
  widthInches: number,
  plantSpacing: number,
  rowSpacing: number,
) {
  const rows = fitAlong(widthInches, rowSpacing);
  const plantsPerRow = fitAlong(lengthInches, plantSpacing);
  return { rows, plantsPerRow, total: rows * plantsPerRow, rowPitch: rowSpacing };
}

function triangularLayout(lengthInches: number, widthInches: number, plantSpacing: number) {
  const rowPitch = plantSpacing * TRIANGULAR_ROW_FACTOR;
  const rows = fitAlong(widthInches, rowPitch);
  const plantsPerRow = fitAlong(lengthInches, plantSpacing);
  // An offset row is shifted half a spacing along, so it loses its last plant
  // unless there is at least half a spacing of slack at the end of the row.
  const slack = lengthInches - plantsPerRow * plantSpacing;
  const plantsPerOffsetRow =
    plantsPerRow === 0 ? 0 : slack >= plantSpacing / 2 ? plantsPerRow : plantsPerRow - 1;
  const fullRows = Math.ceil(rows / 2);
  const offsetRows = Math.floor(rows / 2);
  return {
    rows,
    plantsPerRow,
    plantsPerOffsetRow,
    total: fullRows * plantsPerRow + offsetRows * plantsPerOffsetRow,
    rowPitch,
  };
}

export function calculatePlantSpacing(input: PlantSpacingInput): Calculation<PlantSpacingOutput> {
  const { units, layout } = input;
  const spanUnit = units === 'imperial' ? 'feet' : 'meters';
  const shortUnit = units === 'imperial' ? 'inches' : 'centimeters';

  const errors: FieldError[] = collect([
    requirePositive(input.bedLength, 'bedLength', `bed length in ${spanUnit}`),
    requirePositive(input.bedWidth, 'bedWidth', `bed width in ${spanUnit}`),
    requirePositive(input.plantSpacing, 'plantSpacing', `plant spacing in ${shortUnit}`),
    requirePositive(input.rowSpacing, 'rowSpacing', `row spacing in ${shortUnit}`),
  ]);

  if (errors.length > 0) {
    return fail(errors);
  }

  const lengthInches = lengthToFeet(input.bedLength, units) * INCHES_PER_FOOT;
  const widthInches = lengthToFeet(input.bedWidth, units) * INCHES_PER_FOOT;
  const plantSpacing = spacingToInches(input.plantSpacing, units);
  const rowSpacing = spacingToInches(input.rowSpacing, units);

  const square = squareLayout(lengthInches, widthInches, plantSpacing, rowSpacing);
  const triangular = triangularLayout(lengthInches, widthInches, plantSpacing);
  const chosen = layout === 'square' ? square : triangular;

  const areaSquareFeet = (lengthInches * widthInches) / INCHES_PER_FOOT ** 2;
  const notes: string[] = [];

  if (chosen.total === 0) {
    notes.push(
      `Nothing fits: the bed is smaller than one plant's spacing. A ${round(plantSpacing, 1)} inch spacing needs a bed at least that wide and long.`,
    );
  }

  if (layout === 'triangular') {
    notes.push(
      `Triangular rows sit ${round(triangular.rowPitch, 1)} inches apart — the plant spacing multiplied by 0.866 — rather than using the row spacing above.`,
    );
    if (triangular.total < square.total) {
      notes.push(
        'In this bed the square layout actually fits more. Staggered rows only pay off once the bed is deep enough for the extra row they make room for.',
      );
    }
  }

  const gainPercent =
    square.total === 0 ? 0 : ((triangular.total - square.total) / square.total) * 100;

  return ok({
    layout,
    areaSquareFeet: toSignificant(areaSquareFeet, 4),
    areaSquareMeters: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    rows: chosen.rows,
    rowPitchInches: round(chosen.rowPitch, 2),
    plantsPerRow: chosen.plantsPerRow,
    plantsPerOffsetRow: layout === 'triangular' ? triangular.plantsPerOffsetRow : null,
    totalPlants: chosen.total,
    squareLayoutPlants: square.total,
    triangularLayoutPlants: triangular.total,
    gainPercent: round(gainPercent, 1),
    squareFeetPerPlant: chosen.total === 0 ? null : toSignificant(areaSquareFeet / chosen.total, 3),
    notes,
  });
}
