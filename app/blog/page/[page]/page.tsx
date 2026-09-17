import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArticleList, Pagination } from '@/components/blog/ArticleList';
import { pageMetadata } from '@/lib/seo/metadata';
import { allPageNumbers, articlePage, pageCount } from '@/lib/content/blog';

/**
 * Covers every page number including 1, because `output: 'export'` rejects a
 * dynamic route that generates no paths at all — and with a notebook full of
 * drafts there may be only one page. Page 1 is a duplicate of /blog/, so it
 * canonicalises there and is left out of the index and the sitemap.
 */
export function generateStaticParams() {
  return allPageNumbers().map((page) => ({ page: String(page) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const first = page === '1';
  return pageMetadata({
    title: first ? 'The notebook' : `The notebook, page ${page}`,
    description: first
      ? 'Practical gardening guides from SoilSums — soil, fertilizer, compost, containers and planning.'
      : `Older articles from the SoilSums notebook — page ${page} of practical gardening guides.`,
    path: `/blog/page/${page}/`,
    // Page 1 is the same listing as /blog/, which is the canonical version.
    canonicalPath: first ? '/blog/' : undefined,
    noIndex: first,
  });
}

export default async function BlogPaginatedPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: raw } = await params;
  const page = Number(raw);
  const total = pageCount();

  if (!Number.isInteger(page) || page < 1 || page > total) {
    notFound();
  }

  const articles = articlePage(page);

  return (
    <Container className="py-8">
      <Breadcrumbs
        trail={[
          { name: 'Notebook', href: '/blog/' },
          { name: `Page ${page}`, href: `/blog/page/${page}/` },
        ]}
      />
      <h1 className="text-3xl sm:text-4xl">The notebook</h1>
      <p className="text-ink/80 mt-2">
        Page {page} of {total}.
      </p>
      <ArticleList articles={articles} />
      <Pagination page={page} total={total} />
    </Container>
  );
}
