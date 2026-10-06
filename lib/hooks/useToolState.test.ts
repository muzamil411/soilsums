import { describe, expect, it } from 'vitest';
import { convertFieldForUnits } from './useToolState';

/**
 * Regression coverage for the shared unit-switch behavior.
 *
 * The audit found bulk soil's toggle replacing 20 ft with 6 m (not 6.096 m),
 * changing the result by ~5%. The hook must preserve physical quantity across
 * toggles, including for custom values and boundary-sensitive discrete
 * outputs (plant counts, truck-load ceilings).
 *
 * Precision: converted state values use 10 significant figures (relative
 * error < 5e-10), far below the 5e-7 absolute tolerance that roundUp()'s
 * 6-decimal pre-rounding absorbs. Repeated toggles stabilize; they do not
 * accumulate drift.
 */
describe('convertFieldForUnits', () => {
  it('converts the audit case exactly', () => {
    expect(convertFieldForUnits('20', 'span', 'metric')).toBe('6.096');
    expect(convertFieldForUnits('10', 'span', 'metric')).toBe('3.048');
    expect(convertFieldForUnits('3', 'short', 'metric')).toBe('7.62');
  });

  it('round-trips custom values without meaningful drift', () => {
    // A user-typed odd value, toggled metric -> imperial -> metric.
    const once = convertFieldForUnits('7.5', 'span', 'metric');
    const back = convertFieldForUnits(once, 'span', 'imperial');
    const twice = convertFieldForUnits(back, 'span', 'metric');
    expect(Number(back)).toBeCloseTo(7.5, 9);
    expect(Number(twice)).toBeCloseTo(Number(once), 9);
  });

  it('stabilizes after repeated toggles', () => {
    let value = '13.25';
    for (let i = 0; i < 6; i++) {
      value = convertFieldForUnits(value, 'span', 'metric');
      value = convertFieldForUnits(value, 'span', 'imperial');
    }
    // Drift, if any, must stay far below what a ceiling boundary can feel.
    expect(Number(value)).toBeCloseTo(13.25, 8);
  });

  it('preserves truck-load ceiling boundaries', () => {
    // 1.85185 yd³ in a 0.925925 yd³ truck is exactly 2 loads. The converted
    // metric values must not push the ratio across the integer boundary.
    const cubicYards = '1.85185';
    const truckYd3 = '0.925925';
    const m3 = convertFieldForUnits(cubicYards, 'bulk-volume', 'metric');
    const truckM3 = convertFieldForUnits(truckYd3, 'bulk-volume', 'metric');
    const ratio = Number(m3) / Number(truckM3);
    expect(ratio).toBeCloseTo(2, 6);
    expect(Math.ceil(Number(ratio.toFixed(6)))).toBe(2);
  });

  it('converts density exactly both ways', () => {
    expect(Number(convertFieldForUnits('2000', 'density', 'metric'))).toBeCloseTo(1186.552842, 5);
    const back = convertFieldForUnits(convertFieldForUnits('2000', 'density', 'metric'), 'density', 'imperial');
    // 1e-6 absolute on 2000 is 5e-10 relative — far below any ceiling boundary.
    expect(Number(back)).toBeCloseTo(2000, 5);
  });

  it('leaves non-quantities and blanks untouched', () => {
    expect(convertFieldForUnits('rectangle', 'none', 'metric')).toBe('rectangle');
    expect(convertFieldForUnits('', 'span', 'metric')).toBe('');
    expect(convertFieldForUnits('abc', 'span', 'metric')).toBe('abc');
  });
});
