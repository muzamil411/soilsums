import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isDraftArticleHref } from './draft-links';
import { listContent } from './mdx';

/**
 * Links between pages, checked at source level.
 *
 * The 404 risk itself is handled at render time: `mdx-components.tsx` degrades
 * a link to an unpublished article into plain text, because articles publish in
 * batches and a published one will always name several that are still drafts.
 * The end-to-end check that no built page links to an unbuilt route lives in
 * scripts/seo-audit.ts, which runs against out/ after the build.
 *
 * What is left here is the class of mistake the renderer cannot save you from:
 * a link to a slug that does not exist at all, which degrades to nothing and
 * silently loses the link forever.
 */
describe('internal links', () => {
  const articles = listContent('blog');
  const known = new Set(articles.map((entry) => entry.slug));
  const drafts = articles.filter((entry) => entry.frontmatter.draft === true);

  function blogLinksIn(filePath: string): string[] {
    const source = readFileSync(filePath, 'utf8');
    return [...source.matchAll(/\]\(\/blog\/([^/)]+)\/?\)/g)].flatMap((match) =>
      match[1] === undefined ? [] : [match[1]],
    );
  }

  it('never links to a blog slug that does not exist', () => {
    const offences = articles.flatMap((page) =>
      blogLinksIn(page.filePath)
        .filter((slug) => !known.has(slug))
        .map((slug) => `${page.slug} links to missing /blog/${slug}/`),
    );
    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('only names articles that exist in tool and crop frontmatter', () => {
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

  it('recognises a draft article href so the renderer can degrade it', () => {
    const draft = drafts[0];
    expect(draft, 'no drafts left to test against').toBeDefined();
    expect(isDraftArticleHref(`/blog/${draft?.slug}/`)).toBe(true);
    expect(isDraftArticleHref(`/blog/${draft?.slug}`)).toBe(true);
  });

  it('leaves published articles, tools, crops and external links alone', () => {
    const live = articles.find((entry) => entry.frontmatter.draft !== true);
    expect(live, 'no published articles to test against').toBeDefined();
    expect(isDraftArticleHref(`/blog/${live?.slug}/`)).toBe(false);
    expect(isDraftArticleHref('/tools/lime-calculator/')).toBe(false);
    expect(isDraftArticleHref('/crops/tomato/')).toBe(false);
    expect(isDraftArticleHref('/blog/')).toBe(false);
    expect(isDraftArticleHref('https://example.com/blog/anything/')).toBe(false);
  });
});
