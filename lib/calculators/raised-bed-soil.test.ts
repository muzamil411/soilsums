import { describe, expect, it } from 'vitest';
import { calculateRaisedBedSoil } from './raised-bed-soil';

const base = {
  units: 'imperial',
  shape: 'rectangle',
  length: 8,
  width: 4,
  depth: 12,
  beds: 1,
  bagSize: 1.5,
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateRaisedBedSoil', () => {
  it('works out an 8 by 4 foot bed at 12 inches deep', () => {
    const result = value(calculateRaisedBedSoil(base));
    // 8 x 4 = 32 sq ft, x 12 in / 12 = 32 cu ft
    expect(result.cubicFeet).toBe(32);
    expect(result.cubicYards).toBeCloseTo(1.19, 2);
    expect(result.bags).toBe(22); // 32 / 1.5 = 21.33, rounded up
  });

  it('divides by twelve rather than treating inches as feet', () => {
    const result = value(calculateRaisedBedSoil({ ...base, depth: 6 }));
    expect(result.cubicFeet).toBe(16);
  });

  it('multiplies by the number of beds', () => {
    const result = value(calculateRaisedBedSoil({ ...base, beds: 3 }));
    expect(result.cubicFeetPerBed).toBe(32);
    expect(result.cubicFeet).toBe(96);
    expect(result.cubicYards).toBeCloseTo(3.56, 2);
  });

  it('handles a circular bed with pi, not a square approximation', () => {
    const result = value(
      calculateRaisedBedSoil({
        ...base,
        shape: 'circle',
        diameter: 6,
        length: undefined,
        width: undefined,
      }),
    );
    // pi x 3^2 = 28.274 sq ft, x 12 in / 12 = 28.27 cu ft
    expect(result.areaSquareFeetPerBed).toBeCloseTo(28.27, 1);
    expect(result.cubicFeet).toBeCloseTo(28.27, 1);
  });

  it('gives the same volume in metric as in imperial', () => {
    const imperial = value(calculateRaisedBedSoil(base));
    // 8 ft = 2.4384 m, 4 ft = 1.2192 m, 12 in = 30.48 cm
    const metric = value(
      calculateRaisedBedSoil({
        ...base,
        units: 'metric',
        length: 2.4384,
        width: 1.2192,
        depth: 30.48,
        bagSize: 50,
      }),
    );
    expect(metric.cubicFeet).toBeCloseTo(imperial.cubicFeet, 2);
    expect(metric.liters).toBeCloseTo(906.14, 1);
    expect(metric.bags).toBe(19); // 906.14 / 50 = 18.12, rounded up
  });

  it('splits a mix by percentage and totals back to the whole', () => {
    const result = value(
      calculateRaisedBedSoil({
        ...base,
        mix: [
          { label: 'Topsoil', percent: 60 },
          { label: 'Compost', percent: 30 },
          { label: 'Perlite', percent: 10 },
        ],
      }),
    );
    expect(result.mix.map((component) => component.cubicFeet)).toEqual([19.2, 9.6, 3.2]);
    const total = result.mix.reduce((sum, component) => sum + component.cubicFeet, 0);
    expect(total).toBeCloseTo(result.cubicFeet, 6);
  });

  it('rejects a mix that does not add up to 100 percent', () => {
    const result = calculateRaisedBedSoil({
      ...base,
      mix: [
        { label: 'Topsoil', percent: 60 },
        { label: 'Compost', percent: 25 },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('85%');
    }
  });

  it('rejects a depth of zero with a helpful message', () => {
    const result = calculateRaisedBedSoil({ ...base, depth: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([{ field: 'depth', message: 'Enter a depth greater than 0' }]);
    }
  });

  it('rejects negative dimensions', () => {
    const result = calculateRaisedBedSoil({ ...base, length: -8 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('length');
    }
  });

  it('rejects a fractional number of beds', () => {
    const result = calculateRaisedBedSoil({ ...base, beds: 2.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Enter a whole number for number of beds');
    }
  });

  it('reports every invalid field at once', () => {
    const result = calculateRaisedBedSoil({ ...base, length: 0, width: -1, depth: 0, beds: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual([
        'length',
        'width',
        'depth',
        'beds',
      ]);
    }
  });

  it('refuses absurdly large input instead of returning Infinity', () => {
    const result = calculateRaisedBedSoil({ ...base, length: 1e12 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('too large');
    }
  });

  it('stays finite at the largest accepted input', () => {
    const result = value(
      calculateRaisedBedSoil({ ...base, length: 1e9, width: 1e9, depth: 1e9, beds: 1000 }),
    );
    expect(Number.isFinite(result.cubicFeet)).toBe(true);
    expect(Number.isFinite(result.bags)).toBe(true);
  });

  it('never returns NaN for any valid input', () => {
    const result = value(calculateRaisedBedSoil({ ...base, depth: 0.0001 }));
    for (const entry of Object.values(result)) {
      if (typeof entry === 'number') {
        expect(Number.isNaN(entry)).toBe(false);
      }
    }
  });
});
