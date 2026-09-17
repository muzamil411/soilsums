import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { ArticleList, Pagination } from '@/components/blog/ArticleList';
import { pageMetadata } from '@/lib/seo/metadata';
import { articlePage, pageCount, publishedArticles } from '@/lib/content/blog';

const articles = publishedArticles();

export const metadata: Metadata = pageMetadata({
  title: 'The notebook — practical gardening guides',
  description:
    'Plain-English guides to soil mixes, fertilizer labels, frost dates, compost balance, containers and garden planning. No filler, no invented statistics.',
  path: '/blog/',
  noIndex: articles.length === 0,
});

export default function BlogIndexPage() {
  const page = articlePage(1);

  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Notebook', href: '/blog/' }]} />
      <h1 className="text-3xl sm:text-4xl">The notebook</h1>
      <p className="mt-4 max-w-xl text-lg">
        The longer answers. A calculator tells you how many cubic feet of soil a bed takes; these
        articles cover what to put in it, why the label on the fertilizer bag says what it says, and
        how to plan a season so beds are not empty in August.
      </p>

      {articles.length === 0 ? (
        <Callout title="Drafted, not yet published">
          <p>
            Twenty articles are written and sitting in the repository marked as drafts, waiting to
            be fact-checked against extension-service sources before they go live. Nothing is posted
            here to fill space, so the list stays empty until the first one is ready.
          </p>
          <p>
            The <Link href="/tools/">calculators</Link> and the{' '}
            <Link href="/crops/">crop guides</Link> are the place to start meanwhile.
          </p>
        </Callout>
      ) : (
        <>
          <ArticleList articles={page} />
          <Pagination page={1} total={pageCount()} />
        </>
      )}
    </Container>
  );
}
