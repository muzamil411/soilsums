import { describe, expect, it } from 'vitest';
import { TRIANGULAR_ROW_FACTOR, calculatePlantSpacing } from './plant-spacing';

const base = {
  units: 'imperial',
  bedLength: 8,
  bedWidth: 4,
  plantSpacing: 12,
  rowSpacing: 12,
  layout: 'square',
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculatePlantSpacing', () => {
  it('fits 32 plants at 12 inch spacing in an 8 by 4 foot bed', () => {
    const result = value(calculatePlantSpacing(base));
    expect(result.plantsPerRow).toBe(8);
    expect(result.rows).toBe(4);
    expect(result.totalPlants).toBe(32);
    expect(result.squareFeetPerPlant).toBe(1);
  });

  it('quadruples the count when spacing halves in both directions', () => {
    const result = value(calculatePlantSpacing({ ...base, plantSpacing: 6, rowSpacing: 6 }));
    expect(result.totalPlants).toBe(128);
  });

  it('uses the sqrt(3)/2 row pitch for a triangular layout, not the row spacing', () => {
    const result = value(calculatePlantSpacing({ ...base, layout: 'triangular' }));
    expect(TRIANGULAR_ROW_FACTOR).toBeCloseTo(0.8660254, 6);
    expect(result.rowPitchInches).toBeCloseTo(10.39, 2);
    // 48 inches of width / 10.39 still only fits 4 rows, so no extra row here.
    expect(result.rows).toBe(4);
  });

  it('fits about 15 percent more in a bed deep enough for the extra row', () => {
    // A 20 x 20 ft bed at 12 in: square fits 20 rows of 20, triangular fits 23
    // rows — 12 full rows of 20 and 11 staggered rows of 19.
    const square = value(calculatePlantSpacing({ ...base, bedLength: 20, bedWidth: 20 }));
    const triangular = value(
      calculatePlantSpacing({ ...base, bedLength: 20, bedWidth: 20, layout: 'triangular' }),
    );
    expect(square.totalPlants).toBe(400);
    expect(triangular.rows).toBe(23);
    expect(triangular.totalPlants).toBe(449);
    expect(triangular.gainPercent).toBe(12.3); // rounded from 12.25
    // Short of the ideal 15.5%, because staggered rows lose their last plant
    // and rows only come in whole numbers. A flat 15% would have said 460.
    expect(triangular.gainPercent).toBeLessThan(15.5);
  });

  it('is not a flat 15 percent — it says so when a small bed gains nothing', () => {
    const result = value(calculatePlantSpacing({ ...base, layout: 'triangular' }));
    expect(result.totalPlants).toBeLessThan(result.squareLayoutPlants);
    expect(result.notes.join(' ')).toContain('square layout actually fits more');
  });

  it('drops a plant from staggered rows with no slack at the row end', () => {
    const result = value(calculatePlantSpacing({ ...base, layout: 'triangular' }));
    // 96 inches / 12 leaves no slack, so offset rows hold 7 rather than 8.
    expect(result.plantsPerRow).toBe(8);
    expect(result.plantsPerOffsetRow).toBe(7);
  });

  it('reports both layouts whichever is chosen, for comparison', () => {
    const result = value(calculatePlantSpacing(base));
    expect(result.squareLayoutPlants).toBe(32);
    expect(result.triangularLayoutPlants).toBe(30);
    expect(result.plantsPerOffsetRow).toBeNull();
  });

  it('respects a wider row spacing in the square layout', () => {
    const result = value(calculatePlantSpacing({ ...base, rowSpacing: 24 }));
    expect(result.rows).toBe(2);
    expect(result.totalPlants).toBe(16);
  });

  it('agrees between imperial and metric', () => {
    const imperial = value(calculatePlantSpacing(base));
    const metric = value(
      calculatePlantSpacing({
        ...base,
        units: 'metric',
        bedLength: 2.4384,
        bedWidth: 1.2192,
        plantSpacing: 30.48,
        rowSpacing: 30.48,
      }),
    );
    expect(metric.totalPlants).toBe(imperial.totalPlants);
  });

  it('returns zero plants with an explanation when nothing fits', () => {
    const result = value(calculatePlantSpacing({ ...base, plantSpacing: 200, rowSpacing: 200 }));
    expect(result.totalPlants).toBe(0);
    expect(result.squareFeetPerPlant).toBeNull();
    expect(result.notes.join(' ')).toContain('Nothing fits');
  });

  it('rejects a spacing of zero rather than dividing by it', () => {
    const result = calculatePlantSpacing({ ...base, plantSpacing: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Enter a plant spacing in inches greater than 0');
    }
  });

  it('rejects negative bed dimensions', () => {
    const result = calculatePlantSpacing({ ...base, bedLength: -8, bedWidth: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual(['bedLength', 'bedWidth']);
    }
  });

  it('names the row spacing as the limit when only one row fits', () => {
    // A tomato bed 8 x 4 ft: four plants looks like a bug until the result
    // says that 36 inch rows only fit once across a 4 foot width.
    const result = value(calculatePlantSpacing({ ...base, plantSpacing: 24, rowSpacing: 36 }));
    expect(result.totalPlants).toBe(4);
    expect(result.limit.axis).toBe('width');
    expect(result.limit.explanation).toBe(
      'Rows need 36 in, so 1 fits across a 4 ft width, leaving 12 in spare.',
    );
    expect(result.limit.suggestion).toBe(
      'Narrowing the row spacing to 24 in would fit 2 rows of 4.',
    );
  });

  it('says the bed is fully used when the spacing divides evenly', () => {
    const result = value(calculatePlantSpacing({ ...base, plantSpacing: 8, rowSpacing: 12 }));
    expect(result.limit.axis).toBe('none');
    expect(result.limit.explanation).toContain('fully used');
    expect(result.limit.suggestion).toBeNull();
  });

  it('names the plant spacing when the length is what wastes room', () => {
    const result = value(
      calculatePlantSpacing({
        ...base,
        bedLength: 9,
        bedWidth: 4,
        plantSpacing: 24,
        rowSpacing: 12,
      }),
    );
    // 108 in of length at 24 in spacing leaves 12 in over; 48 in of width at
    // 12 in rows leaves none.
    expect(result.limit.axis).toBe('length');
    expect(result.limit.explanation).toContain('Plants need 24 in');
    expect(result.limit.suggestion).toContain('plants a row');
  });

  it('points at the plant spacing for a staggered layout, since rows follow it', () => {
    const result = value(
      calculatePlantSpacing({ ...base, plantSpacing: 24, rowSpacing: 36, layout: 'triangular' }),
    );
    expect(result.limit.suggestion).toContain('staggered rows take their pitch from it');
  });

  it('explains an empty bed rather than leaving the reader guessing', () => {
    const result = value(calculatePlantSpacing({ ...base, plantSpacing: 200, rowSpacing: 200 }));
    expect(result.limit.axis).toBe('none');
    expect(result.limit.explanation).toContain('smaller than a single plant');
  });

  it('describes the limit in metric when the reader is in metric', () => {
    const result = value(
      calculatePlantSpacing({
        ...base,
        units: 'metric',
        bedLength: 2.4,
        bedWidth: 1.2,
        plantSpacing: 60,
        rowSpacing: 90,
      }),
    );
    expect(result.limit.explanation).toContain('cm');
    expect(result.limit.explanation).not.toContain(' in,');
  });

  it('stays finite for an enormous field', () => {
    const result = value(calculatePlantSpacing({ ...base, bedLength: 1e6, bedWidth: 1e6 }));
    expect(Number.isFinite(result.totalPlants)).toBe(true);
    expect(Number.isNaN(result.totalPlants)).toBe(false);
  });
});

describe('floating-point boundary correction', () => {
  // Regression for the production bug where toggling 3.5 ft / 6 in to metric
  // dropped the count from 28 to 24 plants: fitAlong() floored 6.999999999999999.
  // (Browser repro used default 12 in row spacing: 7 per row x 4 rows = 28.)
  const reported = {
    units: 'imperial',
    bedLength: 3.5,
    bedWidth: 4,
    plantSpacing: 6,
    rowSpacing: 12,
    layout: 'square',
  } as const;

  it('keeps 28 plants for the reported 3.5-ft case in imperial', () => {
    const result = value(calculatePlantSpacing(reported));
    expect(result.plantsPerRow).toBe(7);
    expect(result.rows).toBe(4);
    expect(result.totalPlants).toBe(28);
  });

  it('keeps 28 plants for equivalent metric inputs', () => {
    // 3.5 ft = 1.0668 m, 6 in = 15.24 cm, 12 in = 30.48 cm (exact conversions).
    const result = value(
      calculatePlantSpacing({
        units: 'metric',
        bedLength: 1.0668,
        bedWidth: 1.2192,
        plantSpacing: 15.24,
        rowSpacing: 30.48,
        layout: 'square',
      }),
    );
    expect(result.totalPlants).toBe(28);
  });

  it('keeps 36 plants for the reported 4.5-ft case in both systems', () => {
    const imp = value(
      calculatePlantSpacing({ ...reported, bedLength: 4.5 }),
    );
    expect(imp.plantsPerRow).toBe(9);
    expect(imp.totalPlants).toBe(36);
    const met = value(
      calculatePlantSpacing({
        units: 'metric',
        bedLength: 1.3716, // 4.5 ft in meters
        bedWidth: 1.2192,
        plantSpacing: 15.24,
        rowSpacing: 30.48,
        layout: 'square',
      }),
    );
    expect(met.totalPlants).toBe(36);
  });

  it('gives the same count in triangular layout for equivalent inputs', () => {
    const imp = value(calculatePlantSpacing({ ...reported, layout: 'triangular' }));
    const met = value(
      calculatePlantSpacing({
        units: 'metric',
        bedLength: 1.0668,
        bedWidth: 1.2192,
        plantSpacing: 15.24,
        rowSpacing: 30.48,
        layout: 'triangular',
      }),
    );
    expect(met.totalPlants).toBe(imp.totalPlants);
  });

  it('still fits fewer plants in a genuinely undersized bed', () => {
    // 3.4 ft at 6 in spacing: true ratio 6.8, must NOT snap to 7.
    const result = value(calculatePlantSpacing({ ...reported, bedLength: 3.4 }));
    expect(result.plantsPerRow).toBe(6);
    // 3.49 ft: ratio 6.98, still clearly below 7.
    const result2 = value(calculatePlantSpacing({ ...reported, bedLength: 3.49 }));
    expect(result2.plantsPerRow).toBe(6);
  });

  it('fits more plants when clearly above the boundary', () => {
    // 3.6 ft at 6 in: ratio 7.2, floors to 7.
    const result = value(calculatePlantSpacing({ ...reported, bedLength: 3.6 }));
    expect(result.plantsPerRow).toBe(7);
  });

  it('matches across all 819 scanned combinations in both layouts', () => {
    // Full scan from the audit: bedLength 1–20 ft (step 0.5), plantSpacing
    // 4–24 in (step 1), bedWidth 4 ft, rowSpacing 12 in. Each imperial input
    // is compared against its 10-sig-fig metric equivalent (as the unit toggle
    // produces), in both square and triangular layouts. All dimensions convert
    // consistently: ft→m (×0.3048), in→cm (×2.54).
    let checked = 0;
    for (let ft = 1; ft <= 20; ft += 0.5) {
      for (let spIn = 4; spIn <= 24; spIn += 1) {
        for (const layout of ['square', 'triangular'] as const) {
          const imp = value(
            calculatePlantSpacing({
              units: 'imperial',
              bedLength: ft,
              bedWidth: 4,
              plantSpacing: spIn,
              rowSpacing: 12,
              layout,
            }),
          );
          const met = value(
            calculatePlantSpacing({
              units: 'metric',
              bedLength: Number((ft * 0.3048).toPrecision(10)),
              bedWidth: Number((4 * 0.3048).toPrecision(10)),
              plantSpacing: Number((spIn * 2.54).toPrecision(10)),
              rowSpacing: Number((12 * 2.54).toPrecision(10)),
              layout,
            }),
          );
          expect(
            { plantsPerRow: met.plantsPerRow, rows: met.rows, total: met.totalPlants },
            `ft=${ft} spacing=${spIn}in layout=${layout}`,
          ).toEqual({
            plantsPerRow: imp.plantsPerRow,
            rows: imp.rows,
            total: imp.totalPlants,
          });
          checked++;
        }
      }
    }
    // 39 lengths × 21 spacings × 2 layouts = 1638 comparisons.
    expect(checked).toBe(1638);
  });

  describe('triangular half-spacing slack boundaries', () => {
    // 3.75 ft bed at 6 in spacing: 7 plants use 42 in, leaving exactly 3 in
    // slack = half the 6 in spacing, so the offset row keeps all 7.
    const boundary = {
      units: 'imperial',
      bedLength: 3.75,
      bedWidth: 4,
      plantSpacing: 6,
      rowSpacing: 12,
      layout: 'triangular',
    } as const;

    it('keeps the offset row at exactly the half-spacing boundary', () => {
      const result = value(calculatePlantSpacing(boundary));
      expect(result.plantsPerRow).toBe(7);
      expect(result.plantsPerOffsetRow).toBe(7);
    });

    it('keeps the offset row for conversion-rounded boundary equivalents', () => {
      // 3.75 ft → 1.143 m via 10-sig-fig toggle; slack computes near 3.0 in.
      const result = value(
        calculatePlantSpacing({
          units: 'metric',
          bedLength: Number((3.75 * 0.3048).toPrecision(10)),
          bedWidth: Number((4 * 0.3048).toPrecision(10)),
          plantSpacing: Number((6 * 2.54).toPrecision(10)),
          rowSpacing: Number((12 * 2.54).toPrecision(10)),
          layout: 'triangular',
        }),
      );
      expect(result.plantsPerOffsetRow).toBe(7);
    });

    it('drops the offset plant when clearly below half-spacing', () => {
      // 3.7 ft: 44.4 in - 42 in = 2.4 in slack < 3 in half-spacing.
      const result = value(calculatePlantSpacing({ ...boundary, bedLength: 3.7 }));
      expect(result.plantsPerRow).toBe(7);
      expect(result.plantsPerOffsetRow).toBe(6);
    });

    it('keeps the offset row when clearly above half-spacing', () => {
      // 3.8 ft: 45.6 in - 42 in = 3.6 in slack > 3 in half-spacing.
      const result = value(calculatePlantSpacing({ ...boundary, bedLength: 3.8 }));
      expect(result.plantsPerRow).toBe(7);
      expect(result.plantsPerOffsetRow).toBe(7);
    });
  });
});
