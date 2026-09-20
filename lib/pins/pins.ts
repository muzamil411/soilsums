import { listPublished, type ContentEntry, type ContentKind } from '@/lib/content/mdx';
import { absoluteUrl } from '@/lib/seo/site';
import { tools } from '@/data/tools';

/**
 * The Pinterest pin set, derived from the pages themselves.
 *
 * Every headline is a question the page actually asks — its own title, or one
 * of its FAQs — rather than a slogan written for the pin. That is the whole
 * design: a pin that promises something the page does not answer is a bounce,
 * and a headline invented here would drift from the page the first time the
 * page was edited. Two variants per page come from two different questions, so
 * the same page can be pinned twice without repeating itself.
 *
 * Nothing here is hand-maintained per page, so a newly published article gets
 * its two pins from `npm run pins` with no edit to this file. The boards are
 * the one exception: they are a judgement about where a pin belongs, so they
 * are mapped explicitly and fall back to a per-kind default.
 */
export type Board =
  | 'Raised Bed Gardening'
  | 'Composting Tips'
  | 'Soil pH and Fertilizer'
  | 'Vegetable Garden Planning'
  | 'Container Vegetable Gardening'
  | 'Growing Guides by Crop';

export type Pin = {
  readonly file: string;
  readonly kind: ContentKind;
  readonly slug: string;
  readonly variant: 'a' | 'b';
  /** Stamped on the packet band, as on the site's cards. */
  readonly catalogue: string;
  /** The large type. A real question, kept under HEADLINE_MAX_WORDS. */
  readonly headline: string;
  /** One line under the rule. */
  readonly support: string;
  /** Pinterest's own title field. */
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly board: Board;
};

/** A headline longer than this stops being readable in a phone-width feed. */
export const HEADLINE_MAX_WORDS = 10;
export const TITLE_MAX = 100;
export const DESCRIPTION_MIN = 150;
export const DESCRIPTION_MAX = 300;

/**
 * Where a pin belongs. Only the pages whose board is not obvious from their
 * kind are listed; everything else takes the default for its kind.
 *
 * `grass-seed-calculator` has no good home among the six boards — it is lawn
 * care, and the board list has no lawn board. It sits under garden planning as
 * the least wrong option, and docs/pinterest-pins.md says so.
 */
const BOARDS: Readonly<Record<string, Board>> = {
  'raised-bed-soil-calculator': 'Raised Bed Gardening',
  'what-to-fill-raised-garden-beds-with': 'Raised Bed Gardening',
  'compost-ratio-calculator': 'Composting Tips',
  'why-is-my-compost-not-breaking-down': 'Composting Tips',
  'lime-calculator': 'Soil pH and Fertilizer',
  'fertilizer-calculator': 'Soil pH and Fertilizer',
  'how-much-sulfur-to-lower-soil-ph': 'Soil pH and Fertilizer',
  'what-the-three-numbers-on-fertilizer-mean': 'Soil pH and Fertilizer',
  'potting-soil-calculator': 'Container Vegetable Gardening',
  'how-much-potting-soil-a-container-needs': 'Container Vegetable Gardening',
};

const DEFAULT_BOARD: Record<ContentKind, Board> = {
  blog: 'Vegetable Garden Planning',
  tools: 'Vegetable Garden Planning',
  crops: 'Growing Guides by Crop',
};

/** Straight quotes and trailing punctuation the packet layout does not want. */
function tidy(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function words(text: string): number {
  return tidy(text).split(' ').length;
}

/**
 * Shorter wording for the few page questions that run past the word limit.
 *
 * Trimming these mechanically was tried and abandoned: dropping filler words
 * turns "How much lime do I need to raise soil pH by 1 point?" into "How much
 * lime need to raise soil pH by 1 point?", which is not English. Each entry
 * here is the same question asked in fewer words, and the page still answers
 * it. A new page whose question is too long fails validation rather than
 * getting mangled, which is the point at which a human should write one.
 */
const HEADLINE_OVERRIDES: Readonly<Record<string, string>> = {
  'tool-compost-ratio-calculator-b': 'Why not just average the C:N ratios?',
  'tool-grass-seed-calculator-a': 'How much grass seed for 1,000 square feet?',
  'tool-grass-seed-calculator-b': 'Why does overseeding need less seed than a new lawn?',
  'tool-lime-calculator-a': 'How much lime raises soil pH by one point?',
  'tool-potting-soil-calculator-b': 'How many quarts of soil for a 12 inch pot?',
  'tool-raised-bed-soil-calculator-b': 'Must a raised bed be filled entirely with bought soil?',
};

function catalogueFor(kind: ContentKind, slug: string, index: number): string {
  if (kind === 'tools') {
    const tool = tools.find((entry) => entry.slug === slug);
    if (tool) return tool.no;
  }
  const letter = kind === 'blog' ? 'A' : 'C';
  return `No. ${letter}-${String(index + 1).padStart(2, '0')}`;
}

function pathFor(kind: ContentKind, slug: string): string {
  return kind === 'blog' ? `/blog/${slug}/` : kind === 'tools' ? `/tools/${slug}/` : `/crops/${slug}/`;
}

/** First sentence of a block of prose, if it is short enough for a card. */
function firstSentence(text: string, max: number): string | undefined {
  const sentence = tidy(text).split(/(?<=[.?!])\s+/)[0];
  if (sentence === undefined) return undefined;
  return sentence.length <= max ? sentence : undefined;
}

/**
 * The question each variant leads with, and which FAQ it came from.
 *
 * A tool's title is its name rather than a question, so both of its pins take
 * questions from its FAQs. Articles and crop guides lead with their own
 * heading and take their second pin from the first FAQ.
 */
function variantsFor(
  entry: ContentEntry,
  kind: ContentKind,
): [{ headline: string; faqIndex?: number }, { headline: string; faqIndex?: number }] {
  const faqs = entry.frontmatter.faqs ?? [];
  const title = entry.frontmatter.heading ?? entry.frontmatter.title;

  if (kind === 'tools') {
    return [
      { headline: faqs[0]?.question ?? title, faqIndex: faqs[0] ? 0 : undefined },
      { headline: faqs[1]?.question ?? title, faqIndex: faqs[1] ? 1 : undefined },
    ];
  }
  return [{ headline: title }, { headline: faqs[0]?.question ?? title, faqIndex: faqs[0] ? 0 : undefined }];
}

/**
 * The line under the rule.
 *
 * Where the headline is a question from the page's FAQs, the support is the
 * start of that question's own answer — so the card poses a real question and
 * begins to answer it, and every pin says something specific to its page.
 * Otherwise it is the first sentence of the page description, which is written
 * to stand alone and capped at 155 characters.
 *
 * Crop descriptions are a single sentence, so without the FAQ answer all nine
 * crop B pins printed the same fallback line. That is what this avoids.
 */
function supportFor(entry: ContentEntry, kind: ContentKind, faqIndex?: number): string {
  const answer = faqIndex === undefined ? undefined : entry.frontmatter.faqs?.[faqIndex]?.answer;
  if (answer !== undefined) {
    const sentence = firstSentence(answer, 130);
    if (sentence !== undefined) return sentence;
  }

  const fromDescription = firstSentence(entry.frontmatter.description, 160);
  if (fromDescription !== undefined) return fromDescription;

  const summary = tools.find((tool) => tool.slug === entry.slug)?.summary;
  if (kind === 'tools' && summary) return `${summary}.`;
  return tidy(entry.frontmatter.description).slice(0, 130);
}

function keywordFor(entry: ContentEntry, kind: ContentKind): string {
  const keyword = entry.frontmatter.keyword;
  if (typeof keyword === 'string' && keyword.trim() !== '') return keyword.trim();
  if (kind === 'tools') {
    return (tools.find((t) => t.slug === entry.slug)?.name ?? entry.frontmatter.title).toLowerCase();
  }
  return entry.frontmatter.title.toLowerCase();
}

/**
 * Builds the description from a hook naming the target keyword once, the
 * page's own summary, and a closing reason to click.
 *
 * Page descriptions vary in length, so the closing line is chosen from
 * longest to shortest until the whole thing fits Pinterest's useful range.
 * That keeps every description a natural sentence instead of a truncated one.
 */
function descriptionFor(
  entry: ContentEntry,
  kind: ContentKind,
  variant: 'a' | 'b',
  headline: string,
): string {
  const keyword = keywordFor(entry, kind);
  const body = tidy(entry.frontmatter.description);

  const hook =
    variant === 'a'
      ? kind === 'tools'
        ? `The ${keyword} works this out from your own measurements.`
        : `The short answer to "${keyword}", with the arithmetic shown.`
      : kind === 'tools'
        ? `${tidy(headline)} Answered on the ${keyword}.`
        : `${tidy(headline)} Answered in the SoilSums guide to "${keyword}".`;

  const tails =
    variant === 'a'
      ? [
          'Read it on SoilSums — free, no sign-up, and every figure sourced.',
          'Read it on SoilSums — free and no sign-up.',
          'Free on SoilSums.',
        ]
      : [
          'Every figure comes from a university extension source, and the working is shown.',
          'Every figure comes from a university extension source.',
          'With the working shown.',
        ];

  for (const tail of tails) {
    const candidate = tidy(`${hook} ${body} ${tail}`);
    if (candidate.length >= DESCRIPTION_MIN && candidate.length <= DESCRIPTION_MAX) {
      return candidate;
    }
  }
  // Out of range either way: return the shortest and let validatePins say so.
  return tidy(`${hook} ${body} ${tails[tails.length - 1]}`);
}

export function buildPins(): Pin[] {
  const pins: Pin[] = [];

  for (const kind of ['blog', 'tools', 'crops'] as const) {
    const pages = [...listPublished(kind)].sort((a, b) => a.slug.localeCompare(b.slug));

    pages.forEach((entry, index) => {
      const variants = variantsFor(entry, kind);
      const catalogue = catalogueFor(kind, entry.slug, index);
      const board = BOARDS[entry.slug] ?? DEFAULT_BOARD[kind];
      const prefix = kind === 'blog' ? 'article' : kind === 'tools' ? 'tool' : 'crop';

      for (const [variant, source] of [
        ['a', variants[0]],
        ['b', variants[1]],
      ] as const) {
        const file = `${prefix}-${entry.slug}-${variant}.png`;
        const headline = tidy(HEADLINE_OVERRIDES[file.replace(/\.png$/, '')] ?? source.headline);
        pins.push({
          file,
          kind,
          slug: entry.slug,
          variant,
          catalogue,
          headline,
          support: supportFor(entry, kind, source.faqIndex),
          title: tidy(headline).slice(0, TITLE_MAX),
          description: descriptionFor(entry, kind, variant, headline),
          url: absoluteUrl(pathFor(kind, entry.slug)),
          board,
        });
      }
    });
  }

  return pins;
}

/** Everything that would make a pin unusable, as a list of plain complaints. */
export function validatePins(pins: readonly Pin[]): string[] {
  const problems: string[] = [];
  const seenFiles = new Set<string>();

  for (const pin of pins) {
    if (seenFiles.has(pin.file)) problems.push(`${pin.file}: duplicate filename`);
    seenFiles.add(pin.file);

    if (words(pin.headline) > HEADLINE_MAX_WORDS) {
      problems.push(`${pin.file}: headline is ${words(pin.headline)} words — "${pin.headline}"`);
    }
    if (pin.title.length > TITLE_MAX) {
      problems.push(`${pin.file}: title is ${pin.title.length} chars`);
    }
    if (pin.description.length < DESCRIPTION_MIN || pin.description.length > DESCRIPTION_MAX) {
      problems.push(
        `${pin.file}: description is ${pin.description.length} chars, needs ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} — "${pin.description}"`,
      );
    }
    if (pin.support.trim() === '') problems.push(`${pin.file}: no supporting line`);
  }

  // Two pins per page, and the pair must not say the same thing twice.
  const byPage = new Map<string, Pin[]>();
  for (const pin of pins) {
    const key = `${pin.kind}/${pin.slug}`;
    byPage.set(key, [...(byPage.get(key) ?? []), pin]);
  }
  for (const [key, group] of byPage) {
    if (group.length !== 2) problems.push(`${key}: ${group.length} pins, expected 2`);
    if (group.length === 2 && group[0]!.headline === group[1]!.headline) {
      problems.push(`${key}: both variants use the same headline`);
    }
  }

  return problems;
}
