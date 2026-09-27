/**
 * Bulk soil calculator.
 *
 * Volume for a bed or an area at a given depth, in cubic feet and cubic yards,
 * with bag counts, coverage, and a weight RANGE rather than a single figure.
 *
 * The volume arithmetic is exact and needs no source: 27 cubic feet to the cubic
 * yard by definition, and 324 divided by the depth in inches is the square feet
 * one cubic yard covers, because 27 cubic feet spread an inch deep is 324 square
 * feet. The weight is the opposite — see data/densities.ts for why a single
 * number cannot honestly be printed, which is the whole point of this tool.
 */
import { fillCubicFeet, footprintSquareFeet, type Footprint } from './shared/geometry';
import {
  areaToSquareFeet,
  CUBIC_FEET_PER_CUBIC_YARD,
  depthToInches,
  INCHES_PER_FOOT,
  lengthToFeet,
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
import {
  COMPOST_DENSITY,
  getSoilTexture,
  gramsPerCm3ToLbPerCubicYard,
  SOIL_TEXTURES,
} from '@/data/densities';

/**
 * Square feet that one cubic yard covers at one inch deep.
 *
 * 27 cubic feet x 12 inches per foot = 324. Exact, and the figure behind every
 * coverage number on the yard-of-dirt article.
 */
export const SQUARE_FEET_PER_YARD_INCH = CUBIC_FEET_PER_CUBIC_YARD * INCHES_PER_FOOT;

/** Bag sizes sold in cubic feet, which is how bulk soil and compost come. */
export const BAG_CUBIC_FEET = [0.75, 1, 1.5, 2] as const;

/** A US short ton. Tons here are always short tons, and the page says so. */
export const POUNDS_PER_TON = 2000;

export type BulkSoilMaterial = 'compost' | 'soil';

export type BulkSoilEntryMode = 'area' | 'rectangle';

export type BulkSoilInput = {
  readonly units: UnitSystem;
  readonly mode: BulkSoilEntryMode;
  /** Square feet (imperial) or square meters (metric). Area mode only. */
  readonly area?: number;
  /** Feet or meters. Rectangle mode only. */
  readonly length?: number;
  readonly width?: number;
  /** Inches (imperial) or centimeters (metric). */
  readonly depth?: number;
  readonly material: BulkSoilMaterial;
  /** Which NRCS texture row, for the soil case. */
  readonly texture?: string;
  /** Truck bed capacity in cubic yards, where the reader has measured one. */
  readonly truckCubicYards?: number;
};

export type WeightRange = {
  readonly lowLb: number;
  readonly highLb: number;
  readonly lowTons: number;
  readonly highTons: number;
  /** Cubic yards you get per ton, which is the inverse question people ask. */
  readonly lowYardsPerTon: number;
  readonly highYardsPerTon: number;
  /** A typical figure where the source gives one. Compost only. */
  readonly typicalLbPerCubicYard?: number;
  readonly lowLbPerCubicYard: number;
  readonly highLbPerCubicYard: number;
  /** True where the range describes soil in the ground rather than as delivered. */
  readonly inPlaceOnly: boolean;
};

export type BulkSoilResult = {
  readonly squareFeet: number;
  readonly cubicFeet: number;
  readonly cubicYards: number;
  readonly depthInches: number;
  /** Square feet one cubic yard covers at this depth. */
  readonly coveragePerYard: number;
  readonly bags: readonly { readonly cubicFeet: number; readonly count: number }[];
  readonly weight: WeightRange;
  /** Whole truck loads, by volume only, where a capacity was given. */
  readonly truckLoads?: number;
};

function weightFor(input: BulkSoilInput, cubicYards: number): WeightRange {
  const compost = input.material === 'compost';
  const texture = getSoilTexture(input.texture ?? '') ?? SOIL_TEXTURES[1];

  // Compost is published per cubic yard as supplied. Soil is published in
  // g/cm3 for soil in place, so it converts and carries the in-place warning.
  const lowLbPerCubicYard = compost
    ? COMPOST_DENSITY.lowLbPerCubicYard
    : gramsPerCm3ToLbPerCubicYard(texture?.idealBelow ?? 1.4);
  const highLbPerCubicYard = compost
    ? COMPOST_DENSITY.highLbPerCubicYard
    : gramsPerCm3ToLbPerCubicYard(texture?.restrictingAbove ?? 1.8);

  const lowLb = cubicYards * lowLbPerCubicYard;
  const highLb = cubicYards * highLbPerCubicYard;

  return {
    lowLb: Math.round(lowLb),
    highLb: Math.round(highLb),
    lowTons: toSignificant(lowLb / POUNDS_PER_TON, 3),
    highTons: toSignificant(highLb / POUNDS_PER_TON, 3),
    // Heavier material means fewer yards to the ton, so the high density gives
    // the low yards-per-ton figure.
    lowYardsPerTon: toSignificant(POUNDS_PER_TON / highLbPerCubicYard, 3),
    highYardsPerTon: toSignificant(POUNDS_PER_TON / lowLbPerCubicYard, 3),
    ...(compost ? { typicalLbPerCubicYard: COMPOST_DENSITY.typicalLbPerCubicYard } : {}),
    lowLbPerCubicYard: Math.round(lowLbPerCubicYard),
    highLbPerCubicYard: Math.round(highLbPerCubicYard),
    inPlaceOnly: !compost,
  };
}

export function calculateBulkSoil(input: BulkSoilInput): Calculation<BulkSoilResult> {
  const imperial = input.units === 'imperial';
  const spanUnit = imperial ? 'feet' : 'meters';
  const areaLabel = imperial ? 'area in square feet' : 'area in square meters';
  const depthLabel = imperial ? 'depth in inches' : 'depth in centimeters';

  const errors: FieldError[] = collect([
    input.mode === 'area' ? requirePositive(input.area, 'area', areaLabel) : null,
    input.mode === 'rectangle'
      ? requirePositive(input.length, 'length', `length in ${spanUnit}`)
      : null,
    input.mode === 'rectangle'
      ? requirePositive(input.width, 'width', `width in ${spanUnit}`)
      : null,
    requirePositive(input.depth, 'depth', depthLabel),
    input.truckCubicYards === undefined
      ? null
      : requirePositive(input.truckCubicYards, 'truckCubicYards', 'truck capacity in cubic yards'),
  ]);
  if (errors.length > 0) return fail(errors);

  const depthInches = depthToInches(input.depth ?? 0, input.units);

  const footprint: Footprint =
    input.mode === 'area'
      ? { shape: 'area', squareFeet: areaToSquareFeet(input.area ?? 0, input.units) }
      : {
          shape: 'rectangle',
          lengthFeet: lengthToFeet(input.length ?? 0, input.units),
          widthFeet: lengthToFeet(input.width ?? 0, input.units),
        };

  const squareFeet = footprintSquareFeet(footprint);
  const cubicFeet = fillCubicFeet(squareFeet, depthInches);
  const cubicYards = cubicFeet / CUBIC_FEET_PER_CUBIC_YARD;

  const weight = weightFor(input, cubicYards);

  return ok({
    squareFeet: toSignificant(squareFeet, 4),
    cubicFeet: toSignificant(cubicFeet, 4),
    cubicYards: toSignificant(cubicYards, 4),
    depthInches: toSignificant(depthInches, 3),
    coveragePerYard: toSignificant(SQUARE_FEET_PER_YARD_INCH / depthInches, 4),
    bags: BAG_CUBIC_FEET.map((size) => ({
      cubicFeet: size,
      count: roundUp(cubicFeet / size),
    })),
    weight,
    ...(input.truckCubicYards === undefined
      ? {}
      : { truckLoads: roundUp(cubicYards / input.truckCubicYards) }),
  });
}
