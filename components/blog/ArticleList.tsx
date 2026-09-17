import Link from 'next/link';
import type { ArticleSummary } from '@/lib/content/blog';
import { formatDate } from '@/lib/legal';

/** The notebook listing: a ruled list rather than a grid of cards. */
export function ArticleList({ articles }: { articles: readonly ArticleSummary[] }) {
  return (
    <ul className="divide-rule mt-8 divide-y">
      {articles.map((article) => (
        <li key={article.slug} className="py-4">
          <h2 className="text-xl">
            <Link href={`/blog/${article.slug}/`} className="text-ink no-underline">
              {article.title}
            </Link>
          </h2>
          <p className="text-ink/80 mt-1 max-w-prose text-sm">{article.description}</p>
          {article.published ? (
            <p className="text-ink/60 mt-1 text-xs">
              <time dateTime={article.published}>{formatDate(article.published)}</time>
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Previous and next links, shown only when there is more than one page. */
export function Pagination({ page, total }: { page: number; total: number }) {
  if (total <= 1) return null;

  const href = (target: number) => (target === 1 ? '/blog/' : `/blog/page/${target}/`);

  return (
    <nav
      aria-label="Pagination"
      className="border-rule mt-8 flex items-center justify-between border-t pt-4"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="font-semibold">
          Newer articles
        </Link>
      ) : (
        <span />
      )}
      <span className="text-ink/70 text-sm">
        Page {page} of {total}
      </span>
      {page < total ? (
        <Link href={href(page + 1)} className="font-semibold">
          Older articles
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
