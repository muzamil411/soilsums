import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { pageMetadata } from '@/lib/seo/metadata';
import { legalUpdated } from '@/lib/legal';
import { site } from '@/lib/seo/site';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie policy',
  description:
    'Which cookies and browser storage SoilSums uses, who sets them, what each one does, and how to refuse or remove them.',
  path: '/cookie-policy/',
});

export default function CookiePolicyPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Cookie policy', href: '/cookie-policy/' }]} />
      <h1 className="text-3xl sm:text-4xl">Cookie policy</h1>
      <LastUpdated date={legalUpdated} />

      <div className="prose-notebook mt-6">
        <p>
          A cookie is a small file a website asks your browser to keep. Related technologies — local
          storage in particular — do a similar job. This page lists what SoilSums uses and why. The{' '}
          <Link href="/privacy-policy/">privacy policy</Link> covers the wider picture.
        </p>

        <h2>SoilSums sets no cookies of its own</h2>
        <p>
          There is no login, no session and no server that needs to recognise you, so the site
          itself sets no cookies. It does use your browser&rsquo;s local storage for two
          conveniences, both stored only on your device and never sent anywhere:
        </p>
        <table>
          <thead>
            <tr>
              <th>Stored item</th>
              <th>What it is for</th>
              <th>How long it lasts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unit preference</td>
              <td>
                Remembers whether you chose imperial or metric, so every tool opens the way you left
                it.
              </td>
              <td>Until you clear your browser&rsquo;s site data</td>
            </tr>
            <tr>
              <td>Saved garden plan</td>
              <td>
                Keeps the grid you filled in on the square foot garden planner so it is still there
                next visit.
              </td>
              <td>Until you clear it or your browser&rsquo;s site data</td>
            </tr>
          </tbody>
        </table>
        <p>
          If local storage is unavailable — private browsing, or storage blocked — the site still
          works; it simply forgets these preferences between visits.
        </p>

        <h2>Cookies set by third parties</h2>
        <p>
          When advertising or analytics is active, these are set by the companies named, not by us.
        </p>
        <table>
          <thead>
            <tr>
              <th>Set by</th>
              <th>Purpose</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google AdSense and its advertising partners</td>
              <td>
                Serving ads, including ads based on your prior visits to this and other sites;
                limiting how often you see the same ad; detecting invalid traffic.
              </td>
              <td>Advertising</td>
            </tr>
            <tr>
              <td>Google (consent message)</td>
              <td>
                Remembering the advertising choice you made, so you are not asked again on every
                page.
              </td>
              <td>Necessary for consent</td>
            </tr>
            <tr>
              <td>Google Analytics 4</td>
              <td>
                Counting visits and page views in aggregate, and recording that a calculator
                produced a result, to decide what to improve.
              </td>
              <td>Analytics</td>
            </tr>
          </tbody>
        </table>

        <h2>How to refuse or remove them</h2>
        <ul>
          <li>
            <strong>Advertising choices.</strong> Use{' '}
            <a
              href="https://www.google.com/settings/ads"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              Google Ads Settings
            </a>{' '}
            to turn off personalised advertising, or{' '}
            <a
              href="https://www.aboutads.info/choices/"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              aboutads.info
            </a>{' '}
            for participating vendors generally.
          </li>
          <li>
            <strong>If you were shown a consent message</strong> (visitors in the EEA, the UK and
            Switzerland), you can change or withdraw that choice at any time using the privacy
            options link the message provides.
          </li>
          <li>
            <strong>Analytics.</strong> Install{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              Google&rsquo;s opt-out browser add-on
            </a>
            .
          </li>
          <li>
            <strong>Everything at once.</strong> Every major browser can block third-party cookies
            or clear all site data; look for cookies or site data under privacy settings. Blocking
            them does not break the calculators.
          </li>
        </ul>

        <h2>Questions</h2>
        <p>
          Write to <a href={`mailto:${site.email}`}>{site.email}</a> if something on this page does
          not match what you are seeing in your browser.
        </p>
      </div>
    </Container>
  );
}
