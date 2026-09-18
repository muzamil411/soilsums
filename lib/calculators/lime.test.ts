import { describe, expect, it } from 'vitest';
import { calculateLime } from './lime';

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

  it('keeps a correction at or under 100 lb per 1,000 sq ft in one application', () => {
    // clay, 1.0 unit: 95 lb per 1,000 sq ft, just inside Penn State's ceiling.
    const result = value(calculateLime({ ...base, texture: 'clay' }));
    expect(result.lbPer1000SqFt).toBe(95);
    expect(result.applications).toBe(1);
    expect(result.poundsPerApplication).toBe(95);
  });

  it('splits a correction that exceeds the single-application limit', () => {
    // clay, 1.5 units: 142.5 lb per 1,000 sq ft, over the ceiling.
    const result = value(calculateLime({ ...base, texture: 'clay', targetPh: 7 }));
    expect(result.lbPer1000SqFt).toBe(142.5);
    expect(result.applications).toBe(2);
    expect(result.poundsPerApplication).toBe(71.3);
  });

  it('splits on the rate, not the total, so a small bed at a heavy rate still splits', () => {
    const result = value(calculateLime({ ...base, area: 100, texture: 'clay', targetPh: 7 }));
    expect(result.pounds).toBe(14.25);
    expect(result.applications).toBe(2);
  });

  it('needs three applications for a very large correction', () => {
    const result = value(calculateLime({ ...base, texture: 'clay', currentPh: 4, targetPh: 6.5 }));
    expect(result.lbPer1000SqFt).toBe(237.5);
    expect(result.applications).toBe(3);
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
