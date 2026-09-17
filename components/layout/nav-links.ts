export type NavLink = { href: string; label: string };

export const navLinks: readonly NavLink[] = [
  { href: '/tools/', label: 'Tools' },
  { href: '/crops/', label: 'Crops' },
  { href: '/blog/', label: 'Notebook' },
  { href: '/about/', label: 'About' },
];

export const footerLinks: readonly NavLink[] = [
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy-policy/', label: 'Privacy policy' },
  { href: '/terms/', label: 'Terms' },
  { href: '/disclaimer/', label: 'Disclaimer' },
  { href: '/cookie-policy/', label: 'Cookie policy' },
];
