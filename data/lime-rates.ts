/**
 * Limestone requirement by soil texture, in pounds of ground agricultural
 * limestone per 1,000 square feet to raise pH by one unit.
 *
 * Figures are from the University of Kentucky's lawn liming table (AGR-214,
 * Table 1). They assume ground agricultural limestone, calcitic or dolomitic,
 * worked into the top six inches of a mineral soil with low organic matter.
 *
 * IMPORTANT, and repeated on the calculator page: a single figure per texture
 * is a starting point, not an answer. What actually decides how much lime a
 * soil needs is its buffering capacity — how strongly it resists a pH change —
 * which is driven by clay content and organic matter and cannot be seen from a
 * pH reading. Published rates for the same texture differ several-fold between
 * regions because the soils behind them differ. Kentucky publishes a rate per
 * pH unit by texture; Colorado publishes a ceiling on a single application and
 * no texture table at all. The two are not reconcilable into one number, which
 * is why each texture carries a range as well as a midpoint, and why a soil
 * test reporting buffer pH beats all of it.
 *
 * The calculator treats the requirement as linear in the pH change, which is
 * an approximation. It is reasonable over a change of about one unit and gets
 * progressively less reliable beyond that, so the tool warns above 1.5 units.
 */
export type SoilTexture = 'sandy' | 'loam' | 'clay';

export type LimeRate = {
  readonly slug: SoilTexture;
  readonly name: string;
  readonly description: string;
  /** Pounds of ground limestone per 1,000 sq ft per 1.0 pH unit increase. */
  readonly lbPer1000SqFtPerPhUnit: number;
  /**
   * The published spread for this texture, low and high, in the same units.
   * Shown alongside the single figure so the result reads as an estimate with
   * width rather than a precise quantity to go and buy.
   */
  readonly rangeLbPer1000SqFt: readonly [number, number];
  readonly source: string;
  readonly verified: boolean;
};

const KENTUCKY =
  'University of Kentucky Cooperative Extension, AGR-214 Liming Kentucky Lawns (2014), Table 1, https://publications.mgcafe.uky.edu/files/AGR214.pdf';

export const limeRates: readonly LimeRate[] = [
  {
    slug: 'sandy',
    name: 'Sandy',
    description:
      'Gritty, drains fast, does not hold a ball when squeezed damp. Little buffering, so it shifts pH with less lime — and drifts back sooner.',
    lbPer1000SqFtPerPhUnit: 25,
    rangeLbPer1000SqFt: [20, 30],
    source: KENTUCKY,
    verified: true,
  },
  {
    slug: 'loam',
    name: 'Loam',
    description:
      'Holds together when squeezed but crumbles when poked. The middle of the range in both texture and lime requirement.',
    lbPer1000SqFtPerPhUnit: 60,
    rangeLbPer1000SqFt: [45, 75],
    source: KENTUCKY,
    verified: true,
  },
  {
    slug: 'clay',
    name: 'Clay',
    description:
      'Sticky when wet, hard when dry, ribbons between finger and thumb. Strongly buffered, so it needs the most lime and holds the change longest.',
    lbPer1000SqFtPerPhUnit: 95,
    rangeLbPer1000SqFt: [90, 100],
    source: KENTUCKY,
    verified: true,
  },
];

/** The source behind the rate table, for citing on the page itself. */
export const LIME_RATE_SOURCE = {
  label: 'University of Kentucky Cooperative Extension, AGR-214',
  title: 'Liming Kentucky Lawns',
  year: 2014,
  detail: 'Table 1',
  url: 'https://publications.mgcafe.uky.edu/files/AGR214.pdf',
} as const;

/**
 * Above this rate, Penn State advises splitting the correction across two or
 * more applications four to six months apart rather than putting it all down
 * at once, with no single application exceeding the limit.
 *
 * Penn State Extension, Agricultural Analytical Services Lab, turf lime
 * recommendations: https://extension.psu.edu/liming-turfgrass-areas
 */
export const SINGLE_APPLICATION_LIMIT_LB_PER_1000SQFT = 100;

/**
 * Colorado is stricter again on established turf, and caps hydrated or burned
 * lime far lower because it is caustic and acts fast. The organic matter
 * uplift is from the same source.
 *
 * Colorado State University Extension, Changing Soil pH (CMG GardenNotes #222):
 * https://extension.colostate.edu/resource/changing-soil-ph/
 */
export const COLORADO = {
  establishedTurfLimitLbPer1000SqFt: 50,
  hydratedLimeLimitLbPer1000SqFt: 10,
  /** Increase the rate by this much where organic matter runs 4–5%. */
  organicMatterUplift: 0.2,
} as const;

/**
 * Above this pH change the linear assumption stops being defensible and the
 * calculator says so rather than quietly extrapolating.
 */
export const MAX_RELIABLE_PH_CHANGE = 1.5;

/** Practical pH bounds for the inputs. Soils outside this are exceptional. */
export const PH_RANGE = { min: 3.5, max: 9 } as const;

/**
 * Wood ash as a liming material.
 *
 * From Iowa State University Extension and Outreach, "Using Wood Ashes in the
 * Home Garden". Ash is a real liming material and a free one, but its strength
 * is unknowable without a test: the calcium carbonate equivalent ranges from
 * 25 to 59 percent against 90 to 95 for ground limestone, so the same pH
 * change needs two to four times the weight.
 *
 * The application ceiling and the pH 7.0 cut-off are Iowa State's own, and
 * both belong on any page that quotes the CCE figures.
 */
export const WOOD_ASH = {
  /** Calcium carbonate equivalent, percent, low and high. */
  cceRangePercent: [25, 59] as const,
  /** What to assume when the ash has not been tested, which is normal. */
  cceAssumedPercent: 50,
  /** Ground limestone, for comparison. */
  limestoneCcePercent: [90, 95] as const,
  /** Weight of ash needed for the same effect as lime, low and high. */
  timesMoreThanLime: [2, 4] as const,
  /** Ceiling per application: about one five-gallon bucket. */
  maxLbPer1000SqFt: 20,
  /** Apply none at or above this soil pH. */
  doNotApplyAbovePh: 7,
  source:
    'Iowa State University Extension and Outreach, Using Wood Ashes in the Home Garden: https://yardandgarden.extension.iastate.edu/encyclopedia/using-wood-ashes-home-garden',
  verified: true,
} as const;

export function getLimeRate(texture: SoilTexture): LimeRate | undefined {
  return limeRates.find((rate) => rate.slug === texture);
}
