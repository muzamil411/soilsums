import { describe, expect, it } from 'vitest';
import { calculatePottingSoil } from './potting-soil';

const base = {
  units: 'imperial',
  shape: 'round',
  width: 12,
  depth: 10,
  quantity: 1,
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculatePottingSoil', () => {
  it('fills a 12 inch pot 10 inches deep', () => {
    const result = value(calculatePottingSoil(base));
    // pi x 6^2 x 10 = 1130.97 cu in / 1728 = 0.6545 cu ft
    expect(result.cubicFeet).toBeCloseTo(0.654, 2);
    expect(result.dryQuarts).toBeCloseTo(16.8, 1);
    expect(result.usGallons).toBeCloseTo(4.9, 1);
  });

  it('reports dry quarts as the headline, not liquid quarts', () => {
    const result = value(calculatePottingSoil(base));
    // The liquid figure is 16% higher and must not be the one quoted.
    expect(result.liquidQuarts / result.dryQuarts).toBeCloseTo(1.1633, 3);
    expect(result.dryQuarts).toBeLessThan(result.liquidQuarts);
  });

  it('converts a whole cubic foot to 25.71 dry quarts', () => {
    // A 12 x 12 inch square container, 12 inches deep, is exactly 1 cu ft.
    const result = value(calculatePottingSoil({ ...base, shape: 'square', width: 12, depth: 12 }));
    expect(result.cubicFeet).toBeCloseTo(1, 6);
    expect(result.dryQuarts).toBeCloseTo(25.7, 1);
    expect(result.liquidQuarts).toBeCloseTo(29.9, 1);
  });

  it('treats a half barrel as a cylinder', () => {
    const barrel = value(
      calculatePottingSoil({ ...base, shape: 'half-barrel', width: 26, depth: 16 }),
    );
    const cylinder = value(calculatePottingSoil({ ...base, shape: 'round', width: 26, depth: 16 }));
    expect(barrel.cubicFeet).toBe(cylinder.cubicFeet);
    expect(barrel.dryQuarts).toBeCloseTo(126.2, 0);
  });

  it('handles a rectangular window box', () => {
    const result = value(
      calculatePottingSoil({ ...base, shape: 'rectangular', width: 8, length: 36, depth: 7 }),
    );
    // 36 x 8 x 7 = 2016 cu in / 1728 = 1.1667 cu ft
    expect(result.cubicFeet).toBeCloseTo(1.17, 2);
  });

  it('multiplies by the number of containers', () => {
    const one = value(calculatePottingSoil(base));
    const six = value(calculatePottingSoil({ ...base, quantity: 6 }));
    expect(six.dryQuarts).toBeCloseTo(one.dryQuarts * 6, 1);
    expect(six.dryQuartsPerContainer).toBeCloseTo(one.dryQuarts, 2);
  });

  it('counts bags in dry quarts in imperial and liters in metric', () => {
    const imperial = value(calculatePottingSoil({ ...base, quantity: 4, bagSize: 25 }));
    expect(imperial.bags).toBe(3); // 67.1 dry qt / 25 = 2.69

    // 12 in = 30.48 cm, 10 in = 25.4 cm
    const metric = value(
      calculatePottingSoil({
        ...base,
        units: 'metric',
        width: 30.48,
        depth: 25.4,
        quantity: 4,
        bagSize: 50,
      }),
    );
    expect(metric.liters).toBeCloseTo(imperial.liters, 1);
    expect(metric.bags).toBe(2); // 74.1 L / 50 = 1.48
  });

  it('omits a bag count when no bag size is given', () => {
    const result = value(calculatePottingSoil(base));
    expect(result.bags).toBeNull();
    expect(result.bagSize).toBeNull();
  });

  it('rejects a diameter of zero', () => {
    const result = calculatePottingSoil({ ...base, width: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Enter a diameter in inches greater than 0');
    }
  });

  it('rejects a negative depth and a fractional container count together', () => {
    const result = calculatePottingSoil({ ...base, depth: -5, quantity: 1.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual(['depth', 'quantity']);
    }
  });

  it('requires a length for a rectangular container', () => {
    const result = calculatePottingSoil({ ...base, shape: 'rectangular' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('length');
    }
  });

  it('stays finite for an implausibly large planter', () => {
    const result = value(calculatePottingSoil({ ...base, width: 1e8, depth: 1e8, quantity: 1000 }));
    expect(Number.isFinite(result.dryQuarts)).toBe(true);
    expect(Number.isFinite(result.cubicFeet)).toBe(true);
  });
});
