/**
 * Compost ratio calculator.
 *
 * Estimates the carbon-to-nitrogen ratio of a pile and says what to add to
 * bring it into the 25–30:1 band an active pile wants.
 *
 * The ratio is computed from masses of carbon and nitrogen, NOT by averaging
 * the materials' C:N ratios. Averaging ratios is the common shortcut and it is
 * wrong: mix equal weights of something at 500:1 and something at 20:1 and the
 * average of the ratios says 260:1, while the actual mix — which is what the
 * bacteria experience — is about 38:1. The difference is the whole reason
 * sawdust and coffee grounds behave the way they do.
 */
import { compostMaterials, getCompostMaterial, TARGET_CN_RATIO } from '@/data/compost-materials';
import {
  LITERS_PER_CUBIC_FOOT,
  US_GALLONS_PER_CUBIC_FOOT,
  kilogramsToPounds,
  poundsToKilograms,
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

export type AmountMode = 'volume' | 'weight';

export type CompostEntry = {
  readonly materialSlug: string;
  /**
   * Volume mode: US gallons (imperial) or liters (metric).
   * Weight mode: pounds (imperial) or kilograms (metric).
   */
  readonly amount: number;
};

export type CompostRatioInput = {
  readonly units: UnitSystem;
  readonly mode: AmountMode;
  readonly entries: readonly CompostEntry[];
};

export type CompostContribution = {
  readonly materialSlug: string;
  readonly name: string;
  readonly category: 'brown' | 'green';
  readonly cnRatio: number;
  readonly asIsPounds: number;
  readonly dryPounds: number;
  readonly carbonPounds: number;
  readonly nitrogenPounds: number;
  /** Share of the pile's total carbon and nitrogen, as percentages. */
  readonly shareOfCarbonPercent: number;
  readonly shareOfNitrogenPercent: number;
};

export type CompostSuggestion = {
  readonly materialSlug: string;
  readonly name: string;
  readonly asIsPounds: number;
  readonly kilograms: number;
  readonly gallons: number;
  readonly liters: number;
};

export type CompostVerdict = 'too-much-carbon' | 'in-range' | 'too-much-nitrogen';

export type CompostRatioOutput = {
  readonly cnRatio: number;
  readonly verdict: CompostVerdict;
  readonly targetMin: number;
  readonly targetMax: number;
  readonly totalCarbonPounds: number;
  readonly totalNitrogenPounds: number;
  readonly totalAsIsPounds: number;
  readonly contributions: readonly CompostContribution[];
  readonly advice: string;
  /** How much of one material would bring the pile into range. */
  readonly suggestion: CompostSuggestion | null;
};

/** As-is pounds from whatever the user entered. */
function toAsIsPounds(
  amount: number,
  mode: AmountMode,
  units: UnitSystem,
  bulkDensityLbPerCuFt: number,
): number {
  if (mode === 'weight') {
    return units === 'imperial' ? amount : kilogramsToPounds(amount);
  }
  const cubicFeet =
    units === 'imperial' ? amount / US_GALLONS_PER_CUBIC_FOOT : amount / LITERS_PER_CUBIC_FOOT;
  return cubicFeet * bulkDensityLbPerCuFt;
}

/**
 * As-is pounds of `materialSlug` needed to move a pile holding `carbon` and
 * `nitrogen` pounds to the target ratio.
 *
 * Adding mass x of a material contributes both carbon and nitrogen, so solve
 *   (C + x.cx) / (N + x.nx) = T
 * for x, giving x = (C - T.N) / (T.nx - cx). It only has a useful solution
 * when the material moves the ratio in the direction needed.
 */
export function suggestAddition(
  carbonPounds: number,
  nitrogenPounds: number,
  targetRatio: number,
  materialSlug: string,
): { asIsPounds: number } | null {
  const material = getCompostMaterial(materialSlug);
  if (!material) return null;

  const dryFraction = material.dryMatterPercent / 100;
  const nitrogenFraction = dryFraction * (material.nitrogenPercentDry / 100);
  const carbonFraction = nitrogenFraction * material.cnRatio;

  const denominator = targetRatio * nitrogenFraction - carbonFraction;
  if (denominator === 0) return null;

  const asIsPounds = (carbonPounds - targetRatio * nitrogenPounds) / denominator;
  if (!Number.isFinite(asIsPounds) || asIsPounds <= 0) return null;

  return { asIsPounds };
}

export function calculateCompostRatio(input: CompostRatioInput): Calculation<CompostRatioOutput> {
  const { units, mode, entries } = input;
  const amountLabel =
    mode === 'weight'
      ? units === 'imperial'
        ? 'amount in pounds'
        : 'amount in kilograms'
      : units === 'imperial'
        ? 'amount in gallons'
        : 'amount in liters';

  const errors: FieldError[] = [];

  if (entries.length === 0) {
    errors.push({ field: 'entries', message: 'Add at least one material to the pile' });
  }

  entries.forEach((entry, index) => {
    if (!getCompostMaterial(entry.materialSlug)) {
      errors.push({
        field: `entries.${index}.materialSlug`,
        message: `Unknown material: ${entry.materialSlug}`,
      });
      return;
    }
    const invalid = requirePositive(entry.amount, `entries.${index}.amount`, amountLabel);
    if (invalid) errors.push(invalid);
  });

  if (errors.length > 0) {
    return fail(collect(errors));
  }

  let totalCarbon = 0;
  let totalNitrogen = 0;
  let totalAsIs = 0;

  const raw = entries.map((entry) => {
    // Validated above.
    const material = getCompostMaterial(entry.materialSlug) as (typeof compostMaterials)[number];
    const asIsPounds = toAsIsPounds(entry.amount, mode, units, material.bulkDensityLbPerCuFt);
    const dryPounds = asIsPounds * (material.dryMatterPercent / 100);
    const nitrogenPounds = dryPounds * (material.nitrogenPercentDry / 100);
    const carbonPounds = nitrogenPounds * material.cnRatio;

    totalCarbon += carbonPounds;
    totalNitrogen += nitrogenPounds;
    totalAsIs += asIsPounds;

    return { material, asIsPounds, dryPounds, nitrogenPounds, carbonPounds };
  });

  if (totalNitrogen <= 0) {
    return fail([
      {
        field: 'entries',
        message:
          'These materials supply effectively no nitrogen, so a ratio cannot be worked out. Add a green such as grass clippings, vegetable scraps or manure.',
      },
    ]);
  }

  const cnRatio = totalCarbon / totalNitrogen;

  const contributions: CompostContribution[] = raw.map((item) => ({
    materialSlug: item.material.slug,
    name: item.material.name,
    category: item.material.category,
    cnRatio: item.material.cnRatio,
    asIsPounds: toSignificant(item.asIsPounds, 4),
    dryPounds: toSignificant(item.dryPounds, 4),
    carbonPounds: toSignificant(item.carbonPounds, 4),
    nitrogenPounds: toSignificant(item.nitrogenPounds, 4),
    shareOfCarbonPercent: round((item.carbonPounds / totalCarbon) * 100, 1),
    shareOfNitrogenPercent: round((item.nitrogenPounds / totalNitrogen) * 100, 1),
  }));

  let verdict: CompostVerdict;
  let advice: string;
  let suggestionSlug: string | null = null;

  if (cnRatio > TARGET_CN_RATIO.max) {
    verdict = 'too-much-carbon';
    advice = `At ${round(cnRatio, 1)}:1 this pile is carbon-heavy. It will break down, but slowly and without heating up much. Add a nitrogen-rich green.`;
    suggestionSlug = 'grass-clippings';
  } else if (cnRatio < TARGET_CN_RATIO.min) {
    verdict = 'too-much-nitrogen';
    advice = `At ${round(cnRatio, 1)}:1 this pile is nitrogen-heavy. Expect it to go slimy and smell of ammonia as the surplus nitrogen gasses off. Add a carbon-rich brown.`;
    suggestionSlug = 'dry-leaves';
  } else {
    verdict = 'in-range';
    advice = `At ${round(cnRatio, 1)}:1 this pile is in the ${TARGET_CN_RATIO.min}–${TARGET_CN_RATIO.max}:1 band that composts fastest. Keep it as damp as a wrung-out sponge and turn it when it cools.`;
  }

  let suggestion: CompostSuggestion | null = null;
  if (suggestionSlug) {
    const target = verdict === 'too-much-carbon' ? TARGET_CN_RATIO.max : TARGET_CN_RATIO.min;
    const addition = suggestAddition(totalCarbon, totalNitrogen, target, suggestionSlug);
    const material = getCompostMaterial(suggestionSlug);
    if (addition && material) {
      const cubicFeet = addition.asIsPounds / material.bulkDensityLbPerCuFt;
      suggestion = {
        materialSlug: material.slug,
        name: material.name,
        asIsPounds: toSignificant(addition.asIsPounds, 3),
        kilograms: toSignificant(poundsToKilograms(addition.asIsPounds), 3),
        gallons: toSignificant(cubicFeet * US_GALLONS_PER_CUBIC_FOOT, 3),
        liters: toSignificant(cubicFeet * LITERS_PER_CUBIC_FOOT, 3),
      };
    }
  }

  return ok({
    cnRatio: round(cnRatio, 1),
    verdict,
    targetMin: TARGET_CN_RATIO.min,
    targetMax: TARGET_CN_RATIO.max,
    totalCarbonPounds: toSignificant(totalCarbon, 4),
    totalNitrogenPounds: toSignificant(totalNitrogen, 4),
    totalAsIsPounds: toSignificant(totalAsIs, 4),
    contributions,
    advice,
    suggestion,
  });
}
