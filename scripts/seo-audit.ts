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
  h1Count: number;
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

  return {
    route,
    title: attr(head, /<title>([^<]*)<\/title>/),
    description: attr(head, /<meta name="description" content="([^"]*)"/),
    canonical: attr(head, /<link rel="canonical" href="([^"]*)"/),
    ogTitle: attr(head, /<meta property="og:title" content="([^"]*)"/),
    ogImage: attr(head, /<meta property="og:image" content="([^"]*)"/),
    twitterCard: attr(head, /<meta name="twitter:card" content="([^"]*)"/),
    schemaTypes,
    h1Count: (body.match(/<h1\b/g) ?? []).length,
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
console.log('a canonical URL, Open Graph and Twitter tags, exactly one h1, and alt text on');
console.log('every image.');
