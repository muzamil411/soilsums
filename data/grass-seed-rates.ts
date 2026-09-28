/**
 * Grass seeding rates in pounds of seed per 1,000 square feet.
 *
 * Rates vary with seed quality, variety and region, and warm-season grasses in
 * particular are often established from sod, sprigs or plugs rather than seed.
 *
 * The region matters more here than anywhere else on the site, and the entries
 * name it. Published rates for one species disagree several-fold between
 * states: buffalograss is 1-2 lb per 1,000 sq ft in Kansas and 3-5 in
 * Colorado; annual ryegrass is 1.5-2 in North Carolina, where it is a
 * temporary winter cover, and 7-9 in New England.
 *
 * New-lawn rates are sourced. Overseeding rates mostly are not: the September
 * 2026 verification report found a source for only three of the eleven, so the
 * rest carry `overseedVerified: false` and the calculator marks the result as
 * an estimate rather than quietly presenting it as checked.
 *
 * Every rate is in pounds of bulk seed, not pure live seed. Divide by
 * (purity x germination), both printed on the bag, to get the amount to buy.
 */
import { PENN_STATE, TURF_SPECIES, type Rate } from './turfgrass';

export type GrassSeason = 'cool' | 'warm';

export type GrassSeedRate = {
  readonly slug: string;
  readonly name: string;
  readonly season: GrassSeason;
  /**
   * Pounds per 1,000 sq ft for a new lawn from bare soil.
   *
   * DERIVED, not stored, for every species data/turfgrass.ts covers: it is the
   * midpoint of Penn State's published range, so there is one place in the repo
   * where a seeding rate lives. It is arithmetic on a published range rather
   * than a recommendation of its own, and every page that shows it says so.
   */
  readonly newLawnLbPer1000SqFt: number;
  /** The published range the figure above is the midpoint of. */
  readonly newLawnRange: Rate;
  /** Who published that range, for the label beside it. */
  readonly newLawnBasis: string;
  /** Pounds per 1,000 sq ft for overseeding existing turf. */
  readonly overseedLbPer1000SqFt: number;
  /**
   * The state or region the sourced rate covers. Shown on the page, because a
   * rate from Florida is not advice for New England.
   */
  readonly region: string;
  readonly note: string;
  readonly source: string;
  /** Whether the new-lawn rate has a source that could be opened. */
  readonly verified: boolean;
  /** Whether the overseeding rate has one. Usually it does not. */
  readonly overseedVerified: boolean;
};

/** Divide a bulk rate by this to get pure live seed, both figures off the bag. */
export const PLS_NOTE =
  'Rates are for bulk seed. Divide by purity x germination — both printed on the bag — to get the weight of pure live seed you actually need. A bag at 95% purity and 85% germination needs about 24% more by weight than the rate says.';

/** UMass: poor seedbeds, late sowing or heavy traffic need more. */
export const POOR_CONDITIONS_UPLIFT = 0.5;

/** 1 lb per 1,000 sq ft in metric, for UK and Australian readers. */
export const G_PER_SQM_PER_LB_PER_1000SQFT = 4.9;

/**
 * What this file stores. The new-lawn rate is absent for any species
 * data/turfgrass.ts publishes a range for, and supplied here only for the
 * warm-season grasses and annual ryegrass that Penn State's table does not
 * cover.
 */
type GrassSeedSeed = Omit<
  GrassSeedRate,
  'newLawnLbPer1000SqFt' | 'newLawnRange' | 'newLawnBasis'
> & {
  /** Only for species turfgrass.ts does not cover. */
  readonly ownNewLawnLbPer1000SqFt?: number;
};

const seeds: readonly GrassSeedSeed[] = [
  {
    slug: 'kentucky-bluegrass',
    name: 'Kentucky bluegrass',
    season: 'cool',
    overseedLbPer1000SqFt: 2,
    region: 'Pennsylvania, New York and Nebraska',
    note: 'Slow to germinate — two to three weeks. Spreads by rhizomes once established.',
    source:
      'Penn State, Turfgrass Seed and Seed Mixtures (2-3); Cornell sports fields (1-3); Nebraska, Overseeding in the Fall (~2 overseed): https://extension.psu.edu/turfgrass-seed-and-seed-mixtures',
    verified: true,
    overseedVerified: true,
  },
  {
    slug: 'tall-fescue',
    name: 'Tall fescue',
    season: 'cool',
    overseedLbPer1000SqFt: 3.5,
    region: 'Pennsylvania, New York and Nebraska',
    note: 'Large seed, so it needs a high rate by weight. Deep roots and good drought tolerance.',
    source:
      'Penn State, Turfgrass Seed and Seed Mixtures (6-8); Nebraska, Overseeding in the Fall (3-4 overseed): https://extension.psu.edu/turfgrass-seed-and-seed-mixtures',
    verified: true,
    overseedVerified: true,
  },
  {
    slug: 'fine-fescue',
    name: 'Fine fescue',
    season: 'cool',
    overseedLbPer1000SqFt: 3,
    region: 'Pennsylvania and New England',
    note: 'The usual choice for shade. Includes creeping red, chewings and hard fescue.',
    source:
      'Penn State, Turfgrass Seed and Seed Mixtures (4-5); UMass red fescue 4-6: https://extension.psu.edu/turfgrass-seed-and-seed-mixtures',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'perennial-ryegrass',
    name: 'Perennial ryegrass',
    season: 'cool',
    // Penn State's renovation range for turf-type perennial ryegrass is 2 to 5 lb,
    // and this was its top end — which exceeded the new-lawn rate once that
    // became the midpoint of 4 to 5. Midpoint of the same range instead.
    overseedLbPer1000SqFt: 3.5,
    region: 'Pennsylvania, New York and New England',
    note: 'Germinates fast, often in under a week. Frequently blended for quick cover.',
    source:
      'UMass, Seeding Rate Considerations (7-9 new, 6-8 athletic overseed); Penn State renovation 2-5: https://www.umass.edu/agriculture-food-environment/home-lawn-garden/fact-sheets/seeding-rate-considerations',
    verified: true,
    overseedVerified: true,
  },
  {
    slug: 'annual-ryegrass',
    name: 'Annual ryegrass',
    season: 'cool',
    ownNewLawnLbPer1000SqFt: 9,
    overseedLbPer1000SqFt: 6,
    region: 'New England (as a full cover); far lower where it is a temporary winter crop',
    note: 'A temporary cover or winter overseed for dormant warm-season lawns. Dies out within a year.',
    source:
      'UMass, Seeding Rate Considerations (7-9): https://www.umass.edu/agriculture-food-environment/home-lawn-garden/fact-sheets/seeding-rate-considerations',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'creeping-bentgrass',
    name: 'Creeping bentgrass',
    season: 'cool',
    overseedLbPer1000SqFt: 0.5,
    region: 'Pennsylvania and New England, golf turf rather than home lawns',
    note: 'Tiny seed and a very low rate. High maintenance — more a putting-green grass than a lawn grass.',
    source:
      'Penn State, Turfgrass Seed and Seed Mixtures (greens 1); UMass 0.5-1: https://extension.psu.edu/turfgrass-seed-and-seed-mixtures',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'bermudagrass',
    name: 'Bermudagrass (hulled seed)',
    season: 'warm',
    ownNewLawnLbPer1000SqFt: 1.5,
    overseedLbPer1000SqFt: 1,
    region: 'North Carolina and Florida',
    note: 'Needs warm soil to germinate. Unhulled seed is sown at a higher rate and germinates more slowly.',
    source:
      'NC State, Extension Gardener Handbook ch. 9, Table 9-4 (1-2); UF/IFAS LH013 (1-4): https://content.ces.ncsu.edu/extension-gardener-handbook/9-lawns',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'zoysiagrass',
    name: 'Zoysiagrass',
    season: 'warm',
    ownNewLawnLbPer1000SqFt: 1.5,
    overseedLbPer1000SqFt: 1,
    region: 'Arkansas and North Carolina',
    note: 'Slow to establish from seed — plugs or sod are more common and much faster.',
    source:
      'University of Arkansas MP476 (1-2 lb pure live seed); NC State Table 9-4 (1-2): https://horticulture.uark.edu/_resources/pdf/turf/extension-pubs/establishing-seeded-zoysiagrass-on-lawns-and-golf-courses-mp476.pdf',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'centipedegrass',
    name: 'Centipedegrass',
    season: 'warm',
    ownNewLawnLbPer1000SqFt: 0.4,
    overseedLbPer1000SqFt: 0.25,
    region: 'North Carolina and Florida',
    note: 'Very fine seed at a very low rate. Mixing with sand helps spread it evenly.',
    source:
      'NC State, Extension Gardener Handbook ch. 9, Table 9-4 (0.25-0.5); UF/IFAS LH013 (0.25-1): https://content.ces.ncsu.edu/extension-gardener-handbook/9-lawns',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'bahiagrass',
    name: 'Bahiagrass',
    season: 'warm',
    ownNewLawnLbPer1000SqFt: 6,
    overseedLbPer1000SqFt: 4,
    region: 'North Carolina and Florida',
    note: 'Tolerates poor sandy soil. Coarse texture and tall seed heads.',
    source:
      'NC State, Extension Gardener Handbook ch. 9, Table 9-4 (5); UF/IFAS LH013 (5-10): https://content.ces.ncsu.edu/extension-gardener-handbook/9-lawns',
    verified: true,
    overseedVerified: false,
  },
  {
    slug: 'buffalograss',
    name: 'Buffalograss',
    season: 'warm',
    ownNewLawnLbPer1000SqFt: 4,
    overseedLbPer1000SqFt: 2,
    region: 'Colorado; Kansas publishes 1-2 for the same grass',
    note: 'A low-water native for the Great Plains. Sold as treated burs rather than bare seed.',
    source:
      'Colorado State, Buffalograss Lawns (3-5); Kansas State, Ford County, Buffalograss (1-2): https://extension.colostate.edu/resource/buffalograss-lawns/',
    verified: true,
    overseedVerified: false,
  },
];

/** Midpoint of a published range, or the figure itself where it is a single one. */
function midpoint(rate: Rate): number {
  // typeof rather than Array.isArray: the latter narrows to any[] and leaves a
  // readonly tuple in the negative branch, which TypeScript then rejects.
  if (typeof rate === 'number') return rate;
  const [low, high] = rate;
  return Math.round(((low + high) / 2) * 100) / 100;
}

/**
 * The rates the calculator works from.
 *
 * For every species Penn State's table covers, the figure is the midpoint of
 * that published range, derived here rather than copied — so correcting
 * data/turfgrass.ts corrects the calculator, the rate table, and the article,
 * with no chance of the three disagreeing. Penn State's new-seeding column is
 * the basis because establishing a lawn is the job this calculator does.
 *
 * Missouri's higher autumn and spring figures stay visible on the germination
 * article as a disagreement a reader can see. They are deliberately not the
 * calculator's default: a single blended number would be one neither service
 * publishes.
 */
export const grassSeedRates: readonly GrassSeedRate[] = seeds.map((seed) => {
  const published = TURF_SPECIES.find((species) => species.slug === seed.slug)?.pennState;

  if (published !== undefined) {
    // A species cannot have both. If turfgrass.ts publishes a range for it, that
    // range is the only source, and an own figure alongside it would be a second
    // place a seeding rate lives — which is the exact condition this refactor
    // removed. Fail loudly at import rather than silently preferring one.
    if (seed.ownNewLawnLbPer1000SqFt !== undefined) {
      throw new Error(
        `${seed.slug} carries its own new-lawn rate while turfgrass.ts publishes a range for it. Remove the own figure; the range is the source.`,
      );
    }
    return {
      ...seed,
      newLawnLbPer1000SqFt: midpoint(published),
      newLawnRange: published,
      newLawnBasis: PENN_STATE.institution,
    };
  }

  const own = seed.ownNewLawnLbPer1000SqFt;
  if (own === undefined) {
    throw new Error(
      `${seed.slug} has no new-lawn rate: it is not in turfgrass.ts and carries no own figure`,
    );
  }
  return { ...seed, newLawnLbPer1000SqFt: own, newLawnRange: own, newLawnBasis: seed.region };
});

export function getGrassSeedRate(slug: string): GrassSeedRate | undefined {
  return grassSeedRates.find((rate) => rate.slug === slug);
}
