import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { SectionRule } from '@/components/ui/SectionRule';
import { SeedPacket } from '@/components/ui/SeedPacket';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { toolCategories, toolsByCategory, type ToolCategory } from '@/data/tools';

export const metadata: Metadata = pageMetadata({
  title: 'SoilSums — gardening calculators that give real numbers',
  description:
    'Free calculators for raised bed soil, mulch, fertilizer, plant spacing, watering and planting dates. Imperial or metric, no sign-up needed.',
  path: '/',
});

const categoryOrder: ToolCategory[] = [
  'soil-and-beds',
  'feeding-and-soil-health',
  'timing-and-planning',
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />

      <Container className="pt-8 pb-2">
        <h1 className="text-[2.125rem] sm:text-5xl">How much do you actually need?</h1>
        <p className="mt-4 max-w-xl text-lg">
          Twelve gardening calculators for the questions you hit standing in the garden centre with
          a phone in one hand. Soil for a raised bed, bags of mulch, pounds of fertilizer, how many
          plants fit, when to sow. Answers in imperial or metric, with the formula shown.
        </p>

        {/* A line rather than a panel of shortcuts. The four most-used tools
            were repeated here as cards and again in the lists below, which cost
            400px above the fold on a phone and pushed the first category
            heading out of view. One sentence does the same job. */}
        <p className="mt-4 max-w-xl">
          Most people arrive for the{' '}
          <Link href="/tools/raised-bed-soil-calculator/">raised bed soil calculator</Link> or the{' '}
          <Link href="/tools/mulch-calculator/">mulch calculator</Link>. All twelve are below,
          grouped by the job you are doing.
        </p>
      </Container>

      <Container>
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

        <SectionRule>Growing a specific crop?</SectionRule>
        <p className="max-w-xl">
          Crop guides cover spacing, sowing dates, water, pH, a realistic yield range and the
          problems that actually show up — each with the relevant calculators built into the page
          and pre-filled.
        </p>
        <p className="mt-3">
          <Link href="/crops/" className="font-semibold">
            Browse the crop guides
          </Link>
        </p>

        <SectionRule>From the notebook</SectionRule>
        <p className="max-w-xl">
          Longer reads on the things a calculator alone cannot settle: what to fill a bed with, how
          to read a fertilizer label, when to start seeds indoors, how to fix a compost pile that
          has stalled.
        </p>
        <p className="mt-3">
          <Link href="/blog/" className="font-semibold">
            Read the notebook
          </Link>
        </p>

        <SectionRule>Before you start measuring</SectionRule>
        <div className="prose-notebook">
          <p>
            Almost every wrong answer starts with a wrong measurement rather than wrong arithmetic.
            Four things are worth getting right before you type anything in.
          </p>
          <ul>
            <li>
              <strong>Measure the inside of a bed, not the outside.</strong> A bed built from
              two-inch lumber is four inches narrower inside than its outside dimensions suggest. On
              a four-by-eight bed that is most of a bag of soil.
            </li>
            <li>
              <strong>Decide the fill depth, not the wall height.</strong> Soil is normally filled
              to an inch or two below the rim so watering does not wash it over the edge. Use the
              depth you will actually fill to.
            </li>
            <li>
              <strong>Know whether the bed has a bottom.</strong> A bed sitting on open soil can be
              part-filled with coarse material or native soil underneath; a bed on a patio or with a
              solid base needs the whole volume in bought mix.
            </li>
            <li>
              <strong>Check the bag, not the brand.</strong> Bagged soil and compost come in one,
              one and a half, two and three cubic foot bags, and mulch bags differ again. The bag
              size is the number that decides how many bags you carry home.
            </li>
          </ul>
          <p>
            Expect to buy a little more than any calculator says. Fresh mixes settle as the organic
            matter in them breaks down, so a bed filled level in April usually wants topping up by
            the following spring. Ten per cent extra is a reasonable allowance for a raised bed, and
            for mulch, which compacts as it weathers.
          </p>
        </div>

        <SectionRule>How these calculators work</SectionRule>
        <div className="prose-notebook">
          <p>
            All twelve tools behave the same way, because the point is to get an answer and move on.
          </p>
          <ul>
            <li>
              <strong>The result updates as you type.</strong> There is no submit button. If a value
              does not make sense — a depth of zero, a negative length — the tool says so next to
              the field instead of showing you a broken number.
            </li>
            <li>
              <strong>Imperial or metric, your choice.</strong> Every tool has a unit toggle and
              remembers which you picked, so it opens the way you left it next time.
            </li>
            <li>
              <strong>The answer comes as a sentence.</strong> Not just &ldquo;32&rdquo;, but how
              many bags that is, and what it comes to in cubic yards or liters, so you can check it
              against what is stacked on the pallet.
            </li>
            <li>
              <strong>Your numbers live in the page address.</strong> Copy the link and the result
              travels with it — useful when one person is measuring and another is at the shop.
            </li>
            <li>
              <strong>The formula is on the page.</strong> Each tool shows the arithmetic it used
              with a worked example, so nothing is a black box and you can redo it by hand.
            </li>
          </ul>
          <p>
            Nothing is sent anywhere. The calculators run entirely in your browser, there is no
            account, and the only thing stored on your device is your unit preference and any garden
            plan you choose to save.
          </p>
        </div>

        <SectionRule>Who makes these</SectionRule>
        <p className="max-w-xl">
          SoilSums is written and maintained by one gardener, Muzamil Ali. Every formula is shown on
          the page it is used on, and every agronomic figure carries a source, so you can check the
          work rather than trust it.
        </p>
        <p className="mt-3">
          <Link href="/about/" className="font-semibold">
            About SoilSums and how these are checked
          </Link>
        </p>
      </Container>
    </>
  );
}
