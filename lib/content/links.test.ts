import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { listContent, listPublished } from './mdx';

/**
 * A published page must not link to a draft one.
 *
 * `output: 'export'` only builds published routes, so a link from a live page
 * to a draft is a 404 for every reader who follows it — and it will not show up
 * in a build, because the build is perfectly happy to emit the anchor. This is
 * the check that would have caught it.
 */
describe('internal links', () => {
  const draftSlugs = new Set(
    listContent('blog')
      .filter((entry) => entry.frontmatter.draft === true)
      .map((entry) => entry.slug),
  );

  const publishedPages = [
    ...listPublished('blog'),
    ...listPublished('tools'),
    ...listPublished('crops'),
  ];

  it('has drafts to check against', () => {
    expect(draftSlugs.size).toBeGreaterThan(0);
    expect(publishedPages.length).toBeGreaterThan(0);
  });

  it('never links from a published page to a draft article', () => {
    const offences: string[] = [];

    for (const page of publishedPages) {
      const source = readFileSync(page.filePath, 'utf8');
      for (const match of source.matchAll(/\]\(\/blog\/([^/)]+)\/?\)/g)) {
        const target = match[1];
        if (target !== undefined && draftSlugs.has(target)) {
          offences.push(`${page.kind}/${page.slug} links to draft /blog/${target}/`);
        }
      }
    }

    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('never links to a blog slug that does not exist', () => {
    const known = new Set(listContent('blog').map((entry) => entry.slug));
    const offences: string[] = [];

    for (const page of listContent('blog')) {
      const source = readFileSync(page.filePath, 'utf8');
      for (const match of source.matchAll(/\]\(\/blog\/([^/)]+)\/?\)/g)) {
        const target = match[1];
        if (target !== undefined && !known.has(target)) {
          offences.push(`${page.slug} links to missing /blog/${target}/`);
        }
      }
    }

    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('only names articles that exist in tool and crop frontmatter', () => {
    const known = new Set(listContent('blog').map((entry) => entry.slug));
    const offences: string[] = [];

    for (const page of [...listContent('tools'), ...listContent('crops')]) {
      const named = page.frontmatter.articles;
      if (!Array.isArray(named)) continue;
      for (const slug of named as string[]) {
        if (!known.has(slug)) offences.push(`${page.kind}/${page.slug} names missing ${slug}`);
      }
    }

    expect(offences, offences.join('\n')).toEqual([]);
  });
});
