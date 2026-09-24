import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type ContentKind = 'tools' | 'crops' | 'blog';

export type Faq = { question: string; answer: string };

/** One step of an ordered procedure, for HowTo schema. */
export type HowToStep = { name: string; text: string };

/**
 * Normalises a frontmatter date to a plain YYYY-MM-DD string.
 *
 * YAML parses an unquoted `2026-09-17` into a JavaScript Date, so reading it
 * as a string gives "Thu Sep 17 2026 00:00:00 GMT+0000 (…)" — which then fails
 * to parse again downstream and renders as "Invalid Date". Normalising here
 * means every page gets the same shape whether the file quoted the date or not.
 */
export function toIsoDate(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString().slice(0, 10);
  }
  return undefined;
}

export type Frontmatter = {
  title: string;
  description: string;
  /** Shown as the page's h1 when it should differ from the meta title. */
  heading?: string;
  /** Anything with draft: true is excluded from the build and the sitemap. */
  draft?: boolean;
  updated?: string;
  published?: string;
  /**
   * Questions live in frontmatter rather than in the body so the same text
   * renders on the page and feeds FAQPage structured data. Answers are plain
   * prose, no markdown, because structured data cannot carry markup.
   */
  faqs?: Faq[];
  /**
   * An ordered procedure the page walks through. Emitted as HowTo schema, so
   * every step must also appear in the body in the same order.
   */
  howTo?: { name: string; description: string; steps: HowToStep[] };
  [key: string]: unknown;
};

export type ContentEntry = {
  kind: ContentKind;
  slug: string;
  filePath: string;
  frontmatter: Frontmatter;
  /** Words in the MDX body, excluding frontmatter, code fences and JSX tags. */
  wordCount: number;
};

const CONTENT_ROOT = join(process.cwd(), 'content');

/** Rough but stable prose word count: what a human would read on the page. */
export function countWords(body: string): number {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/[#*_>|`-]/g, ' ');
  const words = prose.match(/[A-Za-z0-9'’]+/g);
  return words ? words.length : 0;
}

export function listContent(kind: ContentKind): ContentEntry[] {
  const dir = join(CONTENT_ROOT, kind);
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const filePath = join(dir, file);
      const parsed = matter(readFileSync(filePath, 'utf8'));
      const frontmatter = parsed.data as Frontmatter;
      // Dates arrive from YAML as Date objects; every page wants a string.
      frontmatter.updated = toIsoDate(frontmatter.updated);
      frontmatter.published = toIsoDate(frontmatter.published);
      // FAQ answers are real page content, so they count towards the total.
      const faqWords = (frontmatter.faqs ?? []).reduce(
        (sum, faq) => sum + countWords(`${faq.question} ${faq.answer}`),
        0,
      );
      return {
        kind,
        slug: file.replace(/\.mdx$/, ''),
        filePath,
        frontmatter,
        wordCount: countWords(parsed.content) + faqWords,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Only content with draft: false (or absent) is publishable. */
export function listPublished(kind: ContentKind): ContentEntry[] {
  return listContent(kind).filter((entry) => entry.frontmatter.draft !== true);
}

export function hasContent(kind: ContentKind, slug: string): boolean {
  return existsSync(join(CONTENT_ROOT, kind, `${slug}.mdx`));
}

/** One entry by slug, or undefined when the file does not exist. */
export function getContent(kind: ContentKind, slug: string): ContentEntry | undefined {
  return listContent(kind).find((entry) => entry.slug === slug);
}

/** True when a page should be built: the content exists and is not a draft. */
export function isPublishable(kind: ContentKind, slug: string): boolean {
  const entry = getContent(kind, slug);
  return entry !== undefined && entry.frontmatter.draft !== true;
}
