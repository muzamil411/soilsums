/**
 * Cool-season lawn feeding and watering, from the publications only.
 *
 * Two things this file exists to keep straight.
 *
 * **The two nitrogen cut-off dates are not the same restriction.** Missouri
 * stops soluble nitrogen on 1 May; Iowa State stops all nitrogen through June,
 * July and August. A reader feeding in late May is outside one recommendation
 * and inside the other, and that gap is the most useful thing on the fertilising
 * page. Both are recorded separately and neither is reconciled.
 *
 * **"One inch a week" is wrong for every species.** Missouri publishes weekly
 * water use by grass and it runs from 0.3 to 1.5 inches. One inch is nearly
 * double what a tall fescue lawn needs and a third short of what perennial
 * ryegrass needs, so the figure most repeated on the internet is not a
 * conservative average — it is wrong in both directions depending on the lawn.
 *
 * Everything here is cool-season unless a row says otherwise. Warm-season
 * grasses run on the opposite feeding schedule and we have not sourced it, so
 * the pages say so rather than guessing.
 */

export type LawnSource = {
  readonly institution: string;
  readonly title: string;
  readonly url: string;
};

export const MISSOURI_FERTILIZER: LawnSource = {
  institution: 'University of Missouri Extension',
  title: 'G6705, Cool-Season Grasses: Lawn Maintenance',
  url: 'https://extension.missouri.edu/publications/g6705',
};

export const MISSOURI_WATER: LawnSource = {
  institution: 'University of Missouri Extension',
  title: 'G6720, Watering Lawns',
  url: 'https://extension.missouri.edu/publications/g6720',
};

export const IOWA_STATE_FERTILIZER_RATES: LawnSource = {
  institution: 'Iowa State University Extension',
  title: 'Fertilizer Rates and Requirements for the Home Garden',
  url: 'https://yardandgarden.extension.iastate.edu/how-to/fertilizer-rates-and-requirements-home-garden',
};

export const IOWA_STATE_SUMMER_CARE: LawnSource = {
  institution: 'Iowa State University Extension',
  title: 'Summer Lawn Care',
  url: 'https://yardandgarden.extension.iastate.edu/how-to/summer-lawn-care',
};

/** Pounds of nitrogen per 1,000 sq ft per year, by grass. Missouri G6705. */
export type AnnualNitrogen = {
  readonly grass: string;
  readonly lbPer1000SqFtPerYear: readonly [number, number] | number;
};

export const ANNUAL_NITROGEN: readonly AnnualNitrogen[] = [
  { grass: 'Kentucky bluegrass, common types', lbPer1000SqFtPerYear: [2, 3] },
  { grass: 'Kentucky bluegrass, higher quality', lbPer1000SqFtPerYear: [4, 5] },
  { grass: 'Red fescues', lbPer1000SqFtPerYear: 2 },
  { grass: 'Tall fescue or ryegrass', lbPer1000SqFtPerYear: [3, 4] },
];

/**
 * When to apply, and how much. Missouri G6705 for the dated applications;
 * Iowa State for how many applications a given standard of lawn needs.
 *
 * September is the single most important application of the year, which is the
 * opposite of what most people assume about spring feeding.
 */
export type FeedWindow = {
  readonly window: string;
  readonly nitrogenLbPer1000SqFt: readonly [number, number] | number | null;
  readonly purpose: string;
  readonly emphasis?: 'most-important';
};

export const FEED_WINDOWS: readonly FeedWindow[] = [
  {
    window: 'Early to mid April',
    nitrogenLbPer1000SqFt: [0.5, 1],
    purpose: 'A light spring feed. Smaller than the autumn applications, deliberately.',
  },
  {
    window: 'September',
    nitrogenLbPer1000SqFt: [1, 1.5],
    purpose:
      'The most important application of the year: the grass is recovering from summer and building roots while the soil is still warm.',
    emphasis: 'most-important',
  },
  {
    window: 'Mid-October',
    nitrogenLbPer1000SqFt: null,
    purpose: 'Root development rather than top growth.',
  },
  {
    window: 'November',
    nitrogenLbPer1000SqFt: null,
    purpose: 'Roots again. This is the application sold as a "winterizer".',
  },
];

/** Missouri's ratio guidance for routine maintenance versus a soil-test result. */
export const NPK_RATIOS = {
  routine: '3:1:1 to 4:1:2',
  soilTestDriven: '1:1:1 or 2:1:1',
  source: MISSOURI_FERTILIZER,
} as const;

/**
 * The two cut-offs, kept apart on purpose.
 *
 * They are different claims about different things — a form of nitrogen and a
 * date, against all nitrogen and a season — so presenting them as one rule
 * would misstate both.
 */
export const NITROGEN_CUTOFFS = [
  {
    rule: 'Do not apply nitrogen fertilizer, particularly quickly available soluble forms, past May 1.',
    source: MISSOURI_FERTILIZER,
  },
  {
    rule: 'Do not fertilize Kentucky bluegrass and other cool-season grasses during the summer months (June, July, and August).',
    source: IOWA_STATE_SUMMER_CARE,
  },
] as const;

/** Iowa State: how many applications a lawn needs depends on the standard wanted. */
export const PROGRAMMES = [
  { standard: 'High-quality lawn', applications: 'Three applications' },
  {
    standard: 'Moderate programme',
    applications: 'Mid-September, plus late October or early November',
  },
  { standard: 'Minimally maintained lawn', applications: 'Late October to early November alone' },
] as const;

/**
 * Weekly water use by grass, in inches. Missouri G6720.
 *
 * `green` keeps the lawn actively growing and green. `dormant` is the lower
 * figure that keeps a lawn alive while it is deliberately brown, which is a
 * different goal rather than a reduced version of the same one.
 */
export type WaterNeed = {
  readonly grass: string;
  readonly season: 'cool' | 'warm';
  readonly greenInchesPerWeek: number;
  readonly dormantInchesPerWeek: number;
};

export const WATER_NEEDS: readonly WaterNeed[] = [
  { grass: 'Perennial ryegrass', season: 'cool', greenInchesPerWeek: 1.5, dormantInchesPerWeek: 1 },
  {
    grass: 'Kentucky bluegrass',
    season: 'cool',
    greenInchesPerWeek: 1.2,
    dormantInchesPerWeek: 0.7,
  },
  { grass: 'Tall fescue', season: 'cool', greenInchesPerWeek: 0.8, dormantInchesPerWeek: 0.5 },
  {
    grass: 'Zoysiagrass and bermudagrass',
    season: 'warm',
    greenInchesPerWeek: 0.5,
    dormantInchesPerWeek: 0.2,
  },
  { grass: 'Buffalograss', season: 'warm', greenInchesPerWeek: 0.3, dormantInchesPerWeek: 0.2 },
];

/** The figure every lawn page repeats, kept here only to be contradicted. */
export const FOLK_FIGURE_INCHES_PER_WEEK = 1;

/** The rest of Missouri G6720's watering guidance. */
export const WATERING_FACTS = {
  rootZoneDepthInches: [6, 8] as const,
  soilIntakeInchesPerHour: 0.5,
  bestTimeOfDay: 'between 6 and 8 a.m.',
  dormantSurvivalInches: 1,
  dormantSurvivalWeeks: [2, 3] as const,
  seedbedMoistDepthInches: [1, 2] as const,
  newSodWetToInches: 6,
  source: MISSOURI_WATER,
} as const;

/** Formats an inches-per-week or lb figure the way the publications write it. */
export function amountLabel(
  value: readonly [number, number] | number | null,
  unit: string,
): string {
  if (value === null) return 'A moderate rate';
  if (typeof value === 'number') return `${value} ${unit}`;
  return `${value[0]} to ${value[1]} ${unit}`;
}
