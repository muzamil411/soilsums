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

Links carry an underline by default in the base layer. That is not decoration: Tailwind's
preflight removes the browser's own underline, which left inline links in body text
distinguishable from the surrounding ink only by colour — kale on ink is 1.53:1, well
under the 3:1 WCAG 1.4.1 requires. Add `no-underline` where a link is a standalone block
(nav, seed packets, plant labels, breadcrumbs) rather than a word inside a sentence.

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
   plus 4–6 crop-specific FAQs, and register it in `content/crops/registry.ts`.
3. Run `npm run verify-data` and work through anything still unverified.

A crop with data but no registered MDX file does **not** get a page. That is deliberate: a
quick-facts table with no guidance would be a thin page.

Each crop page pairs `CropFacts` — the quick-facts table, read straight from `data/crops.ts` —
with `CropCalculators`, three miniature calculators already filled in for that crop: how many
fit in your bed, when to sow it, and what you will harvest. They call the same pure functions
in `lib/calculators/` as the full tools, so a crop page and a tool page cannot disagree.

## How to publish an article

1. Create `content/blog/<slug>.mdx` and register it in `content/blog/registry.ts`.
   Frontmatter: `title`, `description`, `draft`, `published`, `updated`, and an optional
   `tools:` list of tool slugs, which becomes the "Do the sums" links at the foot of the piece.
2. Draft with `draft: true`. Drafts are excluded from the build, the notebook index and the
   sitemap, so work in progress can be committed safely. Every article is registered whether
   or not it is a draft — the route and the sitemap filter on the flag, so publishing is a
   one-line change.
3. Check the facts, then set `draft: false`.
4. Run `npm run content-report`. Articles should reach 900 words; titles must stay within
   60 characters and descriptions within 155, which the script enforces.

### One article has to stay published

`output: 'export'` refuses to build a dynamic route whose `generateStaticParams()` returns an
empty array, so `/blog/[slug]/` needs at least one published article to exist at all. The
container-soil piece is published for that reason: its figures are exact unit conversions and
product conventions, so there is nothing in it awaiting verification.

If you want to unpublish it before anything else goes live, delete `app/blog/[slug]/` and
`app/blog/page/[page]/` as well, and restore them when you publish your first article. The
notebook index at `/blog/` is a static route and copes with an empty list on its own.

For the same reason, `/blog/page/[page]/` covers **every** page number including 1, rather
than page 2 onwards. `/blog/page/1/` duplicates `/blog/`, so it canonicalises there, carries
`noindex`, and stays out of the sitemap.

### Frontmatter dates

Write dates unquoted (`updated: 2026-09-17`) or quoted — either works. YAML parses an
unquoted date into a JavaScript `Date`, so `lib/content/mdx.ts` normalises `updated` and
`published` back to `YYYY-MM-DD` strings on read. Without that step the pages rendered the
words "Invalid Date".

## Deploying to Cloudflare Pages

1. Push to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git, and pick the
   repository.
3. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: `.nvmrc` pins 22, which Pages reads automatically. If a build
     still picks an older Node, set `NODE_VERSION=22` as an environment variable —
     Next 16 will not build on Pages' older default.
4. Add the environment variables you need from the table above, for both Production and
   Preview.
5. Custom domain: Pages → Custom domains → add `soilsums.com` and `www.soilsums.com`, and
   redirect one to the other.
6. Email: Cloudflare → the domain → Email → Email Routing, and forward
   `hello@soilsums.com` to your real inbox.

The same `out/` directory deploys to Vercel with no changes (framework preset Next.js,
or Other with output directory `out`).

### Headers, and why there is no `_redirects` file

`public/_headers` is copied into `out/` by the build and is read by both Workers static
assets and Pages. It sets `nosniff`, `X-Frame-Options`, a referrer policy and a narrow
permissions policy on every route, and marks the hashed `/_next/static/*` assets
immutable.

Comments in that file must start at **column 0**. An indented `#` is read as a header
line, not a comment.

It deliberately sets **no Content-Security-Policy**: AdSense and GA4 load scripts and
frames from a shifting set of Google domains, and a policy written before ads are live
tends to stop them serving weeks later without an obvious cause. Add one after ads are
running, and test it with ads enabled.

HSTS is not set here either. Turn it on in the dashboard — SSL/TLS → Edge Certificates →
HSTS — where it is a toggle you control. Setting it in a file on a site that has not
launched can lock browsers out of the domain if a certificate goes wrong.

There is **no `_redirects` file**, and this is not an oversight. Workers static assets
validates it and rejects any rule containing a hostname:

```
Invalid _redirects configuration:
Line 18: Only relative URLs are allowed. [code: 100324]
```

Pages accepts absolute URLs there; Workers does not. Since the only redirect this site
needs is `www` to apex — which is by definition cross-hostname — it has to be done at
the zone level instead.

### Sending www to the apex

Do this in the dashboard, once, after the site is deployed and the custom domains are
attached:

1. Cloudflare → your domain → **Rules** → **Redirect Rules** → **Create rule**
2. **If** — Custom filter expression, Hostname **equals** `www.soilsums.com`
3. **Then** — Dynamic redirect, expression:
   `concat("https://soilsums.com", http.request.uri.path)`
4. Status **301**, and tick **preserve query string**

Verify:

```bash
curl -sI https://www.soilsums.com/tools/ | head -3     # expect 301 to the apex
```

## Consent for EEA, UK and Swiss visitors

Google requires a Google-certified consent management platform before serving
personalised ads to visitors in the EEA, the UK and Switzerland. The simplest route needs
no code: turn on the GDPR message under **Privacy & messaging** in the AdSense dashboard.

If you use a third-party CMP instead, add it in exactly one place —
`components/ads/AdScript.tsx` — immediately above the AdSense script, with
`strategy="beforeInteractive"` so it can gate ad requests. Nothing else in the codebase
needs to change.

## Go-live checklist

### 1. Content, before anything else

- [ ] Work through `docs/data-to-verify.md` — 63 entries whose figures have not been
      checked against a primary source. Regenerate it with
      `npm run verify-data -- --markdown`.
- [ ] Publish the nineteen drafted articles as you fact-check them
      (`draft: false` in each file's frontmatter).
- [ ] Write the remaining twenty crop guides, or leave the crops index as it is —
      it already names which crops have data but no guide.
- [ ] `npm run check` passes with zero errors.
- [ ] `npm run content-report` shows no thin pages.

### 2. Domain and hosting

- [ ] Point `soilsums.com` at Cloudflare (nameservers), if it is not there already.
- [ ] Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
      Authorise the repository; no API token needs to be created or shared for this.
- [ ] Set the production branch to `main`.
- [ ] Build command `npm run build`, output directory `out`, framework preset None,
      `NODE_VERSION=22`.
- [ ] Add `NEXT_PUBLIC_SITE_URL=https://soilsums.com` for Production and Preview.
- [ ] Pages → Custom domains → add `soilsums.com` and `www.soilsums.com`, and redirect
      one to the other so only a single hostname serves the site.
- [ ] Confirm HTTPS is live and that `http://` redirects to `https://`.
- [ ] Cloudflare → the domain → Email → Email Routing, forwarding
      `hello@soilsums.com` to a real inbox. Send yourself a test message.
- [ ] Check a few pages with `curl -I` and confirm `content-encoding: br`.
- [ ] Create the www-to-apex Redirect Rule (see "Sending www to the apex" above) and
      confirm it returns 301.
- [ ] Turn on HSTS under SSL/TLS → Edge Certificates, once you are happy the site is up.

### 3. Search Console

- [ ] Add `https://soilsums.com/` as a property and verify it (the DNS TXT method is
      simplest when the domain is already on Cloudflare).
- [ ] Submit `https://soilsums.com/sitemap.xml`.
- [ ] Confirm `https://soilsums.com/robots.txt` resolves and names the sitemap.
- [ ] Request indexing for the home page and two or three tool pages to start things off.
- [ ] Check the Core Web Vitals report after a few weeks of real traffic — the
      Lighthouse numbers above are lab data, not field data.

### 4. Analytics, if you want it

- [ ] Create a GA4 property and set `NEXT_PUBLIC_GA4_ID` in Cloudflare Pages.
- [ ] Redeploy, then confirm the `calculator_used` event fires (it is debounced to once
      per tool per page view).

## AdSense go-live checklist

Do this last, after the three sections above.

- [ ] All twelve tool pages published, each with 700+ words of its own content. (Done.)
- [ ] At least a dozen articles published, each 900+ words. Twenty are written; nineteen
      are drafts awaiting fact-checking.
- [ ] About, Contact, Privacy policy, Terms, Disclaimer and Cookie policy all reachable
      from the footer on every page. (Done.)
- [ ] `npm run verify-data` is empty, or every remaining entry is one you have decided to
      accept as-is.
- [ ] Apply for AdSense with `NEXT_PUBLIC_ADSENSE_ENABLED=false`. The site shows no ad
      markup and reserves no space in that state, so a reviewer sees no empty gaps.
- [ ] Once approved: put the publisher ID in `NEXT_PUBLIC_ADSENSE_PUB_ID`, uncomment the
      single line in `public/ads.txt` and fill in the same ID, set
      `NEXT_PUBLIC_ADSENSE_ENABLED=true`, and redeploy.
- [ ] Turn on the GDPR consent message under **Privacy & messaging** in the AdSense
      dashboard, before serving ads to anyone in the EEA, the UK or Switzerland.
- [ ] Confirm `https://soilsums.com/ads.txt` returns the uncommented line.
- [ ] Re-run Lighthouse on a tool page with ads live and confirm CLS is still under 0.1.
      `AdSlot` reserves a fixed min-height for exactly this reason, but a live ad unit is
      the only way to be sure.

## Licence

Site content and code © 2026 Muzamil Ali. Agronomic figures belong to the sources credited
in the data files.
