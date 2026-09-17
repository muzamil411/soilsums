/**
 * Grass seeding rates in pounds of seed per 1,000 square feet.
 *
 * Rates vary with seed quality, variety and region, and warm-season grasses in
 * particular are often established from sod, sprigs or plugs rather than seed.
 * Every figure is `verified: false` — check against your state extension
 * service's turf establishment guide, which will also tell you the right
 * seeding window for your area.
 */
export type GrassSeason = 'cool' | 'warm';

export type GrassSeedRate = {
  readonly slug: string;
  readonly name: string;
  readonly season: GrassSeason;
  /** Pounds per 1,000 sq ft for a new lawn from bare soil. */
  readonly newLawnLbPer1000SqFt: number;
  /** Pounds per 1,000 sq ft for overseeding existing turf. */
  readonly overseedLbPer1000SqFt: number;
  readonly note: string;
  readonly source: string;
  readonly verified: boolean;
};

const CHECK = 'Verify against: your state extension service turf establishment guide';

export const grassSeedRates: readonly GrassSeedRate[] = [
  {
    slug: 'kentucky-bluegrass',
    name: 'Kentucky bluegrass',
    season: 'cool',
    newLawnLbPer1000SqFt: 2.5,
    overseedLbPer1000SqFt: 1.5,
    note: 'Slow to germinate — two to three weeks. Spreads by rhizomes once established.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'tall-fescue',
    name: 'Tall fescue',
    season: 'cool',
    newLawnLbPer1000SqFt: 7,
    overseedLbPer1000SqFt: 5,
    note: 'Large seed, so it needs a high rate by weight. Deep roots and good drought tolerance.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'fine-fescue',
    name: 'Fine fescue',
    season: 'cool',
    newLawnLbPer1000SqFt: 4.5,
    overseedLbPer1000SqFt: 3,
    note: 'The usual choice for shade. Includes creeping red, chewings and hard fescue.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'perennial-ryegrass',
    name: 'Perennial ryegrass',
    season: 'cool',
    newLawnLbPer1000SqFt: 7,
    overseedLbPer1000SqFt: 5,
    note: 'Germinates fast, often in under a week. Frequently blended for quick cover.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'annual-ryegrass',
    name: 'Annual ryegrass',
    season: 'cool',
    newLawnLbPer1000SqFt: 9,
    overseedLbPer1000SqFt: 6,
    note: 'A temporary cover or winter overseed for dormant warm-season lawns. Dies out within a year.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'creeping-bentgrass',
    name: 'Creeping bentgrass',
    season: 'cool',
    newLawnLbPer1000SqFt: 1,
    overseedLbPer1000SqFt: 0.5,
    note: 'Tiny seed and a very low rate. High maintenance — more a putting-green grass than a lawn grass.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'bermudagrass',
    name: 'Bermudagrass (hulled seed)',
    season: 'warm',
    newLawnLbPer1000SqFt: 1.5,
    overseedLbPer1000SqFt: 1,
    note: 'Needs warm soil to germinate. Unhulled seed is sown at a higher rate and germinates more slowly.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'zoysiagrass',
    name: 'Zoysiagrass',
    season: 'warm',
    newLawnLbPer1000SqFt: 1.5,
    overseedLbPer1000SqFt: 1,
    note: 'Slow to establish from seed — plugs or sod are more common and much faster.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'centipedegrass',
    name: 'Centipedegrass',
    season: 'warm',
    newLawnLbPer1000SqFt: 0.4,
    overseedLbPer1000SqFt: 0.25,
    note: 'Very fine seed at a very low rate. Mixing with sand helps spread it evenly.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'bahiagrass',
    name: 'Bahiagrass',
    season: 'warm',
    newLawnLbPer1000SqFt: 6,
    overseedLbPer1000SqFt: 4,
    note: 'Tolerates poor sandy soil. Coarse texture and tall seed heads.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'buffalograss',
    name: 'Buffalograss',
    season: 'warm',
    newLawnLbPer1000SqFt: 4,
    overseedLbPer1000SqFt: 2,
    note: 'A low-water native for the Great Plains. Sold as treated burs rather than bare seed.',
    source: CHECK,
    verified: false,
  },
];

export function getGrassSeedRate(slug: string): GrassSeedRate | undefined {
  return grassSeedRates.find((rate) => rate.slug === slug);
}
