import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { pageMetadata } from '@/lib/seo/metadata';
import { listPublished } from '@/lib/content/mdx';

const articles = listPublished('blog');

export const metadata: Metadata = pageMetadata({
  title: 'The notebook — practical gardening guides',
  description:
    'Plain-English guides to soil mixes, fertilizer labels, frost dates, compost balance, containers and garden planning. No filler, no invented statistics.',
  path: '/blog/',
  noIndex: articles.length === 0,
});

export default function BlogIndexPage() {
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
        <Callout title="Being written">
          <p>
            Articles are drafted, checked against extension-service sources and only then published.
            Nothing is posted here to fill space.
          </p>
          <p>
            The <Link href="/tools/">calculators</Link> are the place to start meanwhile.
          </p>
        </Callout>
      ) : (
        <ul className="divide-rule mt-8 divide-y">
          {articles.map((article) => (
            <li key={article.slug} className="py-4">
              <h2 className="text-xl">
                <Link href={`/blog/${article.slug}/`} className="text-ink no-underline">
                  {article.frontmatter.title}
                </Link>
              </h2>
              <p className="text-ink/80 mt-1 text-sm">{article.frontmatter.description}</p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
