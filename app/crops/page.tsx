import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PlantLabel } from '@/components/ui/PlantLabel';
import { Callout } from '@/components/ui/Callout';
import { pageMetadata } from '@/lib/seo/metadata';
import { listPublished } from '@/lib/content/mdx';

const crops = listPublished('crops');

export const metadata: Metadata = pageMetadata({
  title: 'Vegetable and herb growing guides',
  description:
    'Spacing, sowing dates, watering, soil pH and realistic yields for common vegetables and herbs, with the calculators built into each guide.',
  path: '/crops/',
  noIndex: crops.length === 0,
});

export default function CropsIndexPage() {
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

      {crops.length === 0 ? (
        <Callout title="Being written">
          <p>
            Crop guides are written one at a time, each with its own growing guidance rather than a
            data table dressed up as an article. A guide appears here when it is finished.
          </p>
          <p>
            In the meantime, the <Link href="/tools/">calculators</Link> work for any crop, and the{' '}
            <Link href="/blog/">notebook</Link> covers the groundwork.
          </p>
        </Callout>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-2">
          {crops.map((crop) => (
            <li key={crop.slug}>
              <PlantLabel href={`/crops/${crop.slug}/`}>{crop.frontmatter.title}</PlantLabel>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
