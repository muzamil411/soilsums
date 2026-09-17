'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NavLink } from './nav-links';

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="border-paper text-paper border px-3 py-1 text-sm font-semibold"
      >
        {open ? 'Close' : 'Menu'}
      </button>
      {open ? (
        <ul
          id="mobile-nav"
          className="border-paper/30 absolute top-full right-0 left-0 z-20 border-t"
        >
          {links.map((link) => (
            <li key={link.href} className="border-paper/20 bg-kale border-b">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-paper hover:text-paper block px-4 py-3 no-underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
