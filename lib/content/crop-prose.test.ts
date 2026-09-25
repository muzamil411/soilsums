import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { crops, type Crop } from '@/data/crops';

/**
 * A figure deleted from the dataset must not survive in the page's prose.
 *
 * This exists because it happened. Four crops had unsourced figures removed
 * from data/crops.ts — a blueberry frost offset, its weekly watering figure,
 * asparagus spacing, a marigold row spacing — and every automated check
 * passed while the body text went on quoting all of them. The field was gone,
 * the estimate marker was gone, and verify-data reported the crop as verified,
 * so a reader saw an unsourced number presented as a checked one. The marker
 * at least warned people; prose with no marker does not.
 *
 * The rule is narrow on purpose: where a field is NULL in the data — meaning
 * no publication supports a figure — the body may not state a figure of that
 * shape. It does not attempt to check whether prose agrees with a field that
 * does have a value, because that needs to understand what a number refers to:
 * "spears 7 to 9 inches tall" and "crowns 12 inches apart" are both inches
 * about asparagus and only one is a spacing claim. See the note at the bottom.
 */

/**
 * A rule fires when every field it names is null and the pattern matches.
 *
 * Naming more than one field is what makes the frost-offset rule usable: a
 * crop page saying "sow 4 weeks before your last frost" is quoting whichever
 * of the three planting offsets it has, and only a page with none of them has
 * no business stating one at all.
 *
 * `nearby` and `notNearby` are checked against a window of text around the
 * match, because the same shape of number means different things a few words
 * apart — "5 to 7 days" is germination, not days to maturity.
 */
const WINDOW = 60;

const DELETABLE: readonly {
  fields: readonly (keyof Crop)[];
  what: string;
  pattern: RegExp;
  nearby?: RegExp;
  notNearby?: RegExp;
}[] = [
  {
    fields: ['waterInchesPerWeek'],
    what: 'a weekly watering figure',
    pattern: /\b\d+(?:\.\d+)?\s*(?:inches|inch|in)\s+(?:a|per)\s+week/gi,
  },
  {
    // Only a crop with no sourced planting schedule at all. A page that
    // direct sows on a frost offset says so in exactly this shape.
    fields: [
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ],
    what: 'a frost offset for planting',
    pattern: /\b\d+\s*weeks?\s+(?:before|after)\s+(?:your\s+|the\s+)?last frost/gi,
  },
  {
    fields: ['sowIndoorsWeeksBeforeLastFrost'],
    what: 'an indoor sowing schedule',
    pattern: /(?:start(?:ed|ing)?|sow(?:n|ing)?)\s+indoors\s+(?:about\s+)?\*{0,2}\d+\s*weeks?/gi,
  },
  {
    fields: ['daysToMaturity'],
    what: 'a days-to-maturity figure',
    pattern: /\b\d+\s*(?:to|–|-)\s*\d+\s*days\b/gi,
    nearby: /matur|harvest|ready|picking|from (?:sowing|transplanting|planting)/i,
    notNearby: /germinat|sprout|emerge|soak/i,
  },
  {
    fields: ['rowSpacingInches'],
    what: 'a row spacing',
    pattern:
      /\b(?:rows?\s+\d+\s*(?:inches|inch|in)\b|\d+\s*(?:inches|inch|in)\s+between\s+rows)/gi,
  },
  {
    fields: ['yieldPerPlantLb'],
    what: 'a per-plant yield',
    pattern: /\b\d+(?:\.\d+)?\s*(?:to|–|-)\s*\d+(?:\.\d+)?\s*(?:lb|pounds?)\s+(?:per|a)\s+plant/gi,
  },
];

/**
 * Deliberate exceptions, each with a reason. A page may legitimately quote
 * another crop's figure, or a number of the same shape that means something
 * else. Keep this short — a long allowlist means the patterns are wrong.
 */
const ALLOWED: Readonly<Record<string, string>> = {};

function bodyOf(slug: string): string | null {
  const path = join('content', 'crops', `${slug}.mdx`);
  if (!existsSync(path)) return null;
  return matter(readFileSync(path, 'utf8')).content;
}

describe('crop prose against the dataset', () => {
  const withPages = crops.filter((crop) => bodyOf(crop.slug) !== null);

  it('covers every crop that has a page', () => {
    expect(withPages.length).toBeGreaterThan(20);
  });

  it.each(withPages)('$slug states no figure its data file deleted', (crop) => {
    const body = bodyOf(crop.slug) ?? '';
    const offences: string[] = [];

    for (const rule of DELETABLE) {
      const allNull = rule.fields.every(
        (field) => crop[field] === null || crop[field] === undefined,
      );
      if (!allNull) continue;

      for (const match of body.matchAll(rule.pattern)) {
        const at = match.index ?? 0;
        const window = body.slice(Math.max(0, at - WINDOW), at + match[0].length + WINDOW);
        if (rule.nearby && !rule.nearby.test(window)) continue;
        if (rule.notNearby && rule.notNearby.test(window)) continue;

        const key = `${crop.slug}:${rule.fields[0]}:${match[0].trim()}`;
        if (ALLOWED[key]) continue;
        const line = body.slice(0, at).split('\n').length;
        offences.push(
          `  ${crop.slug}.mdx:${line} states ${rule.what} — "${match[0].trim()}" — but ${rule.fields.join(', ')} ${rule.fields.length > 1 ? 'are' : 'is'} null in data/crops.ts`,
        );
      }
    }

    expect(
      offences,
      `A figure with no source in the data is being shown to readers as prose,\n` +
        `where no estimate marker can warn them about it:\n\n${offences.join('\n')}\n`,
    ).toEqual([]);
  });
});
