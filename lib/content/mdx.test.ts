import { describe, expect, it } from 'vitest';
import { countWords } from './mdx';

describe('countWords', () => {
  it('counts plain prose', () => {
    expect(countWords('A raised bed needs soil.')).toBe(5);
  });

  it('returns zero for an empty body', () => {
    expect(countWords('')).toBe(0);
  });

  it('ignores markdown heading and emphasis marks', () => {
    expect(countWords('## How deep\n\n**Six inches** is the usual minimum.')).toBe(8);
  });

  it('does not count JSX tags or their attributes as words', () => {
    expect(countWords('<MulchCalculator depth={2} unit="in" />\n\nMulch settles.')).toBe(2);
  });

  it('excludes fenced code blocks', () => {
    expect(countWords('Use this formula.\n\n```\ncuFt = area * depth / 12\n```\n')).toBe(3);
  });

  it('counts contractions and possessives as one word each', () => {
    expect(countWords("Don't guess the bed's depth.")).toBe(5);
  });
});
