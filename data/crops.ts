/**
 * Crop data for the spacing, planting date, square foot planner and yield
 * calculators, and for the /crops/ guides.
 *
 * Verification is per field, not per crop. The September 2026 verification
 * report checked six fields against a named US extension page for each crop:
 * the two spacings, the square-foot-gardening figure, and the three planting
 * offsets. `verifiedFields` lists the ones confirmed for that crop, `source` is
 * the page they were confirmed against, and `verified` is true only once every
 * applicable checked field is in that list. Everything else in the entry —
 * yields, days to maturity, companions, problems — was never systematically
 * checked and still renders as an estimate.
 *
 * A field that is null needs no verification: it is not a figure but a
 * statement that the step does not apply, and it carries a reason saying so.
 *
 * Nulls are meaningful, not missing data:
 *  - `sowIndoorsWeeksBeforeLastFrost: null` means a crop is not normally
 *    started indoors (carrots, radishes, beans).
 *  - `directSowWeeksRelativeToLastFrost: null` means it is not normally direct
 *    sown (tomatoes, peppers, broccoli).
 *  - `daysToMaturity: null` means no days-to-maturity figure is shown, which
 *    happens for two unrelated reasons: the concept does not apply (a
 *    perennial such as strawberry, cropping years after planting), or it
 *    applies but nobody publishes it (marigold, where no extension source
 *    gives days from sowing to flower). The two are not interchangeable, so
 *    the crop says which in `noDaysToMaturityReason`.
 *  - Garlic is planted in autumn, so no last-frost offset describes it. Crops
 *    like that carry a `timingNote` and the planting date calculator shows the
 *    note instead of inventing a spring date.
 *
 * Offsets are in weeks relative to the average LAST SPRING FROST date.
 * Negative is before that date, positive is after it.
 *
 * Plants per square foot is NOT stored. There are two different quantities and
 * storing one number conflated them: the density implied by the row spacing,
 * which is arithmetic, and the square-foot-gardening figure, which is a
 * convention from Mel Bartholomew's method rather than a research finding. The
 * first is computed by `plantsPerSquareFoot()`; the second is
 * `sfgPlantsPerSquare`, null wherever the Cornell CALS page does not name the
 * crop.
 */
export type CropType = 'vegetable' | 'herb' | 'fruit';

/** Botanical families across the dataset. Same family means shared pests. */
export type CropFamily =
  | 'Solanaceae'
  | 'Cucurbitaceae'
  | 'Brassicaceae'
  | 'Apiaceae'
  | 'Amaryllidaceae'
  | 'Fabaceae'
  | 'Amaranthaceae'
  | 'Asteraceae'
  | 'Asparagaceae'
  | 'Poaceae'
  | 'Convolvulaceae'
  | 'Rosaceae'
  | 'Ericaceae'
  | 'Malvaceae'
  | 'Lamiaceae';

/** The extension page a crop's checked fields were confirmed against. */
export type CropSource = {
  readonly institution: string;
  readonly url: string;
  /** The publication's own title, where a crop cites more than one. */
  readonly title?: string;
};

/**
 * Inches, or a low-high pair where published sources genuinely disagree.
 *
 * Extension figures differ because the publications are written for different
 * soils and climates: Minnesota spaces asparagus crowns at 12 inches and
 * Maryland at 18. Averaging them invents a figure neither source gives, and
 * picking one hides a real disagreement, so the pair is stored and the page
 * shows both with their sources.
 */
export type Inches = number | readonly [number, number];

/**
 * The single figure a calculator works from when a crop's spacing is a range.
 *
 * The wide end, deliberately. A spacing calculator that takes the narrow end
 * plants too densely, and crowding is the harder mistake to undo — you cannot
 * move a crown once the bed is established.
 */
export function spacingFor(value: Inches): number {
  return Array.isArray(value) ? (value as readonly [number, number])[1] : (value as number);
}

/** "12 to 18 in", or "15 in" for a single figure. */
export function inchesLabel(value: Inches): string {
  return Array.isArray(value)
    ? `${(value as readonly [number, number])[0]} to ${(value as readonly [number, number])[1]} in`
    : `${value as number} in`;
}

/**
 * The fields the verification report checked. Anything outside this list was
 * never systematically checked, whatever `verified` says.
 */
export const CHECKED_FIELDS = [
  'spacingInches',
  'rowSpacingInches',
  'sfgPlantsPerSquare',
  'sowIndoorsWeeksBeforeLastFrost',
  'transplantWeeksAfterLastFrost',
  'directSowWeeksRelativeToLastFrost',
] as const;

export type CheckedField = (typeof CHECKED_FIELDS)[number];

export type Crop = {
  readonly slug: string;
  readonly name: string;
  readonly scientificName: string;
  readonly type: CropType;
  /**
   * Botanical family. Taxonomy rather than an agronomic measurement, so it
   * needs no extension citation — but it does real work: two crops in the same
   * family share pests and diseases, which is the one companion-planting
   * mechanism that can be derived rather than asserted, and it is what the
   * companion planting chart reasons from in both directions.
   */
  readonly family: CropFamily;

  /** In-row spacing between plants. A pair where sources disagree. */
  readonly spacingInches: Inches;
  /**
   * Spacing between rows. Null where no source gives one separately — the
   * marigold factsheet spaces plants without distinguishing rows, and an
   * invented row figure would be worse than none.
   */
  readonly rowSpacingInches: Inches | null;
  /**
   * Plants per square under the square foot gardening METHOD, as described by
   * Cornell CALS. This is Mel Bartholomew's convention — a way of laying out an
   * intensively amended bed — not an extension spacing recommendation, and it
   * is deliberately not derived from `spacingInches`. Null where the Cornell
   * page does not name the crop, which is most herbs and the large vines.
   *
   * A null still needs verifying: "the page does not name this crop" is itself
   * a claim, so it counts as an applicable checked field either way. The three
   * planting offsets are the opposite — a null there is a reason, not a figure.
   */
  readonly sfgPlantsPerSquare: number | null;

  /**
   * When the crop actually goes in, where that is not the spring frost window.
   * Garlic is a fall crop, so no last-frost offset describes it at all.
   */
  readonly plantingSeason?: 'fall';
  /**
   * The second condition, alongside the date. A frost-date offset on its own
   * is misleading for warm-season crops: the calendar can say go while the
   * soil is still too cold for the seed to do anything.
   */
  readonly soilOrAirTempNote?: string;
  /** Anything a reader needs that a number cannot carry. Shown on the page. */
  readonly notes?: readonly string[];

  readonly sowIndoorsWeeksBeforeLastFrost: number | null;
  readonly transplantWeeksAfterLastFrost: number | null;
  readonly directSowWeeksRelativeToLastFrost: number | null;
  /** Explains any crop whose timing cannot be expressed as a frost offset. */
  readonly timingNote?: string;
  /**
   * Wording for an offset that has a value but is published as a condition.
   * Clemson puts marigolds out "after the last frost in spring" — which is
   * zero weeks, and which tells a reader something a zero does not.
   */
  readonly transplantNote?: string;
  readonly directSowNote?: string;
  /**
   * Why a planting step does not apply, for each of the three that can be
   * null. A quick-facts table saying "Direct sow: —" tells the reader nothing;
   * these turn each blank into a short reason.
   */
  readonly noSowIndoorsReason?: string;
  readonly noTransplantReason?: string;
  readonly noDirectSowReason?: string;

  readonly daysToMaturity: readonly [number, number] | null;
  /**
   * Why no days-to-maturity figure is shown. Required wherever
   * `daysToMaturity` is null, because the reasons differ in kind: a perennial
   * has no such figure, while an annual can simply have none published. The
   * quick-facts table used to derive one sentence for both and told readers
   * marigolds were perennials on a page whose whole purpose is saying they
   * are not.
   */
  readonly noDaysToMaturityReason?: string;
  readonly sunHours: number;
  /** Inches per week. Null where no source quantifies it. */
  readonly waterInchesPerWeek: number | null;
  /** Said in words where a source declines to give a number. */
  readonly waterNote?: string;
  /** Null where the only sourced statement is a floor, carried in soilPhNote. */
  readonly soilPh: readonly [number, number] | null;
  readonly soilPhNote?: string;
  readonly fertilizerNote: string;
  /** Pounds of harvest per plant, low to high. Null where sources give another unit. */
  readonly yieldPerPlantLb: readonly [number, number] | null;
  /**
   * Some crops are only ever reported per length of row — asparagus is given
   * as pounds per 10-foot row, not per crown, and converting it to per-plant
   * would invent a figure the source does not give.
   */
  readonly yieldPer10FtRowLb?: readonly [number, number];
  /** Days from sowing to emergence, where a source gives it. */
  readonly germinationDays?: readonly [number, number];
  /** How deep to sow, inches. */
  readonly seedDepthInches?: number;
  /**
   * Spacing that differs by variety group, where one figure would mislead:
   * French marigolds at 8-10 inches and African at 12-16 are far enough apart
   * to matter.
   */
  readonly spacingByType?: readonly { readonly name: string; readonly inches: Inches }[];

  readonly companionPlants: readonly string[];
  readonly avoidPlanting: readonly string[];
  readonly commonProblems: readonly string[];

  /** The page the checked fields were confirmed against, null if none was found. */
  readonly source: CropSource | null;
  /** Further publications, where a figure needed more than one. */
  readonly extraSources?: readonly CropSource[];
  /** Which of CHECKED_FIELDS are confirmed against `source`. */
  readonly verifiedFields: readonly CheckedField[];
  /** True only when every applicable checked field is in `verifiedFields`. */
  readonly verified: boolean;
};

/**
 * Plants per square foot implied by the in-row spacing, which is arithmetic
 * rather than a recommendation: a plant every 6 inches is four to the square
 * foot whatever anyone publishes.
 *
 * It ignores row spacing, so it describes a bed planted on a square grid. A
 * crop grown in widely spaced rows occupies more ground than this suggests,
 * which is why the crop pages show the row spacing next to it.
 */
export function plantsPerSquareFoot(crop: Pick<Crop, 'spacingInches'>): number {
  const inches = spacingFor(crop.spacingInches);
  return Math.round((144 / (inches * inches)) * 100) / 100;
}

/**
 * What the days-to-maturity row says, for a crop that has the figure and for
 * one that does not.
 *
 * It lives here rather than inside the table because the wording for a missing
 * figure is a claim about the plant, and a claim needs a test. The table used
 * to build it inline as "a perennial, so it has no days-to-maturity from
 * planting" — true of asparagus and blueberry, false of marigold, which is an
 * annual whose days to flower nobody publishes. The fallback now says only
 * that no figure is published, which is true of any crop that reaches it, and
 * a crop with more to say says it in `noDaysToMaturityReason`.
 */
export function daysToMaturityLabel(crop: Crop): string {
  if (crop.daysToMaturity) {
    return `${crop.daysToMaturity[0]} to ${crop.daysToMaturity[1]} days`;
  }
  return crop.noDaysToMaturityReason ?? 'No days-to-maturity figure is published for this crop';
}

/**
 * Whether a crop's in-row spacing is confirmed against a publication.
 *
 * The tool tables and the spacing calculator state their figures flat, with no
 * estimate marker anywhere — the marker only exists on a crop page. So a crop
 * whose spacing is not confirmed is left out of them rather than listed as
 * though it were checked. It still gets its own page, where the marker and the
 * data-sources note say plainly that the figure is a typical published range.
 */
export function spacingConfirmed(crop: Crop): boolean {
  return crop.verifiedFields.includes('spacingInches');
}

/** Every publication behind a crop's figures, in citation order. */
export function cropSources(crop: Crop): readonly CropSource[] {
  return crop.source ? [crop.source, ...(crop.extraSources ?? [])] : [];
}

/**
 * Companion names that are not crops we have a page for.
 *
 * Every name in a companion list either resolves to a crop or is listed here.
 * The test in data/crops.test.ts enforces that, because the alternative is what
 * we had: a name that matched nothing produced a plain-text chip with no link
 * and no warning, and nobody could tell a deliberate omission from a typo.
 */
export const NON_CROP_COMPANIONS = [
  'Brassicas',
  'Chive',
  'Fennel',
  'Horseradish',
  'Hyssop',
  'Kohlrabi',
  'Leek',
  'Melon',
  'Nasturtium',
  'Parsnip',
  'Rue',
  'Sunflower',
] as const;

/**
 * Companion names that do refer to a crop we cover, under a different name.
 *
 * `bean` is named "Bush bean", `corn` is "Sweet corn" and `squash` is "Winter
 * squash", while nineteen crops list them as plain "Bean", "Corn" and "Squash".
 * Matching on the crop's name alone therefore failed for the three most-cited
 * companions on the site, silently, on about twenty live pages: the chip
 * rendered as text and the link never appeared.
 */
const COMPANION_ALIASES: Record<string, string> = {
  bean: 'bean',
  beans: 'bean',
  'pole bean': 'bean',
  'bush bean': 'bean',
  corn: 'corn',
  'sweet corn': 'corn',
  squash: 'squash',
  'winter squash': 'squash',
  'summer squash': 'zucchini',
};

/**
 * The crop a companion name refers to, or undefined where it is a plant we do
 * not cover. Never guesses: an unknown name comes back undefined so the caller
 * renders plain text rather than a broken link.
 */
export function resolveCompanion(name: string): Crop | undefined {
  const key = name.trim().toLowerCase();
  const aliased = COMPANION_ALIASES[key];
  if (aliased) return crops.find((crop) => crop.slug === aliased);
  return crops.find((crop) => crop.name.toLowerCase() === key);
}

/** Whether one checked field is confirmed, for the estimate markers on a page. */
export function isFieldVerified(crop: Crop, field: CheckedField): boolean {
  return crop.verifiedFields.includes(field);
}

export const crops: readonly Crop[] = [
  {
    slug: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    type: 'vegetable',
    family: 'Solanaceae',
    spacingInches: 24,
    rowSpacingInches: 36,
    sfgPlantsPerSquare: 0.5,
    sowIndoorsWeeksBeforeLastFrost: 6,
    transplantWeeksAfterLastFrost: 1,
    directSowWeeksRelativeToLastFrost: null,
    noDirectSowReason:
      'Not usually direct sown — it needs a head start indoors to ripen in a temperate season.',
    daysToMaturity: [60, 85],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 6.8],
    fertilizerNote:
      'Moderate nitrogen, steady phosphorus and potassium. Too much nitrogen gives leaves instead of fruit.',
    yieldPerPlantLb: [8, 15],
    companionPlants: ['Basil', 'Marigold', 'Onion', 'Parsley'],
    avoidPlanting: ['Potato', 'Corn', 'Fennel'],
    commonProblems: ['Blossom end rot', 'Early blight', 'Hornworms', 'Cracking after heavy rain'],
    source: {
      institution: 'Cornell Garden-Based Learning',
      url: 'https://gardening.cals.cornell.edu/garden-guidance/foodgarden/vegetable-growing-guides/tomato-growing-guide/',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'pepper',
    name: 'Pepper',
    scientificName: 'Capsicum annuum',
    type: 'vegetable',
    family: 'Solanaceae',
    spacingInches: 18,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: 1,
    soilOrAirTempNote:
      'Wait until night temperatures stay reliably above 50°F (10°C). A cold night checks a pepper for weeks.',
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: 2,
    directSowWeeksRelativeToLastFrost: null,
    noDirectSowReason:
      'Not usually direct sown — it germinates slowly and needs the indoor head start.',
    daysToMaturity: [60, 90],
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 6.8],
    fertilizerNote:
      'Go easy on nitrogen until the first fruit sets, then feed lightly every few weeks.',
    yieldPerPlantLb: [2, 5],
    companionPlants: ['Basil', 'Onion', 'Carrot', 'Spinach'],
    avoidPlanting: ['Fennel', 'Kohlrabi'],
    commonProblems: ['Blossom drop in heat', 'Sunscald', 'Aphids', 'Bacterial leaf spot'],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/vegetables/growing-peppers',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'cucumber',
    name: 'Cucumber',
    scientificName: 'Cucumis sativus',
    type: 'vegetable',
    family: 'Cucurbitaceae',
    spacingInches: 12,
    rowSpacingInches: 48,
    sfgPlantsPerSquare: 2,
    soilOrAirTempNote:
      'Wait for soil at about 70°F (21°C). Cucumber seed does nothing useful in cold ground.',
    sowIndoorsWeeksBeforeLastFrost: 3,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 1,
    daysToMaturity: [50, 70],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Hungry and thirsty. Work compost in before planting and side-dress once vines start running.',
    yieldPerPlantLb: [5, 10],
    companionPlants: ['Bean', 'Corn', 'Radish', 'Dill'],
    avoidPlanting: ['Potato', 'Sage'],
    commonProblems: ['Powdery mildew', 'Cucumber beetles', 'Bitter fruit from drought stress'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/cucumber',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'zucchini',
    name: 'Zucchini',
    scientificName: 'Cucurbita pepo',
    type: 'vegetable',
    family: 'Cucurbitaceae',
    spacingInches: 24,
    rowSpacingInches: 48,
    sfgPlantsPerSquare: 0.5,
    soilOrAirTempNote:
      'Wait for soil at about 70°F (21°C). Squash sown into cold ground germinates poorly and sulks afterwards.',
    sowIndoorsWeeksBeforeLastFrost: 3,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 2,
    daysToMaturity: [45, 60],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.0],
    fertilizerNote: 'Rich soil and consistent water. One or two plants feed a household.',
    yieldPerPlantLb: [6, 12],
    companionPlants: ['Nasturtium', 'Corn', 'Bean', 'Marigold'],
    avoidPlanting: ['Potato'],
    commonProblems: ['Squash vine borer', 'Powdery mildew', 'Poor pollination in wet weather'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/summer-squash',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'lettuce',
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    type: 'vegetable',
    family: 'Asteraceae',
    spacingInches: 8,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 4,
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: -3,
    directSowWeeksRelativeToLastFrost: -4,
    daysToMaturity: [45, 65],
    sunHours: 4,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote: 'Nitrogen for leaf growth. Light, frequent feeding beats one heavy dose.',
    yieldPerPlantLb: [0.5, 1],
    companionPlants: ['Carrot', 'Radish', 'Onion', 'Strawberry'],
    avoidPlanting: ['Broccoli'],
    commonProblems: ['Bolting in heat', 'Slugs', 'Aphids', 'Tip burn'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/lettuce',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'spinach',
    name: 'Spinach',
    scientificName: 'Spinacia oleracea',
    type: 'vegetable',
    family: 'Amaranthaceae',
    spacingInches: 4,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: 9,
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -5,
    noSowIndoorsReason:
      'Not usually started indoors — it goes in as soon as the ground can be worked, weeks before anything needs a windowsill.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [37, 50],
    sunHours: 4,
    waterInchesPerWeek: 1,
    soilPh: [6.5, 7.5],
    fertilizerNote: 'Wants nitrogen and a near-neutral pH. Sulks in acid soil.',
    yieldPerPlantLb: [0.3, 0.6],
    companionPlants: ['Strawberry', 'Radish', 'Pea', 'Cabbage'],
    avoidPlanting: [],
    commonProblems: ['Bolting once days lengthen', 'Leaf miners', 'Downy mildew'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/spinach',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'kale',
    name: 'Kale',
    scientificName: 'Brassica oleracea var. sabellica',
    type: 'vegetable',
    family: 'Brassicaceae',
    spacingInches: 12,
    rowSpacingInches: 24,
    sfgPlantsPerSquare: null,
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: -3,
    directSowWeeksRelativeToLastFrost: -3,
    daysToMaturity: [50, 65],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.5],
    fertilizerNote: 'Steady nitrogen through the season keeps new leaves coming.',
    yieldPerPlantLb: [1, 2],
    companionPlants: ['Onion', 'Beet', 'Nasturtium', 'Dill'],
    avoidPlanting: ['Tomato', 'Strawberry'],
    commonProblems: ['Cabbage worms', 'Aphids', 'Flea beetles', 'Clubroot in acid soil'],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-collards-and-kale',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'carrot',
    name: 'Carrot',
    scientificName: 'Daucus carota subsp. sativus',
    type: 'vegetable',
    family: 'Apiaceae',
    spacingInches: 3,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 9,
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -2,
    noSowIndoorsReason:
      'Not started indoors — moving a seedling forks the taproot, and the taproot is the crop.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [60, 80],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 6.8],
    fertilizerNote:
      'Avoid fresh manure and heavy nitrogen — both cause forked and hairy roots. Phosphorus and potassium matter more.',
    yieldPerPlantLb: [0.2, 0.35],
    companionPlants: ['Onion', 'Leek', 'Lettuce', 'Rosemary'],
    avoidPlanting: ['Dill', 'Parsnip'],
    commonProblems: [
      'Forked roots in stony soil',
      'Carrot rust fly',
      'Green shoulders',
      'Slow, patchy germination',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/carrots',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'radish',
    name: 'Radish',
    scientificName: 'Raphanus sativus',
    type: 'vegetable',
    family: 'Brassicaceae',
    spacingInches: 2,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 16,
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -4,
    noSowIndoorsReason:
      'Not started indoors — it is ready in about four weeks, so a transplant only sets it back.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [22, 30],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote: 'Needs almost nothing in decent soil. Excess nitrogen gives tops, not roots.',
    yieldPerPlantLb: [0.03, 0.06],
    companionPlants: ['Carrot', 'Lettuce', 'Cucumber', 'Spinach'],
    avoidPlanting: ['Hyssop'],
    commonProblems: [
      'Woody roots if left too long',
      'Flea beetles',
      'Splitting after uneven watering',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/radish',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'beet',
    name: 'Beet',
    scientificName: 'Beta vulgaris',
    type: 'vegetable',
    family: 'Amaranthaceae',
    spacingInches: 4,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 9,
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -3,
    noSowIndoorsReason: 'Not usually started indoors — the root resents being moved.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [50, 65],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.5],
    fertilizerNote:
      'Wants boron and potassium; dislikes acid soil. Thin early or roots stay small.',
    yieldPerPlantLb: [0.2, 0.4],
    companionPlants: ['Onion', 'Kale', 'Lettuce', 'Bush bean'],
    avoidPlanting: ['Pole bean'],
    commonProblems: ['Small roots from crowding', 'Leaf miners', 'Scab', 'Cercospora leaf spot'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/beet',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'onion',
    name: 'Onion',
    scientificName: 'Allium cepa',
    type: 'vegetable',
    family: 'Amaryllidaceae',
    spacingInches: 4,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 9,
    sowIndoorsWeeksBeforeLastFrost: 12,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksRelativeToLastFrost: -2,
    daysToMaturity: [90, 120],
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Feed nitrogen early for leaf growth, then stop once bulbs start swelling. Day length decides bulbing, so pick a variety for your latitude.',
    yieldPerPlantLb: [0.3, 0.7],
    companionPlants: ['Carrot', 'Beet', 'Lettuce', 'Tomato'],
    avoidPlanting: ['Pea', 'Bean', 'Asparagus'],
    commonProblems: ['Thrips', 'Onion maggot', 'Downy mildew', 'Splitting bulbs'],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-onions',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'garlic',
    name: 'Garlic',
    scientificName: 'Allium sativum',
    type: 'vegetable',
    family: 'Amaryllidaceae',
    spacingInches: 4,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 9,
    plantingSeason: 'fall',
    notes: [
      'Planted 1 to 2 weeks after the first killing frost in autumn, which is why the spring frost-date fields are empty. It overwinters in the ground and is lifted the following summer.',
      'UMN describes double rows 6 inches apart centered on beds 30 inches apart; the 30-inch bed spacing is the row figure used here.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    timingNote:
      'Garlic is planted in autumn, a few weeks before the ground freezes, and harvested the following summer — so no last-frost offset describes it. Work back from your first fall frost date instead.',
    noSowIndoorsReason: 'Not sown at all — cloves go straight into the ground in autumn.',
    noTransplantReason: 'Not transplanted — cloves are planted where they will grow.',
    noDirectSowReason:
      'Planted in autumn — cloves go in a few weeks before the ground freezes, so no last-frost offset applies.',
    daysToMaturity: [240, 270],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Nitrogen in early spring as leaves grow, then stop by the time scapes appear. Mulch heavily over winter.',
    yieldPerPlantLb: [0.15, 0.25],
    companionPlants: ['Tomato', 'Beet', 'Carrot', 'Strawberry'],
    avoidPlanting: ['Pea', 'Bean'],
    commonProblems: [
      'Small bulbs from late planting',
      'White rot',
      'Rust',
      'Splitting from over-mature harvest',
    ],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-garlic',
    },
    verifiedFields: ['spacingInches', 'sfgPlantsPerSquare', 'rowSpacingInches'],
    verified: true,
  },
  {
    slug: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    type: 'vegetable',
    family: 'Solanaceae',
    spacingInches: 12,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: 1,
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -2,
    timingNote: 'Grown from seed potatoes, not seed — plant pieces once soil is workable.',
    noSowIndoorsReason:
      'Not started indoors — seed potatoes are chitted in a cool, bright place instead.',
    noTransplantReason: 'Not transplanted — seed potatoes go straight into the ground.',
    daysToMaturity: [70, 120],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [5.0, 6.5],
    fertilizerNote:
      'Prefers slightly acid soil: liming to neutral encourages scab. Moderate nitrogen, generous potassium.',
    yieldPerPlantLb: [2, 5],
    companionPlants: ['Bean', 'Corn', 'Horseradish', 'Marigold'],
    avoidPlanting: ['Tomato', 'Cucumber', 'Squash', 'Sunflower'],
    commonProblems: [
      'Scab',
      'Colorado potato beetle',
      'Late blight',
      'Green tubers from shallow planting',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/potato',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'sweet-potato',
    name: 'Sweet potato',
    scientificName: 'Ipomoea batatas',
    type: 'vegetable',
    family: 'Convolvulaceae',
    spacingInches: 12,
    rowSpacingInches: 36,
    sfgPlantsPerSquare: 1,
    soilOrAirTempNote:
      'Set slips out only once the soil is thoroughly warm, not merely frost-free.',
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: 3,
    directSowWeeksRelativeToLastFrost: null,
    timingNote: 'Planted as rooted slips once soil is thoroughly warm, not from seed.',
    noSowIndoorsReason: 'Not sown from seed — it is grown from rooted slips.',
    noDirectSowReason:
      'Not sown from seed — set out rooted slips about three weeks after your last frost.',
    daysToMaturity: [90, 120],
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [5.5, 6.5],
    fertilizerNote:
      'Low nitrogen, higher potassium. Rich nitrogen grows vines and thin roots. Loose soil matters more than feeding.',
    yieldPerPlantLb: [2, 4],
    companionPlants: ['Bush bean', 'Dill', 'Thyme'],
    avoidPlanting: ['Squash'],
    commonProblems: ['Cold soil stalling growth', 'Wireworms', 'Cracked roots from uneven water'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/sweet-potato',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'bean',
    name: 'Bush bean',
    scientificName: 'Phaseolus vulgaris',
    type: 'vegetable',
    family: 'Fabaceae',
    spacingInches: 4,
    rowSpacingInches: 24,
    sfgPlantsPerSquare: 4,
    notes: [
      'Pole beans are a different plant to space: roughly 4 to 6 in apart in rows 30 to 36 in, climbing a support. The figures here are for bush beans.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: 1,
    noSowIndoorsReason: 'Not started indoors — beans grow fast and dislike root disturbance.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [50, 65],
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Fixes its own nitrogen — skip nitrogen fertilizer, which gives foliage and few pods. Phosphorus and potassium only.',
    yieldPerPlantLb: [0.25, 0.5],
    companionPlants: ['Corn', 'Cucumber', 'Squash', 'Marigold'],
    avoidPlanting: ['Onion', 'Garlic', 'Fennel'],
    commonProblems: ['Rotting seed in cold soil', 'Mexican bean beetle', 'Rust', 'Anthracnose'],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/snap-beans',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'pea',
    name: 'Pea',
    scientificName: 'Pisum sativum',
    type: 'vegetable',
    family: 'Fabaceae',
    spacingInches: 3,
    rowSpacingInches: 24,
    sfgPlantsPerSquare: 9,
    soilOrAirTempNote:
      'Wait for soil at 45°F (7°C) or warmer. Peas will sit unsprouted in colder ground and rot.',
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -4,
    noSowIndoorsReason:
      'Not usually started indoors — peas prefer cold soil and germinate readily in it.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [55, 70],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.5],
    fertilizerNote: 'Another nitrogen fixer. Give phosphorus and potassium, and a trellis.',
    yieldPerPlantLb: [0.2, 0.4],
    companionPlants: ['Carrot', 'Radish', 'Cucumber', 'Spinach'],
    avoidPlanting: ['Onion', 'Garlic'],
    commonProblems: [
      'Powdery mildew late in the season',
      'Stops setting in heat',
      'Pea moth',
      'Root rot in wet soil',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/peas',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'corn',
    name: 'Sweet corn',
    scientificName: 'Zea mays',
    type: 'vegetable',
    family: 'Poaceae',
    spacingInches: 10,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: null,
    soilOrAirTempNote:
      'Wait for soil at about 60°F (16°C), or 65°F (18°C) for supersweet varieties, which rot more readily when cold.',
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: 1,
    noSowIndoorsReason:
      'Not started indoors — corn resents root disturbance and catches up quickly outdoors.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    daysToMaturity: [60, 95],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [5.8, 7.0],
    fertilizerNote: 'A heavy nitrogen feeder. Side-dress when knee high and again at tasselling.',
    yieldPerPlantLb: [0.4, 0.8],
    companionPlants: ['Bean', 'Squash', 'Cucumber', 'Sunflower'],
    avoidPlanting: ['Tomato'],
    commonProblems: [
      'Poor pollination in single rows — plant a block',
      'Corn earworm',
      'Raccoons',
      'Smut',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/corn',
    },
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'directSowWeeksRelativeToLastFrost', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'squash',
    name: 'Winter squash',
    scientificName: 'Cucurbita maxima',
    type: 'vegetable',
    family: 'Cucurbitaceae',
    spacingInches: 36,
    rowSpacingInches: 60,
    sfgPlantsPerSquare: null,
    soilOrAirTempNote:
      'Wait for soil at about 70°F (21°C). Squash sown into cold ground germinates poorly and sulks afterwards.',
    sowIndoorsWeeksBeforeLastFrost: 3,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 2,
    daysToMaturity: [85, 110],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.0],
    fertilizerNote: 'Rich soil, plenty of compost, and room. Feed at planting and when vines run.',
    yieldPerPlantLb: [10, 20],
    companionPlants: ['Corn', 'Bean', 'Nasturtium', 'Marigold'],
    avoidPlanting: ['Potato'],
    commonProblems: [
      'Squash vine borer',
      'Powdery mildew',
      'Squash bugs',
      'Immature fruit at frost',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/winter-squash',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'pumpkin',
    name: 'Pumpkin',
    scientificName: 'Cucurbita pepo',
    type: 'vegetable',
    family: 'Cucurbitaceae',
    spacingInches: 48,
    rowSpacingInches: 72,
    sfgPlantsPerSquare: null,
    sowIndoorsWeeksBeforeLastFrost: 3,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 3,
    daysToMaturity: [90, 120],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Nitrogen early, then switch to phosphorus and potassium once flowers appear, or you get vine and no fruit.',
    yieldPerPlantLb: [10, 25],
    companionPlants: ['Corn', 'Bean', 'Nasturtium'],
    avoidPlanting: ['Potato'],
    commonProblems: [
      'Needs a long season',
      'Squash vine borer',
      'Powdery mildew',
      'Rot where fruit sits on wet soil',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/pumpkin',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'broccoli',
    name: 'Broccoli',
    scientificName: 'Brassica oleracea var. italica',
    type: 'vegetable',
    family: 'Brassicaceae',
    spacingInches: 18,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: 1,
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksRelativeToLastFrost: null,
    noDirectSowReason:
      'Not usually direct sown — transplants get ahead of spring weeds and of the heat that ruins heads.',
    daysToMaturity: [55, 80],
    sunHours: 6,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.5],
    fertilizerNote:
      'Steady nitrogen and even moisture. Stress gives small, loose heads that flower early.',
    yieldPerPlantLb: [0.75, 1.5],
    companionPlants: ['Onion', 'Beet', 'Dill', 'Nasturtium'],
    avoidPlanting: ['Tomato', 'Strawberry', 'Lettuce'],
    commonProblems: [
      'Buttoning from heat or stress',
      'Cabbage worms',
      'Aphids',
      'Clubroot in acid soil',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/broccoli',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'cabbage',
    name: 'Cabbage',
    scientificName: 'Brassica oleracea var. capitata',
    type: 'vegetable',
    family: 'Brassicaceae',
    spacingInches: 15,
    rowSpacingInches: 24,
    sfgPlantsPerSquare: 1,
    sowIndoorsWeeksBeforeLastFrost: 9,
    transplantWeeksAfterLastFrost: -3,
    directSowWeeksRelativeToLastFrost: null,
    noDirectSowReason:
      'Not usually direct sown — transplants get ahead of spring weeds and of the heat that splits heads.',
    daysToMaturity: [60, 90],
    sunHours: 6,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.5],
    fertilizerNote: 'Nitrogen for leaf growth, consistent water to stop heads splitting.',
    yieldPerPlantLb: [2, 4],
    companionPlants: ['Onion', 'Dill', 'Beet', 'Nasturtium'],
    avoidPlanting: ['Tomato', 'Strawberry'],
    commonProblems: ['Split heads after heavy rain', 'Cabbage worms', 'Root maggots', 'Clubroot'],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-cabbage',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'cauliflower',
    name: 'Cauliflower',
    scientificName: 'Brassica oleracea var. botrytis',
    type: 'vegetable',
    family: 'Brassicaceae',
    spacingInches: 18,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: 1,
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksRelativeToLastFrost: null,
    noDirectSowReason:
      'Not usually direct sown — it needs an unbroken start that a seedbed rarely provides.',
    daysToMaturity: [55, 80],
    sunHours: 6,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.5],
    fertilizerNote:
      'The fussiest brassica: it wants rich soil, unbroken moisture and cool weather, or the curd never forms properly.',
    yieldPerPlantLb: [1, 2],
    companionPlants: ['Onion', 'Beet', 'Dill'],
    avoidPlanting: ['Tomato', 'Strawberry'],
    commonProblems: [
      'Ricey or loose curds',
      'Yellowing from sun without blanching',
      'Cabbage worms',
      'Boron deficiency',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/cauliflower',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'eggplant',
    name: 'Eggplant',
    scientificName: 'Solanum melongena',
    type: 'vegetable',
    family: 'Solanaceae',
    spacingInches: 18,
    rowSpacingInches: 30,
    sfgPlantsPerSquare: 0.5,
    soilOrAirTempNote:
      'Wait until night temperatures stay reliably above 50°F (10°C). Eggplant is even less tolerant of cold nights than pepper.',
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: 2,
    directSowWeeksRelativeToLastFrost: null,
    noDirectSowReason:
      'Not usually direct sown — it wants a long warm run that an outdoor sowing rarely gives it.',
    daysToMaturity: [65, 85],
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote: 'Wants warmth above all. Moderate, regular feeding once fruit sets.',
    yieldPerPlantLb: [3, 6],
    companionPlants: ['Bean', 'Marigold', 'Thyme', 'Pepper'],
    avoidPlanting: ['Fennel'],
    commonProblems: [
      'Flea beetles on young plants',
      'Verticillium wilt',
      'Slow start in cold soil',
      'Spider mites',
    ],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-eggplant',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'okra',
    name: 'Okra',
    scientificName: 'Abelmoschus esculentus',
    type: 'vegetable',
    family: 'Malvaceae',
    spacingInches: 12,
    rowSpacingInches: 24,
    sfgPlantsPerSquare: null,
    sowIndoorsWeeksBeforeLastFrost: 1,
    transplantWeeksAfterLastFrost: 2,
    directSowWeeksRelativeToLastFrost: 2,
    daysToMaturity: [50, 65],
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Tolerates heat and poorer soil than most. Moderate nitrogen, steady potassium.',
    yieldPerPlantLb: [1, 2],
    companionPlants: ['Pepper', 'Basil', 'Melon', 'Bush bean'],
    avoidPlanting: [],
    commonProblems: [
      'Tough woody pods if picked late',
      'Aphids',
      'Root-knot nematodes',
      'Poor germination in cold soil',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/okra',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'basil',
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    type: 'herb',
    family: 'Lamiaceae',
    spacingInches: 10,
    rowSpacingInches: 18,
    sfgPlantsPerSquare: null,
    sowIndoorsWeeksBeforeLastFrost: 6,
    transplantWeeksAfterLastFrost: 1,
    directSowWeeksRelativeToLastFrost: 1,
    daysToMaturity: [30, 60],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Light feeding only. Heavy nitrogen grows big leaves with less flavour. Pinch flowers to keep it producing.',
    yieldPerPlantLb: [0.25, 0.75],
    companionPlants: ['Tomato', 'Pepper', 'Oregano'],
    avoidPlanting: ['Rue'],
    commonProblems: [
      'Cold damage below 50°F',
      'Downy mildew',
      'Bolting if not pinched',
      'Fusarium wilt',
    ],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/yard-and-garden-problems/growing-basil',
    },
    verifiedFields: [
      'spacingInches',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost', 'sfgPlantsPerSquare'],
    verified: false,
  },
  {
    slug: 'cilantro',
    name: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    type: 'herb',
    family: 'Apiaceae',
    // UW-Madison gives 6 inches and UGA 4, so the range spans both. Rows stay:
    // UW-Madison's crop page does give one, unlike either herb publication.
    spacingInches: [4, 6],
    rowSpacingInches: 12,
    sfgPlantsPerSquare: null,
    notes: [
      'Cilantro does not transplant well — it bolts when its root is disturbed — so direct sowing is the method. Sow a short row every two or three weeks rather than one big patch.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -2,
    noSowIndoorsReason: 'Not started indoors — it bolts almost immediately after being moved.',
    noTransplantReason: 'Not transplanted — sow where it will grow, and sow again every few weeks.',
    // Deleted rather than estimated. Cilantro's useful answer is not a count of
    // days but how long the leaf harvest lasts before heat sends it to seed,
    // which no publication behind this page puts a number on.
    daysToMaturity: null,
    noDaysToMaturityReason:
      'Bolting ends the harvest, not maturity — how long the leaf lasts depends on heat, so no day count describes it.',
    // Lower than the other herbs on purpose: cilantro is the one that does
    // better with some afternoon shade, which slows bolting.
    sunHours: 4,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for cilantro. Keep the seedbed damp until it is up; after that a dry check is what sends it to seed early.',
    soilPh: null,
    soilPhNote:
      'No range is published for cilantro itself. UGA gives about 6 to 7.5 for herbs generally and Minnesota 6.0 to 7.5, which agree.',
    fertilizerNote:
      'Almost none. Resents transplanting, so sow where it will grow and sow again every few weeks.',
    yieldPerPlantLb: null,
    companionPlants: ['Tomato', 'Spinach', 'Pepper'],
    avoidPlanting: ['Fennel'],
    commonProblems: [
      'Bolts quickly in heat',
      'Poor transplanting',
      'Aphids',
      'Damping off in wet soil',
    ],
    source: {
      institution: 'University of Wisconsin-Madison Extension',
      url: 'https://hort.extension.wisc.edu/articles/cilantro-coriander-coriandrum-sativum/',
    },
    extraSources: [
      {
        institution: 'University of Georgia Extension',
        title: 'Bulletin 1170, Herbs in Southern Gardens',
        url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
      },
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'parsley',
    name: 'Parsley',
    scientificName: 'Petroselinum crispum',
    type: 'herb',
    family: 'Apiaceae',
    // Minnesota gives 10 inches, UGA 6 to 8. The range spans both rather than
    // averaging them or choosing one.
    spacingInches: [6, 10],
    // Deleted, not estimated. The 12 inches here was attributed to Minnesota but
    // never confirmed, and neither herb publication gives one: UGA's herb table
    // publishes no row spacing for any herb, and Minnesota's "Growing herbs in
    // home gardens" gives no per-herb figures at all, only the general
    // instruction to space by mature size. A confirmed absence, like the other
    // three herbs.
    rowSpacingInches: null,
    sfgPlantsPerSquare: null,
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 0,
    // The slowest germination of any herb on the site, and the reason most
    // people think the seed failed. Unconfirmed against a publication.
    germinationDays: [14, 28],
    daysToMaturity: null,
    noDaysToMaturityReason:
      'Picked continuously, not harvested once — and a biennial, so its second year goes to seed rather than to leaf.',
    sunHours: 5,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for parsley in the source behind this page. The surface must stay damp for the weeks germination takes; a settled plant is far less fussy.',
    soilPh: null,
    soilPhNote:
      'No range is published for parsley itself. UGA gives about 6 to 7.5 for herbs generally and Minnesota 6.0 to 7.5, which agree.',
    fertilizerNote:
      'Light nitrogen through the season. Slow to germinate — be patient, keep moist.',
    yieldPerPlantLb: null,
    companionPlants: ['Tomato', 'Carrot', 'Chive', 'Corn'],
    avoidPlanting: ['Lettuce'],
    commonProblems: [
      'Very slow germination',
      'Carrot rust fly',
      'Bolts in its second year',
      'Leaf spot',
    ],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-parsley',
    },
    extraSources: [
      {
        institution: 'University of Georgia Extension',
        title: 'Bulletin 1170, Herbs in Southern Gardens',
        url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
      },
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'dill',
    name: 'Dill',
    scientificName: 'Anethum graveolens',
    type: 'herb',
    family: 'Apiaceae',
    // A real disagreement, shown rather than resolved: Minnesota gives 10
    // inches and UGA 12 to 18. The range spans both publications.
    spacingInches: [10, 18],
    // Minnesota gives a row figure; UGA's herb table gives none for any herb.
    rowSpacingInches: 24,
    sfgPlantsPerSquare: null,
    notes: [
      'Dill does not transplant well — it has a taproot that resents being moved — so direct sowing is the method.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: 0,
    noSowIndoorsReason: 'Not started indoors — the taproot resents being moved.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    germinationDays: [7, 21],
    // Deleted rather than estimated, and a single pair was the wrong shape
    // anyway: leaf, flower head and seed ripen on three different timelines.
    daysToMaturity: null,
    noDaysToMaturityReason:
      'Three harvests, not one — leaf, flower head and seed ripen weeks apart, so no single figure describes maturity.',
    sunHours: 6,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for dill in the source behind this page. Keep the seedbed damp until it is up, then water in dry spells — a check makes it bolt.',
    soilPh: null,
    // UGA gives a range for herbs as a group rather than for dill, so it is
    // reported as what it is rather than promoted to a per-crop figure.
    soilPhNote:
      'No range is published for dill itself. UGA gives about 6 to 7.5 for herbs generally and Minnesota 6.0 to 7.5, which agree.',
    fertilizerNote: 'Poor soil suits it. Direct sow — the taproot hates being moved.',
    yieldPerPlantLb: null,
    companionPlants: ['Cabbage', 'Cucumber', 'Onion', 'Lettuce'],
    avoidPlanting: ['Carrot', 'Tomato'],
    commonProblems: [
      'Flops without support',
      'Self-seeds everywhere',
      'Aphids',
      'Bolts fast in heat',
    ],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-dill',
    },
    extraSources: [
      {
        institution: 'University of Georgia Extension',
        title: 'Bulletin 1170, Herbs in Southern Gardens',
        url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
      },
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'strawberry',
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    type: 'fruit',
    family: 'Rosaceae',
    spacingInches: 15,
    rowSpacingInches: 36,
    sfgPlantsPerSquare: null,
    notes: [
      'Dormant bare-root plants and potted plants have different planting dates: bare-root goes in early, while the ground is still cold, and potted plants go in once growth has started.',
      'June-bearing and day-neutral strawberries are grown as different systems. June-bearers are set in matted rows and allowed to fill in with runners; day-neutrals are grown in hills with runners removed.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksRelativeToLastFrost: null,
    timingNote:
      'Planted as bare-root crowns or runners, not seed. June-bearing varieties are usually not allowed to fruit in their first year, so the first real harvest is the season after planting.',
    noSowIndoorsReason: 'Not usually grown from seed — plant bare-root crowns or runners instead.',
    noDirectSowReason:
      'Not sown from seed — set bare-root crowns out about two weeks before your last frost.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A perennial — the first full crop comes the season after planting, not a set number of days from it.',
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [5.5, 6.5],
    fertilizerNote:
      'Slightly acid soil and light feeding after harvest, not before. Renovate the bed each year and replace plants every three or four.',
    yieldPerPlantLb: [0.5, 1],
    companionPlants: ['Spinach', 'Lettuce', 'Onion', 'Thyme'],
    avoidPlanting: ['Cabbage', 'Broccoli', 'Tomato'],
    commonProblems: ['Grey mould on fruit', 'Slugs', 'Birds', 'Declining yield from old plants'],
    source: {
      institution: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-strawberries-in-the-home-garden',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'transplantWeeksAfterLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'watermelon',
    name: 'Watermelon',
    scientificName: 'Citrullus lanatus',
    type: 'fruit',
    family: 'Cucurbitaceae',
    spacingInches: 36,
    rowSpacingInches: 84,
    sfgPlantsPerSquare: null,
    soilOrAirTempNote:
      'Wait for soil above 65°F (18°C). Watermelon is the least forgiving of a cold start.',
    sowIndoorsWeeksBeforeLastFrost: 3,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 2,
    daysToMaturity: [70, 100],
    sunHours: 8,
    waterInchesPerWeek: 1.5,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Nitrogen while vines grow, then phosphorus and potassium once fruit sets. Ease off water as melons ripen for better flavour.',
    yieldPerPlantLb: [10, 30],
    companionPlants: ['Corn', 'Nasturtium', 'Radish', 'Marigold'],
    avoidPlanting: ['Potato'],
    commonProblems: [
      'Needs a long, hot season',
      'Cucumber beetles',
      'Anthracnose',
      'Hard to judge ripeness',
    ],
    source: {
      institution: 'University of Illinois Extension',
      url: 'https://extension.illinois.edu/gardening/watermelon',
    },
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost', 'sfgPlantsPerSquare'],
    verified: true,
  },
  // ---------------------------------------------------------------------
  // Added September 2026 for the Batch 2 crop pages. None of these four is
  // in the verification report, so every checked field is unverified and the
  // pages carry the estimate marker on them. The figures are typical
  // published ranges, expressed as a midpoint where the type requires a
  // single number; docs/data-to-verify.md lists them for sourcing.
  // ---------------------------------------------------------------------
  {
    slug: 'asparagus',
    name: 'Asparagus',
    scientificName: 'Asparagus officinalis',
    type: 'vegetable',
    family: 'Asparagaceae',
    // Minnesota spaces crowns at 12 inches in furrows 3 feet apart; Maryland
    // at 18 inches in rows 4 to 5 feet apart. Both are real recommendations
    // for their own conditions, so the range is stored and the page names
    // both rather than averaging to a figure neither gives.
    spacingInches: [12, 18],
    rowSpacingInches: [36, 60],
    // Confirmed absent from the Cornell CALS square foot gardening page, which
    // is itself the claim this field records.
    sfgPlantsPerSquare: null,
    notes: [
      'A perennial. Minnesota puts the first harvest two years after planting crowns, or three years from seed, and Maryland advises only a light cut in years two and three.',
      'Grown from one-year-old crowns rather than seed in almost every home garden. Seed adds a year.',
      'Maryland also describes a wide bed of three rows with plants 18 inches apart in every direction, which suits a raised bed better than a single furrow.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    timingNote:
      'Crowns go in during spring as soon as the soil is workable. Neither source expresses this as a frost offset — Minnesota gives a local window of early May to early June — so no week count is quoted here.',
    noSowIndoorsReason: 'Not usually grown from seed — plant one-year-old crowns instead.',
    noTransplantReason:
      'Not transplanted on a frost schedule — crowns go into a trench in spring, once the ground can be worked.',
    noDirectSowReason: 'Not direct sown — crowns are planted in a trench, not seed in a drill.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A perennial — the first harvest is two years after planting crowns, not a count of days from it.',
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [6.5, 7],
    fertilizerNote:
      'Feed after the harvest window closes rather than during it, so the ferns can build reserves for next year.',
    yieldPerPlantLb: null,
    yieldPer10FtRowLb: [3, 4],
    companionPlants: ['Tomato', 'Basil', 'Parsley'],
    avoidPlanting: ['Onion', 'Garlic', 'Potato'],
    commonProblems: [
      'Harvesting too early in the bed\u2019s life',
      'Asparagus beetle',
      'Weeds in a permanent bed',
      'Spears thinning late in the season',
    ],
    source: {
      institution: 'University of Minnesota Extension',
      title: 'Growing asparagus in home gardens',
      url: 'https://extension.umn.edu/vegetables/growing-asparagus',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
      {
        institution: 'University of Maryland Extension',
        title: 'Growing Asparagus in a Home Garden',
        url: 'https://extension.umd.edu/resource/asparagus/',
      },
    ],
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'blueberry',
    name: 'Blueberry',
    scientificName: 'Vaccinium corymbosum',
    type: 'fruit',
    family: 'Ericaceae',
    // Maryland gives 4 to 5 feet in the row and 6 to 8 feet between rows, New
    // Hampshire at least 5 feet in rows 8 to 10 feet apart, Minnesota about 3
    // feet. 60 and 96 inches sit inside that spread.
    spacingInches: 60,
    rowSpacingInches: 96,
    // Confirmed absent from the Cornell CALS square foot gardening page.
    sfgPlantsPerSquare: null,
    notes: [
      'Soil pH decides everything. Maryland gives 4.5 to 5.5, New Hampshire a tighter 4.5 to 5.0 and Minnesota a wider 4.0 to 5.5 — the disagreement is real and the safe target is the band they share.',
      'Most varieties crop far better with a second variety nearby for cross-pollination.',
      'Maryland advises making pH adjustments about six months before planting — the single most consequential piece of timing on this crop.',
      'Minnesota puts large harvests two or three years after planting, with a bush reaching full size at eight to ten years.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    // Deleted rather than estimated. Maryland gives no planting-time guidance
    // at all, and Minnesota's late April to early May is a local calendar, not
    // a frost offset — turning it into one would invent precision.
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    noTransplantReason:
      'Planted in spring, not on a frost offset — bare-root stock ships at the right time to go straight in.',
    timingNote:
      'Plant in spring. Bare-root plants arrive at the appropriate time for planting, and a bush takes two to three years to crop properly. Any pH correction wants doing about six months before planting, so the ground is ready when the bush goes in.',
    noSowIndoorsReason: 'Not grown from seed in a home garden — buy a two- or three-year-old bush.',
    noDirectSowReason: 'Not sown from seed — a bush from a nursery fruits years sooner.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A perennial — a bush takes two to three years to crop properly, not a count of days from planting.',
    sunHours: 8,
    // None of the three publications gives a weekly figure. They say to water
    // consistently from blossom through harvest, which is what the page says.
    waterInchesPerWeek: null,
    waterNote:
      'Water consistently from blossom through harvest. None of the sourced publications gives a weekly figure.',
    soilPh: [4.5, 5.5],
    fertilizerNote:
      'Use an acidifying fertilizer formulated for ericaceous plants. Never lime a blueberry, and avoid nitrate-based feeds, which they tolerate poorly.',
    yieldPerPlantLb: [6, 8],
    companionPlants: ['Strawberry', 'Thyme'],
    avoidPlanting: ['Brassicas'],
    commonProblems: [
      'Yellow leaves with green veins from high pH',
      'Birds taking the crop',
      'Drying out in a container',
      'No fruit without a pollination partner',
    ],
    source: {
      institution: 'University of Maryland Extension',
      title: 'Growing Blueberries in a Home Garden',
      url: 'https://extension.umd.edu/resource/blueberries/',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
      {
        institution: 'University of New Hampshire Extension',
        title: 'Growing Fruit: Highbush Blueberries',
        url: 'https://extension.unh.edu/resource/growing-fruit-highbush-blueberries-fact-sheet',
      },
      {
        institution: 'University of Minnesota Extension',
        title: 'Growing blueberries in the home garden',
        url: 'https://extension.umn.edu/fruit/growing-blueberries-home-garden',
      },
    ],
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'marigold',
    name: 'Marigold',
    scientificName: 'Tagetes spp.',
    type: 'herb',
    family: 'Asteraceae',
    // Clemson spaces French marigolds at 8 to 10 inches and African at 12 to
    // 16 — far enough apart that one figure would mislead either way, so both
    // are carried and spacingInches spans them.
    spacingInches: [8, 16],
    // The factsheet spaces plants without distinguishing rows, so there is no
    // row figure to quote. An invented one would be worse than none.
    rowSpacingInches: null,
    // Confirmed absent from the Cornell CALS square foot gardening page, which
    // is itself the claim this field records.
    sfgPlantsPerSquare: null,
    spacingByType: [
      { name: 'French marigolds', inches: [8, 10] },
      { name: 'African marigolds', inches: [12, 16] },
    ],
    notes: [
      'An annual in every climate, despite being widely searched for as a perennial. It self-seeds freely, which is what makes people think it came back.',
      'Clemson notes bronze spotting on the leaves where soil pH falls below 5.5.',
      'Clemson starts seed indoors four to six weeks before the intended planting date, and eight weeks for African types.',
    ],
    sowIndoorsWeeksBeforeLastFrost: 6,
    // Clemson puts the ideal planting time after the last frost in spring, and
    // direct sowing once the soil has warmed and the danger of frost has
    // passed. Zero is the right encoding of both, and the reasons below carry
    // the wording, because "after the last frost" tells a reader something a
    // zero does not.
    transplantWeeksAfterLastFrost: 0,
    transplantNote:
      'Plant out after the last frost in spring — Clemson gives the condition rather than a week count.',
    directSowWeeksRelativeToLastFrost: 0,
    directSowNote: 'Sow direct once the soil has warmed and the danger of frost has passed.',
    germinationDays: [5, 7],
    seedDepthInches: 0.25,
    soilPh: [5.5, 7],
    // An annual with no published figure, which is not the same thing as a
    // perennial having none. Marigolds flower in a season; no extension source
    // found puts a number of days on it, so none is shown.
    daysToMaturity: null,
    noDaysToMaturityReason:
      'No days-to-flower figure is published — no extension source gives a count of days from sowing to bloom.',
    sunHours: 6,
    // Deleted rather than estimated. The 1 inch here was a default carried in
    // with the entry, not a figure from HGIC 1168, which gives no watering
    // quantity.
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for marigolds. Water enough to keep them growing and let the surface dry between waterings.',
    fertilizerNote:
      'Poor soil suits them. Rich or heavily fed ground gives large leafy plants and few flowers.',
    yieldPerPlantLb: null,
    companionPlants: ['Tomato', 'Pepper', 'Bush bean', 'Cucumber', 'Squash'],
    avoidPlanting: [],
    commonProblems: [
      'Few flowers on rich soil',
      'Bronze spotting on leaves below pH 5.5',
      'Spider mites in hot, dry spells',
      'Damping off if sown too wet',
    ],
    source: {
      institution: 'Clemson Cooperative Extension',
      title: 'HGIC 1168, How to Grow and Care for Marigolds in South Carolina',
      url: 'https://hgic.clemson.edu/factsheet/marigold/',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'swiss-chard',
    name: 'Swiss chard',
    scientificName: 'Beta vulgaris subsp. vulgaris',
    type: 'vegetable',
    family: 'Amaranthaceae',
    // Utah gives 6 inches in the row, Minnesota four to six, Maryland a
    // thinning progression from 2 to 4 inches and then 8 to 12 for larger
    // plants. The range spans the thinning rather than picking a point on it.
    spacingInches: [4, 12],
    // Utah puts rows 12 inches apart and Minnesota 18 to 30. A real
    // disagreement between a close-planted bed and a hoed row.
    rowSpacingInches: [12, 30],
    // Cornell CALS lists chard with the leafy greens on a two-by-two grid,
    // which is four to the square foot. Our earlier null said the page did not
    // name it; it does.
    sfgPlantsPerSquare: 4,
    notes: [
      'A cut-and-come-again crop. One sowing crops for months if the outer leaves are taken and the growing point is left alone.',
      'Maryland sows seed 2 inches apart in all directions, thins to 4 inches when seedlings are about 2 inches high, and allows 8 to 12 inches for larger plants.',
      'Maryland puts it at 4 to 6 hours of direct light at a minimum, growing best at 6 to 8.',
      'The same species as beetroot, bred for leaf and stalk instead of root.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: -2,
    seedDepthInches: 0.5,
    noSowIndoorsReason:
      'Not usually started indoors — Utah State sows direct, two to three weeks before the last frost.',
    noTransplantReason: 'Not transplanted — sow where it will grow.',
    soilPh: null,
    soilPhNote:
      'pH 6.0 or above. Minnesota says chard tolerates soil somewhat more acidic than spinach, as low as pH 6, and gives no upper limit.',
    daysToMaturity: [50, 70],
    sunHours: 6,
    waterInchesPerWeek: 1.5,
    fertilizerNote:
      'A steady nitrogen supply keeps leaves coming. Side-dress once mid-season rather than feeding heavily at sowing.',
    yieldPerPlantLb: [1, 2],
    companionPlants: ['Bush bean', 'Onion', 'Cabbage'],
    avoidPlanting: ['Beet', 'Spinach'],
    commonProblems: [
      'Leaf miner tunnels in the leaves',
      'Bolting in a hot summer',
      'Downy mildew in crowded plantings',
      'Slugs on seedlings',
    ],
    source: {
      institution: 'Utah State University Extension',
      title: 'How to Grow Swiss Chard in Your Garden (Drost, 2020)',
      url: 'https://extension.usu.edu/yardandgarden/research/swiss-chard-in-the-garden',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
      {
        institution: 'University of Maryland Extension',
        title: 'Growing Swiss Chard in a Home Garden',
        url: 'https://extension.umd.edu/resource/swiss-chard/',
      },
      {
        institution: 'University of Minnesota Extension',
        title: 'Growing spinach and Swiss chard in home gardens',
        url: 'https://extension.umn.edu/vegetables/growing-spinach-and-swiss-chard',
      },
    ],
    verifiedFields: [
      'spacingInches',
      'rowSpacingInches',
      'sfgPlantsPerSquare',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: true,
  },
  {
    slug: 'lavender',
    name: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    type: 'herb',
    family: 'Lamiaceae',
    // Utah State and UGA give 18 to 24 inches independently and agree exactly,
    // which is unusual enough for the page to say so — the site's normal note
    // is that two extensions disagree.
    spacingInches: [18, 24],
    // UGA's herb cultivation table gives plant spacing without a row figure for
    // any herb on it, so the absence is confirmed rather than unsearched.
    rowSpacingInches: null,
    sfgPlantsPerSquare: null,
    notes: [
      'A woody Mediterranean subshrub, not a soft herb. It is grown for years in one place rather than sown each spring, and almost everything that kills it is a soil or drainage problem rather than a cold one.',
      'Rich, well-fed ground produces soft, sappy growth that rots in winter. Poor, gritty, sharply drained soil produces a hard, long-lived plant.',
      'It will not reshoot from bare old wood. A plant left unpruned goes woody at the base, splits open in the middle, and cannot be brought back by cutting into that wood.',
      'A "lavender tree" is not a species. It is an ordinary lavender, usually a tender one, trained to a single clear stem with a mop head on top.',
      'Utah State puts mature size at 1 to 2 feet tall and wide depending on variety, and gives it three years to reach full size.',
      'Utah State prunes it by shearing back to half its size once a year, after flowering, to force bushier new growth.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    noSowIndoorsReason:
      'Not grown from seed in a garden — seed is slow and variable, so buy a named plant or root a cutting.',
    noTransplantReason:
      'No frost offset applies — a container-grown plant goes in whenever the ground is workable and not frozen.',
    noDirectSowReason:
      'Not direct sown — seed germinates poorly in open ground and a seedling takes years to make a plant.',
    timingNote:
      'Planted from a container rather than sown, so it has no frost-offset date. UGA puts lavender in as a spring and fall planting rather than naming a week relative to frost.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A woody perennial — it flowers in seasons, not in a count of days from planting.',
    sunHours: 6,
    // Utah State does quantify watering, but per plant in gallons rather than
    // in inches over an area, so it cannot go in this field without being
    // converted into a figure nobody published. The schedule is in waterNote
    // and in the body instead.
    waterInchesPerWeek: null,
    waterNote:
      'Utah State gives this per plant rather than per week over an area: 1 gallon a week while establishing, then half a gallon every two weeks until flower buds form, then once or twice a week through flowering.',
    soilPh: [6.5, 7.5],
    fertilizerNote:
      'Do not feed it. Lavender flowers best on poor, gritty, sharply drained ground; rich soil and a nitrogen feed give a soft leafy plant that flowers less and rots in winter.',
    yieldPerPlantLb: null,
    companionPlants: ['Rosemary', 'Thyme', 'Sage'],
    avoidPlanting: [],
    commonProblems: [
      'Rot from winter wet in heavy soil',
      'Woody, split centre on an unpruned plant',
      'Soft leafy growth and few flowers on rich soil',
      'Dying back in a pot with no drainage',
    ],
    source: {
      institution: 'Utah State University Extension',
      title: 'How to Grow English Lavender in Your Garden',
      url: 'https://extension.usu.edu/yardandgarden/research/lavender-in-the-garden',
    },
    extraSources: [
      {
        institution: 'University of Georgia Extension',
        title: 'Bulletin 1170, Herbs in Southern Gardens',
        url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
      },
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    // Confirmed absent from the Cornell CALS square foot gardening page, whose
    // list names no herb at all. Every applicable checked field is confirmed,
    // so this rolls up.
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'rosemary',
    name: 'Rosemary',
    scientificName: 'Salvia rosmarinus',
    type: 'herb',
    family: 'Lamiaceae',
    // UGA gives 2 to 3 feet and Penn State 2 feet, so the range spans both
    // rather than choosing one.
    spacingInches: [24, 36],
    // UGA's herb table gives no row figure for any herb, so the absence is
    // confirmed.
    rowSpacingInches: null,
    sfgPlantsPerSquare: null,
    notes: [
      'A woody evergreen shrub. It is reclassified as Salvia rosmarinus rather than Rosmarinus officinalis, which is why older books and newer labels disagree about its name.',
      'Seed is slow and unreliable, which is the honest reason cuttings are the usual method. A cutting is also a copy of a plant whose hardiness and flavour you have already seen.',
      'Cold alone is rarely what kills it. A plant in cold, wet, heavy ground dies where the same plant in gritty, sharply drained soil in the same winter lives.',
      'Penn State calls it a tender perennial evergreen shrub: where winters are cold it is grown as an annual, or in a pot brought indoors two to three weeks before the first frost.',
      'Penn State puts mature size at 2 to 6 feet tall and 2 to 6 feet wide.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    noSowIndoorsReason:
      'Not usually grown from seed — germination is slow and erratic, so take a cutting instead.',
    noTransplantReason:
      'No frost offset applies — a rooted cutting or container plant goes out once the ground is workable and frost has finished.',
    noDirectSowReason: 'Not direct sown — seed is too slow and unreliable to be worth a drill.',
    timingNote:
      'Grown from cuttings rather than seed, so it has no frost-offset sowing date. UGA puts rosemary in as a spring and fall planting rather than naming a week relative to frost.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A woody perennial — a cutting takes weeks to root and seasons to become a picking plant, not a set count of days.',
    sunHours: 6,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for rosemary in either publication behind this page. Water a rooting cutting or a new plant, and an established one only in a long dry spell — it suffers far more from standing wet than from drought.',
    soilPh: [6.5, 7],
    fertilizerNote:
      'Very little. A free-draining, gritty mix matters more than feeding, and a rich potting compost that holds water is the commonest way a potted rosemary is lost.',
    yieldPerPlantLb: null,
    companionPlants: ['Lavender', 'Thyme', 'Sage', 'Cabbage'],
    avoidPlanting: [],
    commonProblems: [
      'Root rot in wet or heavy ground',
      'Cuttings rotting before they root',
      'Leggy, sparse growth in too little light',
      'Powdery mildew in still, humid air indoors',
    ],
    source: {
      institution: 'Penn State Extension',
      title: 'Herb Garden Plants: Rosemary',
      url: 'https://extension.psu.edu/herb-garden-plants-rosemary',
    },
    extraSources: [
      {
        institution: 'University of Georgia Extension',
        title: 'Bulletin 1170, Herbs in Southern Gardens',
        url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
      },
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    // Confirmed absent from the Cornell CALS page, as for every herb on it.
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'sage',
    name: 'Sage',
    scientificName: 'Salvia officinalis',
    type: 'herb',
    family: 'Lamiaceae',
    spacingInches: 18,
    // UGA's herb table gives plant spacing without a row figure for any herb,
    // and Minnesota's herb page gives no per-herb figures at all, so the absence
    // is confirmed rather than unsearched.
    rowSpacingInches: null,
    // Confirmed absent from the Cornell CALS square foot gardening page, whose
    // list names no herb anywhere.
    sfgPlantsPerSquare: null,
    notes: [
      'Culinary sage is Salvia officinalis. The word "sage" is also sold on ornamental salvias, on Russian sage and on white sage, which are different plants — only this one is the kitchen herb.',
      'A woody perennial that goes leggy and bare at the base with age, like lavender and rosemary, and for the same reason: it does not reshoot well from old bare wood.',
      'UGA puts sage in as a spring or fall planting rather than naming a week relative to frost.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    noSowIndoorsReason:
      'Not usually grown from seed — seed is slow and variable, so buy a named plant or root a cutting.',
    noTransplantReason:
      'No frost offset applies — UGA gives a planting season rather than a week count.',
    noDirectSowReason: 'Not direct sown — a plant or a cutting is years ahead of a seedling.',
    timingNote:
      'Planted from a container or a cutting rather than sown. UGA puts it in as a spring or fall planting rather than naming a week relative to frost.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A woody perennial — picked over years rather than reaching maturity a set number of days from planting.',
    sunHours: 6,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for sage. Water a new plant until it establishes; an established one is at more risk from wet ground than from drought.',
    soilPh: null,
    soilPhNote:
      'No range is published for this crop itself. UGA gives about 6 to 7.5 for herbs generally and Minnesota 6.0 to 7.5, which agree.',
    fertilizerNote:
      'Very little. Rich feeding gives soft growth with less flavour, and sharp drainage matters more than fertiliser.',
    yieldPerPlantLb: null,
    companionPlants: ['Cabbage', 'Carrot', 'Rosemary', 'Thyme', 'Lavender'],
    avoidPlanting: ['Cucumber'],
    commonProblems: [
      'Woody, bare base on an old plant',
      'Root rot in wet or heavy ground',
      'Powdery mildew in still, humid air',
      'Loss of flavour on rich, well-fed soil',
    ],
    source: {
      institution: 'University of Georgia Extension',
      title: 'Bulletin 1170, Herbs in Southern Gardens',
      url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'thyme',
    name: 'Thyme',
    scientificName: 'Thymus vulgaris',
    type: 'herb',
    family: 'Lamiaceae',
    spacingInches: 12,
    // UGA's herb table gives plant spacing without a row figure for any herb,
    // and Minnesota's herb page gives no per-herb figures at all, so the absence
    // is confirmed rather than unsearched.
    rowSpacingInches: null,
    // Confirmed absent from the Cornell CALS square foot gardening page, whose
    // list names no herb anywhere.
    sfgPlantsPerSquare: null,
    notes: [
      'A low, woody, evergreen Mediterranean subshrub. It takes drought and poor stony ground better than almost anything else in the herb bed.',
      'Shade is the common mistake. It survives in part shade and grows leggy, sparse and noticeably less aromatic, because the oils that carry the flavour build in full sun.',
      'UGA puts thyme in as a fall or spring planting rather than naming a week relative to frost.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    noSowIndoorsReason:
      'Not usually grown from seed — the seed is tiny and slow, so buy a plant or root a cutting.',
    noTransplantReason:
      'No frost offset applies — UGA gives a planting season rather than a week count.',
    noDirectSowReason: 'Not direct sown — the seedlings are too small to compete in open ground.',
    timingNote:
      'Planted from a container, a cutting or a divided clump rather than sown. UGA puts it in as a fall or spring planting rather than naming a week relative to frost.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'A woody perennial — picked a little at a time over years rather than maturing a set number of days from planting.',
    sunHours: 6,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for thyme. Water it in when new, then rarely — it is one of the most drought-tolerant plants in the herb bed and rots in wet ground.',
    soilPh: null,
    soilPhNote:
      'No range is published for this crop itself. UGA gives about 6 to 7.5 for herbs generally and Minnesota 6.0 to 7.5, which agree.',
    fertilizerNote:
      'None to speak of. Thyme is stronger flavoured on poor, gritty, sharply drained soil than on anything improved.',
    yieldPerPlantLb: null,
    companionPlants: ['Cabbage', 'Strawberry', 'Tomato', 'Rosemary', 'Lavender', 'Sage'],
    avoidPlanting: [],
    commonProblems: [
      'Leggy, sparse growth in shade',
      'Root rot in wet or heavy ground',
      'Woody centre on an old clump',
      'Dying out under a winter mulch that holds water',
    ],
    source: {
      institution: 'University of Georgia Extension',
      title: 'Bulletin 1170, Herbs in Southern Gardens',
      url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
  {
    slug: 'oregano',
    name: 'Oregano',
    scientificName: 'Origanum vulgare',
    type: 'herb',
    family: 'Lamiaceae',
    spacingInches: 12,
    // UGA's herb table gives plant spacing without a row figure for any herb,
    // and Minnesota's herb page gives no per-herb figures at all, so the absence
    // is confirmed rather than unsearched.
    rowSpacingInches: null,
    // Confirmed absent from the Cornell CALS square foot gardening page, whose
    // list names no herb anywhere.
    sfgPlantsPerSquare: null,
    notes: [
      'One of the few herbs genuinely better dried than fresh: drying concentrates the oils that carry its flavour, which is why dried oregano tastes stronger rather than flatter.',
      'Flavour is strongest just before the flowers open, which is when to cut for drying.',
      'Spreads by runners and will colonise a bed if left alone. A container keeps it where you put it.',
      'UGA puts oregano in as a spring or fall planting rather than naming a week relative to frost.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksRelativeToLastFrost: null,
    noSowIndoorsReason:
      'Not usually grown from seed — seed-grown plants vary a great deal in flavour, so buy or divide a plant you have tasted.',
    noTransplantReason:
      'No frost offset applies — UGA gives a planting season rather than a week count.',
    noDirectSowReason: 'Not direct sown — the seedlings are slow and variable.',
    timingNote:
      'Planted from a container or a division rather than sown. UGA puts it in as a spring or fall planting rather than naming a week relative to frost.',
    daysToMaturity: null,
    noDaysToMaturityReason:
      'Cut repeatedly, not harvested once — the first cut is judged by the flower buds, not by a day count.',
    sunHours: 6,
    waterInchesPerWeek: null,
    waterNote:
      'No weekly figure is published for oregano. Water a new plant until it establishes, then only in a long dry spell.',
    soilPh: null,
    soilPhNote:
      'No range is published for this crop itself. UGA gives about 6 to 7.5 for herbs generally and Minnesota 6.0 to 7.5, which agree.',
    fertilizerNote:
      'Very little. Rich soil and nitrogen give a big, soft, mild plant — the opposite of what oregano is grown for.',
    yieldPerPlantLb: null,
    companionPlants: ['Tomato', 'Pepper', 'Cabbage', 'Basil', 'Thyme'],
    avoidPlanting: [],
    commonProblems: [
      'Mild, weak flavour on rich soil',
      'Spreading into the rest of the bed by runners',
      'Root rot in wet ground',
      'Woody, sparse centre on an old clump',
    ],
    source: {
      institution: 'University of Georgia Extension',
      title: 'Bulletin 1170, Herbs in Southern Gardens',
      url: 'https://extension.uga.edu/publications/detail.html?number=B1170',
    },
    extraSources: [
      {
        institution: 'Cornell CALS',
        title: 'Square Foot Gardening',
        url: 'https://cals.cornell.edu/school-integrative-plant-science/school-sections/horticulture-section/outreach-and-extension/pandemic-vegetable-gardening/pandemic-vegetable-gardening-2021-archive/square-foot-gardening',
      },
    ],
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'sfgPlantsPerSquare'],
    verified: true,
  },
];
export const cropSlugs = crops.map((crop) => crop.slug);

export function getCrop(slug: string): Crop | undefined {
  return crops.find((crop) => crop.slug === slug);
}

/** Plants per foot of row, from in-row spacing. */
export function plantsPerRowFoot(crop: Crop): number {
  return 12 / spacingFor(crop.spacingInches);
}
