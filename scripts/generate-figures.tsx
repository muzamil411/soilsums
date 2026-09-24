/**
 * Renders article diagrams to public/figures/ as WebP.
 *
 * Diagrams rather than photographs: the site has no photography and a stock
 * image of a bag of compost teaches nobody anything. These are drawn in the
 * site palette with the same two typefaces, so a figure reads as part of the
 * page rather than as decoration dropped into it.
 *
 * Rendered through satori (via next/og) for the same reason the pins are —
 * it is the only renderer here that can be handed the vendored TTFs, so the
 * type matches the site instead of falling back to whatever the container has
 * installed. PNG out of satori, then sharp converts to WebP.
 *
 * Run with `npm run figures`.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';

const OUT_DIR = join(process.cwd(), 'public', 'figures');
const FONT_DIR = join(process.cwd(), 'assets', 'fonts');

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

type Layer = { label: string; fill: string; text: string; height: number };

function Band({ layer }: { layer: Layer }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: layer.fill,
        color: layer.text,
        height: layer.height,
        fontFamily: 'Public Sans',
        fontWeight: 600,
        fontSize: 21,
        textAlign: 'center',
        padding: '0 10px',
      }}
    >
      {layer.label}
    </div>
  );
}

function Panel({
  title,
  caption,
  layers,
  framed = false,
}: {
  title: string;
  caption: string;
  layers: readonly Layer[];
  /** Draws the timber sides of a raised bed down the outside of the stack. */
  framed?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 348 }}>
      <div style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 30, color: ink }}>
        {title}
      </div>
      <div
        style={{
          fontFamily: 'Public Sans',
          fontSize: 19,
          color: ink,
          opacity: 0.8,
          marginTop: 6,
          marginBottom: 16,
          height: 52,
        }}
      >
        {caption}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {framed ? <div style={{ width: 12, height: 300, backgroundColor: ink }} /> : null}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {layers.map((layer) => (
            <Band key={layer.label} layer={layer} />
          ))}
        </div>
        {framed ? <div style={{ width: 12, height: 300, backgroundColor: ink }} /> : null}
      </div>
    </div>
  );
}

const surface: Layer = { label: 'Mulch, on top', fill: radish, text: paper, height: 52 };
const native: Layer = { label: 'Native soil, undug', fill: rule, text: ink, height: 96 };

const figure = (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: paper,
      padding: '40px 44px',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <Panel
        title="In-ground bed"
        caption="Improve what is already there"
        layers={[
          surface,
          { label: 'Garden soil or compost, dug in', fill: kale, text: paper, height: 152 },
          native,
        ]}
      />
      <Panel
        title="Raised bed"
        caption="Bulk volume, then amendments"
        framed
        layers={[
          surface,
          { label: 'Topsoil and garden soil', fill: kale, text: paper, height: 116 },
          { label: 'Compost, about a third', fill: '#3d6b52', text: paper, height: 60 },
          { label: 'Native soil below', fill: rule, text: ink, height: 72 },
        ]}
      />
      <Panel
        title="Container"
        caption="Soil-less mix only"
        layers={[
          { label: 'Potting mix, nothing else', fill: kale, text: paper, height: 232 },
          { label: 'Pot base — drainage hole here', fill: ink, text: paper, height: 68 },
        ]}
      />
    </div>
    <div
      style={{
        display: 'flex',
        marginTop: 30,
        paddingTop: 20,
        borderTop: `2px solid ${rule}`,
        fontFamily: 'Public Sans',
        fontSize: 20,
        color: ink,
      }}
    >
      Garden soil and topsoil go in the ground. Potting mix goes in pots. Mulch stays on the
      surface. Swapping them is where most of the trouble starts.
    </div>
  </div>
);

async function main(): Promise<void> {
  const width = 1200;
  const height = 620;
  const response = new ImageResponse(figure, { width, height, fonts });
  const png = Buffer.from(await response.arrayBuffer());
  const webp = await sharp(png).webp({ quality: 90 }).toBuffer();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'where-each-soil-product-goes.webp'), webp);

  console.log(
    `Wrote public/figures/where-each-soil-product-goes.webp (${(webp.length / 1024).toFixed(0)} kB, ${width}x${height})`,
  );
}

void main();
