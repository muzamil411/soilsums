export const site = {
  name: 'SoilSums',
  tagline: 'Know exactly how much to buy',
  description:
    'Free gardening calculators for soil, mulch, fertilizer, plant spacing and planting dates. Imperial or metric, no sign-up.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soilsums.com').replace(/\/$/, ''),
  email: 'hello@soilsums.com',
  author: 'Muzamil Ali',
  locale: 'en-US',
  founded: '2026',
} as const;

/** Absolute URL with a trailing slash, matching next.config trailingSlash. */
export function absoluteUrl(path: string): string {
  if (path === '/') return `${site.url}/`;
  const clean = `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
  return `${site.url}${clean}`;
}

export const adsense = {
  pubId: process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? '',
  /**
   * Ads render only when explicitly enabled AND a publisher ID exists.
   * While this is false, AdSlot renders nothing and reserves no height, so
   * pages have no empty gaps during AdSense review.
   */
  get enabled(): boolean {
    return process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' && this.pubId.startsWith('ca-pub-');
  },
} as const;

export const analytics = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? '',
  get enabled(): boolean {
    return /^G-[A-Z0-9]+$/i.test(this.ga4Id);
  },
} as const;
