/**
 * Renders the default Open Graph card to public/og-default.png at build time
 * (wired up as the `prebuild` script), so the image ships as an ordinary PNG
 * with a real file extension.
 *
 * Next's app/opengraph-image.tsx convention would also work, but under
 * `output: 'export'` it emits an extension-less file at /opengraph-image,
 * whose content type then depends on the host's guesswork. A plain .png in
 * public/ is served correctly by Cloudflare Pages, Vercel and anything else.
 *
 * The card reuses the seed-packet layout: kale band, radish stripe, graph
 * paper, site name.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '../lib/seo/site';

const OUT_DIR = join(process.cwd(), 'public');
const OUT_FILE = join(OUT_DIR, 'og-default.png');

const ink = '#1c231b';
const paper = '#f1f2ec';
const kale = '#14482f';
const radish = '#b8294a';
const rule = '#c8ccbf';

const card = (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: paper,
      backgroundImage: `linear-gradient(to right, ${rule} 1px, transparent 1px), linear-gradient(to bottom, ${rule} 1px, transparent 1px)`,
      backgroundSize: '48px 48px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: kale,
        padding: '30px 60px',
      }}
    >
      <div style={{ color: paper, fontSize: 44, fontWeight: 700 }}>{site.name}</div>
      <div style={{ backgroundColor: radish, width: 130, height: 22 }} />
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        padding: '0 60px',
      }}
    >
      <div style={{ color: ink, fontSize: 82, fontWeight: 700, lineHeight: 1.1 }}>
        {site.tagline}
      </div>
      <div style={{ backgroundColor: radish, width: 190, height: 9, marginTop: 30 }} />
      <div style={{ color: ink, fontSize: 34, marginTop: 30, opacity: 0.85 }}>
        Soil, mulch, fertilizer, spacing and planting date calculators
      </div>
    </div>
  </div>
);

const response = new ImageResponse(card, { width: 1200, height: 630 });
const bytes = Buffer.from(await response.arrayBuffer());

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, bytes);

console.log(`Wrote public/og-default.png (${bytes.length} bytes, 1200x630)`);
