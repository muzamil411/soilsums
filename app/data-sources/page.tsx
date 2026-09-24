import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { pageMetadata } from '@/lib/seo/metadata';
import { cropSources, crops } from '@/data/crops';

export const metadata: Metadata = pageMetadata({
  title: 'How this data is checked',
  description:
    'Where SoilSums numbers come from: US extension services and the Cornell Waste Management Institute, and which figures are estimates.',
  path: '/data-sources/',
});

/** Institutions cited across the crop data, counted from the data itself. */
function institutions(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const crop of crops) {
    // A crop may cite more than one publication where extensions disagree, and
    // each of them belongs in the count.
    for (const source of cropSources(crop)) {
      counts.set(source.institution, (counts.get(source.institution) ?? 0) + 1);
    }
    continue;
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default function DataSourcesPage() {
  const cited = institutions();
  const unverified = crops.filter((crop) => !crop.verified);

  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'How this data is checked', href: '/data-sources/' }]} />
      <h1 className="text-3xl sm:text-4xl">How this data is checked</h1>

      <div className="prose-notebook mt-6">
        <p>
          Every agronomic number on this site is either checked against a named university extension
          publication or marked as an estimate. Nothing sits in between, and no figure here was
          invented to fill a gap.
        </p>

        <Callout tone="caution" title="A checked figure is still a regional figure">
          <p>
            Extension services publish for their own soils and climate. Lime rates for the same soil
            texture differ several-fold between Kentucky, Colorado and Oregon. A spacing from
            Illinois is sound advice in Illinois. Where a number is worth arguing with, the page it
            appears on says so rather than presenting one answer as the answer.
          </p>
        </Callout>

        <h2>Where the numbers come from</h2>
        <p>
          Crop spacing and planting dates come from US university extension services — the publicly
          funded outreach arms of land-grant universities, which publish home-garden guides for
          their own states. Compost carbon-to-nitrogen ratios come from the Cornell Waste Management
          Institute and the University of Nebraska-Lincoln. Lime rates come from the University of
          Kentucky, with limits from Penn State and Colorado State. Turf seeding rates come from
          Penn State, UMass, NC State, Cornell, Nebraska, Florida, Arkansas, Colorado State and
          Kansas State.
        </p>
        <p>The crop guides cite these institutions:</p>
        <ul>
          {cited.map((entry) => (
            <li key={entry.name}>
              {entry.name} — {entry.count} crop{entry.count === 1 ? '' : 's'}
            </li>
          ))}
        </ul>
        <p>
          Magazine tables, gardening blogs and aggregator sites are not used, even where they agree
          with the extension figures. If two extension services disagree, both are shown rather than
          averaged: averaging a Kansas figure with a Colorado one produces a number that describes
          neither place.
        </p>

        <h2>Square foot gardening figures are a method, not research</h2>
        <p>
          The per-square plant counts you see quoted everywhere — 16 radishes, 9 spinach, 1 tomato
          per two squares — come from Mel Bartholomew&rsquo;s <em>Square Foot Gardening</em>, a
          system for laying out intensively amended raised beds. Cornell CALS describes the method;
          it does not publish those counts as spacing research. They work well on their own terms
          and badly as general advice, so this site keeps them separate from the density a
          crop&rsquo;s published row spacing implies, labels which is which, and never blends the
          two into one number.
        </p>
        <p>
          Where the Cornell page does not name a crop — most herbs, sweet corn, the large vines —
          there is no square foot gardening figure here, and the planner falls back to spacing.
        </p>

        <h2>What &ldquo;estimate&rdquo; means on a page</h2>
        <p>
          A figure marked{' '}
          <span className="border-ochre text-ochre border px-1 text-xs">estimate</span> is a typical
          published value that no extension source could be found for. It is kept because the
          calculator needs a number and removing it would leave a hole, but it has not been checked
          and should carry less weight than the figures around it. Most overseeding rates for turf
          are in this category, as are alfalfa meal and garden weeds in the compost tool.
        </p>
        <p>
          Verification is recorded field by field rather than per crop, so a crop can have checked
          spacing and an unchecked row spacing. Of the {crops.length} crop guides,{' '}
          {crops.length - unverified.length} have every checked field confirmed and{' '}
          {unverified.length} have at least one that could not be. Yields, days to maturity,
          companion lists and common problems were never systematically checked — companion planting
          in particular is garden tradition rather than science, and the crop pages say so.
        </p>

        <h2>Dates assume a Northern Hemisphere spring</h2>
        <p>
          Planting offsets are counted in weeks from your average last spring frost, which transfers
          reasonably from the US to the UK and Canada. In the Southern Hemisphere the seasons are
          flipped: enter your own spring frost date and read autumn wherever a page says fall, or
          every date will be six months out.
        </p>

        <h2>Checking a figure yourself</h2>
        <p>
          Search for the crop name plus &ldquo;extension&rdquo; and your own state or province. In
          the United States and Canada every state and provincial service publishes home-garden
          guides free, and they will be tuned to your soils and season in a way this site cannot be.
          In the UK the RHS plays a similar role. Where their figure differs from the one here,
          theirs is the better number for your garden: this site had to pick one, and it picked the
          one with a citation rather than the one that sounded most typical.
        </p>

        <h2>Found an error?</h2>
        <p>
          Corrections are welcome, particularly with a source. See the{' '}
          <Link href="/contact/">contact page</Link>. The{' '}
          <Link href="/disclaimer/">disclaimer</Link> covers why even a checked figure is a starting
          point rather than an instruction.
        </p>
      </div>
    </Container>
  );
}
