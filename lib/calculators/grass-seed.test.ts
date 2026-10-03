import { describe, expect, it } from 'vitest';
import { calculateGrassSeed } from './grass-seed';

const base = {
  units: 'imperial',
  area: 5000,
  grassSlug: 'tall-fescue',
  purpose: 'new-lawn',
} as const;

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe('calculateGrassSeed', () => {
  it('seeds 5,000 sq ft of new tall fescue at 7 lb per 1,000', () => {
    const result = value(calculateGrassSeed(base));
    expect(result.rateLbPer1000SqFt).toBe(7);
    expect(result.pounds).toBe(35);
  });

  it('uses the lower rate when overseeding', () => {
    const result = value(calculateGrassSeed({ ...base, purpose: 'overseed' }));
    expect(result.rateLbPer1000SqFt).toBe(3.5);
    expect(result.pounds).toBe(17.5);
    expect(result.alternateRateLbPer1000SqFt).toBe(7);
  });

  it('says whether the rate it used has a source behind it', () => {
    // Nebraska publishes a tall fescue overseeding rate; nobody publishes one
    // for bahiagrass, and the page has to be able to say so.
    const fescue = value(calculateGrassSeed({ ...base, purpose: 'overseed' }));
    expect(fescue.rateVerified).toBe(true);
    const bahia = value(
      calculateGrassSeed({ ...base, grassSlug: 'bahiagrass', purpose: 'overseed' }),
    );
    expect(bahia.rateVerified).toBe(false);
    expect(value(calculateGrassSeed({ ...base, grassSlug: 'bahiagrass' })).rateVerified).toBe(true);
  });

  it('marks zoysiagrass as pure-live-seed denominated, and every other rate as bulk', () => {
    // Arkansas MP476 publishes zoysiagrass as 1–2 lb pure live seed per
    // 1,000 sq ft; every other stored rate is bulk seed as sold. The
    // calculator must never present the PLS figure as bulk weight to buy.
    for (const purpose of ['new-lawn', 'overseed'] as const) {
      const zoysia = value(calculateGrassSeed({ ...base, grassSlug: 'zoysiagrass', purpose }));
      expect(zoysia.rateBasis).toBe('pls');
    }
    const slugs = [
      'kentucky-bluegrass',
      'tall-fescue',
      'fine-fescue',
      'perennial-ryegrass',
      'annual-ryegrass',
      'creeping-bentgrass',
      'bermudagrass',
      'centipedegrass',
      'bahiagrass',
      'buffalograss',
    ];
    for (const grassSlug of slugs) {
      const result = value(calculateGrassSeed({ ...base, grassSlug }));
      expect(result.rateBasis).toBe('bulk');
    }
  });

  it('does not adjust the arithmetic for a PLS rate — it labels the basis instead', () => {
    // The pounds figure is still rate × area; what changes is the meaning
    // attached to it. 1.5 lb PLS per 1,000 sq ft over 5,000 sq ft is 7.5 lb
    // of pure live seed, and the page says so rather than calling it bulk.
    const result = value(calculateGrassSeed({ ...base, grassSlug: 'zoysiagrass' }));
    expect(result.rateLbPer1000SqFt).toBe(1.5);
    expect(result.pounds).toBe(7.5);
    expect(result.rateBasis).toBe('pls');
  });

  it('names the region every rate covers', () => {
    for (const purpose of ['new-lawn', 'overseed'] as const) {
      const result = value(calculateGrassSeed({ ...base, purpose }));
      expect(result.region).toContain('Pennsylvania');
    }
  });

  it('uses each grass type its own rate', () => {
    const bluegrass = value(calculateGrassSeed({ ...base, grassSlug: 'kentucky-bluegrass' }));
    const centipede = value(calculateGrassSeed({ ...base, grassSlug: 'centipedegrass' }));
    expect(bluegrass.pounds).toBe(12.5);
    expect(centipede.pounds).toBe(2);
    expect(bluegrass.season).toBe('cool');
    expect(centipede.season).toBe('warm');
  });

  it('scales with area', () => {
    const small = value(calculateGrassSeed({ ...base, area: 500 }));
    expect(small.pounds).toBe(3.5);
  });

  it('agrees between imperial and metric', () => {
    const imperial = value(calculateGrassSeed(base));
    // 5,000 sq ft = 464.515 m2
    const metric = value(calculateGrassSeed({ ...base, units: 'metric', area: 464.515 }));
    expect(metric.pounds).toBeCloseTo(imperial.pounds, 2);
    expect(metric.kilograms).toBeCloseTo(15.88, 1);
    expect(metric.rateKgPer100SqM).toBeCloseTo(3.418, 2);
  });

  it('rejects an unknown grass type', () => {
    const result = calculateGrassSeed({ ...base, grassSlug: 'astroturf' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toEqual({ field: 'grassSlug', message: 'Choose a grass type' });
    }
  });

  it('rejects an area of zero', () => {
    const result = calculateGrassSeed({ ...base, area: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('greater than 0');
    }
  });

  it('rejects a negative area', () => {
    const result = calculateGrassSeed({ ...base, area: -100 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('area');
    }
  });

  it('stays finite for a very large area', () => {
    const result = value(calculateGrassSeed({ ...base, area: 1e9 }));
    expect(Number.isFinite(result.pounds)).toBe(true);
    expect(Number.isNaN(result.kilograms)).toBe(false);
  });

  it('carries the grass note through for display', () => {
    const result = value(calculateGrassSeed({ ...base, grassSlug: 'perennial-ryegrass' }));
    expect(result.note).toContain('Germinates fast');
  });
});
