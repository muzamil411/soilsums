/**
 * Content and SEO report.
 *
 *  - Word count for every published page, MDX or TSX, flagging anything under
 *    the minimum for its type.
 *  - Title and meta description length for every page, which are hard limits:
 *    a title over 60 characters or a description over 155 fails the script, so
 *    `npm run check` catches it before it ships.
 *
 * Word counts for TSX pages are approximate — the script strips tags and
 * expressions and counts what is left, which is close enough to judge whether
 * a page is thin.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { countWords, listContent, type ContentKind } from '../lib/content/mdx';
import { DESCRIPTION_MAX, TITLE_MAX } from '../lib/seo/metadata';

// Piping this script into `head` closes stdout early; that is not an error.
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') throw error;
});

type Row = {
  page: string;
  source: string;
  words: number;
  minimum: number;
  draft: boolean;
  title?: string;
  description?: string;
};

const MINIMUMS: Record<ContentKind | 'page', number> = {
  tools: 700,
  crops: 700,
  blog: 900,
  page: 600,
};

/** Legal and utility pages are as long as they need to be, not 600 words. */
const EXEMPT_FROM_WORD_MINIMUM = new Set([
  '/contact/',
  '/terms/',
  '/disclaimer/',
  '/cookie-policy/',
  '/privacy-policy/',
  '/404/',
  '/tools/',
  '/crops/',
  '/blog/',
]);

/**
 * Dynamic route templates carry no content of their own — the words come from
 * the MDX file the template renders, which is counted separately. A path
 * containing a [segment] is a template, not a page.
 */
function isRouteTemplate(route: string): boolean {
  return route.includes('[');
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path));
    } else if (entry === 'page.tsx') {
      out.push(path);
    }
  }
  return out;
}

/** Rough prose extraction from a TSX page: drop imports, tags and expressions. */
function tsxWords(source: string): number {
  const body = source.slice(source.indexOf('return ('));
  return countWords(body);
}

function readMeta(source: string, key: string): string | undefined {
  const match = new RegExp(`${key}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`).exec(
    source,
  );
  const raw = match?.[1] ?? match?.[2];
  return raw?.replace(/\\'/g, "'").replace(/\s+/g, ' ').trim();
}

function routeOf(file: string): string {
  const dir = relative(join(process.cwd(), 'app'), file).replace(/page\.tsx$/, '');
  return `/${dir}`.replace(/\/+/g, '/');
}

const rows: Row[] = [];

// React-authored pages.
for (const file of walk(join(process.cwd(), 'app')).sort()) {
  const source = readFileSync(file, 'utf8');
  const route = routeOf(file);
  if (isRouteTemplate(route)) continue;
  rows.push({
    page: route,
    source: relative(process.cwd(), file),
    words: tsxWords(source),
    minimum: EXEMPT_FROM_WORD_MINIMUM.has(route) ? 0 : MINIMUMS.page,
    draft: false,
    title: readMeta(source, 'title'),
    description: readMeta(source, 'description'),
  });
}

// MDX content.
for (const kind of ['tools', 'crops', 'blog'] as ContentKind[]) {
  for (const entry of listContent(kind)) {
    rows.push({
      page: `/${kind === 'blog' ? 'blog' : kind}/${entry.slug}/`,
      source: relative(process.cwd(), entry.filePath),
      words: entry.wordCount,
      minimum: MINIMUMS[kind],
      draft: entry.frontmatter.draft === true,
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
    });
  }
}

const thin: Row[] = [];
const overLength: string[] = [];

console.log('page'.padEnd(34) + 'words'.padStart(7) + '  min'.padStart(6) + '  state');
console.log('-'.repeat(60));

for (const row of rows) {
  const short = !row.draft && row.minimum > 0 && row.words < row.minimum;
  const state = row.draft ? 'draft' : short ? 'THIN' : 'ok';
  console.log(
    row.page.padEnd(34) +
      String(row.words).padStart(7) +
      String(row.minimum || '-').padStart(6) +
      '  ' +
      state,
  );
  if (short) thin.push(row);

  if (row.title && row.title.length > TITLE_MAX) {
    overLength.push(`${row.source}: title is ${row.title.length} chars (max ${TITLE_MAX})`);
  }
  if (row.description && row.description.length > DESCRIPTION_MAX) {
    overLength.push(
      `${row.source}: description is ${row.description.length} chars (max ${DESCRIPTION_MAX})`,
    );
  }
}

console.log(`\n${rows.length} page(s). Word minimums: tool 700, crop 700, article 900, other 600.`);

if (thin.length > 0) {
  console.log(`\n${thin.length} page(s) under the minimum — these need more writing:`);
  for (const row of thin) {
    console.log(`  - ${row.page} (${row.words} words, needs ${row.minimum}) — ${row.source}`);
  }
}

if (overLength.length > 0) {
  console.error(`\n${overLength.length} metadata length violation(s):`);
  for (const problem of overLength) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log('\nAll titles within 60 characters and descriptions within 155.');
