import { describe, expect, it } from 'vitest';
import {
  BAG_CUBIC_FEET,
  calculateBulkSoil,
  POUNDS_PER_TON,
  SQUARE_FEET_PER_YARD_INCH,
} from './bulk-soil';
import { COMPOST_DENSITY } from '@/data/densities';

function run(input: Parameters<typeof calculateBulkSoil>[0]) {
  const result = calculateBulkSoil(input);
  if (!result.ok) throw new Error(`unexpected failure: ${JSON.stringify(result.errors)}`);
  return result.value;
}

const BED = {
  units: 'imperial',
  mode: 'rectangle',
  length: 10,
  width: 10,
  depth: 3,
} as const;

describe('bulk soil volume', () => {
  it('spreads a cubic yard over 324 square feet at one inch', () => {
    // 27 cubic feet x 12 inches per foot. Exact by definition, and the figure
    // every coverage number on the yard-of-dirt article comes from.
    expect(SQUARE_FEET_PER_YARD_INCH).toBe(324);
  });

  it('agrees with the article: a yard covers 108 square feet at three inches', () => {
    const result = run({ ...BED, material: 'compost' });
    expect(result.coveragePerYard).toBe(108);
  });

  it('converts a bed to cubic feet and cubic yards', () => {
    const result = run({ ...BED, material: 'compost' });
    // 100 sq ft x 3 in / 12 = 25 cubic feet; 25 / 27 of a yard.
    expect(result.cubicFeet).toBe(25);
    expect(result.cubicYards).toBeCloseTo(25 / 27, 3);
  });

  it('rounds bag counts up, never down', () => {
    const result = run({ ...BED, material: 'compost' });
    expect(result.bags.map((bag) => bag.cubicFeet)).toEqual([...BAG_CUBIC_FEET]);
    for (const bag of result.bags) {
      expect(bag.count).toBeGreaterThanOrEqual(25 / bag.cubicFeet);
      expect(Number.isInteger(bag.count)).toBe(true);
    }
  });

  it('handles metric entry', () => {
    const result = run({
      units: 'metric',
      mode: 'rectangle',
      length: 3,
      width: 3,
      depth: 8,
      material: 'compost',
    });
    expect(result.cubicFeet).toBeGreaterThan(0);
    expect(result.depthInches).toBeCloseTo(8 / 2.54, 2);
  });

  it('rejects a missing or zero dimension', () => {
    expect(calculateBulkSoil({ ...BED, depth: 0, material: 'compost' }).ok).toBe(false);
    expect(
      calculateBulkSoil({ units: 'imperial', mode: 'area', depth: 3, material: 'compost' }).ok,
    ).toBe(false);
  });
});

describe('bulk soil weight', () => {
  /**
   * The point of the tool: a range with its reason where one is published, and
   * no weight at all where none is — never one confident invented figure.
   */
  it('gives compost as a range, never a point figure', () => {
    const { weight } = run({ ...BED, material: 'compost' });
    if (weight === null) throw new Error('compost must have a weight');
    expect(weight.highLbPerCubicYard).toBeGreaterThan(weight.lowLbPerCubicYard);
    expect(weight.highLb).toBeGreaterThan(weight.lowLb);
    expect(weight.supplierFigure).toBe(false);
  });

  it('uses Oregon State figures directly for compost, with no conversion', () => {
    const { weight } = run({ ...BED, material: 'compost' });
    if (weight === null) throw new Error('compost must have a weight');
    expect(weight.lowLbPerCubicYard).toBe(COMPOST_DENSITY.lowLbPerCubicYard);
    expect(weight.highLbPerCubicYard).toBe(COMPOST_DENSITY.highLbPerCubicYard);
    expect(weight.typicalLbPerCubicYard).toBe(COMPOST_DENSITY.typicalLbPerCubicYard);
  });

  it('marks the compost high end as open, not a maximum', () => {
    // Oregon State publishes "800 to more than 1,600" — 1,600 is where the
    // published range stops, not where compost stops. The flag drives the "+"
    // on every high-end figure the page prints.
    const { weight } = run({ ...BED, material: 'compost' });
    if (weight === null) throw new Error('compost must have a weight');
    expect(weight.highOpenEnded).toBe(true);
    expect(weight.supplierFigure).toBe(false);
  });

  it('marks a supplier figure as closed', () => {
    const { weight } = run({ ...BED, material: 'soil', supplierLbPerCubicYard: 2200 });
    if (weight === null) throw new Error('supplier figure must produce a weight');
    expect(weight.highOpenEnded).toBe(false);
  });

  it('ignores an invalid supplier figure when compost is selected', () => {
    // The supplier field is hidden for compost, but its value persists in the
    // form state when the reader switches material. A leftover invalid entry
    // from soil must not block the compost calculation.
    const result = calculateBulkSoil({
      ...BED,
      material: 'compost',
      supplierLbPerCubicYard: -50,
    });
    if (!result.ok) throw new Error(`compost blocked: ${JSON.stringify(result.errors)}`);
    expect(result.value.weight?.highOpenEnded).toBe(true);
  });

  it('prints no soil weight without a supplier figure', () => {
    // We have no sourced delivered-topsoil weight, so the honest result is
    // null rather than a range built from root-growth thresholds.
    const { weight } = run({ ...BED, material: 'soil' });
    expect(weight).toBe(null);
  });

  it('computes a soil weight from the supplier figure alone', () => {
    const { weight } = run({ ...BED, material: 'soil', supplierLbPerCubicYard: 2200 });
    if (weight === null) throw new Error('supplier figure must produce a weight');
    // 100 sq ft x 3 in = 25 cu ft = 25/27 cu yd; at 2200 lb/yd that is one figure.
    expect(weight.lowLbPerCubicYard).toBe(2200);
    expect(weight.highLbPerCubicYard).toBe(2200);
    expect(weight.lowLb).toBe(weight.highLb);
    expect(weight.lowLb).toBe(Math.round((25 / 27) * 2200));
    expect(weight.lowTons).toBe(1.02); // toSignificant(2037.04 / 2000, 3)
    expect(weight.lowYardsPerTon).toBeCloseTo(POUNDS_PER_TON / 2200, 3);
    expect(weight.supplierFigure).toBe(true);
    expect(weight.typicalLbPerCubicYard).toBe(undefined);
  });

  it('rejects a non-positive supplier figure', () => {
    expect(
      calculateBulkSoil({ ...BED, material: 'soil', supplierLbPerCubicYard: 0 }).ok,
    ).toBe(false);
    expect(
      calculateBulkSoil({ ...BED, material: 'soil', supplierLbPerCubicYard: -50 }).ok,
    ).toBe(false);
  });

  it('inverts to yards per ton the right way round', () => {
    // Heavier material means fewer cubic yards to the ton, so the high density
    // has to produce the LOW yards-per-ton figure. Getting this backwards would
    // be invisible on the page and wrong by a factor of two or more.
    const { weight } = run({ ...BED, material: 'compost' });
    if (weight === null) throw new Error('compost must have a weight');
    expect(weight.lowYardsPerTon).toBeLessThan(weight.highYardsPerTon);
    expect(weight.lowYardsPerTon).toBeCloseTo(POUNDS_PER_TON / weight.highLbPerCubicYard, 2);
    expect(weight.highYardsPerTon).toBeCloseTo(POUNDS_PER_TON / weight.lowLbPerCubicYard, 2);
  });

  it('counts whole truck loads, rounding up', () => {
    const result = run({ ...BED, material: 'soil', truckCubicYards: 0.5 });
    // 0.926 cubic yards into a 0.5 yard bed is two trips, not one and a bit.
    expect(result.truckLoads).toBe(2);
  });

  it('omits truck loads where no capacity was given', () => {
    expect(run({ ...BED, material: 'compost' }).truckLoads).toBe(undefined);
  });
});
