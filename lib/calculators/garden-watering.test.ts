import { describe, expect, it } from 'vitest';
import { calculateGardenWatering } from './garden-watering';

const base = {
  units: 'imperial',
  area: 100,
  waterPerWeek: 1,
  rainfall: 0,
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateGardenWatering', () => {
  it('needs 62.34 gallons for an inch over 100 square feet', () => {
    const result = value(calculateGardenWatering(base));
    expect(result.gallons).toBeCloseTo(62.34, 1);
    expect(result.liters).toBeCloseTo(235.9, 0);
  });

  it('subtracts rainfall from the target', () => {
    const result = value(calculateGardenWatering({ ...base, rainfall: 0.4 }));
    expect(result.netInches).toBeCloseTo(0.6, 6);
    expect(result.gallons).toBeCloseTo(37.4, 1);
  });

  it('never returns a negative requirement when it has rained more than needed', () => {
    const result = value(calculateGardenWatering({ ...base, rainfall: 3 }));
    expect(result.netInches).toBe(0);
    expect(result.gallons).toBe(0);
    expect(result.rainfallCoveredIt).toBe(true);
    expect(result.notes.join(' ')).toContain('no watering is needed');
  });

  it('splits the week into two soakings', () => {
    const result = value(calculateGardenWatering(base));
    expect(result.sessionsPerWeek).toBe(2);
    expect(result.gallonsPerSession).toBeCloseTo(31.17, 1);
  });

  it('scales with area', () => {
    const result = value(calculateGardenWatering({ ...base, area: 400 }));
    expect(result.gallons).toBeCloseTo(249.4, 0);
  });

  it('agrees between imperial and metric', () => {
    const imperial = value(calculateGardenWatering(base));
    // 100 sq ft = 9.2903 m2, 1 inch = 25.4 mm
    const metric = value(
      calculateGardenWatering({ ...base, units: 'metric', area: 9.2903, waterPerWeek: 25.4 }),
    );
    expect(metric.liters).toBeCloseTo(imperial.liters, 0);
    expect(metric.netMillimeters).toBeCloseTo(25.4, 1);
  });

  it('treats a millimetre over a square metre as one liter', () => {
    const result = value(
      calculateGardenWatering({ ...base, units: 'metric', area: 10, waterPerWeek: 10 }),
    );
    expect(result.liters).toBeCloseTo(100, 1);
  });

  it('warns about an implausibly high weekly target', () => {
    const result = value(calculateGardenWatering({ ...base, waterPerWeek: 3 }));
    expect(result.notes.join(' ')).toContain('a lot for most vegetables');
  });

  it('accepts zero rainfall but rejects negative rainfall', () => {
    expect(calculateGardenWatering({ ...base, rainfall: 0 }).ok).toBe(true);
    const result = calculateGardenWatering({ ...base, rainfall: -1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Rainfall in inches cannot be negative');
    }
  });

  it('rejects an area of zero and a target of zero', () => {
    const result = calculateGardenWatering({ ...base, area: 0, waterPerWeek: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual(['area', 'waterPerWeek']);
    }
  });

  it('stays finite for a very large plot', () => {
    const result = value(calculateGardenWatering({ ...base, area: 1e9 }));
    expect(Number.isFinite(result.gallons)).toBe(true);
    expect(Number.isNaN(result.liters)).toBe(false);
  });
});
