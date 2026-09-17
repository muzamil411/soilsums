import Link from 'next/link';
import { Container } from './Container';
import { footerLinks } from './nav-links';
import { site } from '@/lib/seo/site';

export function Footer() {
  return (
    <footer className="bg-kale text-paper mt-16">
      <Container className="py-8">
        <p className="font-display text-lg">{site.name}</p>
        <p className="text-paper/80 mt-1 max-w-md text-sm">
          Gardening calculators and plain-English growing guides, written and checked by{' '}
          {site.author}. Every result is an estimate — your own soil test and local extension
          service always win.
        </p>
        <nav aria-label="Footer" className="mt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-paper hover:text-paper underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-paper/70 mt-6 text-sm">
          <a href={`mailto:${site.email}`} className="text-paper hover:text-paper underline">
            {site.email}
          </a>
        </p>
        <p className="text-paper/70 mt-2 text-xs">
          © {site.founded}–{new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
