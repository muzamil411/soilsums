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
 *  - `daysToMaturity: null` means the crop does not have a meaningful
 *    days-to-maturity figure from planting — a perennial such as strawberry.
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

/** The extension page a crop's checked fields were confirmed against. */
export type CropSource = {
  readonly institution: string;
  readonly url: string;
};

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

  /** In-row spacing between plants, inches. */
  readonly spacingInches: number;
  /** Spacing between rows, inches. */
  readonly rowSpacingInches: number;
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
   * Why a planting step does not apply, for each of the three that can be
   * null. A quick-facts table saying "Direct sow: —" tells the reader nothing;
   * these turn each blank into a short reason.
   */
  readonly noSowIndoorsReason?: string;
  readonly noTransplantReason?: string;
  readonly noDirectSowReason?: string;

  readonly daysToMaturity: readonly [number, number] | null;
  readonly sunHours: number;
  readonly waterInchesPerWeek: number;
  readonly soilPh: readonly [number, number];
  readonly fertilizerNote: string;
  /** Pounds of harvest per plant, low to high, for a home garden. */
  readonly yieldPerPlantLb: readonly [number, number];

  readonly companionPlants: readonly string[];
  readonly avoidPlanting: readonly string[];
  readonly commonProblems: readonly string[];

  /** The page the checked fields were confirmed against, null if none was found. */
  readonly source: CropSource | null;
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
  return Math.round((144 / (crop.spacingInches * crop.spacingInches)) * 100) / 100;
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
    spacingInches: 4,
    rowSpacingInches: 12,
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
    spacingInches: 4,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: 9,
    plantingSeason: 'fall',
    notes: [
      'Planted 1 to 2 weeks after the first killing frost in autumn, which is why the spring frost-date fields are empty. It overwinters in the ground and is lifted the following summer.',
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
    verifiedFields: ['spacingInches', 'sfgPlantsPerSquare'],
    verified: false,
  },
  {
    slug: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    type: 'vegetable',
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
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'directSowWeeksRelativeToLastFrost'],
    verified: false,
  },
  {
    slug: 'squash',
    name: 'Winter squash',
    scientificName: 'Cucurbita maxima',
    type: 'vegetable',
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
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'broccoli',
    name: 'Broccoli',
    scientificName: 'Brassica oleracea var. italica',
    type: 'vegetable',
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
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'cilantro',
    name: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    type: 'herb',
    spacingInches: 6,
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
    daysToMaturity: [45, 70],
    sunHours: 4,
    waterInchesPerWeek: 1,
    soilPh: [6.2, 6.8],
    fertilizerNote:
      'Almost none. Resents transplanting, so sow where it will grow and sow again every few weeks.',
    yieldPerPlantLb: [0.1, 0.25],
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
    spacingInches: 10,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: null,
    sowIndoorsWeeksBeforeLastFrost: 8,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 0,
    daysToMaturity: [70, 90],
    sunHours: 5,
    waterInchesPerWeek: 1,
    soilPh: [6.0, 7.0],
    fertilizerNote:
      'Light nitrogen through the season. Slow to germinate — be patient, keep moist.',
    yieldPerPlantLb: [0.25, 0.5],
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
    verifiedFields: [
      'spacingInches',
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
  },
  {
    slug: 'dill',
    name: 'Dill',
    scientificName: 'Anethum graveolens',
    type: 'herb',
    spacingInches: 10,
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
    daysToMaturity: [40, 60],
    sunHours: 6,
    waterInchesPerWeek: 1,
    soilPh: [5.8, 6.5],
    fertilizerNote: 'Poor soil suits it. Direct sow — the taproot hates being moved.',
    yieldPerPlantLb: [0.2, 0.5],
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
    verifiedFields: ['spacingInches', 'rowSpacingInches', 'directSowWeeksRelativeToLastFrost'],
    verified: false,
  },
  {
    slug: 'strawberry',
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    type: 'fruit',
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
      'directSowWeeksRelativeToLastFrost',
    ],
    verified: false,
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
    spacingInches: 15,
    rowSpacingInches: 48,
    sfgPlantsPerSquare: null,
    notes: [
      'A perennial. A bed takes two to three years before a real harvest and then crops for fifteen to twenty years, so siting it well matters more than for anything annual.',
      'Grown from one-year-old crowns rather than seed in almost every home garden. Seed adds a year.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: -4,
    directSowWeeksRelativeToLastFrost: null,
    timingNote:
      'Crowns go in early, while the soil is still cool and before growth starts. Harvest nothing in the planting year, little in the second, and a full cut from the third.',
    noSowIndoorsReason: 'Not usually grown from seed — plant one-year-old crowns instead.',
    noDirectSowReason: 'Not direct sown — crowns are planted in a trench, not seed in a drill.',
    daysToMaturity: null,
    sunHours: 8,
    waterInchesPerWeek: 1,
    soilPh: [6.5, 7],
    fertilizerNote:
      'Feed after the harvest window closes rather than during it, so the ferns can build reserves for next year.',
    yieldPerPlantLb: [0.5, 1],
    companionPlants: ['Tomato', 'Basil', 'Parsley'],
    avoidPlanting: ['Onion', 'Garlic', 'Potato'],
    commonProblems: [
      'Harvesting too early in the bed\u2019s life',
      'Asparagus beetle',
      'Weeds in a permanent bed',
      'Spears thinning late in the season',
    ],
    source: null,
    verifiedFields: [],
    verified: false,
  },
  {
    slug: 'blueberry',
    name: 'Blueberry',
    scientificName: 'Vaccinium corymbosum',
    type: 'fruit',
    spacingInches: 60,
    rowSpacingInches: 96,
    sfgPlantsPerSquare: null,
    notes: [
      'Soil pH decides everything. Blueberries need strongly acid soil and will not take up iron above about pH 5.5, whatever else is done for them.',
      'Most varieties crop far better with a second variety nearby for cross-pollination.',
    ],
    sowIndoorsWeeksBeforeLastFrost: null,
    transplantWeeksAfterLastFrost: -4,
    directSowWeeksRelativeToLastFrost: null,
    timingNote:
      'Planted as a container-grown or bare-root bush, in early spring while dormant or in autumn. A bush takes two to three years to crop properly and lives for decades.',
    noSowIndoorsReason: 'Not grown from seed in a home garden — buy a two- or three-year-old bush.',
    noDirectSowReason: 'Not sown from seed — a bush from a nursery fruits years sooner.',
    daysToMaturity: null,
    sunHours: 7,
    waterInchesPerWeek: 1.5,
    soilPh: [4.5, 5.5],
    fertilizerNote:
      'Use an acidifying fertilizer formulated for ericaceous plants. Never lime a blueberry, and avoid nitrate-based feeds, which they tolerate poorly.',
    yieldPerPlantLb: [3, 10],
    companionPlants: ['Strawberry', 'Thyme'],
    avoidPlanting: ['Brassicas'],
    commonProblems: [
      'Yellow leaves with green veins from high pH',
      'Birds taking the crop',
      'Drying out in a container',
      'No fruit without a pollination partner',
    ],
    source: null,
    verifiedFields: [],
    verified: false,
  },
  {
    slug: 'marigold',
    name: 'Marigold',
    scientificName: 'Tagetes spp.',
    type: 'herb',
    spacingInches: 10,
    rowSpacingInches: 12,
    sfgPlantsPerSquare: null,
    notes: [
      'An annual in every climate, despite being widely searched for as a perennial. It self-seeds freely, which is what makes people think it came back.',
      'French marigolds are compact and the usual companion planting choice; African marigolds are tall and grown for the flower.',
    ],
    sowIndoorsWeeksBeforeLastFrost: 6,
    transplantWeeksAfterLastFrost: 0,
    directSowWeeksRelativeToLastFrost: 0,
    soilPh: [6, 7],
    daysToMaturity: [45, 60],
    sunHours: 6,
    waterInchesPerWeek: 1,
    fertilizerNote:
      'Poor soil suits them. Rich or heavily fed ground gives large leafy plants and few flowers.',
    yieldPerPlantLb: [0, 0],
    companionPlants: ['Tomato', 'Pepper', 'Bush bean', 'Cucumber', 'Squash'],
    // The "marigolds inhibit beans" claim is persistent folklore with no
    // support worth citing, and it contradicted the bush bean entry, which
    // names marigold as a companion. Dropped rather than carried on both
    // sides; the marigold page says why.
    avoidPlanting: [],
    commonProblems: [
      'Few flowers on rich soil',
      'Slugs on young plants',
      'Spider mites in hot, dry spells',
      'Damping off if sown too wet',
    ],
    source: null,
    verifiedFields: [],
    verified: false,
  },
  {
    slug: 'swiss-chard',
    name: 'Swiss chard',
    scientificName: 'Beta vulgaris subsp. vulgaris',
    type: 'vegetable',
    spacingInches: 9,
    rowSpacingInches: 18,
    sfgPlantsPerSquare: null,
    notes: [
      'A cut-and-come-again crop. One sowing crops for months if the outer leaves are taken and the growing point is left alone.',
      'The same species as beetroot, bred for leaf and stalk instead of root.',
    ],
    sowIndoorsWeeksBeforeLastFrost: 5,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksRelativeToLastFrost: -2,
    soilPh: [6, 7],
    daysToMaturity: [50, 60],
    sunHours: 6,
    waterInchesPerWeek: 1,
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
    source: null,
    verifiedFields: [],
    verified: false,
  },
];
export const cropSlugs = crops.map((crop) => crop.slug);

export function getCrop(slug: string): Crop | undefined {
  return crops.find((crop) => crop.slug === slug);
}

/** Plants per foot of row, from in-row spacing. */
export function plantsPerRowFoot(crop: Crop): number {
  return 12 / crop.spacingInches;
}
