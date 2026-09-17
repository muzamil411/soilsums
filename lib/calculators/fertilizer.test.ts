import { describe, expect, it } from 'vitest';
import { calculateFertilizer } from './fertilizer';

const base = {
  units: 'imperial',
  area: 1000,
  label: { n: 10, p: 10, k: 10 },
  nutrient: 'nitrogen',
  targetRate: 1,
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateFertilizer', () => {
  it('needs 10 lb of 10-10-10 for 1 lb of nitrogen per 1,000 sq ft', () => {
    const result = value(calculateFertilizer(base));
    expect(result.productPounds).toBe(10);
  });

  it('scales with area', () => {
    const result = value(calculateFertilizer({ ...base, area: 2500 }));
    expect(result.productPounds).toBe(25);
  });

  it('needs less of a more concentrated product', () => {
    const urea = value(calculateFertilizer({ ...base, label: { n: 46, p: 0, k: 0 } }));
    expect(urea.productPounds).toBeCloseTo(2.174, 3);
  });

  it('reports the phosphate and potash that come along with the nitrogen', () => {
    const result = value(calculateFertilizer(base));
    const supplied = Object.fromEntries(
      result.supplied.map((entry) => [entry.nutrient, entry.pounds]),
    );
    expect(supplied.nitrogen).toBe(1);
    expect(supplied.phosphate).toBe(1);
    expect(supplied.potash).toBe(1);
  });

  it('shows the uneven supply from an uneven label', () => {
    // Targeting 1 lb N from a 24-8-16 also drops 0.33 lb phosphate.
    const result = value(calculateFertilizer({ ...base, label: { n: 24, p: 8, k: 16 } }));
    expect(result.productPounds).toBeCloseTo(4.167, 3);
    const supplied = Object.fromEntries(
      result.supplied.map((entry) => [entry.nutrient, entry.pounds]),
    );
    expect(supplied.nitrogen).toBeCloseTo(1, 3);
    expect(supplied.phosphate).toBeCloseTo(0.3333, 3);
    expect(supplied.potash).toBeCloseTo(0.6667, 3);
  });

  it('can target phosphate or potash instead of nitrogen', () => {
    const potash = value(
      calculateFertilizer({ ...base, label: { n: 24, p: 8, k: 16 }, nutrient: 'potash' }),
    );
    expect(potash.productPounds).toBeCloseTo(6.25, 3);
  });

  it('agrees between imperial and metric', () => {
    const imperial = value(calculateFertilizer(base));
    // 1000 sq ft = 92.903 m2; 1 lb/1000 sq ft = 0.4882 kg/100 m2
    const metric = value(
      calculateFertilizer({ ...base, units: 'metric', area: 92.903, targetRate: 0.48824 }),
    );
    expect(metric.productPounds).toBeCloseTo(imperial.productPounds, 2);
    expect(metric.productKilograms).toBeCloseTo(4.536, 2);
  });

  it('refuses to meet a nitrogen target with a product containing no nitrogen', () => {
    const result = calculateFertilizer({ ...base, label: { n: 0, p: 46, k: 0 } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('supplies no nitrogen');
    }
  });

  it('rejects a label whose numbers exceed 100 percent in total', () => {
    const result = calculateFertilizer({ ...base, label: { n: 50, p: 40, k: 30 } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('more than 100%');
    }
  });

  it('rejects a negative label percentage', () => {
    const result = calculateFertilizer({ ...base, label: { n: -10, p: 10, k: 10 } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('label.n');
    }
  });

  it('rejects an area of zero and a target rate of zero', () => {
    const result = calculateFertilizer({ ...base, area: 0, targetRate: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual(['area', 'targetRate']);
    }
  });

  it('stays finite for a huge plot and a trace nutrient percentage', () => {
    const result = value(
      calculateFertilizer({ ...base, area: 1e9, label: { n: 0.01, p: 0, k: 0 } }),
    );
    expect(Number.isFinite(result.productPounds)).toBe(true);
    expect(Number.isNaN(result.productPounds)).toBe(false);
  });
});
