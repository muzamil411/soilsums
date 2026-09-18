import { describe, expect, it } from 'vitest';
import { calculateSquareFootGarden, emptyGrid } from './square-foot-garden';

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

function grid(rows: number, columns: number, fill: (string | null)[]): (string | null)[] {
  const cells = emptyGrid(rows, columns);
  fill.forEach((crop, index) => {
    cells[index] = crop;
  });
  return cells;
}

describe('calculateSquareFootGarden', () => {
  it('counts plants from the per-square density of each crop', () => {
    const cells = grid(4, 4, ['carrot', 'carrot', 'lettuce', 'tomato']);
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    const byCrop = Object.fromEntries(result.crops.map((crop) => [crop.slug, crop.plants]));
    expect(byCrop.carrot).toBe(18); // 2 squares x 9 per square, the SFG figure
    expect(byCrop.lettuce).toBe(4);
    // Square foot gardening gives a tomato two squares, so one square grows none.
    expect(byCrop.tomato).toBe(0);
    expect(result.totalPlants).toBe(22);
  });

  it('says whether a density came from the SFG method or from row spacing', () => {
    const cells = grid(4, 4, ['carrot', 'kale']);
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    const basis = Object.fromEntries(result.crops.map((crop) => [crop.slug, crop.densityBasis]));
    // Carrot is on the Cornell SFG page at 3x3; kale is not on it at all.
    expect(basis.carrot).toBe('sfg');
    expect(basis.kale).toBe('spacing');
  });

  it('reports filled and empty squares', () => {
    const cells = grid(4, 4, ['carrot', 'carrot', 'lettuce']);
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    expect(result.totalSquares).toBe(16);
    expect(result.filledSquares).toBe(3);
    expect(result.emptySquares).toBe(13);
  });

  it('handles a fully planted grid', () => {
    const cells = Array.from({ length: 16 }, () => 'radish');
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    expect(result.emptySquares).toBe(0);
    expect(result.totalPlants).toBe(256); // 16 squares x 16 radishes
  });

  it('handles an entirely empty grid', () => {
    const result = value(
      calculateSquareFootGarden({ rows: 4, columns: 4, cells: emptyGrid(4, 4) }),
    );
    expect(result.crops).toEqual([]);
    expect(result.totalPlants).toBe(0);
    expect(result.emptySquares).toBe(16);
  });

  it('treats a sprawling crop as squares per plant, not plants per square', () => {
    // Winter squash is not on the SFG page, so its 36 in spacing decides: 0.11
    // per square foot, a plant per 10 squares.
    const cells = grid(
      4,
      4,
      Array.from({ length: 9 }, () => 'squash'),
    );
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    const squash = result.crops[0];
    expect(squash?.densityBasis).toBe('spacing');
    expect(squash?.squaresPerPlant).toBe(10);
    expect(squash?.plants).toBe(0);
    expect(squash?.note).toContain('is not enough for one');
  });

  it('grows one sprawling plant once enough squares are given to it', () => {
    const cells = grid(
      4,
      4,
      Array.from({ length: 10 }, () => 'squash'),
    );
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    expect(result.crops[0]?.plants).toBe(1);
    expect(result.crops[0]?.note).toContain('spreads over about 10 squares');
  });

  it('never reports a fractional plant', () => {
    const cells = grid(4, 4, ['pea', 'pea', 'pea']);
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    expect(Number.isInteger(result.crops[0]?.plants)).toBe(true);
    expect(Number.isInteger(result.totalPlants)).toBe(true);
  });

  it('sorts crops by the number of squares they occupy', () => {
    const cells = grid(4, 4, ['lettuce', 'carrot', 'carrot', 'carrot', 'basil', 'basil']);
    const result = value(calculateSquareFootGarden({ rows: 4, columns: 4, cells }));
    expect(result.crops.map((crop) => crop.slug)).toEqual(['carrot', 'basil', 'lettuce']);
  });

  it('rejects a cell count that does not match the grid', () => {
    const result = calculateSquareFootGarden({ rows: 4, columns: 4, cells: emptyGrid(3, 3) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('This grid has 16 squares but 9 were supplied');
    }
  });

  it('rejects an unknown crop slug', () => {
    const cells = grid(2, 2, ['triffid']);
    const result = calculateSquareFootGarden({ rows: 2, columns: 2, cells });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Unknown crop: triffid');
    }
  });

  it('rejects a grid of zero and a grid beyond the maximum', () => {
    expect(calculateSquareFootGarden({ rows: 0, columns: 4, cells: [] }).ok).toBe(false);
    const huge = calculateSquareFootGarden({ rows: 40, columns: 40, cells: [] });
    expect(huge.ok).toBe(false);
    if (!huge.ok) {
      expect(huge.errors[0]?.message).toBe('Enter a number of rows between 1 and 24');
    }
  });

  it('rejects a fractional grid size', () => {
    const result = calculateSquareFootGarden({ rows: 2.5, columns: 4, cells: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Grid size must be a whole number of squares');
    }
  });

  it('handles the largest allowed grid without trouble', () => {
    const cells = Array.from({ length: 576 }, () => 'carrot');
    const result = value(calculateSquareFootGarden({ rows: 24, columns: 24, cells }));
    expect(result.totalSquares).toBe(576);
    expect(result.totalPlants).toBe(5184); // 576 squares x 9 carrots
  });
});
