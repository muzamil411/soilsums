import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type ContentKind = 'tools' | 'crops' | 'blog';

export type Frontmatter = {
  title: string;
  description: string;
  /** Anything with draft: true is excluded from the build and the sitemap. */
  draft?: boolean;
  updated?: string;
  published?: string;
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
      return {
        kind,
        slug: file.replace(/\.mdx$/, ''),
        filePath,
        frontmatter: parsed.data as Frontmatter,
        wordCount: countWords(parsed.content),
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
