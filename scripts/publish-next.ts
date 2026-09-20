/**
 * Publishes the next N draft articles, in the order recorded in
 * content/blog/publish-order.json.
 *
 * That order is the point of the script. It is ranked by keyword difficulty
 * first, then volume, then readiness, so the easiest wins go live first and the
 * site gets its first rankings as early as possible. Publishing by hand invites
 * publishing whatever feels finished, which is a different and worse order.
 *
 * Flipping `draft: false` also sets `published` to today, because an article
 * that has sat in the repository for weeks should date from when readers can
 * actually see it, not from when it was written.
 *
 * Usage:
 *   npm run publish-next -- 4        publish the next four
 *   npm run publish-next -- 4 --dry  show what would happen and change nothing
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = join(process.cwd(), 'content', 'blog');
const ORDER_FILE = join(BLOG_DIR, 'publish-order.json');

type OrderEntry = { slug: string; tier: number };

const args = process.argv.slice(2);
const dryRun = args.includes('--dry') || args.includes('--dry-run');
const countArg = args.find((arg) => /^\d+$/.test(arg));
const count = countArg ? Number(countArg) : 1;

if (count < 1) {
  console.error('Publish how many? e.g. npm run publish-next -- 4');
  process.exit(1);
}

const order: OrderEntry[] = JSON.parse(readFileSync(ORDER_FILE, 'utf8')).order;
const today = new Date().toISOString().slice(0, 10);

/**
 * Rewrites the two frontmatter lines in place rather than round-tripping the
 * file through a YAML parser, which would reformat every block scalar in the
 * FAQs and produce an unreadable diff.
 */
function publish(slug: string): 'published' | 'already-live' | 'missing' | 'malformed' {
  const path = join(BLOG_DIR, `${slug}.mdx`);
  let source: string;
  try {
    source = readFileSync(path, 'utf8');
  } catch {
    return 'missing';
  }

  const end = source.indexOf('\n---', 4);
  if (!source.startsWith('---\n') || end === -1) return 'malformed';

  const frontmatter = source.slice(0, end);
  const body = source.slice(end);

  if (/^draft:\s*false\s*$/m.test(frontmatter)) return 'already-live';
  if (!/^draft:\s*true\s*$/m.test(frontmatter)) return 'malformed';

  const updated = frontmatter
    .replace(/^draft:\s*true\s*$/m, 'draft: false')
    .replace(/^published:.*$/m, `published: ${today}`)
    .replace(/^updated:.*$/m, `updated: ${today}`);

  if (!dryRun) writeFileSync(path, updated + body);
  return 'published';
}

const published: string[] = [];
const skipped: string[] = [];
const problems: string[] = [];

for (const entry of order) {
  if (published.length >= count) break;
  const result = publish(entry.slug);
  if (result === 'published') {
    published.push(`${entry.slug}  (tier ${entry.tier})`);
  } else if (result === 'already-live') {
    skipped.push(`${entry.slug} — already live`);
  } else {
    problems.push(`${entry.slug} — ${result}`);
  }
}

console.log(dryRun ? `Dry run: would publish ${count}\n` : `Publishing ${count}\n`);

for (const line of skipped) console.log(`  skipped   ${line}`);
for (const line of problems) console.log(`  PROBLEM   ${line}`);
for (const line of published) console.log(`  ${dryRun ? 'would be' : 'published'}  ${line}`);

if (published.length < count) {
  console.log(`\nOnly ${published.length} draft(s) left to publish.`);
}

if (!dryRun && published.length > 0) {
  console.log(`\nDated ${today}. Run the build before committing.`);
}

process.exit(problems.length > 0 ? 1 : 0);
