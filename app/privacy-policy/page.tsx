import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { pageMetadata } from '@/lib/seo/metadata';
import { legalUpdated } from '@/lib/legal';
import { site } from '@/lib/seo/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description:
    'What SoilSums collects, how advertising cookies and Google Analytics are used, how to opt out, and how to contact us about your data.',
  path: '/privacy-policy/',
});

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Privacy policy', href: '/privacy-policy/' }]} />
      <h1 className="text-3xl sm:text-4xl">Privacy policy</h1>
      <LastUpdated date={legalUpdated} />

      <div className="prose-notebook mt-6">
        <p>
          This policy explains what happens to information when you use{' '}
          {site.url.replace('https://', '')}. The short version: the site has no accounts, no
          database and no server that stores anything about you. The calculators run entirely in
          your browser. What third parties see is described below.
        </p>

        <h2>Who is responsible</h2>
        <p>
          SoilSums is an independent website operated by {site.author}. For questions about this
          policy or about your data, write to <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2>Information you give us</h2>
        <p>
          Only what you choose to put in an email. There are no sign-up forms, no newsletter and no
          contact form on this site — the <Link href="/contact/">contact page</Link> is an email
          address. Mail you send is forwarded through Cloudflare Email Routing to a personal inbox,
          used to reply to you, and not added to any list or shared with anyone.
        </p>

        <h2>Information the calculators handle</h2>
        <p>
          The numbers you type into a calculator are processed in your browser and are never sent to
          us. Two details are worth knowing:
        </p>
        <ul>
          <li>
            <strong>Your inputs appear in the page address.</strong> Tools put your values into the
            URL so a result can be bookmarked or shared. That means anyone you send the link to can
            see those numbers, and they may appear in your browser history.
          </li>
          <li>
            <strong>Some preferences are stored on your own device.</strong> Your choice of imperial
            or metric units, and any garden plan you save in the square foot planner, are kept in
            your browser&rsquo;s local storage. That data stays on your device, is not transmitted
            to us, and is removed if you clear your browser&rsquo;s site data.
          </li>
        </ul>

        <h2>Information collected automatically</h2>
        <p>
          The site is served as static files by a hosting provider (Cloudflare Pages). Like any web
          host, it processes the technical information your browser sends with each request — IP
          address, user agent, the page requested and the time — to deliver the page and to protect
          against abuse. We do not maintain our own analytics logs of this.
        </p>

        <h2>Advertising and cookies</h2>
        <p>
          SoilSums is funded by advertising. When advertising is active on the site, the following
          applies:
        </p>
        <ul>
          <li>
            Third-party vendors, <strong>including Google</strong>, use cookies to serve ads based
            on your prior visits to this website or other websites.
          </li>
          <li>
            Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to
            you based on your visit to this site and/or other sites on the internet.
          </li>
          <li>
            You may opt out of personalised advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              Google Ads Settings
            </a>
            . You can also opt out of a third-party vendor&rsquo;s use of cookies for personalised
            advertising at{' '}
            <a
              href="https://www.aboutads.info/choices/"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              aboutads.info
            </a>{' '}
            or{' '}
            <a
              href="https://optout.networkadvertising.org/"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              the Network Advertising Initiative
            </a>
            .
          </li>
          <li>
            Opting out does not remove advertising from the site; it means the ads you see are less
            likely to be based on your browsing history.
          </li>
        </ul>
        <p>
          Google&rsquo;s own description of how it handles data from sites that use its services is
          at{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            policies.google.com/technologies/partner-sites
          </a>
          .
        </p>

        <h2>If you are in the EEA, the UK or Switzerland</h2>
        <p>
          Where required, a consent message is shown before personalised advertising cookies are
          set, and you can choose to refuse them or withdraw consent later. Non-personalised ads may
          still be served, which still requires a cookie for frequency capping and fraud prevention.
          Your legal bases for our processing are your consent for advertising and analytics
          cookies, and our legitimate interest in delivering and securing the site for the technical
          request data described above.
        </p>

        <h2>Analytics</h2>
        <p>
          If Google Analytics 4 is enabled on this site, it records aggregate usage — which pages
          are visited, roughly where visitors are in the world, and whether a calculator produced a
          result — using cookies or similar identifiers. It is used to decide what to build next,
          not to identify individuals. Google Analytics data is subject to{' '}
          <a
            href="https://policies.google.com/privacy"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            Google&rsquo;s privacy policy
          </a>
          , and you can prevent it entirely with{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            Google&rsquo;s opt-out browser add-on
          </a>
          .
        </p>
        <p>
          The <Link href="/cookie-policy/">cookie policy</Link> lists what is set, by whom, and what
          each one does.
        </p>

        <h2>What we never do</h2>
        <ul>
          <li>Sell or rent personal information.</li>
          <li>Ask for or store payment details — nothing on this site is for sale.</li>
          <li>Send marketing email.</li>
          <li>Keep a server-side record of what you typed into a calculator.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct or delete personal
          data held about you, to object to processing, or to withdraw consent. Because this site
          keeps no user database, in practice the data that exists is: any email you have sent
          (which you can ask to have deleted at any time), and data held by Google as described
          above, which you control through the opt-out links in this policy and through your browser
          settings. To make a request, write to <a href={`mailto:${site.email}`}>{site.email}</a>.
          California residents may also request information about the categories of personal
          information disclosed for a business purpose; the answer is the advertising and analytics
          identifiers described above.
        </p>

        <h2>Children</h2>
        <p>
          This site is written for adult gardeners and is not directed at children under 13. We do
          not knowingly collect personal information from children. If you believe a child has sent
          us information, write to the address above and it will be deleted.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          When this policy changes, the date at the top of the page changes with it. Material
          changes will be noted on this page rather than made quietly.
        </p>
      </div>
    </Container>
  );
}
