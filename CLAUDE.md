# SoilSums — working rules

Rules that must hold across sessions. Not documentation; see README.md and
docs/ for how things work.

## Shipping

- Develop on a working branch, never directly on `main`.
- **Nothing is live until `main` is fast-forwarded and pushed.** Cloudflare
  deploys from `main` only. A commit on a working branch has changed nothing
  a reader can see.
- **Push `main` before pushing the working branch.** A fast-forward leaves
  both refs on the same commit, and Cloudflare builds per commit: if it sees
  that commit on the branch first it deploys it as a preview, and the later
  push of `main` has nothing new to build, so production stays on the
  previous commit. Pushing `main` first makes the production branch claim
  the commit. This has silently failed twice.
- After pushing, **confirm the remote** with
  `git ls-remote origin main` — not `git status`, not `git log`, not the
  push output. A local branch can look merged while the remote has not
  moved.
- Then **confirm the live page shows one specific string you changed.**
  Not a build status, not a version ID, not a local server — the actual
  string on `https://soilsums.com/...`. Pick the string before deploying and
  name it in the report.
- If `soilsums.com` cannot be reached from this environment, **say the
  deploy is unverified and name the string to look for.** Do not report the
  work as live. A merge that reached `origin/main` is not evidence that
  Cloudflare built it.

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
- **When a figure changes, grep for the old value as well as the field
  name** — in words as well as digits. A number restated in another section
  will not mention the field: a container section saying "space plants at
  the same 9 inches" survived a spacing correction because nothing matched
  `spacingInches`, and asparagus kept a deleted 15 by spelling it
  "fifteen". The guard cannot see these, because the field is no longer
  null; only reading the page or grepping the value catches them.
- **The pin images are a third surface, and nobody was checking it.** Pin text
  is generated from page frontmatter into PNGs committed under `public/pins/`,
  so a corrected figure does not reach them until `npm run pins` is run again.
  Asparagus pins were still offering the retracted 15 inches and 4-week frost
  offset, and marigold pins the retracted 10 inches, long after both were fixed
  in the data and the prose. Run `npm run pins` after any figure change and
  commit what it rewrites. `lib/pins/pins.test.ts` only checks a file exists,
  not that its text is current.
- **A pin diff should now only ever be the pages you changed.** Pins used to
  print a catalogue number built from the crop's index in the published list,
  so publishing one crop rewrote the PNG of every alphabetically-later one —
  38 of them on one commit, with identical text. That drowned a real signal: a
  27-file pin diff was read as retracted figures when it was mostly
  renumbering. The number is gone. If a pin diff is now larger than the pages
  you touched, something else changed the template. The stable identifier for a
  pin is its file name, in `docs/pinterest-pins.md`'s first column.
- **A pin can change with no diff in `docs/pinterest-pins.md`, and that is not a
  bug.** The image renders `pin.support` — the first sentence of the FAQ answer
  the pin was built from — and that file has no column for it, carrying only
  file, title, description, url and board. Correcting a single FAQ answer on the
  grass seed calculator rewrote its pin with the doc untouched. So "the row is
  identical, therefore only the number changed" was wrong guidance while the
  number existed, and is still the wrong test now: to see what moved in a pin,
  compare `buildPins()` output rather than the doc.
- Never take a figure from a search-result summary. This was done once on
  the sulfur work and had to be undone against the primary source.
- **"It appears in the built output" is not "a reader can see it."** Grepping
  `out/**/index.html` matches the React payload in the `<script>` tags as well
  as the rendered page, so a value that exists only as a serialized prop looks
  present. `extraSources` were reported as visible on the crop pages on
  exactly this evidence and were not: the payload carried them and the page
  never rendered them. Strip the script tags before grepping — or check the
  rendered text — whenever the claim is that a reader sees something. It is
  the same class of error as a figure deleted from the data and left in the
  prose: the data was right and what reached the reader was not.

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

- **Never pipe `npm run build` somewhere that hides a failure.** A failed
  build leaves the previous `out/` in place, so every check that reads
  rendered output then passes on stale HTML. This happened while testing the
  tool-count guard: the build failed on an unused import, the output was
  suppressed with `tail -1`, and `seo-audit` cheerfully passed on the
  previous good render. Check the build actually succeeded before trusting
  anything downstream of it.
- **A count in prose belongs to the registry, not to a sentence.** The number
  of calculators was wrong on live pages four times — at twelve, thirteen,
  fourteen and fifteen — because each fix found the sentences a source grep
  happened to reach. `toolCountWord` and `ToolCountWord` in `data/tools.ts`
  derive it, and `seo-audit` now fails on any spelled-out count in the
  rendered copy that disagrees with `publishedTools.length`.
