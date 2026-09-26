import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionRule } from '@/components/ui/SectionRule';
import { PlantLabel } from '@/components/ui/PlantLabel';
import { AdSlot } from '@/components/ads/AdSlot';
import { crops, inchesLabel, type Crop } from '@/data/crops';
import { cropContent } from '@/content/crops/registry';
import { listPublished } from '@/lib/content/mdx';
import { pageMetadata } from '@/lib/seo/metadata';
import { articleSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/JsonLd';

/**
 * The herb index, which exists to make one contrast rather than to list nine
 * pages: a herb bed wants the opposite of what a vegetable bed wants.
 *
 * The grouping is the advice. Alphabetical order would hide the only thing a
 * reader needs before buying anything — whether the plant is a shrub that will
 * outlive the bed or something resown every spring, because that decides where
 * it goes and how it is watered.
 *
 * Names and figures come from data/crops.ts, so the page cannot list a herb we
 * do not have or quote a spacing the guide disagrees with.
 */

const TITLE = 'Growing Herbs: A Herb Bed Wants the Opposite of a Veg Bed';
const DESCRIPTION =
  'Poor soil, sharp drainage and no feeding. Why herbs fail on ground that grows good vegetables, which ones outlive the bed, and which are resown each year.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/crops/herbs/',
});

/** The grouping is the advice, so it is stated rather than derived from a flag. */
const PERENNIAL = ['lavender', 'rosemary', 'sage', 'thyme', 'oregano'] as const;
const RESOWN = ['basil', 'parsley', 'cilantro', 'dill'] as const;

function published(): Set<string> {
  return new Set(
    listPublished('crops')
      .map((entry) => entry.slug)
      .filter((slug) => cropContent[slug] !== undefined),
  );
}

function group(slugs: readonly string[], live: Set<string>): Crop[] {
  return slugs
    .map((slug) => crops.find((crop) => crop.slug === slug))
    .filter((crop): crop is Crop => crop !== undefined && live.has(crop.slug));
}

function HerbCard({ crop, note }: { crop: Crop; note: string }) {
  return (
    <li className="border-ink/20 border p-3">
      <h3 className="font-display text-lg">
        <Link href={`/crops/${crop.slug}/`}>{crop.name}</Link>
      </h3>
      <p className="text-ink/70 text-xs">
        <em>{crop.scientificName}</em> · {inchesLabel(crop.spacingInches)} apart
      </p>
      <p className="text-ink/90 mt-1 text-sm">{note}</p>
    </li>
  );
}

const NOTES: Record<string, string> = {
  lavender:
    'Winter wet kills it, not winter cold. Will not reshoot from old wood, so prune every year from its first.',
  rosemary:
    'Grown from cuttings, not seed. Tender rather than hardy — a pot you can move indoors is often the answer.',
  sage: 'Four different plants are sold as sage and only Salvia officinalis is the kitchen one.',
  thyme:
    'The most drought-tolerant plant in the bed, and the one most often ruined by shade. Never mulch it with anything that holds water.',
  oregano:
    'Better dried than fresh, unusually — drying concentrates the oils. Spreads by runners, so contain it.',
  basil:
    'The one herb here that does want warmth, moisture and feeding. Pinch the flowers or it is finished in weeks.',
  parsley:
    'Slowest seed of any herb here, two to four weeks and uneven. A biennial, so the second year goes to seed.',
  cilantro:
    'Bolts as soon as the weather says summer. Afternoon shade and sowing again every few weeks are the whole technique.',
  dill: 'Will not transplant, so sow where it grows. Leaf, flower head and seed are three harvests weeks apart.',
};

export default function HerbsPage() {
  const live = published();
  const perennials = group(PERENNIAL, live);
  const resown = group(RESOWN, live);
  const marigold = crops.find((crop) => crop.slug === 'marigold');

  return (
    <>
      {/* A written page rather than a directory, so it declares itself as one —
          the same Article schema every crop guide and article carries. */}
      <JsonLd
        data={articleSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: '/crops/herbs/',
          published: '2026-09-26',
          updated: '2026-09-26',
        })}
      />
      <Container className="pt-3 pb-8">
        <Breadcrumbs
          trail={[
            { name: 'Crops', href: '/crops/' },
            { name: 'Herbs', href: '/crops/herbs/' },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl">Growing herbs</h1>
        <p className="text-ink/80 mt-2 max-w-prose">{DESCRIPTION}</p>

        <div className="prose-notebook mt-6">
          <p>
            Almost everything that goes wrong with herbs goes wrong because they were treated like
            vegetables. A vegetable bed is built to hold moisture and fertility: compost dug in, a
            feed through the season, watering when it is dry. Do that to a{' '}
            <Link href="/crops/lavender/">lavender</Link> or a{' '}
            <Link href="/crops/thyme/">thyme</Link> and you get a soft, sappy, mild-tasting plant
            that rots in its first wet winter.
          </p>
          <p>
            <strong>
              Most herbs want the opposite: poor soil, sharp drainage, full sun and no feeding.
            </strong>{' '}
            Not neglect — the conditions they evolved in. Thin, stony, dry ground produces short,
            hard growth with concentrated oils, which is both the flavour you are growing them for
            and the thing that survives the winter. The single most useful decision in a garden is
            therefore to keep the dry herbs together at an edge, and out of the bed you water.
          </p>
          <p>
            There are exceptions, and they matter. <Link href="/crops/basil/">Basil</Link>,{' '}
            <Link href="/crops/cilantro/">cilantro</Link>, <Link href="/crops/dill/">dill</Link> and{' '}
            <Link href="/crops/parsley/">parsley</Link> are soft annuals and biennials that do want
            moisture and a little feeding, so they belong with the vegetables rather than with the
            shrubs. That split is why this page is grouped the way it is instead of alphabetically.
          </p>
        </div>

        <SectionRule>Woody perennials — plant once, prune every year</SectionRule>
        <div className="prose-notebook">
          <p>
            Five of the nine are woody shrubs and subshrubs that will outlive the bed they are
            planted in. They share one habit that decides how you treat them:{' '}
            <strong>they will not reshoot from old bare wood.</strong> Left unpruned, each
            year&rsquo;s growth starts a little higher up, the base goes bare and brittle, the
            middle opens out, and cutting back into that wood does not bring the plant back. Prune
            lightly every year, from the first year, always into growth that still carries leaves.
          </p>
          <p>
            They also all want the same things, which makes them the easiest group in the garden to
            manage: one dry, sunny, sharply drained corner, watered while they establish and then
            largely left alone. Put them together and there is no compromise to make.
          </p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {perennials.map((crop) => (
            <HerbCard key={crop.slug} crop={crop} note={NOTES[crop.slug] ?? ''} />
          ))}
        </ul>

        <AdSlot placement="mid-content" />

        <SectionRule>Resown each year — annuals and one biennial</SectionRule>
        <div className="prose-notebook">
          <p>
            Four are sown fresh rather than kept: basil, cilantro and dill are annuals, and parsley
            is a biennial that makes leaves in its first year and runs to seed in its second. None
            of them can be rescued once it flowers, so the technique is not to keep a plant going
            but to have the next sowing already coming.
          </p>
          <p>
            <strong>
              Sowing again every two or three weeks is worth more than anything else you can do
            </strong>{' '}
            for cilantro and dill in particular. Both bolt as soon as the weather turns, and a
            single large sowing gives a glut and then nothing. Three of the four also resent
            transplanting — dill and cilantro have taproots that bolt when disturbed — which is why
            a pot from the supermarket so rarely settles into a bed.
          </p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resown.map((crop) => (
            <HerbCard key={crop.slug} crop={crop} note={NOTES[crop.slug] ?? ''} />
          ))}
        </ul>

        <SectionRule>Two that need saying separately</SectionRule>
        <div className="prose-notebook">
          <p>
            <strong>
              Mint, which we have no guide for yet, is the one nobody should plant in open ground.
            </strong>{' '}
            It spreads by underground runners and does not stop. A mint put into a bed will be in
            the rest of that bed within two seasons and is genuinely difficult to remove, because
            every fragment of root left behind regrows. Grow it in a container, standing clear of
            the soil so runners cannot reach over the rim. This is the only herb where the advice is
            a warning rather than a method.
          </p>
          {marigold ? (
            <p>
              <strong>Marigold</strong> sits in the herb group in our data and is not a herb at all
              — nothing on the plant goes in a kitchen. It earns its place beside them for a
              different reason: grown as a dense stand and dug in, it genuinely suppresses root-knot
              nematodes, which is one of the few companion planting claims that survives testing.
              Its <Link href="/crops/marigold/">guide</Link> covers what it does and does not do.
            </p>
          ) : null}
        </div>

        <SectionRule>What a herb bed needs, in one list</SectionRule>
        <div className="prose-notebook">
          <ul>
            <li>
              <strong>Full sun.</strong> Six or more hours. Shade gives longer, softer, sparser
              growth with noticeably less flavour, because the aromatic oils build in sunlight.
              Cilantro is the single exception and prefers afternoon shade once the weather warms.
            </li>
            <li>
              <strong>Sharp drainage above everything else.</strong> More woody herbs are lost to
              winter wet than to cold. On heavy ground, plant on a mound, in a{' '}
              <Link href="/tools/raised-bed-soil-calculator/">raised bed</Link> or in a pot, and
              push the mix towards the gritty end. Do not dig a gravel pocket into clay — it fills
              with water and holds it against the roots.
            </li>
            <li>
              <strong>No feeding, for the perennials.</strong> Rich soil and nitrogen give a big
              soft plant with weak flavour. The soft annuals are the exception and take a light
              feed.
            </li>
            <li>
              <strong>No water-holding mulch against the stems.</strong> A generous organic mulch in
              autumn keeps the crown damp through exactly the months it needs to be dry. Grit or
              gravel is fine.
            </li>
            <li>
              <strong>Pruning into leafy growth only.</strong> Never into the bare brown wood on any
              of the five perennials.
            </li>
          </ul>
          <p>
            No publication behind these pages gives a soil pH for an individual herb. UGA puts most
            herbs at about 6 to 7.5 and Minnesota at 6.0 to 7.5, which agree, and lavender and
            rosemary are singled out as taking the alkaline end. Each guide says so in its own quick
            facts table rather than printing a figure for the crop.
          </p>
        </div>

        <SectionRule>Planting them near something else</SectionRule>
        <div className="prose-notebook">
          <p>
            Herbs are the most-recommended companion plants in a vegetable garden, and the reasons
            given are a mixture of one well-supported mechanism and a great deal of folklore. The
            mechanism that holds up is that small open flowers feed the beneficial insects whose
            larvae eat aphids and caterpillars — which means letting some of the dill, cilantro,
            oregano and thyme actually flower rather than clipping it all for the kitchen.
          </p>
          <p>
            The other real effect is the one this page opened with, and it runs the other way: a
            woody herb next to a thirsty vegetable will be killed by the watering that vegetable
            needs. The <Link href="/tools/companion-planting-chart/">companion planting chart</Link>{' '}
            shows both, crop by crop, and labels how well each pairing is supported.
          </p>
        </div>

        <SectionRule>All the herb guides</SectionRule>
        <ul className="flex flex-wrap gap-2">
          {[...perennials, ...resown].map((crop) => (
            <li key={crop.slug}>
              <PlantLabel href={`/crops/${crop.slug}/`}>{crop.name}</PlantLabel>
            </li>
          ))}
        </ul>
        <p className="text-ink/70 mt-4 text-sm">
          Every guide above carries its figures with the publication they came from.{' '}
          <Link href="/crops/">All crop guides</Link> ·{' '}
          <Link href="/data-sources/">how this data is checked</Link>
        </p>

        <AdSlot placement="end-of-content" />
      </Container>
    </>
  );
}
