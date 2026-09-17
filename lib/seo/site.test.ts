import { describe, expect, it } from 'vitest';
import { absoluteUrl, site } from './site';

describe('absoluteUrl', () => {
  it('returns the site root with a trailing slash', () => {
    expect(absoluteUrl('/')).toBe(`${site.url}/`);
  });

  it('adds a trailing slash to a path that lacks one', () => {
    expect(absoluteUrl('/about')).toBe(`${site.url}/about/`);
  });

  it('keeps a single trailing slash when one is already present', () => {
    expect(absoluteUrl('/about/')).toBe(`${site.url}/about/`);
  });

  it('normalizes a path given without a leading slash', () => {
    expect(absoluteUrl('tools/mulch-calculator')).toBe(`${site.url}/tools/mulch-calculator/`);
  });

  it('collapses duplicated slashes at both ends', () => {
    expect(absoluteUrl('//crops//')).toBe(`${site.url}/crops/`);
  });

  it('never emits a double slash after the origin', () => {
    expect(absoluteUrl('/blog/')).not.toMatch(/[^:]\/\//);
  });
});
