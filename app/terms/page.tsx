import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { pageMetadata } from '@/lib/seo/metadata';
import { legalUpdated } from '@/lib/legal';
import { site } from '@/lib/seo/site';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of use',
  description:
    'The terms for using SoilSums: what you may do with the calculators and content, what is not warranted, and the limits of liability.',
  path: '/terms/',
});

export default function TermsPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Terms', href: '/terms/' }]} />
      <h1 className="text-3xl sm:text-4xl">Terms of use</h1>
      <LastUpdated date={legalUpdated} />

      <div className="prose-notebook mt-6">
        <p>
          By using {site.url.replace('https://', '')} you agree to these terms. They are
          deliberately short. If you do not agree with them, please do not use the site.
        </p>

        <h2>What the site is</h2>
        <p>
          A free collection of gardening calculators and written guides, operated by {site.author}.
          There is no account, no subscription and nothing for sale. Access is offered as-is and may
          change or stop at any time.
        </p>

        <h2>Using the site</h2>
        <p>You may:</p>
        <ul>
          <li>
            Use the calculators for personal or commercial gardening purposes, free of charge.
          </li>
          <li>Share links to any page, including links carrying your own input values.</li>
          <li>Quote short passages with credit and a link back to the page you took them from.</li>
          <li>Print pages for your own use in the garden.</li>
        </ul>
        <p>You may not:</p>
        <ul>
          <li>
            Republish the written content or data files in bulk, or use them to train a model or
            populate another site, without written permission.
          </li>
          <li>Present the content as your own work, or remove attribution.</li>
          <li>
            Scrape the site at a rate that degrades it for other people, or attempt to interfere
            with its operation or security.
          </li>
          <li>Use the site in breach of any applicable law.</li>
        </ul>

        <h2>Intellectual property</h2>
        <p>
          The text, design, calculator implementations and compiled data files on this site are ©{' '}
          {site.founded}–{new Date().getFullYear()} {site.author}, except where a third-party source
          is credited. Underlying agronomic facts — a seeding rate, a spacing figure, a conversion
          factor — are not owned by anyone and are credited to their sources in the
          repository&rsquo;s data files.
        </p>

        <h2>No warranty</h2>
        <p>
          The site and everything on it is provided without warranty of any kind, express or
          implied, including fitness for a particular purpose and accuracy. Results are estimates,
          for the reasons set out in the <Link href="/disclaimer/">disclaimer</Link>, which forms
          part of these terms. Availability is not guaranteed.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {site.author} shall not be liable for any
          indirect, incidental or consequential loss, or for any loss of crops, materials, profit or
          opportunity, arising from use of this site or reliance on its content. Nothing in these
          terms excludes liability that cannot lawfully be excluded, including liability for death
          or personal injury caused by negligence, or for fraud.
        </p>

        <h2>Third-party content</h2>
        <p>
          Pages may carry advertising served by third parties and may link to external sites. Those
          parties are responsible for their own content and practices. See the{' '}
          <Link href="/privacy-policy/">privacy policy</Link> for what advertising involves.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may be updated; the date at the top of the page shows when they last were.
          Continuing to use the site after a change means you accept the updated terms.
        </p>

        <h2>Governing law and contact</h2>
        <p>
          These terms are governed by the laws applicable in the operator&rsquo;s place of
          residence, without regard to conflict-of-law rules, and nothing here affects consumer
          rights you have under the law of your own country. Questions about these terms go to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </Container>
  );
}
