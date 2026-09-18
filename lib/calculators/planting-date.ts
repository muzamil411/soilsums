/**
 * Planting date calculator.
 *
 * Works out when to start seeds indoors, transplant and direct sow, from the
 * user's own average last spring frost date and the per-crop week offsets in
 * data/crops.ts. There is no ZIP code database here: the user supplies the one
 * local fact that matters, and the page links to how to find it.
 *
 * Dates are handled entirely in UTC and returned as YYYY-MM-DD strings, so a
 * result never shifts by a day depending on the reader's timezone. Formatting
 * for display is the interface's job.
 *
 * Crops whose timing cannot be expressed as a last-frost offset — garlic goes
 * in during autumn, strawberries are planted as crowns — return null dates and
 * the crop's own `timingNote` instead of an invented date.
 */
import { getCrop, type Crop } from '@/data/crops';
import { fail, ok, type Calculation, type FieldError } from './shared/validate';

export type PlantingDateInput = {
  /** The user's average last spring frost date, as YYYY-MM-DD. */
  readonly lastFrostDate: string;
  /** Optional average first fall frost date, as YYYY-MM-DD. */
  readonly firstFallFrostDate?: string;
  readonly cropSlugs: readonly string[];
};

export type CropSchedule = {
  readonly slug: string;
  readonly name: string;
  readonly sowIndoors: string | null;
  readonly transplant: string | null;
  readonly directSow: string | null;
  /**
   * Why a step is null, in a few words, for a table cell that has no room for
   * the full sentence. Taken from the crop's own reason so the short and long
   * forms cannot disagree.
   */
  readonly sowIndoorsWhyNot: string | null;
  readonly transplantWhyNot: string | null;
  readonly directSowWhyNot: string | null;
  /** Which planting step the harvest estimate counts from. */
  readonly harvestFrom: 'transplant' | 'direct sow' | null;
  readonly harvestStart: string | null;
  readonly harvestEnd: string | null;
  readonly timingNote: string | null;
  /**
   * The temperature the crop actually waits on, where a date alone would
   * mislead. Shown next to the date rather than under it: a frost-free
   * calendar can say "go" while the soil is still at 50°F.
   */
  readonly soilOrAirTempNote: string | null;
  readonly notes: readonly string[];
};

export type PlantingDateOutput = {
  readonly lastFrostDate: string;
  readonly firstFallFrostDate: string | null;
  readonly growingSeasonDays: number | null;
  readonly schedules: readonly CropSchedule[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

function parseUtcDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) return null;
  const date = new Date(timestamp);
  // Rejects impossible dates that Date.parse would roll over, e.g. 2026-02-30.
  return date.toISOString().slice(0, 10) === value ? date : null;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/** The clause before the dash: a compact phrase fit for a table cell. */
function shortReason(reason: string | undefined): string | null {
  if (!reason) return null;
  const [head] = reason.split(' — ');
  return (head ?? reason).replace(/\.$/, '');
}

function scheduleFor(crop: Crop, lastFrost: Date, firstFallFrost: Date | null): CropSchedule {
  const notes: string[] = [];

  const sowIndoors =
    crop.sowIndoorsWeeksBeforeLastFrost === null
      ? null
      : addWeeks(lastFrost, -crop.sowIndoorsWeeksBeforeLastFrost);
  const transplant =
    crop.transplantWeeksAfterLastFrost === null
      ? null
      : addWeeks(lastFrost, crop.transplantWeeksAfterLastFrost);
  const directSow =
    crop.directSowWeeksRelativeToLastFrost === null
      ? null
      : addWeeks(lastFrost, crop.directSowWeeksRelativeToLastFrost);

  // Days to maturity is counted from transplanting for crops that are set out,
  // and from sowing for crops that go straight into the ground.
  const harvestAnchor = directSow ?? transplant;
  const harvestFrom: CropSchedule['harvestFrom'] =
    directSow !== null ? 'direct sow' : transplant !== null ? 'transplant' : null;

  let harvestStart: Date | null = null;
  let harvestEnd: Date | null = null;
  if (harvestAnchor && crop.daysToMaturity) {
    harvestStart = addDays(harvestAnchor, crop.daysToMaturity[0]);
    harvestEnd = addDays(harvestAnchor, crop.daysToMaturity[1]);
  }

  if (crop.timingNote) {
    notes.push(crop.timingNote);
  }

  if (transplant && crop.transplantWeeksAfterLastFrost !== null) {
    if (crop.transplantWeeksAfterLastFrost < 0) {
      notes.push(
        'This goes out before your last frost date, which is fine — it tolerates a light frost. Have fleece ready for a hard one.',
      );
    }
  }

  if (firstFallFrost && harvestStart && harvestStart > firstFallFrost) {
    notes.push(
      'On these dates the crop would not be ready until after your first fall frost. Start earlier, pick a faster variety, or plan to protect it.',
    );
  } else if (firstFallFrost && harvestEnd && harvestEnd > firstFallFrost) {
    notes.push(
      'The later end of the harvest window falls after your first fall frost, so the last of it may be cut short.',
    );
  }

  return {
    slug: crop.slug,
    name: crop.name,
    sowIndoors: sowIndoors ? formatUtcDate(sowIndoors) : null,
    transplant: transplant ? formatUtcDate(transplant) : null,
    directSow: directSow ? formatUtcDate(directSow) : null,
    sowIndoorsWhyNot: sowIndoors ? null : shortReason(crop.noSowIndoorsReason),
    transplantWhyNot: transplant ? null : shortReason(crop.noTransplantReason),
    directSowWhyNot: directSow ? null : shortReason(crop.noDirectSowReason),
    harvestFrom,
    harvestStart: harvestStart ? formatUtcDate(harvestStart) : null,
    harvestEnd: harvestEnd ? formatUtcDate(harvestEnd) : null,
    timingNote: crop.timingNote ?? null,
    soilOrAirTempNote: crop.soilOrAirTempNote ?? null,
    notes,
  };
}

export function calculatePlantingDates(input: PlantingDateInput): Calculation<PlantingDateOutput> {
  const errors: FieldError[] = [];

  const lastFrost = parseUtcDate(input.lastFrostDate);
  if (!lastFrost) {
    errors.push({
      field: 'lastFrostDate',
      message: 'Enter your average last spring frost date as a real date',
    });
  }

  let firstFallFrost: Date | null = null;
  if (input.firstFallFrostDate !== undefined && input.firstFallFrostDate !== '') {
    firstFallFrost = parseUtcDate(input.firstFallFrostDate);
    if (!firstFallFrost) {
      errors.push({
        field: 'firstFallFrostDate',
        message: 'Enter your average first fall frost date as a real date, or leave it blank',
      });
    }
  }

  if (lastFrost && firstFallFrost && firstFallFrost <= lastFrost) {
    errors.push({
      field: 'firstFallFrostDate',
      message: 'Your first fall frost date should come after your last spring frost date',
    });
  }

  if (input.cropSlugs.length === 0) {
    errors.push({ field: 'cropSlugs', message: 'Choose at least one crop' });
  }

  const unknown = input.cropSlugs.filter((slug) => !getCrop(slug));
  if (unknown.length > 0) {
    errors.push({
      field: 'cropSlugs',
      message: `Unknown crop${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`,
    });
  }

  if (errors.length > 0 || !lastFrost) {
    return fail(errors);
  }

  const schedules = input.cropSlugs
    .map((slug) => getCrop(slug) as Crop)
    .map((crop) => scheduleFor(crop, lastFrost, firstFallFrost));

  const growingSeasonDays = firstFallFrost
    ? Math.round((firstFallFrost.getTime() - lastFrost.getTime()) / MS_PER_DAY)
    : null;

  return ok({
    lastFrostDate: formatUtcDate(lastFrost),
    firstFallFrostDate: firstFallFrost ? formatUtcDate(firstFallFrost) : null,
    growingSeasonDays,
    schedules,
  });
}
