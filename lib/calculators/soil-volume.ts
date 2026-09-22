/**
 * Soil volume converter.
 *
 * Converts one quantity of growing medium between the units a bag, a bulk
 * supplier and a European retailer each use, in both directions.
 *
 * The whole point of the tool is the dry quart. Bagged potting mix in the
 * United States is sold by the DRY quart, which is 67.200625 cubic inches —
 * one cubic foot is 25.71 of them. The liquid quart shares the name and is
 * 57.75 cubic inches, so a cubic foot is 29.92 of those. Convert a 25 quart
 * bag with the liquid figure and you get 0.84 cubic feet instead of 0.97, a
 * 16% error in the direction of buying too little.
 *
 * Weight is reported as a range rather than a figure. Bulk density of a
 * growing medium varies with what is in it and how wet it is — a dry
 * peat-and-bark mix and the same bag after a week in the rain differ by more
 * than a factor of two — so a single number would be wrong for almost
 * everyone. See SOIL_DENSITY below.
 */
import {
  CUBIC_FEET_PER_CUBIC_YARD,
  LITERS_PER_CUBIC_FOOT,
  US_DRY_QUARTS_PER_CUBIC_FOOT,
  US_GALLONS_PER_CUBIC_FOOT,
  US_LIQUID_QUARTS_PER_CUBIC_FOOT,
} from './shared/units';
import { toSignificant } from './shared/round';
import { collect, fail, ok, requirePositive, type Calculation } from './shared/validate';

/** Every unit the converter accepts, in both directions. */
export const VOLUME_UNITS = [
  'dryQuarts',
  'liquidQuarts',
  'usGallons',
  'cubicFeet',
  'cubicYards',
  'liters',
] as const;

export type VolumeUnit = (typeof VOLUME_UNITS)[number];

/** How many of each unit make one cubic foot. */
const PER_CUBIC_FOOT: Record<VolumeUnit, number> = {
  dryQuarts: US_DRY_QUARTS_PER_CUBIC_FOOT,
  liquidQuarts: US_LIQUID_QUARTS_PER_CUBIC_FOOT,
  usGallons: US_GALLONS_PER_CUBIC_FOOT,
  cubicFeet: 1,
  cubicYards: 1 / CUBIC_FEET_PER_CUBIC_YARD,
  liters: LITERS_PER_CUBIC_FOOT,
};

export const UNIT_LABELS: Record<VolumeUnit, { short: string; long: string; note: string }> = {
  dryQuarts: {
    short: 'dry qt',
    long: 'US dry quarts',
    note: 'How bagged potting mix is sold in the US',
  },
  liquidQuarts: {
    short: 'liq qt',
    long: 'US liquid quarts',
    note: 'The kitchen quart — 16% larger than a dry quart',
  },
  usGallons: { short: 'gal', long: 'US gallons', note: 'Buckets, and most watering maths' },
  cubicFeet: { short: 'cu ft', long: 'Cubic feet', note: 'Bagged bulk soil, compost and mulch' },
  cubicYards: { short: 'cu yd', long: 'Cubic yards', note: 'Delivered by the truckload' },
  liters: { short: 'L', long: 'Liters', note: 'How compost is sold outside the US' },
};

/**
 * Bulk density of a bagged growing medium, pounds per cubic foot.
 *
 * NOT VERIFIED. The September 2026 verification report's appendix has no
 * extension source for the bulk density of bagged potting mix — its density
 * figures cover compost feedstocks, which is a different material — so this is
 * a typical published range rather than a checked one, and the page carries
 * the estimate marker on it.
 *
 * It is a range on purpose. The low end is a dry peat-and-bark mix straight
 * off a dry pallet; the high end is the same mix wet, or one cut with compost
 * or sand. Moisture alone moves it by more than a factor of two, which is why
 * a bag's weight is a poor guide to its volume and why no single number would
 * serve. Topsoil and garden soil are heavier again — roughly 75 to 100 lb per
 * cubic foot — and are called out separately on the page rather than folded
 * into this range, because averaging the two would describe neither.
 */
export const SOIL_DENSITY = {
  lowLbPerCuFt: 12,
  highLbPerCuFt: 40,
  verified: false,
  source: null,
} as const;

/** Topsoil, for the page to cite beside the potting-mix range. Also unverified. */
export const TOPSOIL_DENSITY = {
  lowLbPerCuFt: 75,
  highLbPerCuFt: 100,
  verified: false,
  source: null,
} as const;

export type SoilVolumeInput = {
  readonly amount: number;
  readonly from: VolumeUnit;
};

export type SoilVolumeResult = {
  /** The input, normalised. Every other figure derives from this. */
  readonly cubicFeet: number;
  readonly converted: Record<VolumeUnit, number>;
  /** Pounds, low and high, from SOIL_DENSITY. */
  readonly weightLb: readonly [number, number];
  /** The same range in kilograms. */
  readonly weightKg: readonly [number, number];
  readonly from: VolumeUnit;
  readonly amount: number;
};

/** One quantity expressed in every unit the converter knows. */
export function convertSoilVolume(input: SoilVolumeInput): Calculation<SoilVolumeResult> {
  const errors = collect([requirePositive(input.amount, 'amount', 'amount')]);
  if (errors.length > 0) return fail(errors);

  const cubicFeet = input.amount / PER_CUBIC_FOOT[input.from];

  const converted = Object.fromEntries(
    VOLUME_UNITS.map((unit) => [unit, toSignificant(cubicFeet * PER_CUBIC_FOOT[unit], 4)]),
  ) as Record<VolumeUnit, number>;

  const low = cubicFeet * SOIL_DENSITY.lowLbPerCuFt;
  const high = cubicFeet * SOIL_DENSITY.highLbPerCuFt;

  return ok({
    cubicFeet: toSignificant(cubicFeet, 4),
    converted,
    weightLb: [toSignificant(low, 3), toSignificant(high, 3)],
    weightKg: [toSignificant(low * 0.45359237, 3), toSignificant(high * 0.45359237, 3)],
    from: input.from,
    amount: input.amount,
  });
}

/** The bag sizes people actually search for, in dry quarts. */
export const COMMON_BAG_QUARTS = [4, 8, 16, 25, 32, 50, 64] as const;

export type BagReference = {
  readonly dryQuarts: number;
  readonly cubicFeet: number;
  readonly liters: number;
  readonly weightLb: readonly [number, number];
};

/** The quick-reference table, computed rather than written out. */
export function bagReference(): BagReference[] {
  return COMMON_BAG_QUARTS.map((dryQuarts) => {
    const cubicFeet = dryQuarts / US_DRY_QUARTS_PER_CUBIC_FOOT;
    return {
      dryQuarts,
      cubicFeet: toSignificant(cubicFeet, 3),
      liters: toSignificant(cubicFeet * LITERS_PER_CUBIC_FOOT, 3),
      weightLb: [
        Math.round(cubicFeet * SOIL_DENSITY.lowLbPerCuFt),
        Math.round(cubicFeet * SOIL_DENSITY.highLbPerCuFt),
      ],
    };
  });
}
