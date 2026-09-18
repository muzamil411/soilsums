import { describe, expect, it } from 'vitest';
import { compostMaterials } from './compost-materials';
import { grassSeedRates } from './grass-seed-rates';
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
    // sources explicitly disclaim.
    for (const material of compostMaterials) {
      if (material.verified) {
        expect(material.range, `${material.slug} is verified with no range`).not.toBeNull();
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
