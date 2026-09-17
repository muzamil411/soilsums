/**
 * Mulch calculator.
 *
 * Cubic feet, cubic yards and liters of mulch for a bed at a given depth, and
 * the number of bags. Accepts either a known area or the bed's dimensions.
 */
import { fillCubicFeet, footprintSquareFeet, type Footprint } from './shared/geometry';
import {
  areaToSquareFeet,
  cubicFeetToCubicYards,
  cubicFeetToLiters,
  depthToInches,
  LITERS_PER_CUBIC_FOOT,
  lengthToFeet,
  squareFeetToSquareMeters,
  type UnitSystem,
} from './shared/units';
import { roundUp, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requirePositive,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type MulchEntryMode = 'area' | 'rectangle' | 'circle';

export type MulchInput = {
  readonly units: UnitSystem;
  readonly mode: MulchEntryMode;
  /** Square feet (imperial) or square meters (metric). Area mode only. */
  readonly area?: number;
  /** Feet or meters. Rectangle mode only. */
  readonly length?: number;
  readonly width?: number;
  /** Feet or meters. Circle mode only. */
  readonly diameter?: number;
  /** Inches (imperial) or centimeters (metric). */
  readonly depth: number;
  /** Cubic feet (imperial) or liters (metric) per bag. */
  readonly bagSize: number;
};

export type MulchOutput = {
  readonly areaSquareFeet: number;
  readonly areaSquareMeters: number;
  readonly cubicFeet: number;
  readonly cubicYards: number;
  readonly liters: number;
  readonly cubicMeters: number;
  readonly bags: number;
  readonly bagSize: number;
  /** Square feet one bag covers at this depth — handy at the garden centre. */
  readonly squareFeetPerBag: number;
};

export function calculateMulch(input: MulchInput): Calculation<MulchOutput> {
  const { units, mode } = input;
  const areaLabel = units === 'imperial' ? 'area in square feet' : 'area in square meters';
  const spanUnit = units === 'imperial' ? 'feet' : 'meters';

  const errors: FieldError[] = collect([
    mode === 'area' ? requirePositive(input.area, 'area', areaLabel) : null,
    mode === 'rectangle' ? requirePositive(input.length, 'length', `length in ${spanUnit}`) : null,
    mode === 'rectangle' ? requirePositive(input.width, 'width', `width in ${spanUnit}`) : null,
    mode === 'circle'
      ? requirePositive(input.diameter, 'diameter', `diameter in ${spanUnit}`)
      : null,
    requirePositive(input.depth, 'depth', 'depth'),
    requirePositive(input.bagSize, 'bagSize', 'bag size'),
  ]);

  if (errors.length > 0) {
    return fail(errors);
  }

  let footprint: Footprint;
  if (mode === 'area') {
    footprint = { shape: 'area', squareFeet: areaToSquareFeet(input.area as number, units) };
  } else if (mode === 'rectangle') {
    footprint = {
      shape: 'rectangle',
      lengthFeet: lengthToFeet(input.length as number, units),
      widthFeet: lengthToFeet(input.width as number, units),
    };
  } else {
    footprint = { shape: 'circle', diameterFeet: lengthToFeet(input.diameter as number, units) };
  }

  const areaSquareFeet = footprintSquareFeet(footprint);
  const depthInches = depthToInches(input.depth, units);
  const cubicFeet = fillCubicFeet(areaSquareFeet, depthInches);
  const liters = cubicFeetToLiters(cubicFeet);

  const totalInBagUnits = units === 'imperial' ? cubicFeet : liters;
  const bags = roundUp(totalInBagUnits / input.bagSize);

  // One bag's own volume, in cubic feet, spread at this depth.
  const bagCubicFeet = units === 'imperial' ? input.bagSize : input.bagSize / LITERS_PER_CUBIC_FOOT;
  const squareFeetPerBag = (bagCubicFeet * 12) / depthInches;

  return ok({
    areaSquareFeet: toSignificant(areaSquareFeet, 4),
    areaSquareMeters: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    cubicFeet: toSignificant(cubicFeet, 4),
    cubicYards: toSignificant(cubicFeetToCubicYards(cubicFeet), 3),
    liters: toSignificant(liters, 4),
    cubicMeters: toSignificant(liters / 1000, 3),
    bags,
    bagSize: input.bagSize,
    squareFeetPerBag: toSignificant(squareFeetPerBag, 3),
  });
}
