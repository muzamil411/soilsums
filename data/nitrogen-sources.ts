/**
 * Nitrogen content of organic fertilizer materials.
 *
 * Every figure is Table 1 of University of Georgia Extension Circular 853,
 * "How to Convert an Inorganic Fertilizer Recommendation to an Organic One"
 * (Reeves, Gaskin, Kissel, Boyhan, McLaurin and Harris, 15 September 2014) —
 * "Guide to the Mineral Nutrient Value of Organic Fertilizers". Nothing here
 * comes from anywhere else, and nothing should be added without the same
 * kind of source.
 *
 * The availability rating is the part that makes the table useful. A material
 * with 12% nitrogen that releases over a year is not interchangeable with one
 * at 5% that releases in a fortnight, and a percentage quoted without the
 * rating invites exactly that mistake. The circular defines its own ratings,
 * and those definitions are on the page beside the table.
 */

/** The circular's release-speed ratings, with its own definitions. */
export type NitrogenAvailability =
  'Rapid' | 'Medium-Rapid' | 'Medium' | 'Medium-Slow' | 'Slow-Medium' | 'Slow' | 'Very Slow';

/** How long each rating means, in the circular's words. */
export const AVAILABILITY_DEFINITIONS: Readonly<Record<string, string>> = {
  Rapid: 'less than 1 month',
  Medium: '1 to 4 months',
  Slow: '4 months to 1 year',
  'Very Slow': 'more than 1 year',
};

export type NitrogenSource = {
  readonly slug: string;
  readonly name: string;
  /** Percent nitrogen. A pair is the published range, low and high. */
  readonly nitrogenPercent: number | readonly [number, number];
  readonly availability: NitrogenAvailability;
  /** True for manures, which carry the circular's own caveat. */
  readonly isManure: boolean;
  readonly source: string;
  readonly verified: boolean;
};

const UGA =
  'University of Georgia Extension Circular 853, How to Convert an Inorganic Fertilizer Recommendation to an Organic One (2014), Table 1: https://extension.uga.edu/publications/detail.html?number=C853';

/**
 * The circular's footnote on manures, which must travel with any manure
 * figure: it is why a manure percentage is a starting point rather than a
 * rate.
 */
export const MANURE_CAVEAT =
  'Plant nutrients available during the year of application vary with the amount of straw or bedding present and with the method of storage.';

export const nitrogenSources: readonly NitrogenSource[] = [
  {
    slug: 'feather-meal',
    name: 'Feather meal',
    nitrogenPercent: [11, 15],
    availability: 'Slow',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'blood-meal',
    name: 'Blood meal',
    nitrogenPercent: 12,
    availability: 'Medium-Rapid',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'fish-powder',
    name: 'Fish powder, dry',
    nitrogenPercent: 12,
    availability: 'Rapid',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'fish-meal',
    name: 'Fish meal',
    nitrogenPercent: 10,
    availability: 'Slow-Medium',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'soybean-meal',
    name: 'Soybean meal',
    nitrogenPercent: 6.7,
    availability: 'Medium-Slow',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'cottonseed-meal',
    name: 'Cottonseed meal, dry',
    nitrogenPercent: 6,
    availability: 'Slow-Medium',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'fish-emulsion',
    name: 'Fish emulsion',
    nitrogenPercent: 5,
    availability: 'Medium-Rapid',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'broiler-litter',
    name: 'Broiler litter, fresh',
    nitrogenPercent: 3.1,
    availability: 'Medium-Rapid',
    isManure: true,
    source: UGA,
    verified: true,
  },
  {
    slug: 'alfalfa-meal',
    name: 'Alfalfa meal',
    nitrogenPercent: 3,
    availability: 'Medium-Slow',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'coffee-grounds',
    name: 'Coffee grounds, dry',
    nitrogenPercent: 2,
    availability: 'Slow',
    isManure: false,
    source: UGA,
    verified: true,
  },
  {
    slug: 'swine-manure',
    name: 'Swine manure, fresh',
    nitrogenPercent: 0.6,
    availability: 'Medium',
    isManure: true,
    source: UGA,
    verified: true,
  },
  {
    slug: 'cattle-manure',
    name: 'Cattle manure, fresh',
    nitrogenPercent: 0.5,
    availability: 'Medium',
    isManure: true,
    source: UGA,
    verified: true,
  },
];

/** "12%", or "11-15%" for a published range. */
export function nitrogenLabel(entry: NitrogenSource): string {
  const value = entry.nitrogenPercent;
  return Array.isArray(value) ? `${value[0]}–${value[1]}%` : `${value as number}%`;
}

/**
 * Cool-season lawn nitrogen, from University of Connecticut Extension,
 * "Suggested Fertilizer Practices for Lawns" (Dawn Pettinelli, 2001, revised
 * 2015). Kentucky bluegrass, the fescues and perennial ryegrass.
 *
 * The per-application cap is a limit rather than a suggestion, and is stored
 * separately from the annual totals so it cannot be read as one of them.
 */
export const LAWN_NITROGEN = {
  annualLbPer1000SqFtClippingsLeft: 2,
  annualLbPer1000SqFtClippingsRemoved: 3,
  /** Never exceed this in a single application of water-soluble nitrogen. */
  maxSingleApplicationLbPer1000SqFt: 1,
  source:
    'University of Connecticut Extension, Suggested Fertilizer Practices for Lawns (Pettinelli, 2001, rev. 2015): https://homegarden.cahnr.uconn.edu/factsheets/suggested-fertilizer-practices-for-lawns/',
  verified: true,
} as const;
