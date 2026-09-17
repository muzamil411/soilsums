# SoilSums

Gardening calculators for people who need a number before they get to the checkout.
Static Next.js site, no backend, no database, no accounts — everything runs in the browser.

Live site: https://soilsums.com

---

## Setup

```bash
npm install
cp .env.example .env.local   # optional; the site builds with nothing set
npm run dev                  # http://localhost:3000
```

Node 20 or newer.

## Commands

| Command                  | What it does                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Development server with hot reload                                                                                                                                  |
| `npm run build`          | Static export to `out/`. Runs `prebuild` first, which regenerates the Open Graph image                                                                              |
| `npm test`               | Vitest unit tests for the calculation functions                                                                                                                     |
| `npm run test:watch`     | Same, in watch mode                                                                                                                                                 |
| `npm run lint`           | ESLint                                                                                                                                                              |
| `npm run format`         | Prettier, writing changes                                                                                                                                           |
| `npm run contrast-check` | Verifies the palette meets WCAG AA, that the ratios documented in `app/globals.css` are true, and that no control uses the decorative `--color-rule` for its border |
| `npm run content-report` | Word count per page, flags thin pages, and **fails** if any title exceeds 60 characters or description exceeds 155                                                  |
| `npm run verify-data`    | Lists every data entry still marked `verified: false` (add `-- --strict` to fail instead of report)                                                                 |
| `npm run check`          | lint → contrast-check → content-report → test → build. This is the gate; it must pass with zero errors                                                              |

## Environment variables

All optional. See `.env.example`.

| Variable                      | Default                | Effect                                                                                      |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | `https://soilsums.com` | Base for canonical URLs, the sitemap and Open Graph tags                                    |
| `NEXT_PUBLIC_ADSENSE_PUB_ID`  | empty                  | AdSense publisher ID, `ca-pub-XXXXXXXXXXXXXXXX`                                             |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `false`                | Must be exactly `true`, **and** a publisher ID must be set, before any ad markup is emitted |
| `NEXT_PUBLIC_GA4_ID`          | empty                  | GA4 measurement ID, `G-XXXXXXXXXX`. Blank disables analytics entirely                       |

While ads are disabled, `<AdSlot />` renders nothing at all — no wrapper and no reserved
height — so pages have no empty gaps during AdSense review. Reserved space appears only
once ads are actually live, where it exists to prevent layout shift.

## How the project is laid out

```
app/          routes (App Router), one folder per URL
components/   layout/, ui/, tools/, seo/, ads/
lib/
  calculators/  one pure function per tool, plus its unit tests
  content/      MDX frontmatter reader and word counting
  hooks/        useUnits, useQueryState, useLocalStorage
  seo/          site constants, metadata builder, JSON-LD builders
data/         crops, grass seed rates, compost materials, lime rates, tool registry
content/      tools/, crops/, blog/ — the MDX that fills the pages
scripts/      contrast-check, content-report, verify-data, generate-og
public/       ads.txt, og-default.png, favicon
```

Two rules the codebase holds to:

1. **Calculation lives in `lib/calculators/`**, as pure functions with typed inputs and
   outputs. UI components call them and render the answer; they never do arithmetic.
2. **Nothing thin gets published.** A tool, crop or article page exists only when its
   content file exists and is not a draft. Everything else is excluded from
   `generateStaticParams` and from the sitemap, so there are no placeholder pages.

## Design system

Tokens live in one place: the `@theme` block at the top of `app/globals.css`.

| Token            | Hex       | Use                                                                    | Contrast on paper |
| ---------------- | --------- | ---------------------------------------------------------------------- | ----------------- |
| `--color-ink`    | `#1c231b` | Body text                                                              | 14.29:1           |
| `--color-paper`  | `#f1f2ec` | Page background                                                        | —                 |
| `--color-kale`   | `#14482f` | Headings, links, buttons, header and footer bands, **control borders** | 9.34:1            |
| `--color-radish` | `#b8294a` | Accent, focus outline, result underline                                | 5.40:1            |
| `--color-ochre`  | `#8a5b00` | Cautions, unverified-data flags                                        | 5.21:1            |
| `--color-rule`   | `#c8ccbf` | **Decorative only** — graph paper, table hairlines                     | 1.45:1            |

`--color-rule` is below 3:1 and must never identify a control. Input borders, select
borders and button outlines use `--color-kale`, or `--color-radish` when focused, per
WCAG 1.4.11. `npm run contrast-check` enforces this by scanning the JSX and fails the
build if a control picks up a rule-coloured border.

Fonts are Fraunces (display) and Public Sans (body and UI), self-hosted via `next/font`.
Public Sans has true tabular figures, which is why live-updating results do not jitter.

Two classes carry the visual identity: `.graph-paper` (the garden-notebook surface behind
each calculator) and `.plant-label` (the pointed nursery tag used for crop chips). The
seed-packet card is `components/ui/SeedPacket.tsx`.

Writing conventions: sentence case for every heading, label and button. No uppercase or
small-caps section labels. No arrows in link or button text. Seed packet catalogue
numbers (`No. 01`) are part of the visual identity and stay.

## How a tool page is assembled

`app/tools/[slug]/page.tsx` builds a page only when all three pieces exist: the tool is
`published` in `data/tools.ts`, it has a component in `components/tools/registry.ts`,
and it has non-draft content in `content/tools/registry.ts`. Miss any one and the page
is left out of both the build and the sitemap.

Each calculator is a client component wrapped in `CalculatorFrame`, which owns the
garden-notebook panel, the unit toggle, the live result, and the copy, print and reset
buttons. State comes from `useToolState`, which:

- composes values from three layers — defaults for the current unit system, anything a
  shared link carried, then the reader's own edits — so no effect has to copy the URL
  into state;
- mirrors the inputs into the query string with `history.replaceState`, so a result is
  shareable without pushing history entries on every keystroke;
- converts values when the units change, using the `kinds` map each tool declares
  (`span`, `short`, `area`, `volume`, `dry-volume`, `mass`, `rainfall`, `rate`, `none`).
  Type 8 feet, switch to metric, and you get 2.438 metres rather than 8 metres.

Browser-only values (the query string, the unit preference, a saved plan) are read
through `useSyncExternalStore` in `lib/hooks/useBrowserValue.ts`, not from an effect.
The static HTML has no query string, so reading one in an effect would mean rendering
defaults and correcting them — a cascading render on every page load, and a lint error
from `react-hooks/set-state-in-effect`.

`CalculatorFrame` takes `resultFirst` for the four tools whose input is a list or a grid
(compost, yield, planner, planting dates). With rows that can be added there is no
settled place "after the inputs", and putting the running total at the top keeps it
visible while the list is edited. It is also what keeps every tool's result above the
fold on a 375x667 phone.

Calculators cannot read the filesystem, so the page passes them `linkedCrops` — the crop
guides that actually exist. Crops outside that list render as plain text rather than as
links to pages that have not been written yet.

## How to add a new tool

1. Add an entry to `data/tools.ts` with `published: false`, a catalogue number, a
   category and three related tool slugs.
2. Write the pure function in `lib/calculators/<slug>.ts`, with typed input and output
   types. Reject invalid input by returning an error, never `NaN` or `Infinity`.
3. Write `lib/calculators/<slug>.test.ts` — at least five cases, including zero,
   negative, very large, and the same calculation in imperial and metric.
4. Build the client component in `components/tools/<Slug>.tsx` around
   `CalculatorFrame`, and register it in `components/tools/registry.ts`.
5. Write `content/tools/<slug>.mdx` and register it in `content/tools/registry.ts`:
   intro, how to use it, how it is calculated with a worked example, a reference table,
   tips and common mistakes, and 5–6 FAQs. 700–1,000 words including the FAQs.
6. Flip `published: true`. Run `npm run check`.

### MDX frontmatter

```yaml
---
title: Mulch calculator # the <title>, 60 characters or fewer
description: How many bags... # the meta description, 155 or fewer
heading: Mulch calculator # optional, when the h1 should differ
updated: 2026-09-17
faqs:
  - question: >-
      How deep should mulch be?
    answer: >-
      Two to three inches is right for most beds...
---
```

FAQ questions and answers are read from the frontmatter, rendered on the page and used
for `FAQPage` structured data, so there is one source of truth for all three. Write them
as YAML block scalars (`>-`): a plain scalar breaks on any `: ` inside the text, which is
easy to hit when writing about ratios and units. Answers are plain prose with no
markdown, because structured data cannot carry markup.

## How to add a crop

1. Add the crop to `data/crops.ts`. Every agronomic figure needs a `source` string and
   `verified: false` until you have checked it against a primary reference.
2. Write `content/crops/<slug>.mdx` with 500–800 words of guidance specific to that crop,
   plus 4–6 crop-specific FAQs.
3. Run `npm run verify-data` and work through anything still unverified.

A crop with data but no MDX file does **not** get a page. That is deliberate.

## How to publish an article

1. Create `content/blog/<slug>.mdx` with frontmatter: `title`, `description`, `draft`,
   `published`, `updated`.
2. Draft with `draft: true`. Drafts are excluded from the build, the blog index and the
   sitemap, so you can commit work in progress safely.
3. Check the facts, then set `draft: false`.
4. Run `npm run content-report`. Articles should reach 900 words; titles must stay within
   60 characters and descriptions within 155, which the script enforces.

## Deploying to Cloudflare Pages

1. Push to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git, and pick the
   repository.
3. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: set `NODE_VERSION` to `22`
4. Add the environment variables you need from the table above, for both Production and
   Preview.
5. Custom domain: Pages → Custom domains → add `soilsums.com` and `www.soilsums.com`, and
   redirect one to the other.
6. Email: Cloudflare → the domain → Email → Email Routing, and forward
   `hello@soilsums.com` to your real inbox.

The same `out/` directory deploys to Vercel with no changes (framework preset Next.js,
or Other with output directory `out`).

## Consent for EEA, UK and Swiss visitors

Google requires a Google-certified consent management platform before serving
personalised ads to visitors in the EEA, the UK and Switzerland. The simplest route needs
no code: turn on the GDPR message under **Privacy & messaging** in the AdSense dashboard.

If you use a third-party CMP instead, add it in exactly one place —
`components/ads/AdScript.tsx` — immediately above the AdSense script, with
`strategy="beforeInteractive"` so it can gate ad requests. Nothing else in the codebase
needs to change.

## AdSense go-live checklist

- [ ] Domain live on Cloudflare Pages with HTTPS, and `www` redirecting to the apex.
- [ ] All twelve tool pages published, each with 700+ words of its own content.
- [ ] At least a dozen articles published (`draft: false`), each 900+ words.
- [ ] About, Contact, Privacy policy, Terms, Disclaimer and Cookie policy all reachable
      from the footer on every page.
- [ ] `npm run check` passes with zero errors.
- [ ] `npm run content-report` shows no thin pages.
- [ ] `npm run verify-data` is empty, or every remaining entry is one you have decided to
      accept.
- [ ] `sitemap.xml` submitted in Google Search Console, and the property verified.
- [ ] Apply for AdSense. Leave `NEXT_PUBLIC_ADSENSE_ENABLED=false` while under review —
      the site should show no ad placeholders at all.
- [ ] Once approved: put the publisher ID in `NEXT_PUBLIC_ADSENSE_PUB_ID`, uncomment the
      single line in `public/ads.txt` and fill in the same ID, set
      `NEXT_PUBLIC_ADSENSE_ENABLED=true`, and redeploy.
- [ ] Turn on the GDPR consent message in **Privacy & messaging**.
- [ ] Confirm `https://soilsums.com/ads.txt` returns the uncommented line, and check for
      layout shift on a tool page with ads live.

## Licence

Site content and code © 2026 Muzamil Ali. Agronomic figures belong to the sources credited
in the data files.
