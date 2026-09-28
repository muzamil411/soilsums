/**
 * Turfgrass establishment: seeding rates from two publications that disagree,
 * and the small number of things extension services actually publish about
 * germination.
 *
 * Two deliberate absences shape everything that reads from this file:
 *
 *  - **There is no published table of germination days by species.** Penn
 *    State, Missouri, Iowa State, UMass and NC State describe establishment
 *    speed comparatively — "among the slowest", "offers more flexibility" —
 *    rather than in day counts. The one numeric statement found is Missouri's
 *    two to three weeks for Kentucky bluegrass in spring. Every "7 to 14 days"
 *    table online is somebody's invention, and a reader who measures their lawn
 *    against an invented figure concludes it failed when it is simply waiting.
 *  - **There is no sourced nitrogen fixation rate for clover** in anything read
 *    for this work, so the qualitative claim stands alone and no number is
 *    attached to it.
 *
 * `data/grass-seed-rates.ts` is a different thing and stays separate: it holds
 * the single operating figure the grass seed calculator works from. This file
 * holds what the publications actually say, ranges and seasonal splits and all,
 * which is what a reader comparing them needs to see.
 */

export type TurfSource = {
  readonly key: string;
  readonly institution: string;
  readonly title: string;
  readonly url: string;
};

export const PENN_STATE: TurfSource = {
  key: 'penn-state',
  institution: 'Penn State Extension',
  title: 'Turfgrass Seed and Seed Mixtures',
  url: 'https://extension.psu.edu/turfgrass-seed-and-seed-mixtures',
};

export const MISSOURI: TurfSource = {
  key: 'missouri',
  institution: 'University of Missouri Extension',
  title: 'G6700, Cool-Season Grasses: Lawn Establishment and Renovation',
  url: 'https://extension.missouri.edu/publications/g6700',
};

export const IOWA_STATE: TurfSource = {
  key: 'iowa-state',
  institution: 'Iowa State University Extension',
  title: 'Seeding a New Lawn',
  url: 'https://yardandgarden.extension.iastate.edu/how-to/seeding-new-lawn',
};

export const UMASS: TurfSource = {
  key: 'umass',
  institution: 'UMass Extension Turf',
  title: 'Late Season Establishment Considerations',
  url: 'https://ag.umass.edu/turf/fact-sheets/late-season-establishment-considerations',
};

export const TURF_SOURCES: readonly TurfSource[] = [PENN_STATE, MISSOURI, IOWA_STATE, UMASS];

/** A published rate, in lb per 1,000 sq ft. A pair where the source gives one. */
export type Rate = readonly [number, number] | number;

export type TurfSpecies = {
  readonly slug: string;
  readonly name: string;
  /** Penn State's rate for a new lawn in an open, sunny location. */
  readonly pennState?: Rate;
  /** Missouri splits by season, which is itself the useful insight. */
  readonly missouriFall?: number;
  readonly missouriSpring?: number;
  /** What the publications say about establishment speed, in words not days. */
  readonly speed?: string;
};

/**
 * Both publications' rates, side by side and unaveraged.
 *
 * The spread matters: on perennial ryegrass Penn State says 4 to 5 lb and
 * Missouri 7 in fall and 10 in spring, which is a factor of two at the extremes.
 * Averaging would produce a figure neither service publishes, and picking one
 * would hide a real disagreement between a Pennsylvania recommendation and a
 * Missouri one.
 */
export const TURF_SPECIES: readonly TurfSpecies[] = [
  {
    slug: 'kentucky-bluegrass',
    name: 'Kentucky bluegrass',
    pennState: [2, 3],
    missouriFall: 2,
    missouriSpring: 3,
    speed:
      'Missouri puts spring germination at two to three weeks, and UMass calls it among the slowest to establish.',
  },
  {
    slug: 'perennial-ryegrass',
    name: 'Perennial ryegrass',
    pennState: [4, 5],
    missouriFall: 7,
    missouriSpring: 10,
    speed:
      'UMass says it offers more flexibility for later planting than Kentucky bluegrass, which is a statement about speed without a day count.',
  },
  {
    slug: 'tall-fescue',
    name: 'Turf-type tall fescue',
    pennState: [6, 8],
    missouriFall: 7,
    missouriSpring: 10,
  },
  {
    slug: 'fine-fescue',
    name: 'Fine fescues',
    pennState: [4, 5],
  },
  {
    slug: 'creeping-bentgrass',
    name: 'Creeping bentgrass',
    pennState: 1,
  },
];

/**
 * Penn State's renovation rate for turf-type perennial ryegrass, which is a
 * different job from seeding bare ground and carries a much lower rate.
 */
export const RENOVATION_RYEGRASS: Rate = [2, 5];

/** Formats a rate the way both publications write it. */
export function rateLabel(rate: Rate | undefined): string {
  if (rate === undefined) return '—';
  return Array.isArray(rate) ? `${rate[0]} to ${rate[1]} lb` : `${rate} lb`;
}

/**
 * The only numeric germination statement found in any of the publications read.
 * Everything else about speed is comparative.
 */
export const GERMINATION_FACT = {
  species: 'Kentucky bluegrass',
  weeks: [2, 3] as const,
  season: 'spring',
  source: MISSOURI,
} as const;

/** UMass's ideal temperature ranges, which are what actually govern the wait. */
export const TEMPERATURES = {
  airShootGrowthF: [65, 75] as const,
  soilRootGrowthF: [55, 65] as const,
  source: UMASS,
} as const;

export type SeedingWindow = {
  readonly label: string;
  readonly window: string;
  readonly source: TurfSource;
  readonly note?: string;
};

/** Published seeding windows. Three publications, broadly agreeing. */
export const SEEDING_WINDOWS: readonly SeedingWindow[] = [
  {
    label: 'Late summer to early autumn, the best window',
    window: 'August 25 to October 10',
    source: MISSOURI,
  },
  {
    label: 'Late summer to early autumn, the best window',
    window: 'Mid-August to mid-September',
    source: IOWA_STATE,
  },
  {
    label: 'Dormant seeding',
    window: 'Late November through early February',
    source: IOWA_STATE,
    note: 'Seed sits unsprouted through the cold and germinates when the soil warms.',
  },
  {
    label: 'Spring seeding, the second-best option',
    window: 'Early April to mid-May',
    source: IOWA_STATE,
  },
];

/**
 * Iowa State's watering guidance, which is the single most consequential thing
 * on the germination page: the commonest reason seed fails is that it dried out
 * once.
 */
export const WATERING_GUIDANCE = {
  text: 'After the initial watering, irrigate frequently and lightly — usually daily, and several times daily in windy, sunny weather.',
  source: IOWA_STATE,
} as const;
