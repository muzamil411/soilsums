import { describe, expect, it } from 'vitest';
import {
  CUBIC_FEET_PER_CUBIC_YARD,
  LITERS_PER_CUBIC_FOOT,
  US_DRY_QUARTS_PER_CUBIC_FOOT,
  US_GALLONS_PER_CUBIC_FOOT,
  US_GALLONS_PER_SQFT_INCH,
  US_LIQUID_QUARTS_PER_CUBIC_FOOT,
  areaToSquareFeet,
  depthToInches,
  poundsToKilograms,
  squareFeetToSquareMeters,
} from './units';

describe('conversion constants', () => {
  it('has 27 cubic feet in a cubic yard', () => {
    expect(CUBIC_FEET_PER_CUBIC_YARD).toBe(27);
  });

  it('has 28.3168 liters in a cubic foot', () => {
    expect(LITERS_PER_CUBIC_FOOT).toBeCloseTo(28.316846592, 6);
  });

  it('has 7.4805 US gallons in a cubic foot', () => {
    expect(US_GALLONS_PER_CUBIC_FOOT).toBeCloseTo(7.480519, 5);
  });

  it('uses dry quarts for growing media: 25.714 per cubic foot', () => {
    expect(US_DRY_QUARTS_PER_CUBIC_FOOT).toBeCloseTo(25.714047, 5);
  });

  it('keeps the liquid quart figure distinct at 29.922 per cubic foot', () => {
    expect(US_LIQUID_QUARTS_PER_CUBIC_FOOT).toBeCloseTo(29.922078, 5);
  });

  it('never conflates dry and liquid quarts', () => {
    expect(US_DRY_QUARTS_PER_CUBIC_FOOT).not.toBeCloseTo(US_LIQUID_QUARTS_PER_CUBIC_FOOT, 1);
  });

  it('puts an inch of water on a square foot with 0.6234 gallons', () => {
    expect(US_GALLONS_PER_SQFT_INCH).toBeCloseTo(0.623377, 6);
  });

  it('converts pounds to kilograms with the exact 1959 definition', () => {
    expect(poundsToKilograms(1)).toBe(0.45359237);
  });
});

describe('unit-system helpers', () => {
  it('passes imperial area straight through', () => {
    expect(areaToSquareFeet(400, 'imperial')).toBe(400);
  });

  it('converts square meters to square feet', () => {
    expect(areaToSquareFeet(10, 'metric')).toBeCloseTo(107.639104, 5);
  });

  it('round-trips an area through both systems', () => {
    expect(squareFeetToSquareMeters(areaToSquareFeet(37.5, 'metric'))).toBeCloseTo(37.5, 10);
  });

  it('reads depth as inches in imperial and centimeters in metric', () => {
    expect(depthToInches(12, 'imperial')).toBe(12);
    expect(depthToInches(30.48, 'metric')).toBeCloseTo(12, 10);
  });
});
