# SoilSums — working rules

Rules that must hold across sessions. Not documentation; see README.md and
docs/ for how things work.

## Shipping

- Develop on a working branch, never directly on `main`.
- **Nothing is live until `main` is fast-forwarded and pushed.** Cloudflare
  deploys from `main` only. A commit on a working branch has changed nothing
  a reader can see.
- Before reporting any page as done, open it and confirm it returns 200.
  A green build is not the same as a page that loads.

## Data

- Every agronomic number needs a source from a university extension service
  or the USDA, and that source must be visible on the page.
- A number that cannot be sourced gets a **range** with `verified: false`,
  never a precise invention. An honest range beats a false decimal.
- **Deleting a field from the data is half the job.** The same figure is
  usually written into the page's prose too, where no estimate marker can
  warn anyone about it — and a page whose data says verified while its body
  quotes an unsourced number makes a stronger false claim than one that
  never deleted anything. Grep the MDX after every data deletion;
  `lib/content/crop-prose.test.ts` checks the cases it can.
- Never take a figure from a search-result summary. This was done once on
  the sulfur work and had to be undone against the primary source.

## Content

- Articles do not carry calculator-shaped tables restating values a data
  file owns. Answer a quantity question in one sentence and link the
  calculator. `lib/content/mdx-figures.test.ts` fails the build otherwise;
  tables of measured values are generated from the data files by a
  component.
- One primary keyword belongs to exactly one page. Run `npm run seo-audit`
  and check `docs/keyword-map.md` before creating a page. On an overlap,
  stop and ask rather than deciding.
- **A slug never changes once live.** The static export has no redirect
  layer, so a rename is a 404.
- Page schema (Article, FAQPage, BreadcrumbList, HowTo) is emitted by the
  page template from frontmatter — `keyword`, `keywordDifficulty`,
  `searchVolume`, `questionKeywords`, `tools`, `faqs`. Put the values in
  frontmatter; do not hand-write schema into MDX.
- Every FAQ question in frontmatter must also be answered in the body.

## Checks

`npm run lint`, `npm test`, `npm run build`, `npm run content-report`,
`npm run verify-data`, `npm run seo-audit`. Run them before merging.
