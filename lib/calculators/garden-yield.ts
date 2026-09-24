/**
 * Garden yield estimator.
 *
 * A low-to-high harvest range for what is planted, from the per-plant yield
 * figures in data/crops.ts. Accepts a plant count or a length of row, and
 * converts row length to plants using the crop's own in-row spacing.
 *
 * The range is deliberately wide. Yield depends on variety, season, soil and
 * how attentively the garden is watered and picked, and a single number would
 * imply a precision that does not exist.
 */
import { getCrop, plantsPerRowFoot, type Crop, spacingFor } from '@/data/crops';
import { lengthToFeet, poundsToKilograms, type UnitSystem } from './shared/units';
import { round, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requireCount,
  requirePositive,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type YieldEntryMode = 'plants' | 'row-length';

export type YieldEntry = {
  readonly cropSlug: string;
  readonly mode: YieldEntryMode;
  /** Plant count, or row length in feet (imperial) or meters (metric). */
  readonly quantity: number;
};

export type GardenYieldInput = {
  readonly units: UnitSystem;
  readonly entries: readonly YieldEntry[];
};

export type YieldLine = {
  readonly cropSlug: string;
  readonly name: string;
  readonly mode: YieldEntryMode;
  readonly quantity: number;
  readonly plants: number;
  readonly perPlantLowLb: number;
  readonly perPlantHighLb: number;
  readonly lowLb: number;
  readonly highLb: number;
  readonly lowKg: number;
  readonly highKg: number;
  readonly notes: readonly string[];
};

export type GardenYieldOutput = {
  readonly lines: readonly YieldLine[];
  readonly totalPlants: number;
  readonly totalLowLb: number;
  readonly totalHighLb: number;
  readonly totalLowKg: number;
  readonly totalHighKg: number;
};

function plantsFromEntry(crop: Crop, entry: YieldEntry, units: UnitSystem): number {
  if (entry.mode === 'plants') {
    return entry.quantity;
  }
  const rowFeet = lengthToFeet(entry.quantity, units);
  return rowFeet * plantsPerRowFoot(crop);
}

export function calculateGardenYield(input: GardenYieldInput): Calculation<GardenYieldOutput> {
  const { units, entries } = input;
  const errors: FieldError[] = [];

  if (entries.length === 0) {
    errors.push({ field: 'entries', message: 'Add at least one crop' });
  }

  entries.forEach((entry, index) => {
    if (!getCrop(entry.cropSlug)) {
      errors.push({
        field: `entries.${index}.cropSlug`,
        message: `Unknown crop: ${entry.cropSlug}`,
      });
      return;
    }
    // A plant count has to be whole; a row length does not.
    const invalid =
      entry.mode === 'plants'
        ? requireCount(entry.quantity, `entries.${index}.quantity`, 'number of plants')
        : requirePositive(
            entry.quantity,
            `entries.${index}.quantity`,
            units === 'imperial' ? 'row length in feet' : 'row length in meters',
          );
    if (invalid) errors.push(invalid);
  });

  if (errors.length > 0) {
    return fail(collect(errors));
  }

  const lines: YieldLine[] = entries.map((entry) => {
    const crop = getCrop(entry.cropSlug) as Crop;
    const rawPlants = plantsFromEntry(crop, entry, units);
    // Part of a plant harvests nothing, so a row is worth whole plants only.
    const plants = entry.mode === 'plants' ? entry.quantity : Math.floor(rawPlants);
    // Crops with no published per-plant yield are filtered out before here.
    const [low, high] = crop.yieldPerPlantLb ?? [0, 0];

    const notes: string[] = [];
    if (entry.mode === 'row-length' && plants === 0) {
      notes.push(
        `At ${spacingFor(crop.spacingInches)} inch spacing, that row is too short to hold even one ${crop.name.toLowerCase()} plant.`,
      );
    }
    if (crop.daysToMaturity === null) {
      notes.push(
        `${crop.name} is a perennial — the figures below are for an established planting, not its first season.`,
      );
    }

    return {
      cropSlug: crop.slug,
      name: crop.name,
      mode: entry.mode,
      quantity: entry.quantity,
      plants: round(plants, 0),
      perPlantLowLb: low,
      perPlantHighLb: high,
      lowLb: toSignificant(plants * low, 3),
      highLb: toSignificant(plants * high, 3),
      lowKg: toSignificant(poundsToKilograms(plants * low), 3),
      highKg: toSignificant(poundsToKilograms(plants * high), 3),
      notes,
    };
  });

  const sum = (pick: (line: YieldLine) => number): number =>
    lines.reduce((total, line) => total + pick(line), 0);

  return ok({
    lines,
    totalPlants: sum((line) => line.plants),
    totalLowLb: toSignificant(
      sum((line) => line.lowLb),
      4,
    ),
    totalHighLb: toSignificant(
      sum((line) => line.highLb),
      4,
    ),
    totalLowKg: toSignificant(
      sum((line) => line.lowKg),
      4,
    ),
    totalHighKg: toSignificant(
      sum((line) => line.highKg),
      4,
    ),
  });
}
