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
 * The single-application ceiling, as four publications give it, by material.
 *
 * Penn State allows 100 lb of ground limestone per 1,000 sq ft in one go.
 * Maryland says a recommendation above 50 lb should be split into two
 * applications six months apart. Colorado caps established turf at 50. Ohio
 * State publishes a ceiling per material rather than one figure for lime in
 * general, and its three limestone figures are 50. Nothing is averaged and
 * every figure is named on the page — the same treatment data/turfgrass.ts
 * gives the seeding-rate disagreement.
 *
 * The calculator caps at the CONSERVATIVE non-caustic figure, which is the one
 * place in this project where we take the safer of several sourced numbers
 * rather than showing a midpoint. The asymmetry is the reason: exceeding a
 * ceiling harms the lawn, while staying under it only means waiting six months
 * for the second half. Three of the four publications put that figure at 50,
 * which is independent confirmation rather than a house preference.
 *
 * `caustic` is load-bearing rather than descriptive. Hydrated and burned lime
 * are capped several-fold lower than limestone, so a ceiling derived across
 * every material would hand a limestone user 10 lb and a `Math.min` over the
 * whole list would silently retune the calculator the next time a caustic
 * figure is added. The calculator's scope is the three limestones, and
 * lib/calculators/lime.test.ts asserts that the derivation ignores the caustic
 * rows.
 */
export type LimeCeiling = {
  readonly lbPer1000SqFt: number;
  /** The material the publication attaches the figure to, in its own terms. */
  readonly material: string;
  /** Caustic materials: capped far lower, and outside the calculator's scope. */
  readonly caustic: boolean;
  readonly institution: string;
  readonly title: string;
  readonly url?: string;
  readonly note: string;
};

export const LAWN_LIME_CEILINGS: readonly LimeCeiling[] = [
  {
    lbPer1000SqFt: 100,
    material: 'Ground limestone',
    caustic: false,
    institution: 'Penn State Extension',
    title: 'Liming Turfgrass Areas',
    url: 'https://extension.psu.edu/liming-turfgrass-areas',
    note: 'The maximum in any single application on an established lawn. Where the requirement exceeds it, Penn State advises semiannual applications until it is met. On golf greens the limit is 25 lb.',
  },
  {
    lbPer1000SqFt: 50,
    material: 'Lime, material not broken out',
    caustic: false,
    institution: 'University of Maryland Extension',
    title: 'Lime and Lawns',
    url: 'https://extension.umd.edu/resource/lime-and-lawns',
    note: 'A recommendation above 50 lb per 1,000 sq ft should be split into two applications six months apart.',
  },
  {
    lbPer1000SqFt: 50,
    material: 'Lime on established turf',
    caustic: false,
    institution: 'Colorado State University Extension',
    title: 'CMG GardenNotes #222, Soil pH',
    note: 'The established-turf limit: individual applications to turf should not exceed 50 lb of limestone per 1,000 sq ft. Colorado publishes no texture table at all, so this ceiling is how it expresses a lime recommendation. (The extension site has since redesigned its soil-pH page; the figures are from GardenNotes #222 as published.)',
  },
  {
    lbPer1000SqFt: 50,
    material: 'Ground limestone',
    caustic: false,
    institution: 'Ohio State University Extension',
    title: 'Lime and the Home Lawn',
    url: 'https://ohioline.osu.edu/factsheet/hyg-4026',
    note: 'Maximum single application. Ohio State gives a figure per material rather than one for lime in general.',
  },
  {
    lbPer1000SqFt: 50,
    material: 'Dolomitic limestone',
    caustic: false,
    institution: 'Ohio State University Extension',
    title: 'Lime and the Home Lawn',
    url: 'https://ohioline.osu.edu/factsheet/hyg-4026',
    note: 'Maximum single application, the same as ground limestone.',
  },
  {
    lbPer1000SqFt: 50,
    material: 'Pelletized limestone',
    caustic: false,
    institution: 'Ohio State University Extension',
    title: 'Lime and the Home Lawn',
    url: 'https://ohioline.osu.edu/factsheet/hyg-4026',
    note: 'Maximum single application, the same as ground and dolomitic limestone — pelletizing is a handling difference, not a chemical one.',
  },
  {
    lbPer1000SqFt: 20,
    material: 'Hydrated lime',
    caustic: true,
    institution: 'Ohio State University Extension',
    title: 'Lime and the Home Lawn',
    url: 'https://ohioline.osu.edu/factsheet/hyg-4026',
    note: 'Maximum single application. Less than half the limestone figure, because hydrated lime is caustic and acts fast.',
  },
  {
    lbPer1000SqFt: 10,
    material: 'Burned lime',
    caustic: true,
    institution: 'Ohio State University Extension',
    title: 'Lime and the Home Lawn',
    url: 'https://ohioline.osu.edu/factsheet/hyg-4026',
    note: 'Maximum single application, a fifth of the limestone figure.',
  },
  {
    lbPer1000SqFt: 10,
    material: 'Hydrated or burned lime',
    caustic: true,
    institution: 'Colorado State University Extension',
    title: 'CMG GardenNotes #222, Soil pH',
    note: 'Apply no more than 10 lb of hydrated or burned lime per 1,000 sq ft of turf. Colorado does not separate hydrated from burned, and its hydrated figure is half of Ohio State\'s 20 — recorded rather than reconciled. (The extension site has since redesigned its soil-pH page; the figures are from GardenNotes #222 as published.)',
  },
];

/** The materials every rate and ceiling this calculator applies is for. */
export const CALCULATOR_MATERIALS = [
  'ground limestone',
  'dolomitic limestone',
  'pelletized limestone',
] as const;

/**
 * The cap the calculator actually applies: the lowest published figure for a
 * non-caustic limestone, deliberately, rather than the most permissive.
 */
export const CONSERVATIVE_CEILING_LB_PER_1000SQFT = Math.min(
  ...LAWN_LIME_CEILINGS.filter((ceiling) => !ceiling.caustic).map(
    (ceiling) => ceiling.lbPer1000SqFt,
  ),
);

/**
 * The caustic materials' ceiling, which the calculator does not use because it
 * does not price those materials. It exists so the pages can say how much lower
 * it is instead of implying the amount is the same whatever bag you buy.
 */
export const CAUSTIC_CEILING_LB_PER_1000SQFT = Math.min(
  ...LAWN_LIME_CEILINGS.filter((ceiling) => ceiling.caustic).map(
    (ceiling) => ceiling.lbPer1000SqFt,
  ),
);

/**
 * One publication's ceiling for one material, so copy naming a specific figure
 * reads it rather than repeating it. Throws rather than returning undefined: a
 * missing row means the copy is describing something the data no longer holds,
 * and a page that silently drops a number is how this file's figures drifted
 * before.
 */
export function ceilingFor(institutionStartsWith: string, material: string): number {
  const found = LAWN_LIME_CEILINGS.find(
    (ceiling) =>
      ceiling.institution.startsWith(institutionStartsWith) && ceiling.material === material,
  );
  if (found === undefined) {
    throw new Error(`No published lime ceiling for ${material} from ${institutionStartsWith}`);
  }
  return found.lbPer1000SqFt;
}

/** The services that publish the conservative figure, for naming them in copy. */
export const CEILING_AGREEMENT: readonly string[] = [
  ...new Set(
    LAWN_LIME_CEILINGS.filter(
      (ceiling) =>
        !ceiling.caustic && ceiling.lbPer1000SqFt === CONSERVATIVE_CEILING_LB_PER_1000SQFT,
    ).map((ceiling) => ceiling.institution),
  ),
];

/**
 * How long lime takes to move soil pH: four to six months.
 *
 * This is the site's only answer to that question and every surface reads it
 * from here, because the site held three answers at once for months. The pH
 * article said three to six, the lime calculator said six months to a year, a
 * generated figure said three to six, and neither of the two that named a
 * figure carried a citation anywhere on its page. The lawn lime article,
 * written later against publications that gave no figure, said no sourced
 * figure existed.
 *
 * UMass states the range; Ohio State corroborates it qualitatively without
 * naming one. It is a range rather than a number because how fast the reaction
 * runs depends on the fineness of the material, how well it is incorporated and
 * soil moisture — none of which a reader controls precisely.
 */
export const UMASS_TIMING = {
  institution: 'UMass Amherst Soil and Plant Nutrient Testing Laboratory',
  /** For a figure subtitle, where the full name does not fit. */
  shortName: 'UMass Amherst',
  title: 'Timing of Lime and Fertilizer Applications',
  url: 'https://www.umass.edu/agriculture-food-environment/soil-plant-nutrient-testing-laboratory/fact-sheets/timing-of-lime-fertilizer-applications',
  quote:
    "limestone can take a long time (4-6 months) to raise soil pH, it's best to start as soon as possible",
  /** Established plantings may be limed twice a year, spring and autumn, with the amount limited to avoid damage. */
  twiceAYearOnEstablishedPlantings: true,
} as const;

export const OHIO_STATE_LAWN = {
  institution: 'Ohio State University Extension',
  title: 'Lime and the Home Lawn',
  detail: 'Ohioline HYG-4026',
  url: 'https://ohioline.osu.edu/factsheet/hyg-4026',
  quote: 'it may be several months before the soil pH changes',
} as const;

export const LIME_TIMING = {
  monthsToMovePh: [4, 6] as const,
  /** Spelled out, because that is how it reads in prose on every page. */
  words: 'four to six',
  label: 'four to six months',
  source: UMASS_TIMING,
  corroboration: OHIO_STATE_LAWN,
  whyARange:
    'how fast it moves depends on the fineness of the material, how well it is incorporated and soil moisture, none of which you control precisely',
} as const;

/**
 * Target pH for a lawn, as three services give it, plus Penn State's
 * per-species rows.
 *
 * The three general ranges are close but not identical — Penn State 6.0 to 7.2,
 * Maryland 6.0 to 6.8, Ohio State 6.0 to 7.0 — so the site states the overlap
 * rather than adopting one service's range as its own. `scope` is what makes
 * that derivable: the overlap is taken across the general ranges only, since a
 * species range is a narrower claim about one grass rather than a competing
 * answer to the same question.
 */
export type LawnPhTarget = {
  readonly label: string;
  readonly range: readonly [number, number];
  readonly source: string;
  readonly scope: 'general' | 'species';
};

export const LAWN_PH_TARGETS: readonly LawnPhTarget[] = [
  {
    label: 'Cool-season turfgrass generally',
    range: [6.0, 7.2],
    source: 'Penn State',
    scope: 'general',
  },
  { label: 'Kentucky bluegrass', range: [6.5, 7.2], source: 'Penn State', scope: 'species' },
  {
    label: 'Fine fescues, bentgrasses and ryegrasses',
    range: [6.0, 6.5],
    source: 'Penn State',
    scope: 'species',
  },
  { label: 'Optimal range for lawns', range: [6.0, 6.8], source: 'Maryland', scope: 'general' },
  { label: 'Ideal range for a home lawn', range: [6.0, 7.0], source: 'Ohio State', scope: 'general' },
];

/**
 * Where the three services' general ranges all agree, which is the practical
 * answer the pages give: a lawn inside this band is inside every one of them.
 */
export const LAWN_PH_OVERLAP: readonly [number, number] = [
  Math.max(
    ...LAWN_PH_TARGETS.filter((target) => target.scope === 'general').map(
      (target) => target.range[0],
    ),
  ),
  Math.min(
    ...LAWN_PH_TARGETS.filter((target) => target.scope === 'general').map(
      (target) => target.range[1],
    ),
  ),
];

/** The overlap written the way prose writes it: one decimal place, always. */
export const LAWN_PH_OVERLAP_LABEL = `${LAWN_PH_OVERLAP[0].toFixed(1)} to ${LAWN_PH_OVERLAP[1].toFixed(1)}`;

/** Maryland: below this, turf growth is compromised. */
export const PH_GROWTH_COMPROMISED_BELOW = 5.5;

/**
 * The instruction Penn State puts in its own words and almost nobody writing
 * about lawn lime repeats. It is the spine of the lime article rather than a
 * footnote, so it lives here and is rendered rather than paraphrased.
 */
export const DO_NOT_GUESS =
  'Do not lime unless a lime requirement test shows that limestone is needed, and never guess at the amount of limestone needed.';

/** Maryland: how often a soil test should be the basis for liming. */
export const SOIL_TEST_INTERVAL_YEARS = [3, 4] as const;

/**
 * A new seeding is the exception to the ceiling: Penn State allows the whole
 * requirement at once where it is mixed into the top 4 to 6 inches of soil.
 */
export const NEW_SEEDING_INCORPORATION_INCHES = [4, 6] as const;

/**
 * Colorado is stricter again on established turf, and caps hydrated or burned
 * lime far lower because it is caustic and acts fast. The organic matter
 * uplift is from the same source.
 *
 * Colorado State University Extension, CMG GardenNotes #222, Soil pH. (The extension site has
 * since redesigned its soil-pH page; the figures below are from GardenNotes #222 as published.)
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
