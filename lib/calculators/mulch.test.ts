import { describe, expect, it } from 'vitest';
import { calculateMulch } from './mulch';

const base = {
  units: 'imperial',
  mode: 'area',
  area: 200,
  depth: 3,
  bagSize: 2,
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateMulch', () => {
  it('spreads 200 square feet at 3 inches', () => {
    const result = value(calculateMulch(base));
    // 200 x 3 / 12 = 50 cu ft
    expect(result.cubicFeet).toBe(50);
    expect(result.cubicYards).toBeCloseTo(1.85, 2);
    expect(result.bags).toBe(25);
  });

  it('halves the volume when the depth is halved', () => {
    const deep = value(calculateMulch({ ...base, depth: 4 }));
    const shallow = value(calculateMulch({ ...base, depth: 2 }));
    expect(deep.cubicFeet).toBeCloseTo(shallow.cubicFeet * 2, 1);
  });

  it('accepts bed dimensions instead of an area', () => {
    const result = value(
      calculateMulch({ ...base, mode: 'rectangle', area: undefined, length: 20, width: 10 }),
    );
    expect(result.areaSquareFeet).toBe(200);
    expect(result.cubicFeet).toBe(50);
  });

  it('handles a circular bed', () => {
    const result = value(
      calculateMulch({ ...base, mode: 'circle', area: undefined, diameter: 10, depth: 3 }),
    );
    // pi x 5^2 = 78.54 sq ft, x 3 / 12 = 19.63 cu ft
    expect(result.areaSquareFeet).toBeCloseTo(78.54, 1);
    expect(result.cubicFeet).toBeCloseTo(19.63, 1);
  });

  it('reports how far one bag goes at the chosen depth', () => {
    const result = value(calculateMulch(base));
    // A 2 cu ft bag at 3 inches covers 2 x 12 / 3 = 8 sq ft
    expect(result.squareFeetPerBag).toBe(8);
  });

  it('agrees between imperial and metric for the same bed', () => {
    const imperial = value(calculateMulch(base));
    // 200 sq ft = 18.5806 m2, 3 in = 7.62 cm
    const metric = value(
      calculateMulch({ ...base, units: 'metric', area: 18.5806, depth: 7.62, bagSize: 50 }),
    );
    expect(metric.cubicFeet).toBeCloseTo(imperial.cubicFeet, 2);
    expect(metric.liters).toBeCloseTo(1415.84, 0);
    expect(metric.bags).toBe(29);
  });

  it('rejects a depth of zero', () => {
    const result = calculateMulch({ ...base, depth: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Enter a depth greater than 0');
    }
  });

  it('rejects a negative area', () => {
    const result = calculateMulch({ ...base, area: -10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('area');
    }
  });

  it('rejects a bag size of zero rather than dividing by it', () => {
    const result = calculateMulch({ ...base, bagSize: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('bagSize');
    }
  });

  it('stays finite for very large beds', () => {
    const result = value(calculateMulch({ ...base, area: 1e9, depth: 1e6 }));
    expect(Number.isFinite(result.cubicFeet)).toBe(true);
    expect(Number.isFinite(result.bags)).toBe(true);
  });
});
