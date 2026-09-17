import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type ContentKind = 'tools' | 'crops' | 'blog';

export type Faq = { question: string; answer: string };

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
