import type { Metadata, Viewport } from 'next';
import { Fraunces, Public_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdScript } from '@/components/ads/AdScript';
import { Analytics } from '@/components/seo/Analytics';
import { site } from '@/lib/seo/site';

// Two static weights rather than the variable font. Fraunces' variable file
// carrying the SOFT and opsz axes came to 120 kB, was preloaded, and was the
// largest-contentful-paint blocker — and neither axis is used anywhere in the
// stylesheet. 400 covers the small display labels, 600 the headings.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-fraunces',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-public-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — gardening calculators`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author }],
  creator: site.author,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#14482f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="focus:bg-paper focus:text-ink sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-30 focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <AdScript />
        <Analytics />
      </body>
    </html>
  );
}
