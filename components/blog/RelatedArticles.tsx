import Link from 'next/link';
import { publishedArticles } from '@/lib/content/blog';

/**
 * Articles named in a tool or crop page's frontmatter, so an article is never
 * orphaned: every one of them is linked from the calculator and the crop it
 * belongs to, not only from the notebook index.
 *
 * Drafts are filtered out here rather than at the call site, which means a page
 * can name an article before it is published and the link simply appears when
 * it goes live.
 */
export function RelatedArticles({ slugs }: { slugs: readonly string[] }) {
  const published = publishedArticles();
  const articles = slugs.flatMap((slug) => {
    const article = published.find((entry) => entry.slug === slug);
    return article ? [article] : [];
  });

  if (articles.length === 0) return null;

  return (
    <ul className="space-y-2">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link href={`/blog/${article.slug}/`} className="font-semibold">
            {article.title}
          </Link>
          <span className="text-ink/80"> — {article.description}</span>
        </li>
      ))}
    </ul>
  );
}
