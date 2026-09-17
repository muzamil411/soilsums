import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/seo/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact SoilSums',
  description:
    'Email SoilSums about a wrong number, a calculator that misbehaved, a missing crop, or anything else about the site.',
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs trail={[{ name: 'Contact', href: '/contact/' }]} />
      <h1 className="text-3xl sm:text-4xl">Contact</h1>

      <div className="prose-notebook mt-6">
        <p>
          One person reads this mail, so please be patient — a reply usually takes a few days. There
          is no form to fill in and no account to create.
        </p>

        <p className="font-display text-kale text-2xl">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>

        <h2>What is especially welcome</h2>
        <ul>
          <li>
            <strong>A number that looks wrong.</strong> If a result does not match what your
            extension service or a bag label says, tell me the inputs you used and what you
            expected. This is the single most useful thing you can send.
          </li>
          <li>
            <strong>A calculator that misbehaved.</strong> Which tool, what you typed, what
            happened, and which browser and device, if you know.
          </li>
          <li>
            <strong>A crop or a calculator that is missing.</strong> Requests genuinely shape what
            gets built next.
          </li>
          <li>
            <strong>Accessibility problems.</strong> Anything that does not work with a keyboard, a
            screen reader or at a large text size is treated as a bug, not a nice-to-have.
          </li>
        </ul>

        <h2>What I cannot help with</h2>
        <p>
          I cannot diagnose a sick plant from a description, interpret your soil test report, or
          give advice specific to your site and season. Your local extension service or master
          gardener programme can, usually for free, and they can see things a website cannot.
        </p>
        <p>
          Guest posts, link exchanges and sponsored content are all declined, so those messages will
          not get a reply.
        </p>

        <h2>Privacy</h2>
        <p>
          Mail sent to the address above arrives through Cloudflare Email Routing and is forwarded
          to a personal inbox. It is used to answer you and nothing else — never added to a mailing
          list, never passed on. See the <Link href="/privacy-policy/">privacy policy</Link> for the
          full picture.
        </p>
      </div>
    </Container>
  );
}
