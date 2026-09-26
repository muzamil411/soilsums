/**
 * Regenerates the Pinterest pin set: a 1000x1500 PNG per pin in public/pins/,
 * plus docs/pinterest-pins.md and docs/pinterest-pins.csv.
 *
 * Everything is derived from the published pages by lib/pins/pins.ts, so a
 * newly published article produces its two pins on the next run with no edit
 * here. Run it with `npm run pins`.
 *
 * The cards are the site's seed packet: paper stock over graph paper, a solid
 * kale band carrying the site name, a hairline keyline, a radish rule
 * under the question. Depth comes from the band and the keyline, never from a
 * gradient or a shadow.
 *
 * Pins are deliberately NOT in the sitemap. They are images for an off-site
 * feed, not pages, and listing them would invite them to be indexed instead of
 * the pages they point at.
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { buildPins, validatePins, type Pin } from '../lib/pins/pins';
import { site } from '../lib/seo/site';

const ROOT = process.cwd();
const PIN_DIR = join(ROOT, 'public', 'pins');
const DOC_DIR = join(ROOT, 'docs');
const FONT_DIR = join(ROOT, 'assets', 'fonts');

const WIDTH = 1000;
const HEIGHT = 1500;

const ink = '#1c231b';
const paper = '#f1f2ec';
const kale = '#14482f';
const radish = '#b8294a';
const rule = '#c8ccbf';

const fonts = [
  {
    name: 'Fraunces',
    data: readFileSync(join(FONT_DIR, 'Fraunces-SemiBold.ttf')),
    weight: 600 as const,
    style: 'normal' as const,
  },
  {
    name: 'Public Sans',
    data: readFileSync(join(FONT_DIR, 'PublicSans-Regular.ttf')),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Public Sans',
    data: readFileSync(join(FONT_DIR, 'PublicSans-SemiBold.ttf')),
    weight: 600 as const,
    style: 'normal' as const,
  },
];

/**
 * Headline size by length. A pin is read at about a quarter of this width in
 * the feed, so the shortest questions are set as large as the card allows and
 * the longest still clear roughly 18px on a phone.
 */
function headlineSize(headline: string): number {
  const length = headline.length;
  if (length <= 32) return 106;
  if (length <= 44) return 94;
  if (length <= 56) return 84;
  return 76;
}

function card(pin: Pin) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: 34,
        backgroundColor: paper,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          backgroundColor: paper,
          // The hairline keyline that bounds the stock on every card on the site.
          border: `2px solid ${rule}`,
          backgroundImage: `linear-gradient(to right, ${rule} 1px, transparent 1px), linear-gradient(to bottom, ${rule} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: kale,
            padding: '30px 46px',
          }}
        >
          {/* This band carried a catalogue number built from the crop's index in
              the published list, so publishing one crop rewrote the PNG of every
              alphabetically-later one. It meant nothing to a viewer and it
              drowned real changes in a large diff — a 27-file pin diff was once
              read as retracted figures when it was mostly renumbering. The
              stable identifier is the file name, recorded in
              docs/pinterest-pins.md, which is where a record belongs. */}
          <div style={{ fontFamily: 'Fraunces', fontSize: 38, color: paper }}>SoilSums</div>
          <div style={{ backgroundColor: radish, width: 150, height: 26, display: 'flex' }} />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            padding: '0 58px',
          }}
        >
          <div
            style={{
              fontFamily: 'Fraunces',
              fontWeight: 600,
              fontSize: headlineSize(pin.headline),
              lineHeight: 1.14,
              color: ink,
            }}
          >
            {pin.headline}
          </div>
          <div
            style={{
              backgroundColor: radish,
              width: 190,
              height: 11,
              margin: '46px 0',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontFamily: 'Public Sans',
              fontWeight: 400,
              fontSize: 40,
              lineHeight: 1.4,
              color: ink,
              opacity: 0.85,
            }}
          >
            {pin.support}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: kale,
            padding: '30px 46px',
          }}
        >
          <div
            style={{
              fontFamily: 'Public Sans',
              fontWeight: 600,
              fontSize: 42,
              color: paper,
              letterSpacing: 1,
            }}
          >
            soilsums.com
          </div>
        </div>
      </div>
    </div>
  );
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function writeTables(pins: readonly Pin[]): void {
  const header = ['Image', 'Pin title', 'Description', 'Destination URL', 'Board'];

  const md = [
    '# Pinterest pins',
    '',
    'Generated by `npm run pins` from the published pages. Do not edit by hand —',
    'the next run overwrites it. Headlines are questions the pages actually ask:',
    "each page's own heading and one of its FAQs, so a pin never promises",
    'something the page does not answer.',
    '',
    `Images are in \`public/pins/\`, sized 1000x1500. ${pins.length} pins across`,
    `${new Set(pins.map((pin) => `${pin.kind}/${pin.slug}`)).size} published pages, two per page.`,
    '',
    'Pins are not in the sitemap, by design: they are images for an off-site',
    'feed, not pages of the site.',
    '',
    '**One board assignment is a compromise.** `grass-seed-calculator` is lawn',
    'care and none of the six boards covers lawns, so both its pins sit under',
    'Vegetable Garden Planning. A "Lawn Care" board would be a better home.',
    '',
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...pins.map(
      (pin) =>
        `| \`${pin.file}\` | ${pin.title} | ${pin.description} | ${pin.url} | ${pin.board} |`,
    ),
    '',
  ].join('\n');

  const csv = [
    header.map(csvCell).join(','),
    ...pins.map((pin) =>
      [pin.file, pin.title, pin.description, pin.url, pin.board].map(csvCell).join(','),
    ),
  ].join('\n');

  mkdirSync(DOC_DIR, { recursive: true });
  writeFileSync(join(DOC_DIR, 'pinterest-pins.md'), md);
  writeFileSync(join(DOC_DIR, 'pinterest-pins.csv'), `${csv}\n`);
}

async function main(): Promise<void> {
  const pins = buildPins();
  const problems = validatePins(pins);

  if (problems.length > 0) {
    console.error(`${problems.length} pin problem(s):\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error('\nFix these in lib/pins/pins.ts — a pin is no use if it does not fit.');
    process.exitCode = 1;
    return;
  }

  // Clear stale pins, so an unpublished page's images do not linger.
  mkdirSync(PIN_DIR, { recursive: true });
  const wanted = new Set(pins.map((pin) => pin.file));
  for (const file of readdirSync(PIN_DIR)) {
    if (file.endsWith('.png') && !wanted.has(file)) {
      rmSync(join(PIN_DIR, file));
      console.log(`  removed stale ${file}`);
    }
  }

  let bytes = 0;
  for (const pin of pins) {
    const response = new ImageResponse(card(pin), { width: WIDTH, height: HEIGHT, fonts });
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(join(PIN_DIR, pin.file), buffer);
    bytes += buffer.length;
  }

  writeTables(pins);

  console.log(
    `Wrote ${pins.length} pins to public/pins/ (${(bytes / 1024 / 1024).toFixed(1)} MB, ${WIDTH}x${HEIGHT})`,
  );
  console.log('Wrote docs/pinterest-pins.md and docs/pinterest-pins.csv');
  console.log(`Destination URLs point at ${site.url}`);
}

void main();
