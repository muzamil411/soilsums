import { describe, expect, it } from 'vitest';
import { calculateCompostRatio, suggestAddition } from './compost-ratio';

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

const byWeight = { units: 'imperial', mode: 'weight' } as const;

describe('calculateCompostRatio', () => {
  it('computes the ratio from carbon and nitrogen masses, not by averaging ratios', () => {
    // 10 lb sawdust (C:N 500) plus 10 lb coffee grounds (C:N 20).
    // Averaging the two ratios would say 260:1. Working from actual masses
    // gives 62:1 — the sawdust is mostly carbon but the coffee grounds bring
    // ten times as much nitrogen, so the mix lands nowhere near the average.
    const result = value(
      calculateCompostRatio({
        ...byWeight,
        entries: [
          { materialSlug: 'sawdust', amount: 10 },
          { materialSlug: 'coffee-grounds', amount: 10 },
        ],
      }),
    );
    expect(result.cnRatio).toBeCloseTo(61.7, 1);
    expect(result.cnRatio).toBeLessThan(100);
  });

  it('calls a leaves-only pile carbon-heavy and suggests a green', () => {
    const result = value(
      calculateCompostRatio({ ...byWeight, entries: [{ materialSlug: 'dry-leaves', amount: 50 }] }),
    );
    expect(result.cnRatio).toBe(60);
    expect(result.verdict).toBe('too-much-carbon');
    expect(result.advice).toContain('carbon-heavy');
    expect(result.suggestion?.materialSlug).toBe('grass-clippings');
    expect(result.suggestion?.asIsPounds).toBeGreaterThan(0);
  });

  it('calls a chicken-manure-only pile nitrogen-heavy and suggests a brown', () => {
    const result = value(
      calculateCompostRatio({
        ...byWeight,
        entries: [{ materialSlug: 'chicken-manure', amount: 20 }],
      }),
    );
    expect(result.cnRatio).toBe(7);
    expect(result.verdict).toBe('too-much-nitrogen');
    expect(result.advice).toContain('ammonia');
    expect(result.suggestion?.materialSlug).toBe('dry-leaves');
  });

  it('recognises a balanced pile and offers no correction', () => {
    const result = value(
      calculateCompostRatio({
        ...byWeight,
        entries: [
          // Grass is three quarters water, so it takes a lot of it by weight
          // to balance a modest heap of dry leaves.
          { materialSlug: 'dry-leaves', amount: 24 },
          { materialSlug: 'grass-clippings', amount: 118 },
        ],
      }),
    );
    expect(result.cnRatio).toBeGreaterThanOrEqual(result.targetMin);
    expect(result.cnRatio).toBeLessThanOrEqual(result.targetMax);
    expect(result.verdict).toBe('in-range');
    expect(result.suggestion).toBeNull();
  });

  it('the suggested addition actually lands the pile in range', () => {
    const start = value(
      calculateCompostRatio({ ...byWeight, entries: [{ materialSlug: 'straw', amount: 30 }] }),
    );
    const topUp = start.suggestion;
    expect(topUp).not.toBeNull();
    const after = value(
      calculateCompostRatio({
        ...byWeight,
        entries: [
          { materialSlug: 'straw', amount: 30 },
          { materialSlug: topUp?.materialSlug ?? '', amount: topUp?.asIsPounds ?? 0 },
        ],
      }),
    );
    expect(after.cnRatio).toBeLessThanOrEqual(after.targetMax + 0.5);
    expect(after.cnRatio).toBeGreaterThanOrEqual(after.targetMin - 0.5);
  });

  it('accepts volume instead of weight, using each material bulk density', () => {
    const result = value(
      calculateCompostRatio({
        units: 'imperial',
        mode: 'volume',
        entries: [{ materialSlug: 'dry-leaves', amount: 20 }],
      }),
    );
    // 20 gallons = 2.674 cu ft, x 5 lb/cu ft = 13.4 lb of leaves
    expect(result.totalAsIsPounds).toBeCloseTo(13.4, 0);
    expect(result.cnRatio).toBe(60);
  });

  it('gives the same ratio in metric as in imperial', () => {
    const imperial = value(
      calculateCompostRatio({
        ...byWeight,
        entries: [
          { materialSlug: 'straw', amount: 10 },
          { materialSlug: 'cow-manure', amount: 10 },
        ],
      }),
    );
    const metric = value(
      calculateCompostRatio({
        units: 'metric',
        mode: 'weight',
        entries: [
          { materialSlug: 'straw', amount: 4.5359 },
          { materialSlug: 'cow-manure', amount: 4.5359 },
        ],
      }),
    );
    expect(metric.cnRatio).toBeCloseTo(imperial.cnRatio, 1);
  });

  it('reports each material share of the pile carbon and nitrogen', () => {
    const result = value(
      calculateCompostRatio({
        ...byWeight,
        entries: [
          { materialSlug: 'dry-leaves', amount: 10 },
          { materialSlug: 'grass-clippings', amount: 10 },
        ],
      }),
    );
    const shares = result.contributions.map((entry) => entry.shareOfNitrogenPercent);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(100, 0);
    const leaves = result.contributions.find((entry) => entry.materialSlug === 'dry-leaves');
    expect(leaves?.category).toBe('brown');
  });

  it('rejects an empty pile', () => {
    const result = calculateCompostRatio({ ...byWeight, entries: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe('Add at least one material to the pile');
    }
  });

  it('rejects an unknown material and a zero amount', () => {
    const result = calculateCompostRatio({
      ...byWeight,
      entries: [
        { materialSlug: 'old-boots', amount: 5 },
        { materialSlug: 'straw', amount: 0 },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.message)).toEqual([
        'Unknown material: old-boots',
        'Enter a amount in pounds greater than 0',
      ]);
    }
  });

  it('rejects a negative amount', () => {
    const result = calculateCompostRatio({
      ...byWeight,
      entries: [{ materialSlug: 'straw', amount: -5 }],
    });
    expect(result.ok).toBe(false);
  });

  it('stays finite for an enormous pile', () => {
    const result = value(
      calculateCompostRatio({ ...byWeight, entries: [{ materialSlug: 'straw', amount: 1e8 }] }),
    );
    expect(Number.isFinite(result.cnRatio)).toBe(true);
    expect(Number.isFinite(result.totalCarbonPounds)).toBe(true);
  });

  it('returns nothing from suggestAddition when the material cannot help', () => {
    // Asking sawdust to fix an already carbon-heavy pile has no solution.
    expect(suggestAddition(1000, 10, 30, 'sawdust')).toBeNull();
    expect(suggestAddition(1000, 10, 30, 'not-a-material')).toBeNull();
  });
});
