/**
 * Fertilizer calculator.
 *
 * Turns a bag's N-P-K label and a target nutrient rate into pounds of product,
 * and reports what that dose also supplies of the other two nutrients — the
 * part most calculators leave out, and the reason people accidentally
 * over-apply phosphorus for years.
 *
 * A note on what the label means: in the United States the second and third
 * numbers are phosphate (P2O5) and potash (K2O), not elemental phosphorus and
 * potassium. Extension recommendations are normally written in the same terms,
 * so the two are consistent and no conversion is applied here.
 */
import {
  KG_PER_100SQM_TO_LB_PER_1000SQFT,
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
  requireRange,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type Nutrient = 'nitrogen' | 'phosphate' | 'potash';

export type NpkLabel = {
  /** The three numbers on the bag, as percentages: 10-10-10 is 10, 10, 10. */
  readonly n: number;
  readonly p: number;
  readonly k: number;
};

export type FertilizerInput = {
  readonly units: UnitSystem;
  /** Square feet (imperial) or square meters (metric). */
  readonly area: number;
  readonly label: NpkLabel;
  readonly nutrient: Nutrient;
  /**
   * Target rate of the chosen nutrient: pounds per 1,000 sq ft (imperial) or
   * kilograms per 100 m2 (metric).
   */
  readonly targetRate: number;
};

export type NutrientSupplied = {
  readonly nutrient: Nutrient;
  readonly labelPercent: number;
  readonly pounds: number;
  readonly kilograms: number;
  readonly lbPer1000SqFt: number;
  readonly kgPer100SqM: number;
};

export type FertilizerOutput = {
  readonly areaSquareFeet: number;
  readonly areaSquareMeters: number;
  readonly productPounds: number;
  readonly productOunces: number;
  readonly productKilograms: number;
  readonly productGrams: number;
  readonly targetRateLbPer1000SqFt: number;
  readonly supplied: readonly NutrientSupplied[];
};

const NUTRIENT_LABELS: Record<Nutrient, string> = {
  nitrogen: 'nitrogen',
  phosphate: 'phosphate',
  potash: 'potash',
};

function labelPercent(label: NpkLabel, nutrient: Nutrient): number {
  switch (nutrient) {
    case 'nitrogen':
      return label.n;
    case 'phosphate':
      return label.p;
    case 'potash':
      return label.k;
  }
}

export function calculateFertilizer(input: FertilizerInput): Calculation<FertilizerOutput> {
  const { units, label, nutrient } = input;
  const areaLabel = units === 'imperial' ? 'area in square feet' : 'area in square meters';
  const rateLabel =
    units === 'imperial'
      ? 'target rate in pounds per 1,000 square feet'
      : 'target rate in kilograms per 100 square meters';

  const errors: FieldError[] = collect([
    requirePositive(input.area, 'area', areaLabel),
    requirePositive(input.targetRate, 'targetRate', rateLabel),
    requireRange(label.n, 0, 100, 'label.n', 'nitrogen percentage'),
    requireRange(label.p, 0, 100, 'label.p', 'phosphate percentage'),
    requireRange(label.k, 0, 100, 'label.k', 'potash percentage'),
  ]);

  const percent = labelPercent(label, nutrient);
  if (errors.length === 0 && percent <= 0) {
    errors.push({
      field: `label.${nutrient === 'nitrogen' ? 'n' : nutrient === 'phosphate' ? 'p' : 'k'}`,
      message: `This fertilizer supplies no ${NUTRIENT_LABELS[nutrient]}, so it cannot meet a ${NUTRIENT_LABELS[nutrient]} target — choose another nutrient or another product`,
    });
  }

  if (errors.length === 0 && label.n + label.p + label.k > 100) {
    errors.push({
      field: 'label.n',
      message: 'The three label numbers add up to more than 100% — check the bag',
    });
  }

  if (errors.length > 0) {
    return fail(errors);
  }

  const areaSquareFeet = areaToSquareFeet(input.area, units);
  const targetRateLbPer1000SqFt =
    units === 'imperial' ? input.targetRate : input.targetRate * KG_PER_100SQM_TO_LB_PER_1000SQFT;

  // lb of product = (target rate / nutrient fraction) x (area / 1000)
  const productPounds = (targetRateLbPer1000SqFt / (percent / 100)) * (areaSquareFeet / 1000);

  const supplied: NutrientSupplied[] = (
    [
      ['nitrogen', label.n],
      ['phosphate', label.p],
      ['potash', label.k],
    ] as const
  ).map(([name, labelValue]) => {
    const pounds = productPounds * (labelValue / 100);
    const lbPer1000SqFt = areaSquareFeet > 0 ? (pounds / areaSquareFeet) * 1000 : 0;
    return {
      nutrient: name,
      labelPercent: labelValue,
      pounds: toSignificant(pounds, 4),
      kilograms: toSignificant(poundsToKilograms(pounds), 4),
      lbPer1000SqFt: toSignificant(lbPer1000SqFt, 4),
      kgPer100SqM: toSignificant(lbPer1000SqFtToKgPer100SqM(lbPer1000SqFt), 4),
    };
  });

  return ok({
    areaSquareFeet: toSignificant(areaSquareFeet, 4),
    areaSquareMeters: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    productPounds: toSignificant(productPounds, 4),
    productOunces: toSignificant(productPounds * OUNCES_PER_POUND, 4),
    productKilograms: toSignificant(poundsToKilograms(productPounds), 4),
    productGrams: toSignificant(poundsToGrams(productPounds), 4),
    targetRateLbPer1000SqFt: toSignificant(targetRateLbPer1000SqFt, 4),
    supplied,
  });
}
