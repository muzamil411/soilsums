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
