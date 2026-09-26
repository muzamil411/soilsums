import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionRule } from '@/components/ui/SectionRule';
import { SeedPacket } from '@/components/ui/SeedPacket';
import { FaqList } from '@/components/ui/FaqList';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { JsonLd } from '@/components/seo/JsonLd';
import { AdSlot } from '@/components/ads/AdSlot';
import { toolComponents } from '@/components/tools/registry';
import { toolContent } from '@/content/tools/registry';
import { getTool, publishedTools, toolCategories, toolCountWord } from '@/data/tools';
import { getContent, isPublishable, listPublished } from '@/lib/content/mdx';
import { pageMetadata } from '@/lib/seo/metadata';
import { webApplicationSchema } from '@/lib/seo/schema';

/**
 * A tool page exists only when all three pieces exist: the tool is marked
 * published, it has a calculator component, and it has written content that is
 * not a draft. Anything else is excluded here and from the sitemap, so the
 * site never has a thin or half-finished page.
 */
function buildableTools() {
  return publishedTools.filter(
    (tool) =>
      toolComponents[tool.slug] !== undefined &&
      toolContent[tool.slug] !== undefined &&
      isPublishable('tools', tool.slug),
  );
}

export function generateStaticParams() {
  return buildableTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContent('tools', slug);
  if (!entry) return {};
  return pageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    path: `/tools/${slug}/`,
  });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const entry = getContent('tools', slug);
  const Calculator = toolComponents[slug];
  const Content = toolContent[slug];

  if (!tool || !entry || !Calculator || !Content) {
    notFound();
  }

  const related = tool.related
    .map((relatedSlug) => getTool(relatedSlug))
    .filter((candidate): candidate is NonNullable<typeof candidate> =>
      Boolean(candidate && candidate.published && isPublishable('tools', candidate.slug)),
    );

  // Crop guides that exist, so the calculators only link to real pages.
  const linkedCrops = listPublished('crops').map((crop) => crop.slug);

  const faqs = entry.frontmatter.faqs ?? [];
  const heading = entry.frontmatter.heading ?? entry.frontmatter.title;

  // Articles this page should point at, so none of them is orphaned.
  const articleSlugs = Array.isArray(entry.frontmatter.articles)
    ? (entry.frontmatter.articles as string[])
    : [];

  return (
    <>
      <JsonLd
        data={webApplicationSchema({
          name: entry.frontmatter.title,
          description: entry.frontmatter.description,
          path: `/tools/${slug}/`,
        })}
      />

      <Container className="pt-3 pb-8">
        <Breadcrumbs
          trail={[
            { name: 'Tools', href: '/tools/' },
            { name: tool.name, href: `/tools/${slug}/` },
          ]}
        />

        {/* The calculator is the first thing on the page, above the fold on a
            phone. Everything explanatory sits beneath it. */}
        <h1 className="mb-4 text-2xl sm:text-4xl">{heading}</h1>

        <Calculator toolSlug={slug} linkedCrops={linkedCrops} />

        <AdSlot placement="below-result" />

        <article className="prose-notebook mt-10">
          <Content />
        </article>

        <AdSlot placement="mid-content" />

        <FaqList faqs={faqs} />

        {related.length > 0 ? (
          <>
            <SectionRule>Related tools</SectionRule>
            <ul className="grid gap-4 sm:grid-cols-3">
              {related.map((relatedTool) => (
                <li key={relatedTool.slug}>
                  <SeedPacket
                    no={relatedTool.no}
                    title={relatedTool.name}
                    href={`/tools/${relatedTool.slug}/`}
                    compact
                  >
                    {relatedTool.summary}
                  </SeedPacket>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {articleSlugs.length > 0 ? (
          <>
            <SectionRule>Read more on this</SectionRule>
            <RelatedArticles slugs={articleSlugs} />
          </>
        ) : null}

        <SectionRule>Keep going</SectionRule>
        <ul className="space-y-2">
          <li>
            <Link href="/tools/">All {toolCountWord} calculators</Link>, grouped by the job you are
            doing
          </li>
          <li>
            <Link href={`/tools/#${tool.category}`}>
              More {toolCategories[tool.category].name.toLowerCase()} tools
            </Link>
          </li>
          <li>
            <Link href="/crops/">Crop guides</Link> with spacing, sowing dates and yields for
            individual vegetables
          </li>
          <li>
            <Link href="/blog/">The notebook</Link>, for the questions a calculator cannot answer
          </li>
          <li>
            <Link href="/about/">How these calculators are built and checked</Link>
          </li>
        </ul>

        <div className="border-rule mt-10 border-t pt-4">
          <LastUpdated date={entry.frontmatter.updated} />
          <p className="text-ink/70 text-sm">
            Written and checked by{' '}
            <Link href="/about/" className="font-semibold">
              Muzamil Ali
            </Link>
            . Results are estimates — see the <Link href="/disclaimer/">disclaimer</Link>.
          </p>
        </div>

        <AdSlot placement="end-of-content" />
      </Container>
    </>
  );
}
