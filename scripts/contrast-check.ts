/**
 * Accessibility gate for the SoilSums palette. Runs as part of `npm run check`.
 *
 * It does three things:
 *  1. Verifies every foreground/background pairing we actually ship meets the
 *     WCAG 2.2 minimum for its use (4.5:1 body text, 3:1 large text and
 *     non-text UI such as control borders — WCAG 1.4.11).
 *  2. Verifies the contrast figures written in the app/globals.css comment
 *     match the computed values, so the documentation cannot drift.
 *  3. Greps the JSX for controls (input, select, textarea, button) that use the
 *     decorative --color-rule for a border, ring or outline. --color-rule is
 *     1.45:1 and is legal only for graph paper and table hairlines.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Piping this script into `head` closes stdout early; that is not an error.
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') throw error;
});

type Rgb = readonly [number, number, number];

const TOKENS_FILE = 'app/globals.css';
const SCAN_DIRS = ['app', 'components'];
const CONTROL_TAGS = ['input', 'select', 'textarea', 'button'] as const;

function parseHex(hex: string): Rgb {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG 2.2 relative luminance. */
function luminance([r, g, b]: Rgb): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(parseHex(a));
  const lb = luminance(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Pull `--color-name: #rrggbb;` declarations out of the @theme block. */
function readTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const match of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8});/g)) {
    tokens.set(match[1] as string, match[2] as string);
  }
  return tokens;
}

/** Pull the documented ratios out of the comment table in globals.css. */
function readDocumentedRatios(css: string): Map<string, number> {
  const documented = new Map<string, number>();
  for (const match of css.matchAll(/^\s*(ink|paper|kale|radish|ochre|rule)\s+(\d+\.\d+):1/gm)) {
    documented.set(match[1] as string, Number.parseFloat(match[2] as string));
  }
  return documented;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path));
    } else if (/\.(tsx|ts)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

const css = readFileSync(TOKENS_FILE, 'utf8');
const tokens = readTokens(css);
const documented = readDocumentedRatios(css);

const failures: string[] = [];
const lines: string[] = [];

function token(name: string): string {
  const value = tokens.get(name);
  if (!value) {
    throw new Error(`Token --color-${name} is missing from ${TOKENS_FILE}`);
  }
  return value;
}

// 1. The pairings we ship. `min` is the WCAG threshold for that usage.
const pairings: { fg: string; bg: string; min: number; usage: string }[] = [
  { fg: 'ink', bg: 'paper', min: 4.5, usage: 'body text' },
  { fg: 'kale', bg: 'paper', min: 4.5, usage: 'headings and links' },
  { fg: 'radish', bg: 'paper', min: 4.5, usage: 'accent text' },
  { fg: 'ochre', bg: 'paper', min: 4.5, usage: 'caution text' },
  { fg: 'kale', bg: 'paper', min: 3, usage: 'control borders (WCAG 1.4.11)' },
  { fg: 'radish', bg: 'paper', min: 3, usage: 'focus outline (WCAG 1.4.11)' },
  { fg: 'paper', bg: 'kale', min: 4.5, usage: 'header band and footer text' },
  { fg: 'paper', bg: 'radish', min: 4.5, usage: 'text on accent fill' },
  { fg: 'paper', bg: 'ink', min: 4.5, usage: 'text on ink fill' },
];

lines.push('Palette pairings');
for (const { fg, bg, min, usage } of pairings) {
  const ratio = round2(contrast(token(fg), token(bg)));
  const ok = ratio >= min;
  lines.push(
    `  ${ok ? 'pass' : 'FAIL'}  ${fg} on ${bg}  ${ratio.toFixed(2)}:1  (needs ${min}:1) — ${usage}`,
  );
  if (!ok) {
    failures.push(`${fg} on ${bg} is ${ratio}:1 but ${usage} needs ${min}:1`);
  }
}

// 2. Documented figures must match reality.
lines.push('');
lines.push(`Documented ratios in ${TOKENS_FILE}`);
for (const [name, claimed] of documented) {
  const actual = round2(contrast(token(name), token('paper')));
  const ok = Math.abs(actual - claimed) < 0.011;
  lines.push(
    `  ${ok ? 'pass' : 'FAIL'}  ${name}: documented ${claimed.toFixed(2)}:1, computed ${actual.toFixed(2)}:1`,
  );
  if (!ok) {
    failures.push(
      `${TOKENS_FILE} documents ${name} as ${claimed}:1 but it computes to ${actual}:1`,
    );
  }
}

// 3. --color-rule must never identify a control.
const ruleRatio = round2(contrast(token('rule'), token('paper')));
lines.push('');
lines.push(`Decorative token guard (--color-rule is ${ruleRatio.toFixed(2)}:1 on paper)`);
const controlPattern = new RegExp(`<(${CONTROL_TAGS.join('|')})\\b[^>]*>`, 'gs');
const forbidden = /\b(?:focus:|hover:|dark:)?(?:border|ring|outline|divide)(?:-[a-z]+)?-rule\b/;
let scanned = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const source = readFileSync(file, 'utf8');
    scanned += 1;
    for (const element of source.matchAll(controlPattern)) {
      const text = element[0] as string;
      if (forbidden.test(text)) {
        const line = source.slice(0, element.index).split('\n').length;
        failures.push(
          `${file}:${line} — a <${element[1]}> uses --color-rule for a border. ` +
            `Controls need 3:1; use border-kale (or border-radish when focused).`,
        );
      }
    }
  }
}
lines.push(`  scanned ${scanned} files in ${SCAN_DIRS.join(', ')}`);

console.log(lines.join('\n'));

if (failures.length > 0) {
  console.error(`\n${failures.length} contrast problem(s):`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('\nAll contrast checks passed.');
