import { describe, expect, it } from 'vitest';
import { calculateLime } from './lime';
import {
  CAUSTIC_CEILING_LB_PER_1000SQFT,
  CEILING_AGREEMENT,
  CONSERVATIVE_CEILING_LB_PER_1000SQFT,
  LAWN_LIME_CEILINGS,
  LAWN_PH_OVERLAP,
  LAWN_PH_OVERLAP_LABEL,
  LAWN_PH_TARGETS,
} from '@/data/lime-rates';

const base = {
  units: 'imperial',
  area: 1000,
  currentPh: 5.5,
  targetPh: 6.5,
  texture: 'loam',
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateLime', () => {
  it('uses the loam rate for a one-unit change over 1,000 sq ft', () => {
    const result = value(calculateLime(base));
    expect(result.phChange).toBe(1);
    expect(result.pounds).toBe(60);
  });

  it('carries the published spread for the texture alongside the figure', () => {
    const result = value(calculateLime(base));
    expect(result.poundsRange).toEqual([45, 75]);
    expect(result.pounds).toBeGreaterThanOrEqual(result.poundsRange[0]);
    expect(result.pounds).toBeLessThanOrEqual(result.poundsRange[1]);
  });

  it('scales the range with area and pH change, like the midpoint', () => {
    const result = value(calculateLime({ ...base, area: 500, targetPh: 7.5 }));
    // loam 45-75 lb/1,000 sq ft/unit x 2.0 units x 0.5 thousand sq ft
    expect(result.poundsRange).toEqual([45, 75]);
    expect(result.pounds).toBe(60);
  });

  it('needs less on sand and more on clay for the same change', () => {
    const sandy = value(calculateLime({ ...base, texture: 'sandy' }));
    const clay = value(calculateLime({ ...base, texture: 'clay' }));
    expect(sandy.pounds).toBe(25);
    expect(clay.pounds).toBe(95);
    expect(sandy.poundsRange).toEqual([20, 30]);
    expect(clay.poundsRange).toEqual([90, 100]);
    expect(sandy.pounds).toBeLessThan(clay.pounds);
  });

  it('scales with area', () => {
    const result = value(calculateLime({ ...base, area: 250 }));
    expect(result.pounds).toBe(15);
  });

  /**
   * These four assert the CONSERVATIVE ceiling, Maryland's 50 lb per 1,000 sq
   * ft, not Penn State's 100. The two publications disagree by a factor of two
   * and the calculator deliberately takes the safer one: exceeding a ceiling
   * harms the lawn, while staying under it only means waiting six months for the
   * second half. They were written against 100 and moved when that decision was
   * taken.
   */
  it('keeps a correction at or under the conservative ceiling in one application', () => {
    // sandy, 1.0 unit: 25 lb per 1,000 sq ft, well inside Maryland's 50.
    const result = value(calculateLime({ ...base, texture: 'sandy' }));
    expect(result.lbPer1000SqFt).toBe(25);
    expect(result.applications).toBe(1);
    expect(result.poundsPerApplication).toBe(25);
  });

  it('splits a correction that exceeds the conservative ceiling', () => {
    // clay, 1.0 unit: 95 lb per 1,000 sq ft. Inside Penn State's 100 and over
    // Maryland's 50, which is exactly the case the two publications disagree on.
    const result = value(calculateLime({ ...base, texture: 'clay' }));
    expect(result.lbPer1000SqFt).toBe(95);
    expect(result.applications).toBe(2);
    expect(result.poundsPerApplication).toBe(47.5);
  });

  it('splits on the rate, not the total, so a small bed at a heavy rate still splits', () => {
    const result = value(calculateLime({ ...base, area: 100, texture: 'clay', targetPh: 7 }));
    expect(result.pounds).toBe(14.25);
    expect(result.applications).toBe(3);
  });

  it('needs more applications the larger the correction', () => {
    const result = value(calculateLime({ ...base, texture: 'clay', currentPh: 4, targetPh: 6.5 }));
    expect(result.lbPer1000SqFt).toBe(237.5);
    expect(result.applications).toBe(5);
  });

  it('scales with the size of the pH change', () => {
    const half = value(calculateLime({ ...base, targetPh: 6 }));
    expect(half.phChange).toBe(0.5);
    expect(half.pounds).toBe(30);
    expect(half.poundsRange).toEqual([22.5, 37.5]);
  });

  it('agrees between imperial and metric', () => {
    const imperial = value(calculateLime(base));
    const metric = value(calculateLime({ ...base, units: 'metric', area: 92.903 }));
    expect(metric.pounds).toBeCloseTo(imperial.pounds, 2);
    expect(metric.kilograms).toBeCloseTo(27.22, 1);
    expect(metric.kilogramsRange[0]).toBeCloseTo(20.41, 1);
    expect(metric.kilogramsRange[1]).toBeCloseTo(34.02, 1);
  });

  it('warns when the requested change is too big to trust', () => {
    const result = value(calculateLime({ ...base, currentPh: 4.5, targetPh: 6.5 }));
    expect(result.phChange).toBe(2);
    expect(result.warnings.join(' ')).toContain('more than this estimate can be trusted for');
  });

  it('warns that liming above pH 6.5 is rarely needed', () => {
    const result = value(calculateLime({ ...base, currentPh: 6.6, targetPh: 7 }));
    expect(result.warnings.join(' ')).toContain('no lime at all');
  });

  it('gives no warnings for an ordinary correction', () => {
    expect(value(calculateLime(base)).warnings).toEqual([]);
  });

  it('points at sulfur when the target is below the current pH', () => {
    const result = calculateLime({ ...base, currentPh: 7.2, targetPh: 6.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('elemental sulfur');
    }
  });

  it('says nothing is needed when target and current pH match', () => {
    const result = calculateLime({ ...base, currentPh: 6.5, targetPh: 6.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('no lime is needed');
    }
  });

  it('rejects a pH outside the plausible range', () => {
    const result = calculateLime({ ...base, currentPh: 0, targetPh: 14 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual(['currentPh', 'targetPh']);
    }
  });

  it('rejects an area of zero', () => {
    const result = calculateLime({ ...base, area: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Enter a area in square feet greater than 0');
    }
  });

  it('stays finite for a very large field', () => {
    const result = value(calculateLime({ ...base, area: 1e9 }));
    expect(Number.isFinite(result.pounds)).toBe(true);
  });
});

/**
 * The ceiling the calculator applies is derived, and the derivation has to
 * ignore the caustic materials.
 *
 * Ohio State publishes its ceilings per material — 50 lb per 1,000 sq ft for
 * ground, dolomitic and pelletized limestone, 20 for hydrated lime, 10 for
 * burned — and Colorado caps hydrated or burned lime at 10. A `Math.min` across
 * the whole list would therefore cap a limestone user at 10 lb and split a
 * routine correction into five applications, so the filter is load-bearing
 * rather than tidy. This fails if a caustic figure ever reaches the calculator's
 * cap, and if the conservative choice stops being the conservative one.
 */
describe('the derived single-application ceiling', () => {
  it('is the lowest published figure for a limestone, not for any lime', () => {
    const limestone = LAWN_LIME_CEILINGS.filter((ceiling) => !ceiling.caustic).map(
      (ceiling) => ceiling.lbPer1000SqFt,
    );

    expect(CONSERVATIVE_CEILING_LB_PER_1000SQFT).toBe(Math.min(...limestone));
    expect(CONSERVATIVE_CEILING_LB_PER_1000SQFT).toBe(50);
  });

  it('is not dragged down by a caustic material', () => {
    const caustic = LAWN_LIME_CEILINGS.filter((ceiling) => ceiling.caustic);

    expect(caustic.length).toBeGreaterThan(0);
    expect(CAUSTIC_CEILING_LB_PER_1000SQFT).toBeLessThan(CONSERVATIVE_CEILING_LB_PER_1000SQFT);
    expect(
      CONSERVATIVE_CEILING_LB_PER_1000SQFT,
      'a caustic ceiling has reached the calculator, which prices limestone only',
    ).toBeGreaterThan(Math.min(...caustic.map((ceiling) => ceiling.lbPer1000SqFt)));
  });

  it('is the figure three of the four publications give', () => {
    expect(CEILING_AGREEMENT.length).toBe(3);
    expect(CEILING_AGREEMENT).not.toContain('Penn State Extension');
    for (const institution of CEILING_AGREEMENT) {
      const theirs = LAWN_LIME_CEILINGS.filter(
        (ceiling) => ceiling.institution === institution && !ceiling.caustic,
      );
      expect(theirs.every((ceiling) => ceiling.lbPer1000SqFt === 50)).toBe(true);
    }
  });

  it('keeps the three services pH ranges overlapping where the pages say they do', () => {
    expect(LAWN_PH_OVERLAP_LABEL).toBe('6.0 to 6.8');
    const general = LAWN_PH_TARGETS.filter((target) => target.scope === 'general');
    expect(general.length).toBe(3);
    for (const target of general) {
      expect(target.range[0]).toBeLessThanOrEqual(LAWN_PH_OVERLAP[0]);
      expect(target.range[1]).toBeGreaterThanOrEqual(LAWN_PH_OVERLAP[1]);
    }
  });
});
