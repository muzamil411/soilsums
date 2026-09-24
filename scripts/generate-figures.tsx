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
import { nitrogenLabel, nitrogenSources } from '../data/nitrogen-sources';

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

/**
 * The release-rate spectrum, built from data/nitrogen-sources.ts.
 *
 * The table gives percentage and rating in two columns and a reader has to
 * hold both in mind at once. Laid along a timeline the point lands
 * immediately: the richest materials are not the fastest, and choosing by
 * percentage alone is how people end up feeding next year's crop.
 */
function releaseBand(rating: string): 0 | 1 | 2 {
  if (rating === 'Rapid' || rating === 'Medium-Rapid') return 0;
  if (rating === 'Slow') return 2;
  return 1;
}

const BANDS = [
  { title: 'Under a month', sub: 'Rapid and Medium-Rapid', fill: radish },
  { title: 'One to four months', sub: 'Medium, and either way of it', fill: kale },
  { title: 'Four months to a year', sub: 'Slow', fill: '#3d6b52' },
] as const;

const spectrum = (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: paper,
      padding: '38px 44px',
    }}
  >
    <div style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 34, color: ink }}>
      How fast each material releases its nitrogen
    </div>
    <div
      style={{
        fontFamily: 'Public Sans',
        fontSize: 20,
        color: ink,
        opacity: 0.8,
        marginTop: 8,
        marginBottom: 26,
      }}
    >
      Percent nitrogen in brackets. University of Georgia Extension Circular 853, Table 1.
    </div>
    <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
      {BANDS.map((band, index) => (
        <div
          key={band.title}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            marginRight: index === BANDS.length - 1 ? 0 : 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: band.fill,
              color: paper,
              padding: '12px 16px',
            }}
          >
            <div style={{ fontFamily: 'Public Sans', fontWeight: 600, fontSize: 23 }}>
              {band.title}
            </div>
            <div style={{ fontFamily: 'Public Sans', fontSize: 17, opacity: 0.9 }}>
              {band.sub}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              border: `2px solid ${rule}`,
              borderTop: 'none',
              padding: '12px 16px',
            }}
          >
            {nitrogenSources
              .filter((entry) => releaseBand(entry.availability) === index)
              .map((entry) => (
                <div
                  key={entry.slug}
                  style={{
                    display: 'flex',
                    fontFamily: 'Public Sans',
                    fontSize: 19,
                    color: ink,
                    marginBottom: 7,
                  }}
                >
                  {`${entry.name} (${nitrogenLabel(entry)})`}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        display: 'flex',
        marginTop: 22,
        fontFamily: 'Public Sans',
        fontSize: 20,
        color: ink,
      }}
    >
      Feather meal is the richest material on the list and one of the slowest. Percentage alone
      does not tell you whether a crop will see it this season.
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

  const spectrumPng = Buffer.from(
    await new ImageResponse(spectrum, { width, height: 560, fonts }).arrayBuffer(),
  );
  const spectrumWebp = await sharp(spectrumPng).webp({ quality: 90 }).toBuffer();
  writeFileSync(join(OUT_DIR, 'nitrogen-release-rate-spectrum.webp'), spectrumWebp);
  console.log(
    `Wrote public/figures/nitrogen-release-rate-spectrum.webp (${(spectrumWebp.length / 1024).toFixed(0)} kB, ${width}x560)`,
  );
}

void main();
