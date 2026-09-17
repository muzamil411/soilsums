import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema } from '@/lib/seo/schema';

export type Faq = { question: string; answer: string };

/**
 * Frequently asked questions, rendered as real text and mirrored into FAQPage
 * structured data from the same source, so the two cannot disagree.
 */
export function FaqList({
  faqs,
  heading = 'Common questions',
}: {
  faqs: readonly Faq[];
  heading?: string;
}) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq">
      <h2 id="faq" className="mt-12 text-2xl">
        {heading}
      </h2>
      <dl className="mt-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="border-rule border-t py-4">
            <dt className="font-display text-lg">{faq.question}</dt>
            <dd className="mt-1 max-w-prose">{faq.answer}</dd>
          </div>
        ))}
      </dl>
      <JsonLd data={faqSchema(faqs)} />
    </section>
  );
}
