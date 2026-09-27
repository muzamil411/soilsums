/**
 * Bulk densities for soil and compost, and the reason a single weight for "a
 * yard of dirt" cannot honestly be printed.
 *
 * Every competing calculator gives one confident number. That number is wrong
 * for most readers, and the interesting part is why:
 *
 *  - **Compost** is published by weight per cubic yard, as supplied, so a range
 *    here is a real answer. Oregon State gives about 1,000 lb per cubic yard as
 *    a rule of thumb for screened compost at 50% moisture, with the full range
 *    running from 800 to more than 1,600 depending on moisture, particle size
 *    and compaction.
 *  - **Soil** is published by texture, in grams per cubic centimetre, for soil
 *    IN PLACE — undisturbed, in the ground. That is not the same material as
 *    loose screened topsoil tipped onto a driveway. Delivered material is
 *    looser and its moisture varies enormously, so an in-place figure is an
 *    upper bound rather than an estimate.
 *
 * No extension service publishes a weight for a yard of delivered topsoil,
 * because it is not a property of soil: it is a property of one supplier's pile
 * on one day. Where the number matters — a truck payload, a floor loading, a
 * raised bed on a balcony — the only reliable figure is the supplier's own.
 */

import {
  FEET_PER_YARD,
  KILOGRAMS_PER_POUND,
  METERS_PER_FOOT,
} from '@/lib/calculators/shared/units';

export type DensitySource = {
  readonly institution: string;
  readonly title: string;
  readonly url: string;
};

/**
 * Pounds per cubic yard for a material of 1 g/cm3.
 *
 * Exact arithmetic from the definitions rather than a quoted constant: a cubic
 * yard is (3 x 0.3048) metres cubed, 1 g/cm3 is 1000 kg/m3, and a pound is
 * 0.45359237 kg. Comes out at 1685.55, so 1.40 g/cm3 is about 2,360 lb per
 * cubic yard and 1.10 is about 1,854.
 */
export const LB_PER_CUBIC_YARD_PER_G_PER_CM3 =
  (1000 * (FEET_PER_YARD * METERS_PER_FOOT) ** 3) / KILOGRAMS_PER_POUND;

export function gramsPerCm3ToLbPerCubicYard(value: number): number {
  return value * LB_PER_CUBIC_YARD_PER_G_PER_CM3;
}

export const COMPOST_SOURCE: DensitySource = {
  institution: 'Oregon State University Extension',
  title: 'EM 9217, Interpreting compost analyses',
  url: 'https://extension.oregonstate.edu/catalog/pub/em-9217-interpreting-compost-analyses',
};

export const SOIL_SOURCE: DensitySource = {
  institution: 'USDA Natural Resources Conservation Service',
  title: 'Soil Health — Bulk Density',
  url: 'https://www.nrcs.usda.gov/sites/default/files/2022-10/Soil%20Bulk%20Density%20Moisture%20Aeration.pdf',
};

/**
 * Screened compost, as supplied. Oregon State's own figures, in lb per cubic
 * yard, so no conversion is involved.
 */
export const COMPOST_DENSITY = {
  /** The rule of thumb: screened compost at 50% moisture. */
  typicalLbPerCubicYard: 1000,
  /** Oregon State's full published range. The high end is "more than 1,600". */
  lowLbPerCubicYard: 800,
  highLbPerCubicYard: 1600,
  /** Very wet composts, which Oregon State says can exceed this. */
  veryWetLbPerCubicYard: 1500,
  source: COMPOST_SOURCE,
  verified: true,
} as const;

export type SoilTexture = {
  readonly slug: string;
  readonly name: string;
  /** NRCS: ideal bulk density for plant growth is below this, in g/cm3. */
  readonly idealBelow: number;
  /** NRCS: root growth is restricted above this, in g/cm3. */
  readonly restrictingAbove: number;
};

/**
 * NRCS ideal and root-restricting bulk densities by texture, in g/cm3.
 *
 * Read as a pair: a soil below `idealBelow` is in good condition for roots, and
 * one above `restrictingAbove` restricts them. The span between the two is the
 * honest range of what soil of that texture actually weighs in the ground, from
 * well-structured to compacted.
 *
 * The published table does not apply to red clayey soils or to volcanic ash
 * soils, which the page says rather than quietly extending it to them.
 */
export const SOIL_TEXTURES: readonly SoilTexture[] = [
  { slug: 'sand', name: 'Sand or loamy sand', idealBelow: 1.6, restrictingAbove: 1.8 },
  { slug: 'sandy-loam', name: 'Sandy loam or loam', idealBelow: 1.4, restrictingAbove: 1.8 },
  {
    slug: 'sandy-clay-loam',
    name: 'Sandy clay loam or clay loam',
    idealBelow: 1.4,
    restrictingAbove: 1.75,
  },
  { slug: 'silt', name: 'Silt or silt loam', idealBelow: 1.4, restrictingAbove: 1.75 },
  {
    slug: 'silty-clay-loam',
    name: 'Silt loam or silty clay loam',
    idealBelow: 1.4,
    restrictingAbove: 1.65,
  },
  {
    slug: 'silty-clay',
    name: 'Sandy clay, silty clay or clay loam',
    idealBelow: 1.1,
    restrictingAbove: 1.58,
  },
  { slug: 'clay', name: 'Clay, under 45% clay', idealBelow: 1.1, restrictingAbove: 1.47 },
] as const;

export function getSoilTexture(slug: string): SoilTexture | undefined {
  return SOIL_TEXTURES.find((texture) => texture.slug === slug);
}

/** The exclusion NRCS states, carried wherever the table is shown. */
export const SOIL_TABLE_EXCLUSION =
  'The NRCS table does not apply to red clayey soils or to soils formed from volcanic ash.';

/** Why the tool refuses to print one weight, in one sentence, used on both pages. */
export const WEIGHT_CAVEAT =
  'These are bulk densities for soil in place, in the ground — not for loose screened topsoil tipped onto a driveway, which is looser and varies enormously with moisture. Treat the figures as an upper bound, and where the weight actually matters ask your supplier what their material weighs.';
