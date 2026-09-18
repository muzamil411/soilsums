/**
 * Wording for per-square planting densities, shared by the crop pages and the
 * square foot garden planner so they never describe the same crop differently.
 *
 * Two different quantities end up in the same sentence position, and the site
 * is careful to keep them apart:
 *
 *  - the density implied by a crop's in-row spacing, which is arithmetic;
 *  - the square foot gardening figure, which is a convention from Mel
 *    Bartholomew's method as listed by Cornell CALS, not a research finding.
 */

/** "4 per square", or "1 per 4 squares" for anything needing more than one. */
export function perSquare(density: number): string {
  if (density >= 1) {
    return `${density} per square`;
  }
  const squares = Math.ceil(1 / density);
  return `1 per ${squares} square${squares === 1 ? '' : 's'}`;
}

/** The one-line note that keeps the two figures from being read as one claim. */
export const DENSITY_NOTE =
  'Square foot gardening figures come from Mel Bartholomew’s method and assume an intensive bed of amended soil. Spacing-derived figures assume conventional rows.';
