import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionRule } from '@/components/ui/SectionRule';
import { PlantLabel } from '@/components/ui/PlantLabel';
import { pageMetadata } from '@/lib/seo/metadata';
import { cropContent } from '@/content/crops/registry';
import { crops, type CropType } from '@/data/crops';
import { listPublished } from '@/lib/content/mdx';

const published = listPublished('crops').filter((entry) => cropContent[entry.slug] !== undefined);
const publishedSlugs = new Set(published.map((entry) => entry.slug));

export const metadata: Metadata = pageMetadata({
  title: 'Vegetable and herb growing guides',
  description:
    'Spacing, sowing dates, watering, soil pH and realistic yields for common vegetables and herbs, with the calculators built into each guide.',
  path: '/crops/',
  noIndex: published.length === 0,
});

const GROUPS: { type: CropType; name: string; blurb: string }[] = [
  {
    type: 'vegetable',
    name: 'Vegetables',
    blurb: 'The staples of a kitchen garden, from the easy to the demanding.',
  },
  { type: 'herb', name: 'Herbs', blurb: 'Small plants that earn their space several times over.' },
  { type: 'fruit', name: 'Fruit', blurb: 'Perennials and long-season crops that need planning.' },
];

export default function CropsIndexPage() {
  const waiting = crops.filter((crop) => !publishedSlugs.has(crop.slug));

  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Crops', href: '/crops/' }]} />
      <h1 className="text-3xl sm:text-4xl">Crop guides</h1>
      <p className="mt-4 max-w-xl text-lg">
        One page per crop: how far apart to space it, when to sow and transplant, how much water it
        wants, the pH range it prefers, what a plant realistically yields, and the problems worth
        watching for. The spacing, planting date and yield calculators are embedded in each guide
        and already filled in for that crop.
      </p>

      {GROUPS.map((group) => {
        const inGroup = published
          .map((entry) => crops.find((crop) => crop.slug === entry.slug))
          .filter(
            (crop): crop is NonNullable<typeof crop> =>
              crop !== undefined && crop.type === group.type,
          );
        if (inGroup.length === 0) return null;
        return (
          <section key={group.type}>
            <SectionRule>{group.name}</SectionRule>
            <p className="text-ink/80 -mt-3 mb-4 text-sm">{group.blurb}</p>
            <ul className="flex flex-wrap gap-2">
              {inGroup.map((crop) => (
                <li key={crop.slug}>
                  <PlantLabel href={`/crops/${crop.slug}/`}>{crop.name}</PlantLabel>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {waiting.length > 0 ? (
        <>
          <SectionRule>Still being written</SectionRule>
          <p className="max-w-xl">
            These crops have their spacing, timing and yield figures in the calculators already —
            they just do not have a written guide yet, and a page with a data table and no guidance
            would not be worth reading. They appear above as each one is finished.
          </p>
          <p className="text-ink/80 mt-3">{waiting.map((crop) => crop.name).join(', ')}.</p>
        </>
      ) : null}

      <SectionRule>Meanwhile</SectionRule>
      <ul className="space-y-2">
        <li>
          <Link href="/tools/plant-spacing-calculator/">The plant spacing calculator</Link> has all
          thirty crops in its dropdown
        </li>
        <li>
          <Link href="/tools/planting-date-calculator/">The planting date calculator</Link> works
          out a sowing calendar for any of them
        </li>
        <li>
          <Link href="/tools/garden-yield-estimator/">The yield estimator</Link> gives a harvest
          range for whatever you are planning
        </li>
        <li>
          <Link href="/blog/">The notebook</Link> covers the groundwork that applies to every crop
        </li>
      </ul>
    </Container>
  );
}
