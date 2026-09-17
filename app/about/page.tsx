import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/seo/site';

export const metadata: Metadata = pageMetadata({
  title: 'About SoilSums',
  description:
    'Who runs SoilSums, why it exists, and exactly how the calculators are built, sourced and checked before a page goes live.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'About', href: '/about/' }]} />
      <h1 className="text-3xl sm:text-4xl">About SoilSums</h1>

      <div className="prose-notebook mt-6">
        <p>
          SoilSums is a small, independent site that answers one kind of question: how much of
          something a garden needs. Cubic feet of soil for a raised bed. Bags of mulch at two
          inches. Pounds of a 10-10-10 fertilizer across four hundred square feet. How many lettuces
          fit in a bed four feet by eight. It is run by {site.author}.
        </p>

        <h2>Why it exists</h2>
        <p>
          Most of these sums are simple arithmetic, but they are easy to get wrong in the one place
          it matters — usually a unit conversion, or a depth in inches multiplied by an area in
          square feet without dividing by twelve. Getting it wrong means either three trips to the
          garden centre or six unopened bags in the garage.
        </p>
        <p>
          The existing answers online tend to fall into two camps: a calculator with no explanation
          of what it just did, or a long article that never gets to a number. SoilSums tries to do
          both on one page — the answer at the top, the working underneath.
        </p>

        <h2>How the calculators are built</h2>
        <p>Every tool on this site follows the same process.</p>
        <ol>
          <li>
            The arithmetic lives in a plain, separate function with typed inputs and outputs — no
            calculation happens inside a button or a form.
          </li>
          <li>
            That function gets unit tests before any interface is built, including the awkward
            cases: zero, negative numbers, absurdly large numbers, and the same input expressed in
            both imperial and metric.
          </li>
          <li>
            The page then shows the formula it used, with a worked example using real numbers, so
            you can check the result by hand if something looks off.
          </li>
          <li>
            Invalid input produces a plain-English message next to the field. You will never see
            <code> NaN</code> or an infinity symbol where a number should be.
          </li>
        </ol>

        <h2>Where the agronomic numbers come from</h2>
        <p>
          Some tools need more than arithmetic. Grass seeding rates, compost carbon-to-nitrogen
          values, lime requirements by soil texture, plant spacing, days to maturity and yield
          ranges are all published figures, and they vary between sources and regions.
        </p>
        <p>
          Every one of those values is stored in a data file alongside the source it came from and a
          flag recording whether it has been checked against a primary reference — typically a
          university extension service in the United States or Canada, or the Royal Horticultural
          Society in the United Kingdom. Values that have not yet been verified are marked as such
          in the repository, and a maintenance script lists them so none get quietly forgotten.
        </p>
        <p>
          Two things you will never find here: an invented statistic, and a personal anecdote used
          as evidence. If a figure has a source, the source is named. If it is a rule of thumb, it
          is called a rule of thumb.
        </p>

        <h2>What the results are and are not</h2>
        <p>
          Everything on this site is an estimate. Soil settles and compacts, bagged products vary in
          how much they actually contain, and the amount of lime a soil needs depends on buffering
          capacity that no online form can see. Where a decision has real consequences — amending pH
          in particular — a soil test from your local extension service is worth more than any
          calculator, including this one. The <Link href="/disclaimer/">disclaimer</Link> says this
          in full.
        </p>

        <h2>How the site is paid for</h2>
        <p>
          SoilSums is free and needs no account. It is funded by advertising, which is kept out of
          the calculators themselves — you will not find an ad between an input field and its
          result. What data advertising involves is set out in the{' '}
          <Link href="/privacy-policy/">privacy policy</Link> and the{' '}
          <Link href="/cookie-policy/">cookie policy</Link>.
        </p>

        <h2>Corrections</h2>
        <p>
          If a number here is wrong, or a formula does not match what your extension service
          publishes, please say so — corrections are the most useful mail this site gets. Write to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>, or use the{' '}
          <Link href="/contact/">contact page</Link>.
        </p>
      </div>
    </Container>
  );
}
