import { listContent, type ContentKind } from './mdx';

/**
 * Slugs that exist as content but are not published, by kind.
 *
 * A link from a published page to one of these is a 404: `output: 'export'`
 * builds only published routes, and nothing in the build complains about an
 * anchor pointing at a route it did not generate.
 *
 * Read once at module load. This only ever runs at build time — the file
 * system is not available in the browser — and the content directory does not
 * change while a build is running.
 */
function draftsOf(kind: ContentKind): ReadonlySet<string> {
  return new Set(
    listContent(kind)
      .filter((entry) => entry.frontmatter.draft === true)
      .map((entry) => entry.slug),
  );
}

const drafts: Record<'blog' | 'crops', ReadonlySet<string>> = {
  blog: draftsOf('blog'),
  crops: draftsOf('crops'),
};

/**
 * Whether an href points at a page that is written but not yet published.
 *
 * Articles and crop guides cross-link each other freely and publish in
 * batches, so at any moment a published page will name several that are still
 * drafts. Rather than forbidding those links — which would mean editing half a
 * dozen files every time a batch goes out — the renderer degrades them to plain
 * text, and they become real links on the day the target publishes.
 */
export function isDraftContentHref(href: string): boolean {
  const match = /^\/(blog|crops)\/([^/?#]+)\/?$/.exec(href);
  const section = match?.[1];
  const slug = match?.[2];
  if (section === undefined || slug === undefined) return false;
  return drafts[section as 'blog' | 'crops'].has(slug);
}

/** @deprecated Use isDraftContentHref, which also covers crop guides. */
export const isDraftArticleHref = isDraftContentHref;
