import type { MetadataRoute } from 'next';

// Required by output: 'export' — the file is written once at build time.
export const dynamic = 'force-static';
import { absoluteUrl } from '@/lib/seo/site';
import { publishedTools } from '@/data/tools';
import { listPublished } from '@/lib/content/mdx';

/**
 * Built at build time and contains published pages only. A tool, crop or
 * article that has no finished content is not in here and has no page.
 *
 * Section index pages (/tools/, /crops/, /blog/) appear only once they have at
 * least one published child, so an empty listing is never submitted to Google.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const crops = listPublished('crops');
  const articles = listPublished('blog');

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/about/'), lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/contact/'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    {
      url: absoluteUrl('/data-sources/'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/privacy-policy/'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    { url: absoluteUrl('/terms/'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    {
      url: absoluteUrl('/disclaimer/'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/cookie-policy/'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  if (publishedTools.length > 0) {
    entries.push({
      url: absoluteUrl('/tools/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
    for (const tool of publishedTools) {
      entries.push({
        url: absoluteUrl(`/tools/${tool.slug}/`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  if (crops.length > 0) {
    entries.push({
      url: absoluteUrl('/crops/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
    for (const crop of crops) {
      entries.push({
        url: absoluteUrl(`/crops/${crop.slug}/`),
        lastModified: new Date(String(crop.frontmatter.updated ?? now)),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  if (articles.length > 0) {
    entries.push({
      url: absoluteUrl('/blog/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
    for (const article of articles) {
      entries.push({
        url: absoluteUrl(`/blog/${article.slug}/`),
        lastModified: new Date(String(article.frontmatter.updated ?? now)),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
