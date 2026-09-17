/**
 * Container presets for the potting soil calculator.
 *
 * Nominal sizes only — pots vary between makers, and most taper, so a measured
 * pot beats a preset. Dimensions are the inside measurements that matter for
 * volume: the width across the top of the soil and the depth you will fill to.
 *
 * These are product conventions, not agronomic data, so they carry no
 * verification flag. The one figure worth knowing is that US nursery "gallon"
 * sizes are trade sizes, not liquid gallons: a #1 "one gallon" pot typically
 * holds around 0.7 US liquid gallons.
 */
export type ContainerShape = 'round' | 'square' | 'rectangular' | 'half-barrel';

export type ContainerPreset = {
  readonly slug: string;
  readonly name: string;
  readonly shape: ContainerShape;
  /** Inches. Diameter for round and half-barrel, side for square. */
  readonly widthInches: number;
  /** Inches. Only used by rectangular containers. */
  readonly lengthInches?: number;
  /** Inches of soil depth, not the full height of the pot. */
  readonly depthInches: number;
  readonly note: string;
};

export const containerPresets: readonly ContainerPreset[] = [
  {
    slug: 'pot-6in',
    name: '6 inch pot',
    shape: 'round',
    widthInches: 6,
    depthInches: 5,
    note: 'A herb or a single annual.',
  },
  {
    slug: 'pot-8in',
    name: '8 inch pot',
    shape: 'round',
    widthInches: 8,
    depthInches: 7,
    note: 'Lettuce, a compact pepper, or a small group of herbs.',
  },
  {
    slug: 'pot-10in',
    name: '10 inch pot',
    shape: 'round',
    widthInches: 10,
    depthInches: 9,
    note: 'One pepper or a bushy herb such as basil.',
  },
  {
    slug: 'pot-12in',
    name: '12 inch pot',
    shape: 'round',
    widthInches: 12,
    depthInches: 10,
    note: 'About the minimum for a determinate tomato.',
  },
  {
    slug: 'pot-14in',
    name: '14 inch pot',
    shape: 'round',
    widthInches: 14,
    depthInches: 12,
    note: 'Comfortable for a tomato, an aubergine or a dwarf shrub.',
  },
  {
    slug: 'pot-nursery-1gal',
    name: 'Nursery #1 (trade gallon)',
    shape: 'round',
    widthInches: 6.5,
    depthInches: 6.5,
    note: 'A trade size, not a liquid gallon — it holds roughly 0.7 US gallons.',
  },
  {
    slug: 'pot-nursery-5gal',
    name: 'Nursery #5 (trade 5 gallon)',
    shape: 'round',
    widthInches: 11,
    depthInches: 11,
    note: 'Around 3.5 to 4 US gallons in practice.',
  },
  {
    slug: 'window-box-24in',
    name: '24 inch window box',
    shape: 'rectangular',
    widthInches: 7,
    lengthInches: 24,
    depthInches: 6,
    note: 'Shallow, so it dries out fast in summer.',
  },
  {
    slug: 'window-box-36in',
    name: '36 inch window box',
    shape: 'rectangular',
    widthInches: 8,
    lengthInches: 36,
    depthInches: 7,
    note: 'Salad leaves, herbs and trailing flowers.',
  },
  {
    slug: 'grow-bag-large',
    name: 'Large grow bag',
    shape: 'rectangular',
    widthInches: 14,
    lengthInches: 36,
    depthInches: 9,
    note: 'The standard UK grow bag footprint — two or three tomatoes.',
  },
  {
    slug: 'half-barrel',
    name: 'Half barrel',
    shape: 'half-barrel',
    widthInches: 26,
    depthInches: 16,
    note: 'Takes a lot of mix. A whippy tomato, a small fruit bush or a mixed planting.',
  },
  {
    slug: 'planter-square-16in',
    name: '16 inch square planter',
    shape: 'square',
    widthInches: 16,
    depthInches: 14,
    note: 'Roughly the volume of a half barrel, in a squarer footprint.',
  },
];

export function getContainerPreset(slug: string): ContainerPreset | undefined {
  return containerPresets.find((preset) => preset.slug === slug);
}
