/** Rounding helpers. Every number a calculator returns has passed through one. */

/** Rounds to `places` decimals, and never returns -0. */
export function round(value: number, places = 2): number {
  const factor = 10 ** places;
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded;
}

/** Bags, plants and pots come in whole units, and you cannot buy 0.4 of a bag. */
export function roundUp(value: number): number {
  return Math.ceil(round(value, 6));
}

/**
 * Significant-figure rounding for results that span orders of magnitude, so a
 * tiny pot does not report 0 and a field does not report 14 digits.
 */
export function toSignificant(value: number, digits = 3): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const places = Math.max(0, digits - 1 - magnitude);
  return round(value, Math.min(places, 10));
}
