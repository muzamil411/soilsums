import { describe, expect, it } from 'vitest';
import { calculateGardenYield } from './garden-yield';

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateGardenYield', () => {
  it('gives a low-to-high range for a plant count', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'tomato', mode: 'plants', quantity: 4 }],
      }),
    );
    const line = result.lines[0];
    expect(line?.plants).toBe(4);
    expect(line?.lowLb).toBe(32); // 4 x 8
    expect(line?.highLb).toBe(60); // 4 x 15
    expect(line?.lowKg).toBeCloseTo(14.5, 1);
  });

  it('converts a row length to plants using the crop spacing', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'carrot', mode: 'row-length', quantity: 10 }],
      }),
    );
    // 10 ft = 120 inches, at 3 inch spacing = 40 carrots
    expect(result.lines[0]?.plants).toBe(40);
    expect(result.lines[0]?.lowLb).toBe(8);
  });

  it('never counts a fraction of a plant from a row', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'tomato', mode: 'row-length', quantity: 5 }],
      }),
    );
    // 60 inches at 24 inch spacing is 2.5 plants, which is two plants.
    expect(result.lines[0]?.plants).toBe(2);
  });

  it('says so when a row is too short for a single plant', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'pumpkin', mode: 'row-length', quantity: 1 }],
      }),
    );
    expect(result.lines[0]?.plants).toBe(0);
    expect(result.lines[0]?.lowLb).toBe(0);
    expect(result.lines[0]?.notes.join(' ')).toContain('too short to hold even one');
  });

  it('totals several crops', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [
          { cropSlug: 'tomato', mode: 'plants', quantity: 2 },
          { cropSlug: 'zucchini', mode: 'plants', quantity: 1 },
          { cropSlug: 'lettuce', mode: 'plants', quantity: 8 },
        ],
      }),
    );
    expect(result.totalPlants).toBe(11);
    expect(result.totalLowLb).toBe(26); // 16 + 6 + 4
    expect(result.totalHighLb).toBe(50); // 30 + 12 + 8
    expect(result.totalHighKg).toBeCloseTo(22.68, 1);
  });

  it('agrees between imperial and metric row lengths', () => {
    const imperial = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'bean', mode: 'row-length', quantity: 10 }],
      }),
    );
    const metric = value(
      calculateGardenYield({
        units: 'metric',
        entries: [{ cropSlug: 'bean', mode: 'row-length', quantity: 3.048 }],
      }),
    );
    expect(metric.lines[0]?.plants).toBe(imperial.lines[0]?.plants);
    expect(metric.totalLowLb).toBe(imperial.totalLowLb);
  });

  it('flags a perennial whose first season will not match the figures', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'strawberry', mode: 'plants', quantity: 25 }],
      }),
    );
    expect(result.lines[0]?.notes.join(' ')).toContain('perennial');
  });

  it('keeps the low estimate below the high one for every crop', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [
          { cropSlug: 'radish', mode: 'plants', quantity: 50 },
          { cropSlug: 'watermelon', mode: 'plants', quantity: 2 },
        ],
      }),
    );
    for (const line of result.lines) {
      expect(line.lowLb).toBeLessThanOrEqual(line.highLb);
    }
    expect(result.totalLowLb).toBeLessThan(result.totalHighLb);
  });

  it('rejects an empty list', () => {
    const result = calculateGardenYield({ units: 'imperial', entries: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Add at least one crop');
    }
  });

  it('rejects an unknown crop and a zero quantity', () => {
    const result = calculateGardenYield({
      units: 'imperial',
      entries: [
        { cropSlug: 'triffid', mode: 'plants', quantity: 3 },
        { cropSlug: 'tomato', mode: 'plants', quantity: 0 },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.message)).toEqual([
        'Unknown crop: triffid',
        'Enter a number of plants greater than 0',
      ]);
    }
  });

  it('rejects a fractional plant count but allows a fractional row length', () => {
    const fractionalPlants = calculateGardenYield({
      units: 'imperial',
      entries: [{ cropSlug: 'tomato', mode: 'plants', quantity: 2.5 }],
    });
    expect(fractionalPlants.ok).toBe(false);
    if (!fractionalPlants.ok) {
      expect(fractionalPlants.errors[0]?.message).toBe('Enter a whole number for number of plants');
    }

    const fractionalRow = calculateGardenYield({
      units: 'imperial',
      entries: [{ cropSlug: 'carrot', mode: 'row-length', quantity: 7.5 }],
    });
    expect(fractionalRow.ok).toBe(true);
  });

  it('rejects a negative quantity', () => {
    const result = calculateGardenYield({
      units: 'imperial',
      entries: [{ cropSlug: 'tomato', mode: 'plants', quantity: -4 }],
    });
    expect(result.ok).toBe(false);
  });

  it('stays finite for an implausible number of plants', () => {
    const result = value(
      calculateGardenYield({
        units: 'imperial',
        entries: [{ cropSlug: 'tomato', mode: 'plants', quantity: 1e8 }],
      }),
    );
    expect(Number.isFinite(result.totalHighLb)).toBe(true);
    expect(Number.isNaN(result.totalHighKg)).toBe(false);
  });
});
