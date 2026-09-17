import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static output: deployable to Cloudflare Pages or Vercel with no server.
  output: 'export',
  trailingSlash: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    // Required by output: 'export' — we ship pre-sized WebP/AVIF instead.
    unoptimized: true,
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Strips the YAML frontmatter out of the rendered body. The frontmatter
    // itself is read separately by lib/content/mdx.ts with gray-matter, so
    // titles, descriptions and FAQs have exactly one source of truth and are
    // available to the page as data rather than as markup.
    // Passed as a string because Turbopack needs serializable plugin refs.
    remarkPlugins: [['remark-frontmatter', ['yaml']]],
  },
});

export default withMDX(nextConfig);
