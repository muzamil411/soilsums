import { describe, expect, it } from 'vitest';
import { calculatePlantingDates } from './planting-date';

function value<T>(result: { ok: true; value: T } | { ok: false; errors: unknown }): T {
  if (!result.ok)
    throw new Error(`expected a result, got errors: ${JSON.stringify(result.errors)}`);
  return result.value;
}

const lastFrostDate = '2026-05-15';

describe('calculatePlantingDates', () => {
  it('counts back six weeks for sowing tomatoes indoors', () => {
    const result = value(calculatePlantingDates({ lastFrostDate, cropSlugs: ['tomato'] }));
    const tomato = result.schedules[0];
    expect(tomato?.sowIndoors).toBe('2026-04-03'); // 42 days before May 15
    expect(tomato?.transplant).toBe('2026-05-22'); // one week after
    expect(tomato?.directSow).toBeNull();
  });

  it('gives a direct sow date for crops that are not started indoors', () => {
    const result = value(calculatePlantingDates({ lastFrostDate, cropSlugs: ['carrot'] }));
    const carrot = result.schedules[0];
    expect(carrot?.sowIndoors).toBeNull();
    expect(carrot?.transplant).toBeNull();
    expect(carrot?.directSow).toBe('2026-04-24'); // three weeks before
  });

  it('puts cool-season transplants out before the last frost', () => {
    const result = value(calculatePlantingDates({ lastFrostDate, cropSlugs: ['lettuce'] }));
    const lettuce = result.schedules[0];
    expect(lettuce?.transplant).toBe('2026-04-24');
    expect(lettuce?.notes.join(' ')).toContain('before your last frost date');
  });

  it('estimates a harvest window from days to maturity', () => {
    const result = value(calculatePlantingDates({ lastFrostDate, cropSlugs: ['radish'] }));
    const radish = result.schedules[0];
    // Direct sown 2026-04-17, ready in 22 to 30 days.
    expect(radish?.directSow).toBe('2026-04-17');
    expect(radish?.harvestFrom).toBe('direct sow');
    expect(radish?.harvestStart).toBe('2026-05-09');
    expect(radish?.harvestEnd).toBe('2026-05-17');
  });

  it('refuses to invent a spring date for garlic and explains why', () => {
    const result = value(calculatePlantingDates({ lastFrostDate, cropSlugs: ['garlic'] }));
    const garlic = result.schedules[0];
    expect(garlic?.sowIndoors).toBeNull();
    expect(garlic?.transplant).toBeNull();
    expect(garlic?.directSow).toBeNull();
    expect(garlic?.timingNote).toContain('planted in autumn');
    expect(garlic?.notes.join(' ')).toContain('planted in autumn');
  });

  it('handles several crops at once, in the order given', () => {
    const result = value(
      calculatePlantingDates({ lastFrostDate, cropSlugs: ['pepper', 'bean', 'kale'] }),
    );
    expect(result.schedules.map((schedule) => schedule.slug)).toEqual(['pepper', 'bean', 'kale']);
    expect(result.schedules).toHaveLength(3);
  });

  it('works out the growing season from both frost dates', () => {
    const result = value(
      calculatePlantingDates({
        lastFrostDate,
        firstFallFrostDate: '2026-10-15',
        cropSlugs: ['tomato'],
      }),
    );
    expect(result.growingSeasonDays).toBe(153);
    expect(result.firstFallFrostDate).toBe('2026-10-15');
  });

  it('warns when a crop would not ripen before the first fall frost', () => {
    const result = value(
      calculatePlantingDates({
        lastFrostDate,
        firstFallFrostDate: '2026-07-01',
        cropSlugs: ['pumpkin'],
      }),
    );
    expect(result.schedules[0]?.notes.join(' ')).toContain('after your first fall frost');
  });

  it('crosses a year boundary correctly', () => {
    const result = value(
      calculatePlantingDates({ lastFrostDate: '2026-01-20', cropSlugs: ['onion'] }),
    );
    // Onions start twelve weeks before, which lands in the previous year.
    expect(result.schedules[0]?.sowIndoors).toBe('2025-10-28');
  });

  it('handles a leap day without drifting', () => {
    const result = value(
      calculatePlantingDates({ lastFrostDate: '2028-03-01', cropSlugs: ['radish'] }),
    );
    expect(result.schedules[0]?.directSow).toBe('2028-02-02');
  });

  it('rejects a malformed date', () => {
    const result = calculatePlantingDates({ lastFrostDate: '15/05/2026', cropSlugs: ['tomato'] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.field).toBe('lastFrostDate');
    }
  });

  it('rejects an impossible date rather than rolling it over', () => {
    const result = calculatePlantingDates({ lastFrostDate: '2026-02-30', cropSlugs: ['tomato'] });
    expect(result.ok).toBe(false);
  });

  it('rejects a fall frost date that comes before the spring one', () => {
    const result = calculatePlantingDates({
      lastFrostDate,
      firstFallFrostDate: '2026-03-01',
      cropSlugs: ['tomato'],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toContain('after your last spring frost date');
    }
  });

  it('rejects an empty crop list and an unknown crop', () => {
    expect(calculatePlantingDates({ lastFrostDate, cropSlugs: [] }).ok).toBe(false);
    const unknown = calculatePlantingDates({ lastFrostDate, cropSlugs: ['triffid'] });
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) {
      expect(unknown.errors[0]?.message).toBe('Unknown crop: triffid');
    }
  });

  it('treats a blank fall frost date as simply not given', () => {
    const result = value(
      calculatePlantingDates({ lastFrostDate, firstFallFrostDate: '', cropSlugs: ['tomato'] }),
    );
    expect(result.firstFallFrostDate).toBeNull();
    expect(result.growingSeasonDays).toBeNull();
  });
});
