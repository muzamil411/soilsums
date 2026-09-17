import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionRule } from '@/components/ui/SectionRule';
import { SeedPacket } from '@/components/ui/SeedPacket';
import { PlantLabel } from '@/components/ui/PlantLabel';
import { FaqList } from '@/components/ui/FaqList';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { AdSlot } from '@/components/ads/AdSlot';
import { CropFacts } from '@/components/crops/CropFacts';
import { CropCalculators } from '@/components/crops/CropCalculators';
import { cropContent } from '@/content/crops/registry';
import { crops, getCrop } from '@/data/crops';
import { getTool } from '@/data/tools';
import { getContent, isPublishable, listPublished } from '@/lib/content/mdx';
import { pageMetadata } from '@/lib/seo/metadata';

/** Tools worth reaching for from any crop guide. */
const CROP_TOOLS = [
  'plant-spacing-calculator',
  'planting-date-calculator',
  'garden-yield-estimator',
  'raised-bed-soil-calculator',
];

/**
 * A crop page exists only when the crop has a written guide that is not a
 * draft. A crop with data but no guidance is excluded here and from the
 * sitemap — a quick-facts table on its own would be a thin page.
 */
export function generateStaticParams() {
  return listPublished('crops')
    .filter((entry) => getCrop(entry.slug) !== undefined && cropContent[entry.slug] !== undefined)
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContent('crops', slug);
  if (!entry) return {};
  return pageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    path: `/crops/${slug}/`,
  });
}

export default async function CropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = getCrop(slug);
  const entry = getContent('crops', slug);
  const Content = cropContent[slug];

  if (!crop || !entry || !Content) {
    notFound();
  }

  const publishedCropSlugs = new Set(listPublished('crops').map((item) => item.slug));

  // Companions this reader can actually click through to, matched by name.
  const companionLinks = crop.companionPlants
    .map((name) => crops.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase()))
    .filter(
      (candidate): candidate is NonNullable<typeof candidate> =>
        candidate !== undefined && publishedCropSlugs.has(candidate.slug),
    );

  // Other guides in the same family, to keep the section from being a dead end.
  const relatedCrops = crops
    .filter(
      (candidate) =>
        candidate.slug !== crop.slug &&
        candidate.type === crop.type &&
        publishedCropSlugs.has(candidate.slug),
    )
    .slice(0, 6);

  const tools = CROP_TOOLS.map((toolSlug) => getTool(toolSlug)).filter(
    (tool): tool is NonNullable<typeof tool> =>
      Boolean(tool && tool.published && isPublishable('tools', tool.slug)),
  );

  const faqs = entry.frontmatter.faqs ?? [];
  const heading = entry.frontmatter.heading ?? entry.frontmatter.title;

  return (
    <Container className="pt-3 pb-8">
      <Breadcrumbs
        trail={[
          { name: 'Crops', href: '/crops/' },
          { name: crop.name, href: `/crops/${slug}/` },
        ]}
      />

      <h1 className="text-2xl sm:text-4xl">{heading}</h1>
      <p className="text-ink/80 mt-2 max-w-prose">{entry.frontmatter.description}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <CropFacts crop={crop} />
        <CropCalculators crop={crop} />
      </div>

      <AdSlot placement="below-result" />

      <article className="prose-notebook mt-10">
        <Content />
      </article>

      <SectionRule>Growing alongside {crop.name.toLowerCase()}</SectionRule>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-lg">Good neighbours</h3>
          <p className="mt-1 text-sm">
            {crop.companionPlants.join(', ') || 'No particular pairings.'}
          </p>
          {companionLinks.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {companionLinks.map((companion) => (
                <li key={companion.slug}>
                  <PlantLabel href={`/crops/${companion.slug}/`}>{companion.name}</PlantLabel>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h3 className="font-display text-lg">Keep apart from</h3>
          <p className="mt-1 text-sm">
            {crop.avoidPlanting.length > 0
              ? crop.avoidPlanting.join(', ')
              : 'Nothing in particular — this one is easy-going.'}
          </p>
          <h3 className="font-display mt-4 text-lg">Watch out for</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {crop.commonProblems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-ink/70 mt-4 text-sm">
        Companion planting pairings are traditional garden practice rather than settled science.
        Spacing, sun and water do far more for a crop than its neighbours do.
      </p>

      <AdSlot placement="mid-content" />

      <FaqList faqs={faqs} heading={`${crop.name} questions`} />

      {relatedCrops.length > 0 ? (
        <>
          <SectionRule>Other crop guides</SectionRule>
          <ul className="flex flex-wrap gap-2">
            {relatedCrops.map((related) => (
              <li key={related.slug}>
                <PlantLabel href={`/crops/${related.slug}/`}>{related.name}</PlantLabel>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionRule>Calculators for this crop</SectionRule>
      <ul className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <SeedPacket no={tool.no} title={tool.name} href={`/tools/${tool.slug}/`} compact>
              {tool.summary}
            </SeedPacket>
          </li>
        ))}
      </ul>

      <div className="border-rule mt-10 border-t pt-4">
        <LastUpdated date={entry.frontmatter.updated} />
        <p className="text-ink/70 text-sm">
          Written by{' '}
          <Link href="/about/" className="font-semibold">
            Muzamil Ali
          </Link>
          . The figures in the quick-facts table are typical published ranges that have not yet been
          checked against a primary source, so treat them as a starting point and defer to your
          local extension service. See the <Link href="/disclaimer/">disclaimer</Link> and{' '}
          <Link href="/about/">how these pages are made</Link>.
        </p>
      </div>

      <AdSlot placement="end-of-content" />
    </Container>
  );
}
