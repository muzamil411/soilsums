import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionRule } from '@/components/ui/SectionRule';
import { SeedPacket } from '@/components/ui/SeedPacket';
import { pageMetadata } from '@/lib/seo/metadata';
import {
  ToolCountWord,
  publishedTools,
  toolCategories,
  toolsByCategory,
  type ToolCategory,
} from '@/data/tools';

export const metadata: Metadata = pageMetadata({
  title: 'All gardening calculators',
  description:
    'Every SoilSums calculator, grouped by job: soil and bed volumes, fertilizer and soil health, and timing and planning. Imperial or metric.',
  path: '/tools/',
  // Keeps an index with nothing published on it out of Google.
  noIndex: publishedTools.length === 0,
});

const categoryOrder: ToolCategory[] = [
  'soil-and-beds',
  'feeding-and-soil-health',
  'timing-and-planning',
];

export default function ToolsIndexPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Tools', href: '/tools/' }]} />
      <h1 className="text-3xl sm:text-4xl">All calculators</h1>
      <p className="mt-4 max-w-xl text-lg">
        {ToolCountWord} calculators, grouped by the job you are doing. Each one shows its formula,
        works in imperial or metric, and keeps your numbers in the page address so you can send a
        result to whoever is holding the wheelbarrow.
      </p>

      {categoryOrder.map((category) => (
        <section key={category}>
          <SectionRule id={category}>{toolCategories[category].name}</SectionRule>
          <p className="text-ink/80 -mt-3 mb-4 text-sm">{toolCategories[category].blurb}</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {toolsByCategory(category).map((tool) => (
              <li key={tool.slug}>
                <SeedPacket
                  no={tool.no}
                  title={tool.name}
                  href={tool.published ? `/tools/${tool.slug}/` : undefined}
                >
                  {tool.summary}
                </SeedPacket>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Container>
  );
}
