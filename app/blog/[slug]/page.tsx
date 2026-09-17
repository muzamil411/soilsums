import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionRule } from '@/components/ui/SectionRule';
import { FaqList } from '@/components/ui/FaqList';
import { JsonLd } from '@/components/seo/JsonLd';
import { AdSlot } from '@/components/ads/AdSlot';
import { AuthorBox } from '@/components/blog/AuthorBox';
import { articleContent } from '@/content/blog/registry';
import { getContent, isPublishable, listPublished } from '@/lib/content/mdx';
import { publishedArticles } from '@/lib/content/blog';
import { pageMetadata } from '@/lib/seo/metadata';
import { articleSchema } from '@/lib/seo/schema';
import { getTool } from '@/data/tools';
import { formatDate } from '@/lib/legal';

/**
 * Articles marked `draft: true` in their frontmatter are excluded here and
 * from the sitemap, so work in progress can be committed safely.
 */
export function generateStaticParams() {
  return listPublished('blog')
    .filter((entry) => articleContent[entry.slug] !== undefined)
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContent('blog', slug);
  if (!entry) return {};
  return pageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    path: `/blog/${slug}/`,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getContent('blog', slug);
  const Content = articleContent[slug];

  if (!entry || !Content || entry.frontmatter.draft === true) {
    notFound();
  }

  const published = entry.frontmatter.published;
  const updated = entry.frontmatter.updated;
  const faqs = entry.frontmatter.faqs ?? [];
  const heading = entry.frontmatter.heading ?? entry.frontmatter.title;

  // Tools named in the article's frontmatter, so each piece links onward to
  // the arithmetic it describes.
  const relatedToolSlugs = Array.isArray(entry.frontmatter.tools)
    ? (entry.frontmatter.tools as string[])
    : [];
  const tools = relatedToolSlugs
    .map((toolSlug) => getTool(toolSlug))
    .filter((tool): tool is NonNullable<typeof tool> =>
      Boolean(tool && tool.published && isPublishable('tools', tool.slug)),
    );

  // Other published articles, so a reader is never at a dead end.
  const others = publishedArticles()
    .filter((article) => article.slug !== slug)
    .slice(0, 4);

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: entry.frontmatter.title,
          description: entry.frontmatter.description,
          path: `/blog/${slug}/`,
          published,
          updated,
        })}
      />

      <Container className="pt-3 pb-8">
        <Breadcrumbs
          trail={[
            { name: 'Notebook', href: '/blog/' },
            { name: entry.frontmatter.title, href: `/blog/${slug}/` },
          ]}
        />

        <article>
          <h1 className="text-2xl sm:text-4xl">{heading}</h1>
          <p className="text-ink/70 mt-2 text-sm">
            By{' '}
            <Link href="/about/" className="font-semibold">
              Muzamil Ali
            </Link>
            {updated && formatDate(updated) ? (
              <>
                {' · Last updated '}
                <time dateTime={updated}>{formatDate(updated)}</time>
              </>
            ) : null}
          </p>
          <p className="text-ink/80 mt-3 max-w-prose text-lg">{entry.frontmatter.description}</p>

          <div className="prose-notebook mt-8">
            <Content />
          </div>
        </article>

        <AdSlot placement="mid-content" />

        <FaqList faqs={faqs} />

        {tools.length > 0 ? (
          <>
            <SectionRule>Do the sums</SectionRule>
            <ul className="space-y-2">
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}/`} className="font-semibold">
                    {tool.name}
                  </Link>{' '}
                  — {tool.summary.toLowerCase()}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {others.length > 0 ? (
          <>
            <SectionRule>More from the notebook</SectionRule>
            <ul className="space-y-2">
              {others.map((article) => (
                <li key={article.slug}>
                  <Link href={`/blog/${article.slug}/`}>{article.title}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <AuthorBox published={published} updated={updated} />

        <AdSlot placement="end-of-content" />
      </Container>
    </>
  );
}
