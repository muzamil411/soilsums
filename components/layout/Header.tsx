import Link from 'next/link';
import { Container } from './Container';
import { MobileNav } from './MobileNav';
import { navLinks } from './nav-links';
import { site } from '@/lib/seo/site';

export function Header() {
  return (
    <header className="bg-kale text-paper relative">
      <Container className="flex items-center justify-between gap-4 py-2.5">
        <div>
          <Link
            href="/"
            className="text-paper font-display hover:text-paper text-xl leading-tight no-underline"
          >
            {site.name}
          </Link>
          <p className="text-paper/80 text-xs">{site.tagline}</p>
        </div>
        <nav aria-label="Main" className="hidden sm:block">
          <ul className="flex items-center gap-5 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-paper hover:text-paper no-underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav links={navLinks} />
      </Container>
    </header>
  );
}
