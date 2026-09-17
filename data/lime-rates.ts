/**
 * Limestone requirement by soil texture, in pounds of ground agricultural
 * limestone per 1,000 square feet to raise pH by one unit in the top 6–7
 * inches of soil.
 *
 * IMPORTANT, and repeated on the calculator page: these are rough guides only.
 * The amount of lime a soil actually needs depends on its buffering capacity —
 * how strongly it resists a pH change — which is driven by clay content and
 * organic matter and cannot be seen from a pH reading. Two soils reading the
 * same pH can need substantially different amounts of lime. A soil test that
 * reports buffer pH or a direct lime recommendation is worth far more than any
 * calculator.
 *
 * The calculator treats the requirement as linear in the pH change, which is
 * an approximation. It is reasonable over a change of about one unit and gets
 * progressively less reliable beyond that, so the tool warns above 1.5 units.
 *
 * Every figure is `verified: false`.
 */
export type SoilTexture = 'sandy' | 'loam' | 'clay';

export type LimeRate = {
  readonly slug: SoilTexture;
  readonly name: string;
  readonly description: string;
  /** Pounds of ground limestone per 1,000 sq ft per 1.0 pH unit increase. */
  readonly lbPer1000SqFtPerPhUnit: number;
  readonly source: string;
  readonly verified: boolean;
};

const CHECK =
  'Verify against: your state extension service lime recommendation table, and prefer a soil test buffer pH reading';

export const limeRates: readonly LimeRate[] = [
  {
    slug: 'sandy',
    name: 'Sandy',
    description:
      'Gritty, drains fast, does not hold a ball when squeezed damp. Little buffering, so it shifts pH with less lime — and drifts back sooner.',
    lbPer1000SqFtPerPhUnit: 30,
    source: CHECK,
    verified: false,
  },
  {
    slug: 'loam',
    name: 'Loam',
    description:
      'Holds together when squeezed but crumbles when poked. The middle of the range in both texture and lime requirement.',
    lbPer1000SqFtPerPhUnit: 60,
    source: CHECK,
    verified: false,
  },
  {
    slug: 'clay',
    name: 'Clay',
    description:
      'Sticky when wet, hard when dry, ribbons between finger and thumb. Strongly buffered, so it needs the most lime and holds the change longest.',
    lbPer1000SqFtPerPhUnit: 90,
    source: CHECK,
    verified: false,
  },
];

/**
 * Above this pH change the linear assumption stops being defensible and the
 * calculator says so rather than quietly extrapolating.
 */
export const MAX_RELIABLE_PH_CHANGE = 1.5;

/** Practical pH bounds for the inputs. Soils outside this are exceptional. */
export const PH_RANGE = { min: 3.5, max: 9 } as const;

export function getLimeRate(texture: SoilTexture): LimeRate | undefined {
  return limeRates.find((rate) => rate.slug === texture);
}
