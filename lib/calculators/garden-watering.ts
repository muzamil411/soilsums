/**
 * Garden watering calculator.
 *
 * Water needed for a week, after rainfall, in US gallons and liters.
 *
 * The imperial arithmetic is area in square feet x inches of water x 0.6234
 * gallons. That 0.6234 is not a fudge factor: an inch of water over a square
 * foot is 144 cubic inches, and a US gallon is 231 cubic inches, so
 * 144 / 231 = 0.6234.
 *
 * Metric is simpler — a millimetre of water over a square metre is exactly one
 * liter.
 */
import {
  LITERS_PER_SQM_MM,
  MM_PER_INCH,
  US_GALLONS_PER_SQFT_INCH,
  areaToSquareFeet,
  squareFeetToSquareMeters,
  type UnitSystem,
} from './shared/units';
import { round, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requireNonNegative,
  requirePositive,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type GardenWateringInput = {
  readonly units: UnitSystem;
  /** Square feet (imperial) or square meters (metric). */
  readonly area: number;
  /** Inches per week (imperial) or millimetres per week (metric). */
  readonly waterPerWeek: number;
  /** Rainfall already received this week, in the same depth unit. */
  readonly rainfall: number;
};

export type GardenWateringOutput = {
  readonly areaSquareFeet: number;
  readonly areaSquareMeters: number;
  /** What the garden still needs, after rain, never below zero. */
  readonly netInches: number;
  readonly netMillimeters: number;
  readonly gallons: number;
  readonly liters: number;
  /** Split across the usual two soakings a week. */
  readonly gallonsPerSession: number;
  readonly litersPerSession: number;
  readonly sessionsPerWeek: number;
  readonly rainfallCoveredIt: boolean;
  readonly notes: readonly string[];
};

/** Deep soakings per week — twice is the usual advice for most vegetables. */
const SESSIONS_PER_WEEK = 2;

export function calculateGardenWatering(
  input: GardenWateringInput,
): Calculation<GardenWateringOutput> {
  const { units } = input;
  const areaLabel = units === 'imperial' ? 'area in square feet' : 'area in square meters';
  const depthUnit = units === 'imperial' ? 'inches' : 'millimeters';

  const errors: FieldError[] = collect([
    requirePositive(input.area, 'area', areaLabel),
    requirePositive(input.waterPerWeek, 'waterPerWeek', `weekly water target in ${depthUnit}`),
    requireNonNegative(input.rainfall, 'rainfall', `rainfall in ${depthUnit}`),
  ]);

  if (errors.length > 0) {
    return fail(errors);
  }

  const areaSquareFeet = areaToSquareFeet(input.area, units);
  const targetInches = units === 'imperial' ? input.waterPerWeek : input.waterPerWeek / MM_PER_INCH;
  const rainfallInches = units === 'imperial' ? input.rainfall : input.rainfall / MM_PER_INCH;

  // Rain in excess of the target does not create a negative requirement.
  const netInches = Math.max(0, targetInches - rainfallInches);
  const gallons = areaSquareFeet * netInches * US_GALLONS_PER_SQFT_INCH;
  const liters =
    squareFeetToSquareMeters(areaSquareFeet) * netInches * MM_PER_INCH * LITERS_PER_SQM_MM;

  const notes: string[] = [];
  const rainfallCoveredIt = netInches === 0;
  if (rainfallCoveredIt) {
    notes.push(
      'Rainfall has already met this week’s target, so no watering is needed. Check the soil a few inches down before deciding — a heavy shower can run off rather than soak in.',
    );
  }
  if (targetInches > 2) {
    notes.push(
      'More than two inches a week is a lot for most vegetables. Sandy soil in high summer can need it; heavy soil rarely does, and staying that wet invites root rot.',
    );
  }

  return ok({
    areaSquareFeet: toSignificant(areaSquareFeet, 4),
    areaSquareMeters: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    netInches: round(netInches, 3),
    netMillimeters: round(netInches * MM_PER_INCH, 2),
    gallons: toSignificant(gallons, 4),
    liters: toSignificant(liters, 4),
    gallonsPerSession: toSignificant(gallons / SESSIONS_PER_WEEK, 4),
    litersPerSession: toSignificant(liters / SESSIONS_PER_WEEK, 4),
    sessionsPerWeek: SESSIONS_PER_WEEK,
    rainfallCoveredIt,
    notes,
  });
}
