/**
 * Compost feedstock data for the C:N calculator.
 *
 * A pile's carbon-to-nitrogen ratio is NOT the average of its materials'
 * ratios — averaging ratios is a common mistake that gives the wrong answer.
 * The ratio has to be computed from the actual masses of carbon and nitrogen:
 *
 *   dry mass    = as-is mass x dryMatterPercent / 100
 *   nitrogen    = dry mass x nitrogenPercentDry / 100
 *   carbon      = nitrogen x cnRatio
 *   mix C:N     = total carbon / total nitrogen
 *
 * That is why each material carries a nitrogen percentage and a dry matter
 * percentage as well as its own C:N ratio. Bulk density is here so a gardener
 * can enter buckets or liters rather than weighing anything.
 *
 * Published C:N ratios for the same material vary widely — a leaf is not a
 * standard object. Cornell's own wording is that its figures "should be viewed
 * as representative ranges, not as universal values", and Nebraska calls its
 * table "only guidelines". So each material carries the published `range` as
 * well as a working value, and the calculator shows the range rather than
 * implying the single number is exact.
 *
 * Checked against the Cornell Waste Management Institute tables in September
 * 2026. Alfalfa meal is sourced from USDA AMS (15.9:1) and fresh green weeds
 * from LSU AgCenter (19:1); both were verified in the October 2026 audit.
 */
export type CompostCategory = 'brown' | 'green';

export type CompostMaterial = {
  readonly slug: string;
  readonly name: string;
  readonly category: CompostCategory;
  /** Carbon to nitrogen ratio of this material on its own. */
  readonly cnRatio: number;
  /**
   * The published spread for this material, low and high. Shown instead of the
   * bare number: for wood chips the sources run 100 to 1,300, and a reader who
   * sees only "400" will trust it far more than anyone should.
   */
  readonly range: readonly [number, number] | null;
  /** Nitrogen as a percentage of dry matter. */
  readonly nitrogenPercentDry: number;
  /** Dry matter as a percentage of as-is weight. */
  readonly dryMatterPercent: number;
  /** Loose bulk density, pounds per cubic foot, for volume-based entry. */
  readonly bulkDensityLbPerCuFt: number;
  readonly note: string;
  readonly source: string;
  readonly verified: boolean;
};

const COR_CHEM =
  'Cornell Composting, Compost Chemistry: https://compost.css.cornell.edu/chemistry.html';
const CWMI_3 =
  'Cornell Waste Management Institute, Getting the Right Mix ch. 3, Tables 3-2 and 3-3: https://cwmi.css.cornell.edu/chapter3.pdf';
const OFCH =
  'Cornell Waste Management Institute, On-Farm Composting Handbook Appendix A Table A.1: https://cwmi.css.cornell.edu/AppendixATable1OFCH.pdf';
const UNL =
  'University of Nebraska-Lincoln, Garden Compost G2222 (2013), Table II: https://extensionpubs.unl.edu/publication/g2222/2013/pdf/view/g2222-2013.pdf';
const USDA_AMS =
  'USDA Agricultural Marketing Service, Highly Soluble Nitrogen Fertilizers (April 2022), Table "Traditional organic materials": https://www.ams.usda.gov/sites/default/files/media/CSSolubleNitrogenFertFinalRecApril2022.pdf';
const LSU =
  'LSU AgCenter, Composting and the Carbon-Nitrogen Ratio: https://www.lsuagcenter.com/topics/lawn_garden/ornamentals/landscaping/composting-and-the-carbon-nitrogen-ratio';

export const compostMaterials: readonly CompostMaterial[] = [
  {
    slug: 'dry-leaves',
    name: 'Dry autumn leaves',
    category: 'brown',
    cnRatio: 60,
    range: [30, 80],
    nitrogenPercentDry: 0.8,
    dryMatterPercent: 85,
    bulkDensityLbPerCuFt: 5,
    note: 'The most useful brown most gardeners have. Shred them or they mat into layers that shed water.',
    source: COR_CHEM,
    verified: true,
  },
  {
    slug: 'straw',
    name: 'Straw',
    category: 'brown',
    cnRatio: 75,
    range: [48, 150],
    nitrogenPercentDry: 0.7,
    dryMatterPercent: 90,
    bulkDensityLbPerCuFt: 3,
    note: 'Very light, so a bale goes a long way by volume but adds little weight. Wheat straw runs higher than oat, 100-150 against 48-98.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'wood-chips',
    name: 'Wood chips',
    category: 'brown',
    cnRatio: 400,
    range: [200, 1300],
    nitrogenPercentDry: 0.12,
    dryMatterPercent: 70,
    bulkDensityLbPerCuFt: 20,
    note: 'Extremely high carbon and slow to break down. Better as a path or mulch than a compost ingredient. Hardwood chips run 450-800 and softwood 200-1,300, so the species matters more than the chip size.',
    source: CWMI_3,
    verified: true,
  },
  {
    slug: 'sawdust',
    name: 'Sawdust',
    category: 'brown',
    cnRatio: 500,
    range: [200, 750],
    nitrogenPercentDry: 0.1,
    dryMatterPercent: 80,
    bulkDensityLbPerCuFt: 15,
    note: 'Use sparingly. Untreated wood only — never sawdust from treated or painted timber.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'shredded-newspaper',
    name: 'Shredded newspaper',
    category: 'brown',
    cnRatio: 560,
    range: [400, 900],
    nitrogenPercentDry: 0.1,
    dryMatterPercent: 92,
    bulkDensityLbPerCuFt: 7,
    note: 'Fine shredded, wetted and mixed in. Avoid glossy inserts. The old figure of 175 was for mixed office paper, which is a different material.',
    source: COR_CHEM,
    verified: true,
  },
  {
    slug: 'cardboard',
    name: 'Plain cardboard',
    category: 'brown',
    cnRatio: 580,
    range: [560, 600],
    nitrogenPercentDry: 0.1,
    dryMatterPercent: 92,
    bulkDensityLbPerCuFt: 9.6,
    note: 'Remove tape and labels, tear small and soak first, or it stays dry in the middle.',
    source: COR_CHEM,
    verified: true,
  },
  {
    slug: 'pine-needles',
    name: 'Pine needles',
    category: 'brown',
    cnRatio: 80,
    range: [66, 80],
    nitrogenPercentDry: 0.6,
    dryMatterPercent: 85,
    bulkDensityLbPerCuFt: 6,
    note: 'Slow to break down and mildly acidic, though the finished compost ends up close to neutral. Nebraska publishes 80 and Cornell 66 for the same material.',
    source: UNL,
    verified: true,
  },
  {
    slug: 'corn-stalks',
    name: 'Corn stalks',
    category: 'brown',
    cnRatio: 75,
    range: [60, 80],
    nitrogenPercentDry: 0.6,
    dryMatterPercent: 85,
    bulkDensityLbPerCuFt: 1.2,
    note: 'Chop or shred. Whole stalks take a year or more. Nebraska publishes 80, Cornell 60-73.',
    source: UNL,
    verified: true,
  },
  {
    slug: 'shrub-trimmings',
    name: 'Shrub and hedge trimmings',
    category: 'brown',
    cnRatio: 50,
    range: [50, 53],
    nitrogenPercentDry: 1,
    dryMatterPercent: 45,
    bulkDensityLbPerCuFt: 12,
    note: 'Green when fresh but woody in the middle. Anything thicker than a pencil needs shredding. Tree trimmings are a different material at about 16 — do not mix the two figures.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'grass-clippings',
    name: 'Fresh grass clippings',
    category: 'green',
    cnRatio: 20,
    range: [9, 25],
    nitrogenPercentDry: 2.4,
    dryMatterPercent: 25,
    bulkDensityLbPerCuFt: 25,
    note: 'Heats a pile fast. In a thick layer on its own it turns into a slimy, airless mat. The density here is for compacted clippings. Loose from the bag they are nearer 11-15 lb per cubic foot.',
    source: COR_CHEM,
    verified: true,
  },
  {
    slug: 'vegetable-scraps',
    name: 'Vegetable and fruit scraps',
    category: 'green',
    cnRatio: 20,
    range: [10, 20],
    nitrogenPercentDry: 2.5,
    dryMatterPercent: 15,
    bulkDensityLbPerCuFt: 35,
    note: 'Mostly water. Bury in the middle of the pile so it does not attract animals. A fruit-heavy bucket runs higher, 20-50.',
    source: COR_CHEM,
    verified: true,
  },
  {
    slug: 'coffee-grounds',
    name: 'Coffee grounds',
    category: 'green',
    cnRatio: 20,
    range: [20, 20],
    nitrogenPercentDry: 2.1,
    dryMatterPercent: 40,
    bulkDensityLbPerCuFt: 40,
    note: 'A green despite the colour. Dense and prone to caking, so mix rather than layer.',
    source: COR_CHEM,
    verified: true,
  },
  {
    slug: 'fruit-waste',
    name: 'Orchard fruit waste',
    category: 'green',
    cnRatio: 35,
    range: [20, 50],
    nitrogenPercentDry: 1.4,
    dryMatterPercent: 15,
    bulkDensityLbPerCuFt: 35,
    note: 'Windfall apples and similar. Wet and acidic in quantity — mix with plenty of browns.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'cow-manure',
    name: 'Cow manure',
    category: 'green',
    cnRatio: 20,
    range: [11, 30],
    nitrogenPercentDry: 2.4,
    dryMatterPercent: 20,
    bulkDensityLbPerCuFt: 45,
    note: 'A reliable nitrogen source. Compost fully before it goes near food crops. How much bedding is mixed in, and how old the heap is, move this more than the animal does.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'chicken-manure',
    name: 'Chicken manure (fresh)',
    category: 'green',
    cnRatio: 7,
    range: [3, 10],
    nitrogenPercentDry: 5,
    dryMatterPercent: 30,
    bulkDensityLbPerCuFt: 40,
    note: 'The strongest common green. Enough carbon alongside it or the pile goes ammoniacal.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'chicken-manure-litter',
    name: 'Chicken manure with litter',
    category: 'green',
    cnRatio: 15,
    range: [12, 18],
    nitrogenPercentDry: 3.5,
    dryMatterPercent: 45,
    bulkDensityLbPerCuFt: 35,
    note: 'Coop bedding mixed in with the droppings, which is what most people actually shovel out. The shavings raise the ratio well above fresh manure, so it burns a pile far less readily.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'horse-manure',
    name: 'Horse manure with bedding',
    category: 'green',
    cnRatio: 35,
    range: [30, 60],
    nitrogenPercentDry: 1.8,
    dryMatterPercent: 30,
    bulkDensityLbPerCuFt: 35,
    note: 'The ratio depends on how much bedding came with it. Straw bedding pushes it browner. How much bedding is mixed in, and how old the heap is, move this more than the animal does. Without bedding it is nearer 20-25.',
    source: UNL,
    verified: true,
  },
  {
    slug: 'alfalfa-meal',
    name: 'Alfalfa meal',
    category: 'green',
    cnRatio: 15.9,
    range: null,
    nitrogenPercentDry: 3.5,
    dryMatterPercent: 90,
    bulkDensityLbPerCuFt: 22,
    note: 'A concentrated nitrogen boost for a stalled, carbon-heavy pile. C:N 15.9:1 is from USDA AMS (single published value; no published range). Nitrogen percentage, dry matter, and bulk density are estimates — the closest published N figure is 2.7% for alfalfa pellets (UC ANR).',
    source: USDA_AMS,
    verified: true,
  },
  {
    slug: 'seaweed',
    name: 'Seaweed',
    category: 'green',
    cnRatio: 19,
    range: [5, 27],
    nitrogenPercentDry: 2.5,
    dryMatterPercent: 20,
    bulkDensityLbPerCuFt: 40,
    note: 'Rinse off salt first. Collect only where it is legal to do so. A single source with a fivefold spread, so treat it loosely.',
    source: OFCH,
    verified: true,
  },
  {
    slug: 'fresh-weeds',
    name: 'Fresh green weeds',
    category: 'green',
    cnRatio: 19,
    range: null,
    nitrogenPercentDry: 2.5,
    dryMatterPercent: 20,
    bulkDensityLbPerCuFt: 20,
    note: 'Fine before they seed. Perennial roots and seed heads survive a cool pile. C:N 19:1 is from LSU AgCenter (single published value; no published range). UC ANR gives fresh weeds at 10-20% carbon and 1-4% nitrogen. Nitrogen percentage, dry matter, and bulk density are estimates.',
    source: LSU,
    verified: true,
  },
];

/** The target band for an active pile, widely given as roughly 25–30:1. */
export const TARGET_CN_RATIO = { min: 25, max: 30 } as const;

export function getCompostMaterial(slug: string): CompostMaterial | undefined {
  return compostMaterials.find((material) => material.slug === slug);
}
