/**
 * Grass seed calculator.
 *
 * Pounds of seed for a lawn, from the per-1,000-square-foot rates in
 * data/grass-seed-rates.ts, for either a new lawn from bare soil or an
 * overseed of existing turf.
 */
import { getGrassSeedRate } from '@/data/grass-seed-rates';
import {
  OUNCES_PER_POUND,
  areaToSquareFeet,
  lbPer1000SqFtToKgPer100SqM,
  poundsToGrams,
  poundsToKilograms,
  squareFeetToSquareMeters,
  type UnitSystem,
} from './shared/units';
import { toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requirePositive,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type SeedingPurpose = 'new-lawn' | 'overseed';

export type GrassSeedInput = {
  readonly units: UnitSystem;
  /** Square feet (imperial) or square meters (metric). */
  readonly area: number;
  readonly grassSlug: string;
  readonly purpose: SeedingPurpose;
};

export type GrassSeedOutput = {
  readonly areaSquareFeet: number;
  readonly areaSquareMeters: number;
  readonly grassName: string;
  readonly season: 'cool' | 'warm';
  readonly purpose: SeedingPurpose;
  readonly rateLbPer1000SqFt: number;
  readonly rateKgPer100SqM: number;
  readonly pounds: number;
  readonly ounces: number;
  readonly kilograms: number;
  readonly grams: number;
  /** The rate for the other purpose, so the choice is easy to sanity-check. */
  readonly alternateRateLbPer1000SqFt: number;
  readonly note: string;
  /** The state or region the sourced rate covers. */
  readonly region: string;
  /**
   * Whether the rate actually used has a source that could be opened. Most
   * overseeding rates do not, and the page says so next to the number rather
   * than in a footnote.
   */
  readonly rateVerified: boolean;
  readonly source: string;
};

export function calculateGrassSeed(input: GrassSeedInput): Calculation<GrassSeedOutput> {
  const { units } = input;
  const areaLabel =
    units === 'imperial' ? 'lawn area in square feet' : 'lawn area in square meters';

  const errors: FieldError[] = collect([requirePositive(input.area, 'area', areaLabel)]);

  const rate = getGrassSeedRate(input.grassSlug);
  if (!rate) {
    errors.push({ field: 'grassSlug', message: 'Choose a grass type' });
  }

  if (errors.length > 0 || !rate) {
    return fail(errors);
  }

  const areaSquareFeet = areaToSquareFeet(input.area, units);
  const rateLbPer1000SqFt =
    input.purpose === 'new-lawn' ? rate.newLawnLbPer1000SqFt : rate.overseedLbPer1000SqFt;
  const alternateRate =
    input.purpose === 'new-lawn' ? rate.overseedLbPer1000SqFt : rate.newLawnLbPer1000SqFt;
  const pounds = rateLbPer1000SqFt * (areaSquareFeet / 1000);

  return ok({
    areaSquareFeet: toSignificant(areaSquareFeet, 4),
    areaSquareMeters: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    grassName: rate.name,
    season: rate.season,
    purpose: input.purpose,
    rateLbPer1000SqFt,
    rateKgPer100SqM: toSignificant(lbPer1000SqFtToKgPer100SqM(rateLbPer1000SqFt), 3),
    pounds: toSignificant(pounds, 4),
    ounces: toSignificant(pounds * OUNCES_PER_POUND, 4),
    kilograms: toSignificant(poundsToKilograms(pounds), 4),
    grams: toSignificant(poundsToGrams(pounds), 4),
    alternateRateLbPer1000SqFt: alternateRate,
    note: rate.note,
    region: rate.region,
    rateVerified: input.purpose === 'new-lawn' ? rate.verified : rate.overseedVerified,
    source: rate.source,
  });
}
