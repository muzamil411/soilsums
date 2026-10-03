/**
 * Bulk soil calculator.
 *
 * Volume for a bed or an area at a given depth, in cubic feet and cubic yards,
 * with bag counts, coverage, and weight where a defensible figure exists.
 *
 * The volume arithmetic is exact and needs no source: 27 cubic feet to the cubic
 * yard by definition, and 324 divided by the depth in inches is the square feet
 * one cubic yard covers, because 27 cubic feet spread an inch deep is 324 square
 * feet.
 *
 * Weight is the opposite. Compost is published per cubic yard as supplied, so a
 * range there is a real answer. We do not have a source supporting a reliable
 * delivered-topsoil weight for this calculator — it is a property of one
 * supplier's pile on one day — so for soil the tool prints no weight unless
 * the reader enters their supplier's own figure. See data/densities.ts for why.
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
import { COMPOST_DENSITY } from '@/data/densities';

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
  /**
   * Supplier-quoted weight in lb per cubic yard, for the soil case.
   *
   * No publication gives a delivered-topsoil weight, so the tool refuses to
   * invent one: it only computes a soil weight from a figure the reader's own
   * supplier supplied. Absent, there is no weight — see weightFor.
   */
  readonly supplierLbPerCubicYard?: number;
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
  /** True where the figures come from the reader's supplier rather than a publication. */
  readonly supplierFigure: boolean;
  /**
   * True where the high end is open rather than a maximum. Compost only:
   * Oregon State publishes "800 to more than 1,600", so 1,600 is where the
   * published range stops, not where compost stops.
   */
  readonly highOpenEnded: boolean;
};

export type BulkSoilResult = {
  readonly squareFeet: number;
  readonly cubicFeet: number;
  readonly cubicYards: number;
  readonly depthInches: number;
  /** Square feet one cubic yard covers at this depth. */
  readonly coveragePerYard: number;
  readonly bags: readonly { readonly cubicFeet: number; readonly count: number }[];
  /**
   * Null for soil where no supplier figure was entered: there is no published
   * delivered-topsoil weight, so the honest result is no weight at all rather
   * than a range built from something else.
   */
  readonly weight: WeightRange | null;
  /** Whole truck loads, by volume only, where a capacity was given. */
  readonly truckLoads?: number;
};

function weightFor(input: BulkSoilInput, cubicYards: number): WeightRange | null {
  if (input.material === 'compost') {
    // Compost is published per cubic yard as supplied: a range with its reason.
    const lowLbPerCubicYard = COMPOST_DENSITY.lowLbPerCubicYard;
    const highLbPerCubicYard = COMPOST_DENSITY.highLbPerCubicYard;

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
      typicalLbPerCubicYard: COMPOST_DENSITY.typicalLbPerCubicYard,
      lowLbPerCubicYard: Math.round(lowLbPerCubicYard),
      highLbPerCubicYard: Math.round(highLbPerCubicYard),
      supplierFigure: false,
      highOpenEnded: true,
    };
  }

  // Soil: we have no sourced delivered weight. A supplier's own figure is the
  // only defensible input, and without one the tool prints no weight.
  const supplierLbPerCubicYard = input.supplierLbPerCubicYard;
  if (supplierLbPerCubicYard === undefined) return null;

  const pounds = cubicYards * supplierLbPerCubicYard;
  return {
    lowLb: Math.round(pounds),
    highLb: Math.round(pounds),
    lowTons: toSignificant(pounds / POUNDS_PER_TON, 3),
    highTons: toSignificant(pounds / POUNDS_PER_TON, 3),
    lowYardsPerTon: toSignificant(POUNDS_PER_TON / supplierLbPerCubicYard, 3),
    highYardsPerTon: toSignificant(POUNDS_PER_TON / supplierLbPerCubicYard, 3),
    lowLbPerCubicYard: Math.round(supplierLbPerCubicYard),
    highLbPerCubicYard: Math.round(supplierLbPerCubicYard),
    supplierFigure: true,
    highOpenEnded: false,
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
    // Supplier density is meaningless for compost (the field is hidden and
    // weightFor ignores it), so an invalid leftover value from soil must not
    // block a compost calculation.
    input.material === 'compost' || input.supplierLbPerCubicYard === undefined
      ? null
      : requirePositive(
          input.supplierLbPerCubicYard,
          'supplierLbPerCubicYard',
          'supplier weight in lb per cubic yard',
        ),
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
