/**
 * Container potting soil calculator.
 *
 * Volume for one or more containers, reported in US dry quarts, US liquid
 * gallons, cubic feet and liters.
 *
 * The headline unit is the DRY quart, because that is how bagged potting mix is
 * sold in the United States: one cubic foot is 25.71 dry quarts. The liquid
 * figure for the same cubic foot is 29.92 quarts, and using it would overstate
 * a container's capacity — and understate the bags needed — by about 16%.
 */
import { boxCubicFeet, cylinderCubicFeet } from './shared/geometry';
import {
  US_DRY_QUARTS_PER_CUBIC_FOOT,
  US_GALLONS_PER_CUBIC_FOOT,
  US_LIQUID_QUARTS_PER_CUBIC_FOOT,
  cubicFeetToLiters,
  spacingToInches,
  type UnitSystem,
} from './shared/units';
import { roundUp, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requireCount,
  requirePositive,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type ContainerShape = 'round' | 'square' | 'rectangular' | 'half-barrel';

export type PottingSoilInput = {
  readonly units: UnitSystem;
  readonly shape: ContainerShape;
  /**
   * Inches (imperial) or centimeters (metric). Diameter for round and half
   * barrel, side length for square, the shorter side for rectangular.
   */
  readonly width: number;
  /** Inches or centimeters. Rectangular only — the longer side. */
  readonly length?: number;
  /** Inches or centimeters of soil depth, not the full height of the pot. */
  readonly depth: number;
  readonly quantity: number;
  /**
   * Optional bag size in US dry quarts (imperial) or liters (metric). When
   * given, the result includes a bag count.
   */
  readonly bagSize?: number;
};

export type PottingSoilOutput = {
  readonly dryQuartsPerContainer: number;
  readonly dryQuarts: number;
  readonly usGallons: number;
  readonly liquidQuarts: number;
  readonly cubicFeet: number;
  readonly liters: number;
  readonly quantity: number;
  readonly bags: number | null;
  readonly bagSize: number | null;
};

export function calculatePottingSoil(input: PottingSoilInput): Calculation<PottingSoilOutput> {
  const { units, shape } = input;
  const unitName = units === 'imperial' ? 'inches' : 'centimeters';
  const widthLabel =
    shape === 'round' || shape === 'half-barrel'
      ? `diameter in ${unitName}`
      : `width in ${unitName}`;

  const errors: FieldError[] = collect([
    requirePositive(input.width, 'width', widthLabel),
    shape === 'rectangular'
      ? requirePositive(input.length, 'length', `length in ${unitName}`)
      : null,
    requirePositive(input.depth, 'depth', `depth in ${unitName}`),
    requireCount(input.quantity, 'quantity', 'number of containers'),
    input.bagSize === undefined ? null : requirePositive(input.bagSize, 'bagSize', 'bag size'),
  ]);

  if (errors.length > 0) {
    return fail(errors);
  }

  const widthInches = spacingToInches(input.width, units);
  const depthInches = spacingToInches(input.depth, units);

  let cubicFeetPerContainer: number;
  switch (shape) {
    case 'round':
    case 'half-barrel':
      // A half barrel is a cylinder; the two differ only in typical size.
      cubicFeetPerContainer = cylinderCubicFeet(widthInches, depthInches);
      break;
    case 'square':
      cubicFeetPerContainer = boxCubicFeet(widthInches, widthInches, depthInches);
      break;
    case 'rectangular': {
      const lengthInches = spacingToInches(input.length as number, units);
      cubicFeetPerContainer = boxCubicFeet(lengthInches, widthInches, depthInches);
      break;
    }
  }

  const cubicFeet = cubicFeetPerContainer * input.quantity;
  const liters = cubicFeetToLiters(cubicFeet);
  const dryQuarts = cubicFeet * US_DRY_QUARTS_PER_CUBIC_FOOT;

  const bagUnits = units === 'imperial' ? dryQuarts : liters;
  const bags = input.bagSize === undefined ? null : roundUp(bagUnits / input.bagSize);

  return ok({
    dryQuartsPerContainer: toSignificant(cubicFeetPerContainer * US_DRY_QUARTS_PER_CUBIC_FOOT, 4),
    dryQuarts: toSignificant(dryQuarts, 4),
    usGallons: toSignificant(cubicFeet * US_GALLONS_PER_CUBIC_FOOT, 4),
    liquidQuarts: toSignificant(cubicFeet * US_LIQUID_QUARTS_PER_CUBIC_FOOT, 4),
    cubicFeet: toSignificant(cubicFeet, 4),
    liters: toSignificant(liters, 4),
    quantity: input.quantity,
    bags,
    bagSize: input.bagSize ?? null,
  });
}
