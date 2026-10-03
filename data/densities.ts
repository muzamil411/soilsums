/**
 * Bulk densities for compost, and why soil has no entry here.
 *
 * Every competing calculator gives one confident weight for "a yard of dirt".
 * That number is wrong for most readers, and the interesting part is why:
 *
 *  - **Compost** is published by weight per cubic yard, as supplied, so a range
 *    here is a real answer. Oregon State gives about 1,000 lb per cubic yard as
 *    a rule of thumb for screened compost at 50% moisture, with the full range
 *    running from 800 to more than 1,600 depending on moisture, particle size
 *    and compaction.
 *  - **Soil** has no entry, deliberately. No extension service publishes a
 *    weight per cubic yard for delivered topsoil, because it is not a property
 *    of soil: it is a property of one supplier's pile on one day.
 *
 * An earlier version of this file carried the USDA NRCS texture table (ideal
 * and root-restricting bulk densities in g/cm3) and the calculator converted
 * those thresholds into a delivered-weight range. That was a misuse, and it is
 * removed: the NRCS table diagnoses compaction in undisturbed field soil,
 * measured ovendry. Its "ideal below" is not a minimum weight, its
 * "restricting above" is not a maximum, and a wet delivered pile can outweigh
 * the dry-basis figure. The calculator now prints a soil weight only from a
 * supplier-quoted figure the reader enters. Do not re-add a texture table here
 * as a weight source.
 *
 * Where the number matters — a truck payload, a floor loading, a raised bed on
 * a balcony — the only reliable figure is the supplier's own.
 */

export type DensitySource = {
  readonly institution: string;
  readonly title: string;
  readonly url: string;
};

export const COMPOST_SOURCE: DensitySource = {
  institution: 'Oregon State University Extension',
  title: 'EM 9217, Interpreting compost analyses',
  url: 'https://extension.oregonstate.edu/catalog/pub/em-9217-interpreting-compost-analyses',
};

/**
 * Screened compost, as supplied. Oregon State's own figures, in lb per cubic
 * yard, so no conversion is involved.
 *
 * The published range is "800 to more than 1,600" — 1,600 is where Oregon
 * State's published range stops, not where compost stops. Very wet composts
 * exceed 1,600, so the high end is open: the calculator renders it with a "+"
 * and never presents 1,600 as a maximum or a safe load.
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
