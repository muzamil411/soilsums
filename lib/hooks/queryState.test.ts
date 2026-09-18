import { describe, expect, it } from 'vitest';
import { buildQuery, parseQuery, pathWithQuery } from './queryState';

const params = { length: 'l', width: 'w', depth: 'd', shape: 'sh' };
const defaults = { length: '8', width: '4', depth: '12', shape: 'rectangle' };

describe('buildQuery', () => {
  it('writes nothing when every value is still the default', () => {
    const query = buildQuery({ values: { ...defaults }, defaults, params, units: 'imperial' });
    expect(query.toString()).toBe('');
  });

  it('writes only the field that changed', () => {
    const query = buildQuery({
      values: { ...defaults, length: '10' },
      defaults,
      params,
      units: 'imperial',
    });
    expect(query.toString()).toBe('l=10');
  });

  it('writes several changed fields and leaves the rest out', () => {
    const query = buildQuery({
      values: { ...defaults, length: '10', depth: '6' },
      defaults,
      params,
      units: 'imperial',
    });
    expect(query.toString()).toBe('l=10&d=6');
  });

  it('omits the unit system while it is the default', () => {
    const query = buildQuery({ values: { ...defaults }, defaults, params, units: 'imperial' });
    expect(query.get('u')).toBeNull();
  });

  it('writes the unit system once it is not the default', () => {
    const query = buildQuery({ values: { ...defaults }, defaults, params, units: 'metric' });
    expect(query.toString()).toBe('u=metric');
  });

  it('skips a field the reader has emptied', () => {
    const query = buildQuery({
      values: { ...defaults, length: '' },
      defaults,
      params,
      units: 'imperial',
    });
    expect(query.toString()).toBe('');
  });

  it('spells out every value for a shared link', () => {
    const query = buildQuery({
      values: { ...defaults, length: '10' },
      defaults,
      params,
      units: 'imperial',
      includeAll: true,
    });
    expect(query.get('l')).toBe('10');
    expect(query.get('w')).toBe('4');
    expect(query.get('d')).toBe('12');
    expect(query.get('sh')).toBe('rectangle');
    expect(query.get('u')).toBe('imperial');
  });

  it('ignores fields that have no query key', () => {
    const query = buildQuery({
      values: { ...defaults, secret: 'x' },
      defaults,
      params,
      units: 'imperial',
    });
    expect(query.toString()).toBe('');
  });
});

describe('parseQuery', () => {
  it('reads the fields a shared link carried', () => {
    expect(parseQuery('?l=10&d=6', params).values).toEqual({ length: '10', depth: '6' });
  });

  it('returns nothing from an empty query string', () => {
    expect(parseQuery('', params)).toEqual({ values: {}, units: null });
  });

  it('reads the unit system when present', () => {
    expect(parseQuery('?u=metric', params).units).toBe('metric');
  });

  it('ignores an unrecognised unit system', () => {
    expect(parseQuery('?u=furlongs', params).units).toBeNull();
  });

  it('round-trips what buildQuery wrote', () => {
    const values = { ...defaults, length: '10', shape: 'circle' };
    const query = buildQuery({ values, defaults, params, units: 'metric' });
    const parsed = parseQuery(`?${query.toString()}`, params);
    expect(parsed.values).toEqual({ length: '10', shape: 'circle' });
    expect(parsed.units).toBe('metric');
  });
});

describe('pathWithQuery', () => {
  it('returns a bare path when there is nothing to add', () => {
    expect(pathWithQuery('/tools/mulch-calculator/', new URLSearchParams())).toBe(
      '/tools/mulch-calculator/',
    );
  });

  it('appends the query string when there is one', () => {
    expect(pathWithQuery('/tools/mulch-calculator/', new URLSearchParams({ l: '10' }))).toBe(
      '/tools/mulch-calculator/?l=10',
    );
  });
});
