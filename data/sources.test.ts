import { describe, expect, it } from 'vitest';
import { compostMaterials } from './compost-materials';
import { getGrassSeedRate, grassSeedRates } from './grass-seed-rates';
import { TURF_SPECIES } from './turfgrass';
import { limeRates } from './lime-rates';

describe('compost materials', () => {
  it('brackets every working ratio inside its published range', () => {
    for (const material of compostMaterials) {
      if (!material.range) continue;
      const [low, high] = material.range;
      expect(low, material.slug).toBeLessThanOrEqual(high);
      expect(material.cnRatio, material.slug).toBeGreaterThanOrEqual(low);
      expect(material.cnRatio, material.slug).toBeLessThanOrEqual(high);
    }
  });

  it('gives a range to everything it claims to have verified', () => {
    // A verified figure with no range would be claiming a precision the
    // sources explicitly disclaim — unless the source itself publishes a
    // single value, in which case there is no published spread to show and
    // the table says "No published range found". A single value must not be
    // dressed up as a measured range like [15.9, 15.9].
    const SINGLE_VALUE_SLUGS = new Set(['alfalfa-meal', 'fresh-weeds']);
    for (const material of compostMaterials) {
      if (material.verified) {
        if (!SINGLE_VALUE_SLUGS.has(material.slug)) {
          expect(material.range, `${material.slug} is verified with no range`).not.toBeNull();
        }
      } else {
        expect(material.range, `${material.slug} is unverified with a range`).toBeNull();
      }
    }
  });

  it('keeps fresh chicken manure and coop litter as separate materials', () => {
    const fresh = compostMaterials.find((material) => material.slug === 'chicken-manure');
    const litter = compostMaterials.find((material) => material.slug === 'chicken-manure-litter');
    expect(fresh?.cnRatio).toBe(7);
    expect(litter?.cnRatio).toBe(15);
    expect(litter?.cnRatio).toBeGreaterThan(fresh?.cnRatio ?? 0);
  });
});

describe('grass seed rates', () => {
  it('names the region behind every rate', () => {
    for (const rate of grassSeedRates) {
      expect(rate.region.length, rate.slug).toBeGreaterThan(0);
      expect(rate.source, rate.slug).toContain('http');
    }
  });

  it('overseeds at or below the establishment rate', () => {
    for (const rate of grassSeedRates) {
      expect(rate.overseedLbPer1000SqFt, rate.slug).toBeLessThanOrEqual(rate.newLawnLbPer1000SqFt);
    }
  });

  it('has a sourced establishment rate for every grass, and mostly not for overseeding', () => {
    expect(grassSeedRates.every((rate) => rate.verified)).toBe(true);
    const sourced = grassSeedRates.filter((rate) => rate.overseedVerified);
    expect(sourced.map((rate) => rate.slug)).toEqual([
      'kentucky-bluegrass',
      'tall-fescue',
      'perennial-ryegrass',
    ]);
  });
});

describe('lime rates', () => {
  it('brackets every rate inside its published range', () => {
    for (const rate of limeRates) {
      const [low, high] = rate.rangeLbPer1000SqFt;
      expect(rate.lbPer1000SqFtPerPhUnit, rate.slug).toBeGreaterThanOrEqual(low);
      expect(rate.lbPer1000SqFtPerPhUnit, rate.slug).toBeLessThanOrEqual(high);
    }
  });
});

describe('grass seeding rates against the publications', () => {
  /**
   * The calculator's rate must sit inside the range turfgrass.ts publishes.
   *
   * This exists because it did not. data/grass-seed-rates.ts held single points
   * that quietly mixed two publications: Kentucky bluegrass, tall fescue and
   * fine fescue were Penn State midpoints, but perennial ryegrass was 7 —
   * Missouri's autumn figure — while Penn State gives 4 to 5. The calculator and
   * the article disagreed by a factor of 1.5 on a live page, with nothing to
   * catch it.
   *
   * The rate is now derived from turfgrass.ts rather than copied, so this test
   * guards the derivation rather than a transcription. Two things make that
   * worth asserting: the midpoint arithmetic could be changed to something that
   * leaves the range, and turfgrass.ts could gain a species the calculator does
   * not offer. An override alongside a published range cannot drift, because
   * grass-seed-rates.ts now throws on it at import rather than picking one.
   */
  it('keeps every derived rate inside the published range', () => {
    for (const species of TURF_SPECIES) {
      if (species.pennState === undefined) continue;
      const rate = getGrassSeedRate(species.slug);
      expect(
        rate,
        `${species.slug} is in turfgrass.ts but not in grass-seed-rates.ts`,
      ).toBeDefined();
      if (!rate) continue;

      const [low, high] =
        typeof species.pennState === 'number'
          ? [species.pennState, species.pennState]
          : species.pennState;

      expect(
        rate.newLawnLbPer1000SqFt,
        `${species.slug}: calculator uses ${rate.newLawnLbPer1000SqFt} lb, outside Penn State's ${low} to ${high}`,
      ).toBeGreaterThanOrEqual(low);
      expect(rate.newLawnLbPer1000SqFt, species.slug).toBeLessThanOrEqual(high);
    }
  });

  it('carries the published range beside the figure, for every species', () => {
    for (const rate of grassSeedRates) {
      expect(rate.newLawnRange, rate.slug).toBeDefined();
      expect(rate.newLawnBasis.length, rate.slug).toBeGreaterThan(0);
    }
  });

  it('never overseeds heavier than it seeds a new lawn', () => {
    // Perennial ryegrass broke this the moment the new-lawn rate became the
    // midpoint of 4 to 5: its overseeding figure was 5, the top of Penn State's
    // renovation range, which then exceeded it.
    for (const rate of grassSeedRates) {
      expect(
        rate.overseedLbPer1000SqFt,
        `${rate.slug}: overseeding at ${rate.overseedLbPer1000SqFt} exceeds the new-lawn rate of ${rate.newLawnLbPer1000SqFt}`,
      ).toBeLessThanOrEqual(rate.newLawnLbPer1000SqFt);
    }
  });
});
