import { listContent } from './mdx';

/**
 * Slugs of articles that exist but are not published.
 *
 * A link from a published page to one of these is a 404: `output: 'export'`
 * builds only published routes, and nothing in the build complains about an
 * anchor pointing at a route it did not generate.
 *
 * Read once at module load. This only ever runs at build time — the file
 * system is not available in the browser — and the content directory does not
 * change while a build is running.
 */
const draftSlugs: ReadonlySet<string> = new Set(
  listContent('blog')
    .filter((entry) => entry.frontmatter.draft === true)
    .map((entry) => entry.slug),
);

/**
 * Whether an href points at an article that is written but not yet published.
 *
 * Articles cross-link each other freely, and they are published in batches, so
 * at any moment a published article will name several that are still drafts.
 * Rather than forbidding those links — which would mean editing five articles
 * every time a batch goes out — the renderer degrades them to plain text, and
 * they become real links on the day the target publishes.
 */
export function isDraftArticleHref(href: string): boolean {
  const match = /^\/blog\/([^/?#]+)\/?$/.exec(href);
  return match?.[1] !== undefined && draftSlugs.has(match[1]);
}
