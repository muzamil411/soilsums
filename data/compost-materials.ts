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
 * Every figure is `verified: false`. Published C:N ratios for the same material
 * vary widely — a leaf is not a standard object — so treat these as typical
 * values and expect a range.
 */
export type CompostCategory = 'brown' | 'green';

export type CompostMaterial = {
  readonly slug: string;
  readonly name: string;
  readonly category: CompostCategory;
  /** Carbon to nitrogen ratio of this material on its own. */
  readonly cnRatio: number;
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

const CHECK =
  'Verify against: Cornell Waste Management Institute composting tables and your state extension composting guide';

export const compostMaterials: readonly CompostMaterial[] = [
  {
    slug: 'dry-leaves',
    name: 'Dry autumn leaves',
    category: 'brown',
    cnRatio: 60,
    nitrogenPercentDry: 0.8,
    dryMatterPercent: 85,
    bulkDensityLbPerCuFt: 5,
    note: 'The most useful brown most gardeners have. Shred them or they mat into layers that shed water.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'straw',
    name: 'Straw',
    category: 'brown',
    cnRatio: 75,
    nitrogenPercentDry: 0.7,
    dryMatterPercent: 90,
    bulkDensityLbPerCuFt: 3,
    note: 'Very light, so a bale goes a long way by volume but adds little weight.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'wood-chips',
    name: 'Wood chips',
    category: 'brown',
    cnRatio: 400,
    nitrogenPercentDry: 0.12,
    dryMatterPercent: 70,
    bulkDensityLbPerCuFt: 20,
    note: 'Extremely high carbon and slow to break down. Better as a path or mulch than a compost ingredient.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'sawdust',
    name: 'Sawdust',
    category: 'brown',
    cnRatio: 500,
    nitrogenPercentDry: 0.1,
    dryMatterPercent: 80,
    bulkDensityLbPerCuFt: 15,
    note: 'Use sparingly. Untreated wood only — never sawdust from treated or painted timber.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'shredded-newspaper',
    name: 'Shredded newspaper',
    category: 'brown',
    cnRatio: 175,
    nitrogenPercentDry: 0.25,
    dryMatterPercent: 92,
    bulkDensityLbPerCuFt: 7,
    note: 'Fine shredded, wetted and mixed in. Avoid glossy inserts.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'cardboard',
    name: 'Plain cardboard',
    category: 'brown',
    cnRatio: 350,
    nitrogenPercentDry: 0.14,
    dryMatterPercent: 92,
    bulkDensityLbPerCuFt: 5,
    note: 'Remove tape and labels, tear small and soak first, or it stays dry in the middle.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'pine-needles',
    name: 'Pine needles',
    category: 'brown',
    cnRatio: 80,
    nitrogenPercentDry: 0.6,
    dryMatterPercent: 85,
    bulkDensityLbPerCuFt: 6,
    note: 'Slow to break down and mildly acidic, though the finished compost ends up close to neutral.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'corn-stalks',
    name: 'Corn stalks',
    category: 'brown',
    cnRatio: 75,
    nitrogenPercentDry: 0.6,
    dryMatterPercent: 85,
    bulkDensityLbPerCuFt: 5,
    note: 'Chop or shred. Whole stalks take a year or more.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'shrub-trimmings',
    name: 'Shrub and hedge trimmings',
    category: 'brown',
    cnRatio: 50,
    nitrogenPercentDry: 1,
    dryMatterPercent: 45,
    bulkDensityLbPerCuFt: 12,
    note: 'Green when fresh but woody in the middle. Anything thicker than a pencil needs shredding.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'grass-clippings',
    name: 'Fresh grass clippings',
    category: 'green',
    cnRatio: 20,
    nitrogenPercentDry: 2.4,
    dryMatterPercent: 25,
    bulkDensityLbPerCuFt: 25,
    note: 'Heats a pile fast. In a thick layer on its own it turns into a slimy, airless mat.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'vegetable-scraps',
    name: 'Vegetable and fruit scraps',
    category: 'green',
    cnRatio: 20,
    nitrogenPercentDry: 2.5,
    dryMatterPercent: 15,
    bulkDensityLbPerCuFt: 35,
    note: 'Mostly water. Bury in the middle of the pile so it does not attract animals.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'coffee-grounds',
    name: 'Coffee grounds',
    category: 'green',
    cnRatio: 20,
    nitrogenPercentDry: 2.1,
    dryMatterPercent: 40,
    bulkDensityLbPerCuFt: 40,
    note: 'A green despite the colour. Dense and prone to caking, so mix rather than layer.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'fruit-waste',
    name: 'Orchard fruit waste',
    category: 'green',
    cnRatio: 35,
    nitrogenPercentDry: 1.4,
    dryMatterPercent: 15,
    bulkDensityLbPerCuFt: 35,
    note: 'Windfall apples and similar. Wet and acidic in quantity — mix with plenty of browns.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'cow-manure',
    name: 'Cow manure',
    category: 'green',
    cnRatio: 20,
    nitrogenPercentDry: 2.4,
    dryMatterPercent: 20,
    bulkDensityLbPerCuFt: 45,
    note: 'A reliable nitrogen source. Compost fully before it goes near food crops.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'chicken-manure',
    name: 'Chicken manure',
    category: 'green',
    cnRatio: 7,
    nitrogenPercentDry: 5,
    dryMatterPercent: 30,
    bulkDensityLbPerCuFt: 40,
    note: 'The strongest common green. Enough carbon alongside it or the pile goes ammoniacal.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'horse-manure',
    name: 'Horse manure with bedding',
    category: 'green',
    cnRatio: 25,
    nitrogenPercentDry: 1.8,
    dryMatterPercent: 30,
    bulkDensityLbPerCuFt: 35,
    note: 'The ratio depends on how much bedding came with it. Straw bedding pushes it browner.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'alfalfa-meal',
    name: 'Alfalfa meal',
    category: 'green',
    cnRatio: 12,
    nitrogenPercentDry: 3.5,
    dryMatterPercent: 90,
    bulkDensityLbPerCuFt: 22,
    note: 'A concentrated nitrogen boost for a stalled, carbon-heavy pile.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'seaweed',
    name: 'Seaweed',
    category: 'green',
    cnRatio: 19,
    nitrogenPercentDry: 2.5,
    dryMatterPercent: 20,
    bulkDensityLbPerCuFt: 40,
    note: 'Rinse off salt first. Collect only where it is legal to do so.',
    source: CHECK,
    verified: false,
  },
  {
    slug: 'fresh-weeds',
    name: 'Fresh green weeds',
    category: 'green',
    cnRatio: 20,
    nitrogenPercentDry: 2.5,
    dryMatterPercent: 20,
    bulkDensityLbPerCuFt: 20,
    note: 'Fine before they seed. Perennial roots and seed heads survive a cool pile.',
    source: CHECK,
    verified: false,
  },
];

/** The target band for an active pile, widely given as roughly 25–30:1. */
export const TARGET_CN_RATIO = { min: 25, max: 30 } as const;

export function getCompostMaterial(slug: string): CompostMaterial | undefined {
  return compostMaterials.find((material) => material.slug === slug);
}
