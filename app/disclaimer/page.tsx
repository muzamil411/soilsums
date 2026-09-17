import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { Callout } from '@/components/ui/Callout';
import { pageMetadata } from '@/lib/seo/metadata';
import { legalUpdated } from '@/lib/legal';
import { site } from '@/lib/seo/site';

export const metadata: Metadata = pageMetadata({
  title: 'Disclaimer',
  description:
    'SoilSums results are estimates. Why they vary from real-world quantities, and when to rely on a soil test or your local extension service instead.',
  path: '/disclaimer/',
});

export default function DisclaimerPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Disclaimer', href: '/disclaimer/' }]} />
      <h1 className="text-3xl sm:text-4xl">Disclaimer</h1>
      <LastUpdated date={legalUpdated} />

      <div className="prose-notebook mt-6">
        <Callout tone="caution" title="Every result on this site is an estimate">
          <p>
            The calculators are arithmetic applied to the numbers you type in. They cannot see your
            soil, your site or your season, and they are not a substitute for a soil test or advice
            from your local extension service.
          </p>
        </Callout>

        <h2>Why a result will differ from what you actually need</h2>
        <ul>
          <li>
            <strong>Soil settles.</strong> Fresh compost and bagged mixes lose volume as they settle
            and as organic matter breaks down. A bed filled exactly to the calculated volume will
            usually want topping up within a season.
          </li>
          <li>
            <strong>Bags vary.</strong> Bagged soil, compost and mulch are sold by volume that can
            be measured loose or compressed, and moisture content changes what is in the bag. Read
            the bag rather than assuming.
          </li>
          <li>
            <strong>Soil chemistry is local.</strong> Lime requirement in particular depends on
            buffering capacity, which no online form can measure. Two soils at the same pH can need
            substantially different amounts of limestone.
          </li>
          <li>
            <strong>Published rates are regional averages.</strong> Seeding rates, spacing, days to
            maturity and yields come from extension service and horticultural sources and reflect
            typical conditions, not your garden in a particular year.
          </li>
          <li>
            <strong>Frost dates are probabilities, not promises.</strong> An average last frost date
            is a statistical midpoint. Roughly half of years are later than it.
          </li>
        </ul>

        <h2>No professional advice</h2>
        <p>
          Nothing here is professional agronomic, horticultural, financial or legal advice. It is
          general information for home gardeners. Decisions with real cost or risk attached —
          amending soil chemistry, applying fertilizer near water, planting a commercial crop —
          should be made with a current soil test and advice from someone who can inspect the site.
          In the United States and Canada, a county or provincial extension service will usually do
          this cheaply or free; in the United Kingdom, the Royal Horticultural Society is a good
          starting point.
        </p>

        <h2>Chemicals and safety</h2>
        <p>
          Fertilizer, lime and other amendments are regulated products. Always follow the label on
          the product you actually bought: the label is the legal instruction and it overrides any
          figure this site gives you. Over-application can damage plants, and can run off into
          groundwater and watercourses. Keep products and treated areas away from children and pets
          as the label directs.
        </p>

        <h2>Accuracy and corrections</h2>
        <p>
          The formulas are unit-tested and the data files record the source of every published
          figure, but mistakes are still possible. If you find one, write to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a> and it will be fixed and noted. How the
          numbers are sourced and checked is described on the <Link href="/about/">about page</Link>
          .
        </p>

        <h2>External links</h2>
        <p>
          Links to extension services, standards bodies and other sites are provided for reference.
          SoilSums does not control those sites and is not responsible for their content or their
          privacy practices.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          The site is provided as-is, without warranty of any kind. To the fullest extent permitted
          by law, {site.author} accepts no liability for loss or damage — including wasted material,
          crop loss or costs incurred — arising from use of this site or reliance on its results.
          The <Link href="/terms/">terms of use</Link> set this out in full.
        </p>
      </div>
    </Container>
  );
}
