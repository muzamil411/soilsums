import { describe, expect, it } from 'vitest';
import {
  BAG_CUBIC_FEET,
  calculateBulkSoil,
  POUNDS_PER_TON,
  SQUARE_FEET_PER_YARD_INCH,
} from './bulk-soil';
import { COMPOST_DENSITY, gramsPerCm3ToLbPerCubicYard, SOIL_TEXTURES } from '@/data/densities';

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
   * The point of the tool: a range with its reason, never one confident figure.
   * Both of these assertions exist because every competing calculator prints a
   * single number that is wrong for most readers.
   */
  it('always gives a range, never a point figure', () => {
    for (const material of ['compost', 'soil'] as const) {
      const { weight } = run({ ...BED, material, texture: 'sandy-loam' });
      expect(weight.highLbPerCubicYard).toBeGreaterThan(weight.lowLbPerCubicYard);
      expect(weight.highLb).toBeGreaterThan(weight.lowLb);
    }
  });

  it('uses Oregon State figures directly for compost, with no conversion', () => {
    const { weight } = run({ ...BED, material: 'compost' });
    expect(weight.lowLbPerCubicYard).toBe(COMPOST_DENSITY.lowLbPerCubicYard);
    expect(weight.highLbPerCubicYard).toBe(COMPOST_DENSITY.highLbPerCubicYard);
    expect(weight.typicalLbPerCubicYard).toBe(COMPOST_DENSITY.typicalLbPerCubicYard);
  });

  it('marks soil as in-place only, and compost as not', () => {
    // Compost is published as supplied; the NRCS soil figures are for soil in
    // the ground, which is not what a supplier tips on a driveway.
    expect(run({ ...BED, material: 'compost' }).weight.inPlaceOnly).toBe(false);
    expect(run({ ...BED, material: 'soil', texture: 'clay' }).weight.inPlaceOnly).toBe(true);
    expect(run({ ...BED, material: 'soil', texture: 'clay' }).weight.typicalLbPerCubicYard).toBe(
      undefined,
    );
  });

  it('converts NRCS grams per cubic centimetre exactly', () => {
    // 1.40 g/cm3 is about 2,360 lb per cubic yard and 1.10 about 1,854.
    expect(Math.round(gramsPerCm3ToLbPerCubicYard(1.4))).toBe(2360);
    expect(Math.round(gramsPerCm3ToLbPerCubicYard(1.1))).toBe(1854);
  });

  it('spans a texture from its ideal figure to its root-restricting one', () => {
    for (const texture of SOIL_TEXTURES) {
      const { weight } = run({ ...BED, material: 'soil', texture: texture.slug });
      expect(weight.lowLbPerCubicYard).toBe(
        Math.round(gramsPerCm3ToLbPerCubicYard(texture.idealBelow)),
      );
      expect(weight.highLbPerCubicYard).toBe(
        Math.round(gramsPerCm3ToLbPerCubicYard(texture.restrictingAbove)),
      );
    }
  });

  it('inverts to yards per ton the right way round', () => {
    // Heavier material means fewer cubic yards to the ton, so the high density
    // has to produce the LOW yards-per-ton figure. Getting this backwards would
    // be invisible on the page and wrong by a factor of two or more.
    const { weight } = run({ ...BED, material: 'soil', texture: 'sandy-loam' });
    expect(weight.lowYardsPerTon).toBeLessThan(weight.highYardsPerTon);
    expect(weight.lowYardsPerTon).toBeCloseTo(POUNDS_PER_TON / weight.highLbPerCubicYard, 2);
    expect(weight.highYardsPerTon).toBeCloseTo(POUNDS_PER_TON / weight.lowLbPerCubicYard, 2);
  });

  it('counts whole truck loads, rounding up', () => {
    const result = run({ ...BED, material: 'soil', texture: 'sandy-loam', truckCubicYards: 0.5 });
    // 0.926 cubic yards into a 0.5 yard bed is two trips, not one and a bit.
    expect(result.truckLoads).toBe(2);
  });

  it('omits truck loads where no capacity was given', () => {
    expect(run({ ...BED, material: 'compost' }).truckLoads).toBe(undefined);
  });
});
