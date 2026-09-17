/**
 * Lime calculator.
 *
 * Estimates the ground limestone needed to raise soil pH, from a texture-based
 * table in data/lime-rates.ts.
 *
 * This is the calculator on the site with the widest real-world error bars. The
 * amount of lime a soil needs depends on its buffering capacity, which a pH
 * reading does not reveal: two soils reading pH 5.5 can need very different
 * amounts. The result carries explicit warnings, and the page says plainly that
 * a soil test giving buffer pH or a direct lime recommendation beats this.
 */
import { MAX_RELIABLE_PH_CHANGE, PH_RANGE, getLimeRate, type SoilTexture } from '@/data/lime-rates';
import {
  areaToSquareFeet,
  lbPer1000SqFtToKgPer100SqM,
  poundsToKilograms,
  squareFeetToSquareMeters,
  type UnitSystem,
} from './shared/units';
import { round, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requirePositive,
  requireRange,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type LimeInput = {
  readonly units: UnitSystem;
  /** Square feet (imperial) or square meters (metric). */
  readonly area: number;
  readonly currentPh: number;
  readonly targetPh: number;
  readonly texture: SoilTexture;
};

export type LimeOutput = {
  readonly areaSquareFeet: number;
  readonly areaSquareMeters: number;
  readonly phChange: number;
  readonly texture: SoilTexture;
  readonly rateLbPer1000SqFtPerPhUnit: number;
  readonly pounds: number;
  readonly kilograms: number;
  readonly lbPer1000SqFt: number;
  readonly kgPer100SqM: number;
  /** Shown alongside the number, not buried in the small print. */
  readonly warnings: readonly string[];
};

export function calculateLime(input: LimeInput): Calculation<LimeOutput> {
  const { units } = input;
  const areaLabel = units === 'imperial' ? 'area in square feet' : 'area in square meters';

  const errors: FieldError[] = collect([
    requirePositive(input.area, 'area', areaLabel),
    requireRange(input.currentPh, PH_RANGE.min, PH_RANGE.max, 'currentPh', 'current pH'),
    requireRange(input.targetPh, PH_RANGE.min, PH_RANGE.max, 'targetPh', 'target pH'),
  ]);

  const rate = getLimeRate(input.texture);
  if (!rate) {
    errors.push({ field: 'texture', message: 'Choose a soil texture' });
  }

  if (errors.length === 0 && input.targetPh <= input.currentPh) {
    errors.push({
      field: 'targetPh',
      message:
        input.targetPh === input.currentPh
          ? 'Your target pH already matches your current pH, so no lime is needed'
          : 'Lime raises pH. To lower pH you need elemental sulfur instead, not lime',
    });
  }

  if (errors.length > 0 || !rate) {
    return fail(errors);
  }

  const areaSquareFeet = areaToSquareFeet(input.area, units);
  const phChange = input.targetPh - input.currentPh;
  const lbPer1000SqFt = rate.lbPer1000SqFtPerPhUnit * phChange;
  const pounds = lbPer1000SqFt * (areaSquareFeet / 1000);

  const warnings: string[] = [];
  if (phChange > MAX_RELIABLE_PH_CHANGE) {
    warnings.push(
      `A change of ${round(phChange, 1)} pH units is more than this estimate can be trusted for. Apply no more than about ${MAX_RELIABLE_PH_CHANGE} units' worth in a year, retest, and repeat — lime works slowly and overshooting is hard to undo.`,
    );
  }
  if (input.currentPh >= 6.5) {
    warnings.push(
      'Above pH 6.5 most vegetables need no lime at all, and liming further can lock up iron, manganese and zinc.',
    );
  }
  if (input.targetPh > 7.5) {
    warnings.push(
      'A target above pH 7.5 is higher than almost any garden crop wants. Check the figure before buying lime.',
    );
  }

  return ok({
    areaSquareFeet: toSignificant(areaSquareFeet, 4),
    areaSquareMeters: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    phChange: round(phChange, 2),
    texture: input.texture,
    rateLbPer1000SqFtPerPhUnit: rate.lbPer1000SqFtPerPhUnit,
    pounds: toSignificant(pounds, 4),
    kilograms: toSignificant(poundsToKilograms(pounds), 4),
    lbPer1000SqFt: toSignificant(lbPer1000SqFt, 4),
    kgPer100SqM: toSignificant(lbPer1000SqFtToKgPer100SqM(lbPer1000SqFt), 4),
    warnings,
  });
}
