import { listPublished, type ContentEntry } from './mdx';

/** Articles per page in the notebook listing. */
export const ARTICLES_PER_PAGE = 8;

export type ArticleSummary = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly published: string | null;
  readonly updated: string | null;
  readonly wordCount: number;
};

function summarise(entry: ContentEntry): ArticleSummary {
  return {
    slug: entry.slug,
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    published: entry.frontmatter.published ?? null,
    updated: entry.frontmatter.updated ?? null,
    wordCount: entry.wordCount,
  };
}

/** Published articles, newest first. Drafts never appear. */
export function publishedArticles(): ArticleSummary[] {
  return listPublished('blog')
    .map(summarise)
    .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''));
}

export function pageCount(): number {
  return Math.max(1, Math.ceil(publishedArticles().length / ARTICLES_PER_PAGE));
}

/**
 * Every page number, including 1. The /blog/page/[page]/ route covers all of
 * them so that it always generates at least one path — `output: 'export'`
 * refuses a dynamic route that generates none. Page 1 duplicates /blog/, so it
 * canonicalises there, is marked noindex and stays out of the sitemap.
 */
export function allPageNumbers(): number[] {
  return Array.from({ length: pageCount() }, (_, index) => index + 1);
}

/** One page of articles. Page numbers are 1-based. */
export function articlePage(page: number): ArticleSummary[] {
  const all = publishedArticles();
  const start = (page - 1) * ARTICLES_PER_PAGE;
  return all.slice(start, start + ARTICLES_PER_PAGE);
}
