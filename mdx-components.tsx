import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { Callout } from '@/components/ui/Callout';

/**
 * The App Router MDX convention: every .mdx file renders through these
 * components. Long-form styling lives in the .prose-notebook class in
 * app/globals.css, so this file only handles behaviour — internal links go
 * through next/link, tables get a scroll container on narrow screens — and
 * exposes the components an article is allowed to use.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      const target = typeof href === 'string' ? href : '';
      if (target.startsWith('/')) {
        return (
          <Link href={target} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={target} rel="nofollow noopener noreferrer" target="_blank" {...props}>
          {children}
        </a>
      );
    },
    table: ({ children, ...props }) => (
      <div className="my-5 overflow-x-auto">
        <table {...props}>{children}</table>
      </div>
    ),
    Callout,
    ...components,
  };
}
