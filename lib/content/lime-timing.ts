import { LIME_TIMING } from '@/data/lime-rates';

/**
 * Finds any statement of how long lime takes to move soil pH, so nothing can
 * state a figure other than the one in data/lime-rates.ts.
 *
 * This exists because the site held three answers at once and nobody noticed
 * for months: the pH article said three to six months in five places, the lime
 * calculator said six months to a year in two, a generated figure said three to
 * six, and the lawn lime article said no sourced figure existed. Each was
 * written in prose or in frontmatter, where no data file could reach it, so
 * there was nothing to drift against.
 *
 * Deriving the figure was not enough on its own. Two of the surfaces are YAML
 * frontmatter — a meta description and an FAQ answer, which the pin images are
 * also generated from — and frontmatter cannot import a module. So the guard
 * reads what shipped instead: any month figure in a lime-timing sentence, in
 * the rendered copy, whatever produced it.
 */

/** A month figure, spelled out or in digits, as either a range or a single. */
const MONTH_FIGURE =
  /\b(?:(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s*(?:to|–|-|through)\s*)?(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+months?\b/gi;

/** "six months to a year" and its variants, which name no second month figure. */
const MONTHS_TO_A_YEAR =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+months?\s+to\s+(?:a|one)\s+year\b/gi;

/**
 * A range with the noun left off, which is how one of the three answers hid.
 *
 * The pH article's FAQ said "the answer is months, not days — three to six
 * before the full change shows": a figure with no unit beside it, which a grep
 * for "months" cannot find. It is only read as months because the previous
 * clause said months, so that is exactly the test — a bare range counts when
 * the words just before it name the unit.
 */
const BARE_RANGE =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(?:to|–|-)\s*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b(?!\s*(?:months?|weeks?|days?|years?|times?|inch|inches|lb|pounds?|percent|%|applications?|passes|units?|square|per\b))/gi;

/** What has to appear just before a bare range for it to be a month figure. */
const UNIT_NAMED_NEARBY = /\bmonths?\b/i;

/**
 * Words that make a sentence about how long lime takes to move pH, rather than
 * about one of the other quantities the same pages measure in months.
 *
 * Those others are real and must not be flagged: Penn State splits a large
 * correction into applications four to six months apart, Maryland six months
 * apart, blueberry beds are acidified about six months before planting, and
 * nitrogen wants several weeks' clearance. `EXCLUDED` is what tells them from a
 * timing claim.
 */
const TIMING_CONTEXT =
  /\b(lime|limed|liming|limestone|soil ph|ph (?:has|had)?\s*(?:fully\s*)?(?:move|moves|moved|rise|rises|risen|change|changes|changed)|full change|raise soil ph)\b/i;

const EXCLUDED =
  /\b(apart|semiannual|split|splitting|second half|costs? you|staying under|again in|the same again|before planting|before you plant|has already happened)\b/i;

/** The window either side of a match that decides whether it is a timing claim. */
const WINDOW = 180;

/** The window that decides whether it is one of the other month quantities. */
const NEAR_BEFORE = 90;
const NEAR_AFTER = 45;

export type TimingFinding = {
  /** The matched phrase, e.g. "three to six months". */
  phrase: string;
  /** The sentence fragment it sits in, for the failure message. */
  context: string;
};

type Span = { start: number; end: number };

function findIn(text: string, pattern: RegExp, skip: readonly Span[] = []): TimingFinding[] {
  const found: TimingFinding[] = [];
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    const end = at + match[0].length;
    if (skip.some((span) => at >= span.start && end <= span.end)) continue;

    const context = text.slice(Math.max(0, at - WINDOW), end + WINDOW);
    if (!TIMING_CONTEXT.test(context)) continue;

    // The same pages measure other things in months — how far apart two
    // applications of a split correction go, how long before planting a
    // blueberry bed is acidified — and those are not this figure.
    const near = text.slice(Math.max(0, at - NEAR_BEFORE), end + NEAR_AFTER);
    if (EXCLUDED.test(near)) continue;

    found.push({ phrase: match[0].trim(), context: context.replace(/\s+/g, ' ').trim() });
  }
  return found;
}

/** Every lime-timing statement in a page's text that is not the figure we hold. */
export function wrongTimingStatements(text: string): TimingFinding[] {
  // The words as prose writes them, and the digits as UMass writes them in the
  // quoted sentence — "(4-6 months)" is the same figure and must not be flagged.
  const [low, high] = LIME_TIMING.monthsToMovePh;
  const expected = new RegExp(
    `^(?:${LIME_TIMING.words}(\\s+months?)?|${low}\\s*(?:to|–|-)\\s*${high}\\s+months?)$`,
    'i',
  );

  // "six months to a year" contains "six months", so the narrower pattern is
  // told to skip what the wider one already claimed rather than reporting the
  // same sentence twice.
  const toAYear: Span[] = [...text.matchAll(MONTHS_TO_A_YEAR)].map((match) => ({
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));

  const withNoun = findIn(text, MONTH_FIGURE, toAYear);
  const claimed: Span[] = [
    ...toAYear,
    ...[...text.matchAll(MONTH_FIGURE)].map((match) => ({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    })),
  ];

  const bare = findIn(text, BARE_RANGE, claimed).filter((finding) =>
    UNIT_NAMED_NEARBY.test(
      finding.context.slice(0, Math.max(0, finding.context.indexOf(finding.phrase))).slice(-70),
    ),
  );

  return [
    ...findIn(text, MONTHS_TO_A_YEAR),
    ...[...withNoun, ...bare].filter(
      (finding) => !expected.test(finding.phrase.replace(/\s+/g, ' ')),
    ),
  ];
}
