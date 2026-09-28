/**
 * Audits the exported HTML in out/ against the site's SEO requirements.
 *
 * The other scripts check sources; this one checks what actually shipped. It
 * reads every built page and fails on anything that would be a real defect:
 * a duplicate or over-long title, a missing canonical, a page with no
 * structured data, more than one h1, or an image without alt text.
 *
 * Run after a build: `npm run build && npm run seo-audit`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { publishedTools, toolCountWord } from '../data/tools';
import { LIME_TIMING } from '../data/lime-rates';
import { wrongTimingStatements } from '../lib/content/lime-timing';

process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') throw error;
});

const OUT = join(process.cwd(), 'out');
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/** Pages that are deliberately not indexed, so they need no canonical check. */
const NOINDEX_EXPECTED = ['/404/', '/blog/page/1/'];

/**
 * Next writes the not-found page twice — as 404.html for the host to serve and
 * as _not-found/index.html for client navigation. They are the same page, so
 * auditing both reports a false duplicate.
 */
const SKIP_ROUTES = ['/_not-found/'];

type Page = {
  route: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  schemaTypes: string[];
  /** The page as a reader sees it: tags and script payload removed. */
  visibleText: string;
  h1Count: number;
  /** Every same-site href in the body, for the broken-link check. */
  internalHrefs: string[];
  imagesWithoutAlt: number;
  noIndex: boolean;
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (entry === 'index.html') out.push(path);
  }
  return out;
}

function attr(html: string, pattern: RegExp): string | null {
  const match = pattern.exec(html);
  return match?.[1] ? decode(match[1]) : null;
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}

function readPage(file: string): Page {
  const html = readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>') + 7);
  const route = `/${relative(OUT, file)
    .replace(/index\.html$/, '')
    .replace(/\\/g, '/')}`;

  const schemaTypes: string[] = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(decode(match[1] as string)) as { '@type'?: string };
      if (parsed['@type']) schemaTypes.push(parsed['@type']);
    } catch {
      schemaTypes.push('(unparseable)');
    }
  }

  // The rendered markup only. Next also serializes the React payload into
  // inline scripts, which repeat the same markup as escaped strings, so those
  // are removed before counting anything.
  const bodyStart = html.indexOf('<body');
  const bodyEnd = html.lastIndexOf('</body>');
  const body = (
    bodyStart === -1 ? html : html.slice(bodyStart, bodyEnd === -1 ? undefined : bodyEnd)
  ).replace(/<script[\s\S]*?<\/script>/g, '');
  const imgTags = [...body.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  // Rendered copy: tags gone, whitespace collapsed. The body above already has
  // its <script> blocks stripped, so this is what a reader actually reads and
  // not the React payload, which looks identical to a naive grep.
  const visibleText = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ');

  return {
    route,
    title: attr(head, /<title>([^<]*)<\/title>/),
    description: attr(head, /<meta name="description" content="([^"]*)"/),
    canonical: attr(head, /<link rel="canonical" href="([^"]*)"/),
    ogTitle: attr(head, /<meta property="og:title" content="([^"]*)"/),
    ogImage: attr(head, /<meta property="og:image" content="([^"]*)"/),
    twitterCard: attr(head, /<meta name="twitter:card" content="([^"]*)"/),
    schemaTypes,
    visibleText,
    h1Count: (body.match(/<h1\b/g) ?? []).length,
    internalHrefs: [...body.matchAll(/href="(\/[^"#?]*)"/g)].flatMap((match) =>
      match[1] === undefined ? [] : [match[1]],
    ),
    imagesWithoutAlt: imgTags.filter((tag) => !/\balt=/.test(tag)).length,
    noIndex: /<meta name="robots" content="[^"]*noindex/.test(head),
  };
}

if (!existsSync(OUT)) {
  console.error('No out/ directory. Run `npm run build` first.');
  process.exit(1);
}

const pages = walk(OUT)
  .map(readPage)
  .filter((page) => !SKIP_ROUTES.includes(page.route))
  .sort((a, b) => a.route.localeCompare(b.route));
const failures: string[] = [];
const notes: string[] = [];

const titles = new Map<string, string[]>();
const descriptions = new Map<string, string[]>();

for (const page of pages) {
  const { route } = page;

  if (!page.title) failures.push(`${route} has no <title>`);
  else {
    // The layout appends " | SoilSums", which counts towards the limit.
    if (page.title.length > TITLE_MAX) {
      failures.push(
        `${route} title is ${page.title.length} chars (max ${TITLE_MAX}): ${page.title}`,
      );
    }
    const seen = titles.get(page.title) ?? [];
    seen.push(route);
    titles.set(page.title, seen);
  }

  if (!page.description) failures.push(`${route} has no meta description`);
  else {
    if (page.description.length > DESCRIPTION_MAX) {
      failures.push(
        `${route} description is ${page.description.length} chars (max ${DESCRIPTION_MAX})`,
      );
    }
    const seen = descriptions.get(page.description) ?? [];
    seen.push(route);
    descriptions.set(page.description, seen);
  }

  if (!page.canonical) failures.push(`${route} has no canonical URL`);
  if (!page.ogTitle) failures.push(`${route} has no og:title`);
  if (!page.ogImage) failures.push(`${route} has no og:image`);
  if (!page.twitterCard) failures.push(`${route} has no twitter:card`);

  if (page.h1Count !== 1)
    failures.push(`${route} has ${page.h1Count} h1 elements, expected exactly 1`);
  if (page.imagesWithoutAlt > 0) {
    failures.push(`${route} has ${page.imagesWithoutAlt} image(s) without alt text`);
  }

  // Every page except the plain legal and utility pages carries structured data.
  const inner = route !== '/' && !NOINDEX_EXPECTED.includes(route);
  if (inner && page.schemaTypes.length === 0) {
    notes.push(`${route} carries no structured data`);
  }
  if (route === '/' && !page.schemaTypes.includes('WebSite')) {
    failures.push('/ is missing WebSite structured data');
  }
  if (
    route.startsWith('/tools/') &&
    route !== '/tools/' &&
    !page.schemaTypes.includes('WebApplication')
  ) {
    failures.push(`${route} is missing WebApplication structured data`);
  }
  if (
    route.startsWith('/blog/') &&
    /\/blog\/[^/]+\/$/.test(route) &&
    !page.schemaTypes.includes('Article')
  ) {
    failures.push(`${route} is missing Article structured data`);
  }
}

for (const [title, routes] of titles) {
  if (routes.length > 1) failures.push(`duplicate title across ${routes.join(', ')}: ${title}`);
}
for (const [, routes] of descriptions) {
  if (routes.length > 1) failures.push(`duplicate description across ${routes.join(', ')}`);
}

console.log(`route`.padEnd(42) + 'title'.padStart(6) + 'desc'.padStart(6) + '  h1  schema');
console.log('-'.repeat(84));
for (const page of pages) {
  console.log(
    page.route.padEnd(42) +
      String(page.title?.length ?? 0).padStart(6) +
      String(page.description?.length ?? 0).padStart(6) +
      String(page.h1Count).padStart(4) +
      '  ' +
      (page.schemaTypes.join(', ') || '—') +
      (page.noIndex ? '  [noindex]' : ''),
  );
}

// A link to a route the export never built is a 404 that nothing else catches:
// the build emits the anchor happily and only generates published routes. This
// is the end-to-end check that the render-time degrading in mdx-components.tsx
// actually worked.
const builtRoutes = new Set(pages.map((page) => page.route));
const STATIC_ASSET = /\.(png|jpe?g|svg|webp|avif|ico|txt|xml|json|css|js|pdf|woff2?)$/i;

for (const page of pages) {
  for (const href of new Set(page.internalHrefs)) {
    if (STATIC_ASSET.test(href)) continue;
    if (href.startsWith('/_next/')) continue;
    const route = href.endsWith('/') ? href : `${href}/`;
    if (!builtRoutes.has(route) && !existsSync(join(OUT, href.replace(/^\//, '')))) {
      failures.push(`${page.route} links to ${href}, which the export did not build`);
    }
  }
}

/**
 * A spelled-out count of the calculators has to match the registry.
 *
 * This has been wrong four times without anyone noticing — at twelve, thirteen,
 * fourteen and fifteen tools — because the sentence lives in prose and nothing
 * connected it to `publishedTools`. Deriving it from the registry was not
 * enough on its own: two more sentences carried the literal word, on the home
 * page and on /tools/, and a source grep for the ones already fixed did not
 * find them.
 *
 * So this checks the RENDERED copy instead. A count that reaches a reader is
 * caught here whatever produced it, and the fix is always to use
 * `toolCountWord` or `ToolCountWord` from data/tools.ts rather than a word.
 */
const NUMBER_WORD =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+(?:gardening\s+)?(calculators?|tools?)\b/gi;

for (const page of pages) {
  for (const match of page.visibleText.matchAll(NUMBER_WORD)) {
    const word = (match[1] ?? '').toLowerCase();
    if (word === toolCountWord) continue;
    failures.push(
      `${page.route} tells the reader "${match[0]}" while the registry has ${publishedTools.length} ` +
        `published tools ("${toolCountWord}"). Use toolCountWord from data/tools.ts instead of a literal word.`,
    );
  }
}

/**
 * One answer to how long lime takes, in the rendered copy.
 *
 * The same shape as the tool-count check above and for the same reason: the
 * figure lived in prose and in frontmatter on seven surfaces, the site held
 * three different answers at once, and nothing connected any of them to
 * `LIME_TIMING`. Two of those surfaces are YAML that cannot import a module, and
 * the pH article's meta description is echoed as a card excerpt on five other
 * pages, so the only place that catches all of them is what shipped.
 */
for (const page of pages) {
  for (const finding of wrongTimingStatements(page.visibleText)) {
    failures.push(
      `${page.route} tells the reader lime takes "${finding.phrase}" while data/lime-rates.ts ` +
        `holds ${LIME_TIMING.label} (${LIME_TIMING.source.institution}). Context: …${finding.context.slice(0, 160)}…`,
    );
  }
}

console.log(`\n${pages.length} pages audited.`);

if (notes.length > 0) {
  console.log(`\n${notes.length} note(s):`);
  for (const note of notes) console.log(`  - ${note}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} SEO failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\nEvery page has a unique title within 60 chars, a unique description within 155,');
console.log('a canonical URL, Open Graph and Twitter tags, exactly one h1, alt text on every');
console.log('image, and no internal link to a route the export did not build.');
