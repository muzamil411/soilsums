/**
 * Lists every data entry still marked `verified: false`.
 *
 * Agronomic figures — seeding rates, spacing, frost offsets, C:N values, lime
 * rates, yields — are only as good as their source, so each carries a `source`
 * string and a `verified` flag. This script is the standing to-do list of
 * figures that still need checking against a primary reference.
 *
 * Exits 0 always: unverified data is a task, not a build error. Use
 * `npm run verify-data -- --strict` to make it fail instead.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Piping this script into `head` closes stdout early; that is not an error.
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') throw error;
});

type Finding = { file: string; path: string; label: string; source: string };

const DATA_DIR = join(process.cwd(), 'data');
const strict = process.argv.includes('--strict');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function label(value: Record<string, unknown>): string {
  for (const key of ['name', 'slug', 'material', 'label', 'id']) {
    const candidate = value[key];
    if (typeof candidate === 'string') return candidate;
  }
  return '(unnamed entry)';
}

/** Walks any exported structure looking for objects with verified === false. */
function collect(value: unknown, file: string, path: string, out: Finding[], seen: Set<object>) {
  if (!isRecord(value) || seen.has(value)) return;
  seen.add(value);

  if (value.verified === false) {
    out.push({
      file,
      path,
      label: label(value),
      source: typeof value.source === 'string' && value.source ? value.source : '(no source given)',
    });
  }

  for (const [key, child] of Object.entries(value)) {
    collect(child, file, path ? `${path}.${key}` : key, out, seen);
  }
}

const files = readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
  .sort();

const findings: Finding[] = [];

for (const file of files) {
  const moduleUrl = pathToFileURL(join(DATA_DIR, file)).href;
  const loaded: unknown = await import(moduleUrl);
  const seen = new Set<object>();
  for (const [exportName, exported] of Object.entries(loaded as Record<string, unknown>)) {
    collect(exported, file, exportName, findings, seen);
  }
}

console.log(`Scanned ${files.length} data file(s) in data/\n`);

if (findings.length === 0) {
  console.log('No entries marked verified: false. Every figure has been checked.');
  process.exit(0);
}

console.log(`${findings.length} entr${findings.length === 1 ? 'y' : 'ies'} still to verify:\n`);
let currentFile = '';
for (const finding of findings) {
  if (finding.file !== currentFile) {
    currentFile = finding.file;
    console.log(`  data/${currentFile}`);
  }
  console.log(`    - ${finding.label}  [${finding.path}]`);
  console.log(`      source: ${finding.source}`);
}
console.log(
  '\nCheck each against a primary reference (a university extension service, or the RHS in the UK),',
);
console.log('then set verified: true and record the exact page you used in `source`.');

if (strict) {
  process.exit(1);
}
