import { describe, expect, it } from 'vitest';
import {
  COMMON_BAG_QUARTS,
  SOIL_DENSITY,
  VOLUME_UNITS,
  bagReference,
  convertSoilVolume,
  type VolumeUnit,
} from './soil-volume';
import {
  US_DRY_QUARTS_PER_CUBIC_FOOT,
  US_LIQUID_QUARTS_PER_CUBIC_FOOT,
} from './shared/units';

function value(amount: number, from: VolumeUnit) {
  const result = convertSoilVolume({ amount, from });
  if (!result.ok) throw new Error(result.errors.map((error) => error.message).join(', '));
  return result.value;
}

describe('soil volume converter', () => {
  it('keeps the dry and liquid quart apart', () => {
    // The mistake the tool exists to prevent: one cubic foot is 25.71 dry
    // quarts but 29.92 liquid ones, and bagged mix is sold in dry.
    expect(US_DRY_QUARTS_PER_CUBIC_FOOT).toBeCloseTo(25.714, 3);
    expect(US_LIQUID_QUARTS_PER_CUBIC_FOOT).toBeCloseTo(29.922, 3);

    const dry = value(1, 'cubicFeet');
    expect(dry.converted.dryQuarts).toBeCloseTo(25.71, 1);
    expect(dry.converted.liquidQuarts).toBeCloseTo(29.92, 1);
  });

  it('answers the searches that prompted it', () => {
    // "25 qt potting soil to cubic feet"
    expect(value(25, 'dryQuarts').converted.cubicFeet).toBeCloseTo(0.972, 2);
    // "how much is 4 quarts of soil"
    expect(value(4, 'dryQuarts').converted.cubicFeet).toBeCloseTo(0.156, 2);
    expect(value(4, 'dryQuarts').converted.liters).toBeCloseTo(4.4, 1);
  });

  it('round-trips through every unit', () => {
    for (const unit of VOLUME_UNITS) {
      const out = value(1, 'cubicFeet').converted[unit];
      const back = value(out, unit).converted.cubicFeet;
      expect(back, unit).toBeCloseTo(1, 2);
    }
  });

  it('scales linearly', () => {
    const one = value(1, 'dryQuarts');
    const ten = value(10, 'dryQuarts');
    expect(ten.converted.liters / one.converted.liters).toBeCloseTo(10, 5);
  });

  it('reports weight as a range, never a single figure', () => {
    const result = value(1, 'cubicFeet');
    const [low, high] = result.weightLb;
    expect(low).toBeLessThan(high);
    expect(low).toBeCloseTo(SOIL_DENSITY.lowLbPerCuFt, 1);
    expect(high).toBeCloseTo(SOIL_DENSITY.highLbPerCuFt, 1);
    // Wide enough that nobody mistakes it for a precise answer.
    expect(high / low).toBeGreaterThan(2);
  });

  it('carries no source for density, so the page must mark it an estimate', () => {
    expect(SOIL_DENSITY.verified).toBe(false);
    expect(SOIL_DENSITY.source).toBeNull();
  });

  it('gives kilograms for the same range', () => {
    const result = value(1, 'cubicFeet');
    expect(result.weightKg[0]).toBeCloseTo(result.weightLb[0] * 0.45359237, 1);
    expect(result.weightKg[1]).toBeCloseTo(result.weightLb[1] * 0.45359237, 1);
  });

  it('rejects input it cannot convert', () => {
    for (const amount of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(convertSoilVolume({ amount, from: 'dryQuarts' }).ok, String(amount)).toBe(false);
    }
  });

  it('builds the reference table from the sizes people search for', () => {
    const rows = bagReference();
    expect(rows.map((row) => row.dryQuarts)).toEqual([...COMMON_BAG_QUARTS]);
    for (const row of rows) {
      expect(row.cubicFeet).toBeCloseTo(row.dryQuarts / US_DRY_QUARTS_PER_CUBIC_FOOT, 2);
      expect(row.weightLb[0]).toBeLessThan(row.weightLb[1]);
    }
    // A 25 quart bag is just under a cubic foot, which is the fact the page
    // is built around.
    expect(rows.find((row) => row.dryQuarts === 25)?.cubicFeet).toBeCloseTo(0.97, 2);
  });
});
