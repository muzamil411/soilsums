import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { SeedPacket } from '@/components/ui/SeedPacket';
import { pageMetadata } from '@/lib/seo/metadata';
import { tools } from '@/data/tools';

export const metadata: Metadata = pageMetadata({
  title: 'Page not found',
  description: 'That page does not exist. Here are the calculators people reach for most often.',
  path: '/404/',
  noIndex: true,
});

const suggestions = ['raised-bed-soil-calculator', 'mulch-calculator', 'fertilizer-calculator'];

export default function NotFound() {
  return (
    <Container className="py-12">
      <p className="font-display text-radish text-5xl">404</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">This page is not here</h1>
      <p className="mt-4 max-w-lg text-lg">
        The address may be mistyped, or the page may never have been published — pages here go live
        only once their content is finished, so a link from elsewhere can point at something that
        does not exist yet.
      </p>
      <p className="mt-4">
        Try <Link href="/tools/">all calculators</Link>, the <Link href="/crops/">crop guides</Link>
        , or the <Link href="/blog/">notebook</Link>.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {suggestions.map((slug) => {
          const tool = tools.find((candidate) => candidate.slug === slug);
          if (!tool) return null;
          return (
            <li key={tool.slug}>
              <SeedPacket
                no={tool.no}
                title={tool.name}
                href={tool.published ? `/tools/${tool.slug}/` : undefined}
                compact
              />
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
