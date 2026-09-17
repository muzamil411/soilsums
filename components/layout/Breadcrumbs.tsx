import Link from 'next/link';
import { absoluteUrl } from '@/lib/seo/site';
import { JsonLd } from '@/components/seo/JsonLd';

export type Crumb = { name: string; href: string };

/**
 * Visible breadcrumb trail plus its BreadcrumbList structured data. The last
 * crumb is the current page and is not a link.
 */
export function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  const items = [{ name: 'Home', href: '/' }, ...trail];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-[0.8125rem]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="text-ink/70">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="text-kale no-underline">
                    {item.name}
                  </Link>
                )}
                {isLast ? null : (
                  <span aria-hidden="true" className="text-ink/40">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  );
}
