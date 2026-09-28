import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { crops } from '@/data/crops';
import { compostMaterials } from '@/data/compost-materials';
import { grassSeedRates } from '@/data/grass-seed-rates';
import { limeRates } from '@/data/lime-rates';
import { ANNUAL_NITROGEN, WATER_NEEDS } from '@/data/lawn-care';

/**
 * No agronomic figure is written into Markdown by hand where a data file
 * already carries it.
 *
 * This exists because four live tool pages drifted. The planting date
 * calculator's offsets table disagreed with the calculator directly above it
 * on seven of its ten rows; the square foot planner listed square counts for
 * eight crops the Cornell CALS page does not name at all. Nothing was wrong
 * with the data — the tables were copies of it, made once and never updated
 * when the verification pass corrected the source.
 *
 * Correcting the values alone would have left the mechanism intact and the
 * next drift a matter of time, so those tables became components that read the
 * data files at build time. This test stops the hand-written kind coming back.
 *
 * The rule: inside a Markdown table, a row that names something a data file
 * covers must not also carry a figure in the shape of a field that data file
 * holds — a spacing in inches, a yield in pounds, a C:N ratio, a seeding rate,
 * days to maturity, a frost offset, a lime rate. Other numbers about the same
 * thing are fine: how many seasons a straw mulch lasts is not in any data
 * file, so a mulch table may say it.
 *
 * Prose may cite any figure. A sentence explaining why clay needs more lime
 * than sand should say so in numbers; prose is read and revised as prose. A
 * table row is a data record, and data records belong in the data files.
 */

/**
 * Short forms a table row might use. Derived names are not enough: the data
 * file says "Bush bean" and "Chicken manure (fresh)" where a table writes
 * "Bean" and "Chicken manure", and matching only the full name would let
 * exactly the stale rows through. Mechanically taking the last word instead
 * matches far too much — "Blood meal, 12-0-0" is not "Alfalfa meal".
 */
const ALIASES: Readonly<Record<string, readonly string[]>> = {
  'bush bean': ['bean'],
  'chicken manure (fresh)': ['chicken manure'],
  'chicken manure with litter': ['chicken manure'],
  'horse manure with bedding': ['horse manure'],
  'shrub and hedge trimmings': ['shrub trimmings'],
  'vegetable and fruit scraps': ['vegetable scraps'],
  'orchard fruit waste': ['fruit waste'],
  'dry autumn leaves': ['autumn leaves'],
  'bermudagrass, hulled': ['bermudagrass'],
  'winter squash': ['squash'],
  'sweet corn': ['corn'],
};

function coveredNames(): string[] {
  const names = [
    ...crops.map((crop) => crop.name),
    ...compostMaterials.map((material) => material.name),
    ...grassSeedRates.map((grass) => grass.name),
    ...limeRates.map((rate) => rate.name),
    // Lawn feeding and watering rates: the grass names here overlap
    // grassSeedRates but not exactly, and a hand-written calendar table would
    // restate them the same way the planting-date table restated its offsets.
    ...ANNUAL_NITROGEN.map((row) => row.grass),
    ...WATER_NEEDS.map((row) => row.grass),
  ].map((name) => name.toLowerCase());

  const expanded = names.flatMap((name) => [
    name,
    name.replace(/\s*\([^)]*\)/g, '').trim(),
    ...(ALIASES[name] ?? []),
  ]);

  return [...new Set(expanded)].filter((name) => name.length > 3).sort((a, b) => b.length - a.length);
}

const NAMES = coveredNames();

/**
 * Figure shapes the data files hold. A row naming a covered entity and
 * carrying one of these is restating data rather than describing something
 * new about it.
 *
 * A measurement in inches is ambiguous on its own — a bed's root depth and a
 * bucket's minimum depth are both inches and neither is in any data file — so
 * the two inch shapes carry a `context` matched against the table's header row
 * as well as the row itself. That is what tells "In-row spacing | 24 in" from
 * "Minimum container | 6 in deep".
 */
const COVERED_SHAPES: readonly { what: string; pattern: RegExp; context?: RegExp }[] = [
  {
    what: 'a plant spacing',
    pattern: /\b\d+(?:\.\d+)?\s*(?:in\b|inch|inches|")/,
    context: /spacing|apart|in-row|row spacing/i,
  },
  {
    what: 'a water requirement',
    pattern: /\b\d+(?:\.\d+)?\s*(?:in\b|inch|inches|")/,
    context: /per week|watering|water needs/i,
  },
  { what: 'a weight in pounds', pattern: /\b\d+(?:\.\d+)?\s*(?:lb\b|lbs\b|pounds?\b)/ },
  { what: 'a C:N ratio', pattern: /\b\d+(?:,\d{3})?\s*:\s*1\b/ },
  { what: 'days to maturity', pattern: /\b\d+\s*(?:[–-]\s*\d+\s*)?days?\b/ },
  { what: 'a frost offset', pattern: /\b\d+\s*(?:weeks?\s*)?(?:before|after)\b/ },
  { what: 'a square foot gardening density', pattern: /\b\d+\s*per\s*squares?\b|per\s*square\b/ },
  { what: 'a soil pH', pattern: /\bpH\s*\d/i },
];

/**
 * Every Markdown table row in a file, with its line number and the header row
 * of the table it belongs to. The header is what gives an ambiguous figure its
 * meaning, so it travels with the row.
 */
function tableRows(source: string): { line: number; text: string; header: string }[] {
  const rows: { line: number; text: string; header: string }[] = [];
  const lines = source.split('\n');
  let inFence = false;
  let header = '';
  let sawSeparator = false;

  lines.forEach((text, index) => {
    if (text.trimStart().startsWith('```')) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    if (!text.trimStart().startsWith('|')) {
      // A blank line ends the table, so the next one starts a new header.
      header = '';
      sawSeparator = false;
      return;
    }
    if (/^[\s|:-]+$/.test(text)) {
      sawSeparator = true;
      return;
    }
    if (!sawSeparator) {
      header = text;
      return;
    }
    rows.push({ line: index + 1, text, header });
  });

  return rows;
}

function namesIn(row: string): string[] {
  const haystack = row.toLowerCase();
  return NAMES.filter((name) => {
    let at = haystack.indexOf(name);
    while (at !== -1) {
      const before = haystack[at - 1] ?? ' ';
      const after = haystack[at + name.length] ?? ' ';
      // Word boundaries, so "pea" does not match inside "peat" and a trailing
      // plural still counts as the same name.
      if (!/[a-z]/.test(before) && (!/[a-z]/.test(after) || haystack.slice(at + name.length).startsWith('s'))) {
        return true;
      }
      at = haystack.indexOf(name, at + 1);
    }
    return false;
  });
}

function shapesIn(row: string, header: string): string[] {
  return COVERED_SHAPES.filter(
    ({ pattern, context }) =>
      pattern.test(row) && (context === undefined || context.test(`${header} ${row}`)),
  ).map(({ what }) => what);
}

function mdxFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => join(dir, file));
}

describe('agronomic figures in MDX', () => {
  const files = [...mdxFiles('content/tools'), ...mdxFiles('content/blog')];

  it('checks every tool page and article', () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it.each(files)('%s restates no figure a data file covers', (file) => {
    const offenders = tableRows(readFileSync(file, 'utf8')).flatMap((row) => {
      const named = namesIn(row.text);
      const shapes = shapesIn(row.text, row.header);
      if (named.length === 0 || shapes.length === 0) return [];
      return [`  ${file}:${row.line}  ${named[0]} — ${shapes.join(', ')}\n    ${row.text.trim().slice(0, 110)}`];
    });

    expect(
      offenders,
      `These table rows restate figures the data files already carry. Render them from\n` +
        `the data with a table component instead of writing the numbers into Markdown:\n\n` +
        `${offenders.join('\n')}\n`,
    ).toEqual([]);
  });
});
