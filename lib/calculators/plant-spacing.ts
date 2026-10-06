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
  /**
   * Why the count is what it is. A bed that fits four plants when it looks big
   * enough for more reads like a bug unless the binding constraint is named,
   * so every result carries this.
   */
  readonly limit: SpacingLimit;
  readonly notes: readonly string[];
};

export type SpacingLimit = {
  /** The dimension wasting the most room at the current spacing. */
  readonly axis: 'width' | 'length' | 'none';
  /** Plain sentence naming the constraint, e.g. why only one row fits. */
  readonly explanation: string;
  /**
   * The spacing along that axis that would fit one more row or plant, in the
   * reader's own units. Null when the bed is already fully used, or when the
   * change needed is too small to be worth making.
   */
  readonly suggestion: string | null;
};

/** Spans in feet read better than spans in inches once they pass a foot. */
function describeSpan(inches: number, units: UnitSystem): string {
  if (units === 'metric') {
    const centimeters = inches * 2.54;
    return centimeters >= 100 ? `${round(centimeters / 100, 2)} m` : `${round(centimeters, 0)} cm`;
  }
  return inches >= 24 ? `${round(inches / 12, 2)} ft` : `${round(inches, 1)} in`;
}

/** A spacing figure in whichever short unit the reader is working in. */
function describeSpacing(inches: number, units: UnitSystem): string {
  return units === 'metric' ? `${Math.floor(inches * 2.54)} cm` : `${Math.floor(inches)} in`;
}

/**
 * Works out which dimension is actually holding the count down, and what
 * spacing along it would gain one more row or one more plant.
 *
 * Both axes constrain a bed to some degree; the useful one to report is
 * whichever is leaving the most unused space, because that is where the
 * gardener is losing plants they could have had.
 */
function findLimit(
  lengthInches: number,
  widthInches: number,
  plantSpacing: number,
  rowPitch: number,
  rows: number,
  plantsPerRow: number,
  units: UnitSystem,
  rowSpacingIsDerived: boolean,
): SpacingLimit {
  const widthWaste = widthInches - rows * rowPitch;
  const lengthWaste = lengthInches - plantsPerRow * plantSpacing;

  if (rows === 0 || plantsPerRow === 0) {
    return {
      axis: 'none',
      explanation: 'The bed is smaller than a single plant needs at this spacing.',
      suggestion: null,
    };
  }

  // Under an inch of slack either way means the bed is being used fully.
  if (widthWaste < 1 && lengthWaste < 1) {
    return {
      axis: 'none',
      explanation: `The spacing divides evenly into both dimensions, so the bed is fully used.`,
      suggestion: null,
    };
  }

  const widthLimits = widthWaste >= lengthWaste;
  const axis = widthLimits ? ('width' as const) : ('length' as const);
  const span = widthLimits ? widthInches : lengthInches;
  const spacing = widthLimits ? rowPitch : plantSpacing;
  const count = widthLimits ? rows : plantsPerRow;
  const waste = widthLimits ? widthWaste : lengthWaste;

  const explanation = widthLimits
    ? `Rows need ${describeSpacing(rowPitch, units)}, so ${count} fit${count === 1 ? 's' : ''} across a ${describeSpan(widthInches, units)} width, leaving ${describeSpan(waste, units)} spare.`
    : `Plants need ${describeSpacing(plantSpacing, units)}, so ${count} fit along a ${describeSpan(lengthInches, units)} length, leaving ${describeSpan(waste, units)} spare.`;

  // What spacing fits one more? Only worth saying if it is a real change.
  const needed = span / (count + 1);
  const meaningful = needed >= 1 && spacing - needed >= 0.5;
  const suggestion =
    meaningful && !(widthLimits && rowSpacingIsDerived)
      ? widthLimits
        ? `Narrowing the row spacing to ${describeSpacing(needed, units)} would fit ${count + 1} rows of ${plantsPerRow}.`
        : `Narrowing the plant spacing to ${describeSpacing(needed, units)} would fit ${count + 1} plants a row.`
      : meaningful && widthLimits && rowSpacingIsDerived
        ? `A plant spacing of ${describeSpacing(needed / TRIANGULAR_ROW_FACTOR, units)} would fit ${count + 1} rows, since staggered rows take their pitch from it.`
        : null;

  return { axis, explanation, suggestion };
}

/** The sqrt(3)/2 row-pitch factor that makes triangular packing tighter. */
export const TRIANGULAR_ROW_FACTOR = Math.sqrt(3) / 2;

/**
 * Relative tolerance for floating-point boundary corrections.
 *
 * Unit conversion stores 10 significant figures (relative error < 5e-10), so a
 * converted ratio carries absolute error below R * 1e-9. Snapping only within
 * this band fixes conversions landing at 6.999999999999999 instead of 7,
 * while a genuinely undersized input (e.g. 6.99 vs 7.0, off by 1e-2) is far
 * outside it and keeps normal floor behavior. Not a claim of exactness for
 * all inputs — only that conversion/state noise cannot flip a boundary.
 */
const FP_RELATIVE_TOLERANCE = 1e-9;

/**
 * Plants that fit along a span, with half the spacing left at each end so the
 * outermost plants are not jammed against the sides of the bed.
 */
function fitAlong(spanInches: number, spacingInches: number): number {
  const ratio = spanInches / spacingInches;
  const nearest = Math.round(ratio);
  // Snap to a nearby integer only within FP noise; otherwise floor normally.
  if (nearest > 0 && Math.abs(ratio - nearest) <= nearest * FP_RELATIVE_TOLERANCE) {
    return nearest;
  }
  return Math.floor(ratio);
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
  // The half-spacing edge convention is preserved; the tolerance only absorbs
  // FP noise from conversion (e.g. slack computing as 2.999999999999983
  // instead of 3.0), not a genuinely shortfall.
  const slack = lengthInches - plantsPerRow * plantSpacing;
  const halfSpacing = plantSpacing / 2;
  const meetsHalfSpacing = slack / halfSpacing >= 1 - FP_RELATIVE_TOLERANCE;
  const plantsPerOffsetRow =
    plantsPerRow === 0 ? 0 : meetsHalfSpacing ? plantsPerRow : plantsPerRow - 1;
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

  const limit = findLimit(
    lengthInches,
    widthInches,
    plantSpacing,
    chosen.rowPitch,
    chosen.rows,
    chosen.plantsPerRow,
    units,
    layout === 'triangular',
  );

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
    limit,
    notes,
  });
}
