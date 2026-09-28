import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { LIME_TIMING } from '@/data/lime-rates';
import { wrongTimingStatements } from './lime-timing';

/**
 * One answer to "how long does lime take?", everywhere.
 *
 * The site carried three at once — three to six months on the pH article and in
 * a generated figure, six months to a year on the lime calculator, and "no
 * sourced figure exists" on the lawn lime article — for months, without a
 * failing check anywhere, because every one of them was prose or frontmatter.
 *
 * So this reads the surfaces rather than the data: every MDX file, every source
 * file that mentions lime, the generated pin catalogue, and the rendered pages
 * when a build is present. A month figure in a lime-timing sentence has to be
 * the figure in data/lime-rates.ts.
 */

function walk(dir: string, match: (file: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path, match));
    else if (match(entry)) out.push(path);
  }
  return out;
}

/** A page as a reader sees it: the RSC payload in the script tags is not copy. */
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

const sources = [
  ...walk('content', (file) => file.endsWith('.mdx')),
  ...walk('components', (file) => file.endsWith('.tsx')),
  ...walk('scripts', (file) => file.endsWith('.tsx') || file.endsWith('.ts')),
  ...walk('app', (file) => file.endsWith('.tsx')),
  'docs/pinterest-pins.md',
  'docs/pinterest-pins.csv',
].filter((file) => existsSync(file) && /lime|limestone/i.test(readFileSync(file, 'utf8')));

describe('how long lime takes to work', () => {
  it('is worth guarding on more than one file', () => {
    expect(sources.length).toBeGreaterThan(3);
  });

  it.each(sources)('%s states no other figure', (file) => {
    const findings = wrongTimingStatements(readFileSync(file, 'utf8'));

    expect(
      findings.map((finding) => `  ${finding.phrase}\n    …${finding.context}…`),
      `${file} states a lime timing figure other than "${LIME_TIMING.label}", which is what\n` +
        `data/lime-rates.ts holds (${LIME_TIMING.source.institution}). Every surface has to\n` +
        `agree, frontmatter and generated files included — the site carried three answers at\n` +
        `once before this check existed:\n\n`,
    ).toEqual([]);
  });

  const built = existsSync('out') ? walk('out', (file) => file === 'index.html') : [];

  it('has rendered pages to check, or says the build is missing', () => {
    // Not a failure on its own: `npm test` is run without a build in normal use,
    // and the gate runs the build before seo-audit, which applies the same
    // check to the same pages.
    expect(built.length === 0 || built.length > 20).toBe(true);
  });

  it.each(built)('%s renders no other figure', (file) => {
    const findings = wrongTimingStatements(visibleText(readFileSync(file, 'utf8')));

    expect(
      findings.map((finding) => `  ${finding.phrase}\n    …${finding.context}…`),
      `${file} shows a reader a lime timing figure other than "${LIME_TIMING.label}":\n\n`,
    ).toEqual([]);
  });
});
