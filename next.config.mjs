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
    // remark-frontmatter strips the YAML out of the rendered body. The
    // frontmatter itself is read separately by lib/content/mdx.ts with
    // gray-matter, so titles, descriptions and FAQs have exactly one source of
    // truth and are available to the page as data rather than as markup.
    //
    // remark-gfm is what turns pipe tables into real tables. Without it every
    // rate table on the site rendered as a paragraph of literal pipes, which
    // is how they shipped until this was added.
    //
    // Passed as strings because Turbopack needs serializable plugin refs.
    remarkPlugins: [
      ['remark-frontmatter', ['yaml']],
      ['remark-gfm', {}],
    ],
  },
});

export default withMDX(nextConfig);
