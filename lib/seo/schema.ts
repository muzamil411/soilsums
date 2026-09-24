import { absoluteUrl, site } from './site';

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    alternateName: site.tagline,
    url: absoluteUrl('/'),
    description: site.description,
    inLanguage: site.locale,
    publisher: { '@id': `${absoluteUrl('/')}#organization` },
  };
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${absoluteUrl('/')}#organization`,
    name: site.name,
    url: absoluteUrl('/'),
    email: site.email,
    founder: { '@type': 'Person', name: site.author },
    foundingDate: site.founded,
  };
}

/**
 * A calculator is a WebApplication: a piece of software that runs in the
 * browser. `offers` at zero price is how Google expects "free" to be stated.
 */
export function webApplicationSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any browser',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: site.locale,
    publisher: { '@id': `${absoluteUrl('/')}#organization` },
  };
}

/** Article structured data for a notebook piece. */
export function articleSchema({
  title,
  description,
  path,
  published,
  updated,
}: {
  title: string;
  description: string;
  path: string;
  published?: string;
  updated?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
    inLanguage: site.locale,
    author: { '@type': 'Person', name: site.author, url: absoluteUrl('/about/') },
    publisher: { '@id': `${absoluteUrl('/')}#organization` },
    image: `${site.url}/og-default.png`,
    ...(published ? { datePublished: published } : {}),
    ...(updated ? { dateModified: updated } : {}),
  };
}

export function faqSchema(faqs: readonly { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/**
 * HowTo schema for a page carrying a genuine ordered sequence.
 *
 * Only for a real procedure with steps that must happen in order. A list of
 * tips is not a HowTo, and marking one up as though it were is the kind of
 * structured data that gets a site's rich results withdrawn rather than
 * granted. Every step here has to appear, in order, in the visible body.
 */
export function howToSchema({
  name,
  description,
  path,
  steps,
}: {
  name: string;
  description: string;
  path: string;
  steps: readonly { name: string; text: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${absoluteUrl(path)}#how-to-fill-a-raised-garden-bed`,
    })),
  };
}
