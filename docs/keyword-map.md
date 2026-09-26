# Keyword map — blog articles and crop guides

Chosen keyword, volume and difficulty are filled in from Muzamil's checks in
Ahrefs' free Keyword Generator (US database, September 2026). The candidate
columns are kept as a record of what was considered and rejected.

**What the check found.** No candidate came back Medium, Hard or Super hard.
Every keyword was either KD "Easy" or had no KD calculated — for a long-tail
phrase a missing KD means Ahrefs has not measured the SERP because the phrase is
so specific, which indicates low competition rather than a problem. Volumes are
"<100" throughout, except "what do the three numbers on fertilizer mean" at
100-1K. Some phrasings returned no volume data at all, which is normal for
long-tail queries: each article ranks for many variants of its question rather
than for one exact string.

Every article went ahead. File names in the first column are the slugs after the
rewrite — each was rebuilt from its chosen keyword. Publishing order lives in
`content/blog/publish-order.json` and is applied by `npm run publish-next`.

Site context: soilsums.com is new, with no backlinks and near-zero domain
rating. Every candidate here is long-tail and informational. Head terms
("raised bed soil", "companion planting", "mulch") are deliberately excluded —
they are not winnable and the calculators already cover the transactional half
of the intent.

Market priority: US first, then UK, Canada, Australia.

## How to read the SERP column

"What ranks now" records what I saw in a live web search on 19 September 2026,
one search per article. The pattern worth acting on is in the last column of
that note: where the top results are content farms, retailers selling beds and
soil, or pages that contradict each other on the numbers, a small site with
sourced figures has a way in. Where extension services already hold the top
spots with a good answer, the gap is narrower and the angle has to be sharper.

---

## The map

| Article (file)                                                | Candidate 1                                                     | Candidate 2                                          | Candidate 3                                         | Question keywords                                                                                                                                                                                                                                                              | What ranks now                                                                                                                                                                                                                                                                                                 | Supports                                                                     | Conflicts / notes                                                                                                                                                                                                                                                                                   | Chosen keyword                                              | Volume  | KD             |
| ------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------- | -------------- |
| `what-to-fill-raised-garden-beds-with.mdx`                    | what to fill raised garden beds with                            | best soil mix for raised garden beds                 | can you fill a raised bed with just compost         | What is the best soil mix for a raised bed? · Can you use garden soil in a raised bed? · How much compost should a raised bed have? · Do you need topsoil in a raised bed? · What should you put in the bottom of a raised bed? · Can you fill a raised bed with just compost? | Maryland and Iowa State extension rank, but the top half is Gardenary, Homestead and Chill, Almanac and Garden Betty. They give four different mixes (equal thirds; 70/30; 1:1 compost and soilless; 40/40/20) and none reconciles them. Contradiction is the gap.                                             | raised-bed-soil-calculator, how-deep-should-a-raised-bed-be                  | Splits from the calculator cleanly: this is _what goes in_, the tool is _how much_. Candidate 3 is the sharpest long-tail — it is a real question with a definite answer and the top results waffle.                                                                                                | **what to fill raised garden beds with**                    | <100    | Easy           |
| `how-deep-should-a-raised-bed-be.mdx`                         | how deep should a raised bed be for vegetables                  | is 6 inches deep enough for a raised bed             | how deep does a raised bed need to be for tomatoes  | How deep should a raised bed be for vegetables? · Is 12 inches deep enough for a raised bed? · How deep do carrots need? · Do you need to remove grass under a raised bed? · Does a deeper bed mean more soil to buy? · Can roots grow into the ground below?                  | A permies forum thread ranks, and much of page one is retailers who sell beds (Vegogarden, Aosom, Eartheasy) with an interest in recommending deeper. Piedmont and Penn State Master Gardeners are the only neutral sources. Crop-by-crop depth from our own spacing data is the differentiator.               | raised-bed-soil-calculator, crop pages                                       | Distinct from the soil-mix article. Must link the calculator for the cost consequence of depth, which the retailer pages never mention.                                                                                                                                                             | **how deep should a raised bed be for vegetables**          | <100    | not calculated |
| `how-much-potting-soil-a-container-needs.mdx` **(published)** | how much potting soil for a 12 inch pot                         | how many quarts of soil in a 5 gallon bucket         | dry quarts vs liquid quarts potting soil            | How much soil does a 12 inch pot need? · How many quarts is a 5 gallon pot? · Why is potting soil sold in dry quarts? · How many pots will a bag of soil fill? · Does potting soil settle after watering?                                                                      | Bonnie, Omnicalculator and a dozen thin calculator clones. **They contradict each other badly**: for a 12-inch pot page one offers 8 qt, 12 qt and 20 qt. Nobody explains that a dry quart is 1.164 liquid quarts, which is where the error comes from. That is an unusually clean gap.                        | potting-soil-calculator                                                      | **Already published — slug change needs a redirect.** Overlaps the tool most of any article here. Keep the tool for "my pot, my number" and give the article the unit confusion and the per-pot table. Candidate 3 is the honest differentiator but likely tiny volume; candidate 1 is the traffic. | **how many quarts of soil in a 5 gallon bucket**            | <100    | Easy           |
| `how-much-sulfur-to-lower-soil-ph.mdx`                        | how much sulfur to lower soil pH                                | how to lower soil pH for blueberries                 | does vinegar lower soil pH                          | How do you lower soil pH naturally? · How long does sulfur take to lower pH? · How much sulfur per 1,000 square feet? · Will coffee grounds acidify soil? · Can you lower pH too fast? · What pH do blueberries need?                                                          | Maine, NC State, MSU and Agvise all rank — genuinely good extension coverage, so the bar is higher here. But the figures conflict (15 lb/1,000 sq ft vs 10–15 vs "never above 5–10 per application") and nobody resolves it. The myth-busting angle (vinegar, coffee grounds, pine needles) is thinly covered. | lime-calculator, how-to-raise-soil-ph-with-lime                              | **No tool covers lowering pH** — the cleanest non-competing article on the list. Candidate 3 is a pure myth query with no commercial competition.                                                                                                                                                   | **how much sulfur to lower soil pH**                        | <100    | Easy           |
| `greens-vs-browns-in-compost.mdx`                             | what is the ratio of greens to browns in compost                | are coffee grounds green or brown compost            | is cardboard a brown in compost                     | What counts as a green in compost? · What counts as a brown? · Is the 2:1 rule by weight or volume? · Are grass clippings green or brown? · What happens if you have too many browns? · Do you need to measure at all?                                                         | Epic Gardening, Gardening Know How, Garden Myths and a county page. Page one gives 2:1, 3:1, 4:1 and 1:1 without agreeing whether that is weight or volume. Our C:N-by-mass data resolves exactly this.                                                                                                        | compost-ratio-calculator, composting-mistakes                                | **Conflict risk with `composting-mistakes`.** Keep this one conceptual (what the words mean, why volume rules are proxies) and give troubleshooting entirely to the other. Candidates 2 and 3 are the classifier questions the top pages skim.                                                      | **are coffee grounds green or brown compost**               | <100    | Easy           |
| `why-is-my-compost-not-breaking-down.mdx`                     | why is my compost not breaking down                             | why does my compost smell like ammonia               | compost pile not heating up                         | Why is my compost slimy? · Why is my compost pile full of flies? · How wet should a compost pile be? · How often should you turn a compost pile? · Why won't my compost heat up? · Can you over-turn a compost pile?                                                           | Almost entirely content farms — Green Matters, Thriving Yard, Ready To DIY, That Backyard. No extension page on page one for either query. Symptom-to-cause diagnosis with real C:N numbers behind it is a genuine gap.                                                                                        | compost-ratio-calculator, greens-vs-browns-in-compost                        | Troubleshooting intent, distinct from the conceptual article above. Candidate 2 is narrower and probably the easier first win.                                                                                                                                                                      | **why is my compost not breaking down**                     | <100    | Easy           |
| `how-much-to-water-a-vegetable-garden.mdx`                    | how many gallons of water does a vegetable garden need per week | how much is 1 inch of water per square foot          | how often should you water a vegetable garden       | How much water does a vegetable garden need per week? · How do you measure an inch of water? · Is it better to water deeply or daily? · What time of day should you water? · How do you tell if soil is dry enough? · Does mulch reduce watering?                              | Clemson, NC State, Utah State and Almanac rank well. But the gallons conversion is given three ways on page one (6 gal/sq yd, ⅔ gal/sq ft, 66 gal for 10×10) and none shows the arithmetic.                                                                                                                    | garden-watering-calculator, mulch-types-compared                             | **Conflict:** the watering calculator owns the per-bed number. Article should own the _conversion and the method_, not "calculate mine". Candidate 2 is the snippet-winnable one.                                                                                                                   | **how much water does a vegetable garden need per week**    | no data | not calculated |
| `what-does-last-frost-date-mean.mdx`                          | how to find your last frost date                                | what does last frost date mean                       | how accurate are frost dates                        | How do I find my last frost date? · What is a 10% frost risk date? · Why does my frost date differ from my neighbour's? · Is the last frost date a guarantee? · What is the difference between frost and a freeze? · How do microclimates change frost dates?                  | Dominated by lookup tools — Almanac, Garden.org, Dave's Garden, plus several thin zip-code clones. They _give_ the date; almost none explains that it is a 50% probability date, which is the actual misunderstanding.                                                                                         | planting-date-calculator, starting-seeds-indoors-timeline                    | We have no frost-date lookup, so this is explainer-only — a good thing, since it sends users to the planting date calculator. Candidate 2 is the concept gap.                                                                                                                                       | **what does last frost date mean**                          | <100    | not calculated |
| `starting-seeds-indoors-weeks-before-frost.mdx`               | how many weeks before last frost to start seeds indoors         | when to start tomato seeds indoors                   | seed starting schedule by weeks before last frost   | How many weeks before last frost do I start seeds? · Which seeds should not be started indoors? · What happens if you start seeds too early? · Do seedlings need a grow light? · What is hardening off? · How long do peppers need indoors?                                    | Park Seed, Botanical Interests, Johnny's, Almanac — all seed retailers with a calculator. Their week counts disagree with each other and with Rutgers FS787. Our corrected, sourced table (and the 2–12 week invariant) is a real differentiator.                                                              | planting-date-calculator, crop pages                                         | **Conflict:** planting-date-calculator owns "when do I plant X". Article owns the _week counts per crop and why they matter_. Candidate 2 would collide with the tomato crop page — prefer 1 or 3.                                                                                                  | **how many weeks before last frost to start seeds indoors** | no data | not calculated |
| `succession-planting-schedule.mdx`                            | what is succession planting                                     | how often to succession plant lettuce                | succession planting schedule for vegetables         | What is succession planting? · How far apart should successions be? · Which vegetables are worth succession planting? · When do you stop succession sowing? · Does succession planting need more fertilizer? · How do you plan successions around frost dates?                 | Almanac, Gardening Know How, Farmers' Almanac, plus Maryland and Florida extension. Johnny's has the best interval chart. Coverage is decent, so the angle must be the four-different-meanings framing plus frost-date arithmetic.                                                                             | planting-date-calculator, crop pages, how-to-find-your-last-frost-date       | Candidate 1 is a head-ish definition term — likely harder than it looks. Candidate 2 is the winnable one.                                                                                                                                                                                           | **succession planting schedule for vegetables**             | <100    | not calculated |
| `how-often-should-you-fertilize-vegetables.mdx`               | how often should you fertilize vegetables                       | when to fertilize tomatoes and peppers               | should you fertilize vegetables every week          | How often should you fertilize a vegetable garden? · When do you stop fertilizing? · Should you fertilize at planting? · Do beans and peas need fertilizer? · Can you over-fertilize vegetables? · Is liquid or granular better?                                               | Almanac, Burpee, Pro-Mix, MSU and two AOL syndications. A Quora thread ranks, which is a soft SERP. Advice is calendar-based ("every 3–4 weeks"); a growth-stage schedule by crop group is better and is what extension actually says.                                                                         | fertilizer-calculator, how-to-read-a-fertilizer-label, crop pages            | **Conflict:** fertilizer-calculator owns "how much". Candidate 2 overlaps the tomato and pepper crop pages — prefer 1 or 3.                                                                                                                                                                         | **how often should you fertilize vegetables**               | <100    | Easy           |
| `what-the-three-numbers-on-fertilizer-mean.mdx`               | what do the three numbers on fertilizer mean                    | what does 10-10-10 fertilizer mean                   | how to calculate pounds of nitrogen in fertilizer   | What do the numbers on fertilizer mean? · Is the middle number phosphorus? · What does the guaranteed analysis show? · What is a complete fertilizer? · How much actual nitrogen is in a bag? · What does slow-release mean on a label?                                        | Planet Natural, Greener Horizon, two Zendesk help-desk pages, an Issuu scan. MSU is the only strong source. **Several top pages say the second number "is phosphorus" — it is phosphate (P₂O₅).** Correcting that is a clean differentiator.                                                                   | fertilizer-calculator, when-to-fertilize-vegetables                          | Candidate 3 is closest to the calculator's job — flag it, prefer 1 or 2. Candidate 2 is a distinct long-tail worth its own H2 either way.                                                                                                                                                           | **what do the three numbers on fertilizer mean**            | 100-1K  | Easy           |
| `best-mulch-for-a-vegetable-garden.mdx`                       | best mulch for a vegetable garden                               | is straw or wood chips better for a vegetable garden | what mulch should you not use in a vegetable garden | What is the best mulch for vegetables? · How thick should mulch be? · Do wood chips steal nitrogen? · Is hay or straw better? · Can you mulch with grass clippings? · When should you mulch a vegetable garden?                                                                | GrowVeg, Epic Gardening, Fine Gardening, joegardener. Decent quality, so candidate 1 is the hardest on this list. The nitrogen-tie-up question is answered vaguely everywhere and we have C:N data to answer it properly.                                                                                      | mulch-calculator, compost-ratio-calculator, greens-vs-browns-in-compost      | Candidate 1 is a near-head term — listed because it is the true intent, but candidates 2 and 3 are the realistic first wins.                                                                                                                                                                        | **best mulch for a vegetable garden**                       | no data | not calculated |
| `when-to-overseed-a-lawn.mdx`                                 | when is the best time to overseed a lawn                        | do you need to rake before overseeding               | how long does overseeded grass take to grow         | When should you overseed a lawn? · What soil temperature does grass seed need? · Do you need to aerate before overseeding? · Should you fertilize when overseeding? · How often do you water new seed? · Can you overseed in spring?                                           | Entirely commercial: Jonathan Green, TruGreen, Lawn Doctor, LawnStarter, Scotts-adjacent. No extension page on page one. Our sourced, region-named rates are the wedge, but link equity on these queries is high.                                                                                              | grass-seed-calculator                                                        | **Conflict:** grass-seed-calculator owns "how much seed per 1,000 sq ft". Article owns _timing and preparation_. Note our own data: 8 of 11 overseeding rates are unsourced estimates, so the article must not lean on rate numbers.                                                                | **when is the best time to overseed a lawn**                | no data | not calculated |
| `how-does-square-foot-gardening-work.mdx`                     | how does square foot gardening work                             | what can you plant in each square foot               | is square foot gardening worth it                   | How does square foot gardening work? · How many plants per square foot? · What is Mel's Mix? · Do you need a physical grid? · Does square foot gardening work for tomatoes? · What are the drawbacks?                                                                          | Frame It All and Garden In Minutes (both sell beds and grids), Grow a Good Life, Wikipedia, Gardener's Path. Universally promotional — nobody says where the method gets in the way. **Nobody flags that the per-square counts are Bartholomew's convention, not research.**                                   | square-foot-garden-planner, plant-spacing-calculator, crop pages             | **Conflict:** the planner owns grid planning. Candidate 2 overlaps the planner's core function — prefer 1 or 3. Candidate 3 is the honest-critique angle no competitor will write.                                                                                                                  | **how does square foot gardening work**                     | <100    | not calculated |
| `planning-a-vegetable-garden-layout.mdx`                      | how to plan a vegetable garden layout for beginners             | how wide should a vegetable garden bed be            | which direction should garden rows run              | How do you lay out a vegetable garden? · How much space between beds? · Should beds run north to south? · Where do tall crops go? · How do you rotate crops in a small garden? · How big should a first garden be?                                                             | Bonnie, Almanac, Grow a Good Life, plus several very thin listicles ("25 Beginner Layouts", Stellas Wardrobe). Bed width and row orientation are stated without reasons everywhere.                                                                                                                            | plant-spacing-calculator, square-foot-garden-planner, garden-yield-estimator | **Conflict risk with `square-foot-gardening-for-beginners`** — keep this one about siting, bed dimensions, orientation and rotation; keep SFG about the grid method. Candidates 2 and 3 are the winnable sub-questions.                                                                             | **how to plan a vegetable garden layout**                   | <100    | not calculated |
| `growing-vegetables-in-5-gallon-buckets.mdx`                  | best vegetables to grow in pots for beginners                   | what size pot for growing tomatoes                   | can you grow vegetables in 5 gallon buckets         | Which vegetables grow best in containers? · What size container does each crop need? · How often do containers need watering? · Do containers need fertilizer more often? · Can you reuse potting soil? · Which vegetables fail in pots?                                       | Almanac, Growing In The Garden, EarthBox, Bright Lane, Tom's Guide. All listicles; container size is given loosely ("at least 12 inches"). A sourced size-per-crop table tied to our spacing data would beat them.                                                                                             | potting-soil-calculator, crop pages, how-much-potting-soil-a-container-needs | Candidate 2 overlaps the tomato crop page — flag but probably fine, since the crop page is not container-specific. Candidate 3 is a distinctly winnable long-tail.                                                                                                                                  | **can you grow vegetables in 5 gallon buckets**             | <100    | not calculated |
| `how-much-food-from-a-4x8-raised-bed.mdx`                     | how much food can you grow in a 4x8 raised bed                  | can a vegetable garden feed a family of four         | how many pounds of vegetables per square foot       | How much can a 4x8 bed produce? · Which crops give the most food per square foot? · How much space to feed one person? · Which crops are not worth the space? · How many tomato plants per person? · Do raised beds yield more than rows?                                      | Gardenary, Savvy Gardening, EdenVatika, Anleolife, a Quora thread. **Yield claims are wildly inflated and unsourced** (one page: 32 lb of carrots from one bed). Our yield data is explicitly unverified, so we can beat them on honesty but must not counter-claim with numbers we cannot source.             | garden-yield-estimator, plant-spacing-calculator, crop pages                 | **Conflict:** garden-yield-estimator owns the estimate. Article owns realism and crop-by-crop worth-the-space judgement. **Caution: our `yieldPerPlantLb` figures were never verified** — the article must present them as estimates.                                                               | **how much food can you grow in a 4x8 raised bed**          | no data | not calculated |
| `does-companion-planting-actually-work.mdx`                   | does companion planting actually work                           | what should not be planted next to tomatoes          | companion planting chart for vegetables             | Does companion planting have any science behind it? · Which pairings actually work? · What is the Three Sisters? · Does basil improve tomato flavor? · Do marigolds repel pests? · What should not go near brassicas?                                                          | Genuinely contested: Garden Myths and Mississippi State argue it is mostly myth; Fine Gardening and Gardener's Path argue the opposite. Arizona and MSU extension rank. A page that separates mechanism from folklore, and says which is which, fits the SERP.                                                 | crop pages (each lists companions), plant-spacing-calculator                 | **Conflict:** every crop page has a companion list. This article must own the _evidence question_, and the crop pages should link to it rather than repeat the argument. Candidate 3 is the volume term but the most competitive.                                                                   | **does companion planting actually work**                   | <100    | not calculated |

---

## Cannibalisation summary

Eight pairs need an explicit split before any rewriting starts. In each case
the tool page or the more specific page keeps the quantity intent, and the
article keeps the explanation.

| Pair                                                                             | Who owns what                                                                                                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `how-much-potting-soil-a-container-needs` ↔ potting-soil-calculator              | Tool: the number for your pot. Article: why dry and liquid quarts differ, and the per-pot reference table. **Highest overlap on the site.** |
| `how-to-raise-soil-ph-with-lime` ↔ lime-calculator                               | Tool: how much lime. Article: when to apply it, how long it takes, which lime. Drop candidate 3 if the tool is to keep its FAQ.             |
| `overseeding-a-lawn` ↔ grass-seed-calculator                                     | Tool: rate per 1,000 sq ft. Article: timing, soil temperature, seedbed prep, watering.                                                      |
| `how-much-to-water-a-vegetable-garden` ↔ garden-watering-calculator              | Tool: gallons for your bed. Article: the inch-to-gallons conversion and how to check soil moisture.                                         |
| `how-much-food-can-a-small-garden-produce` ↔ garden-yield-estimator              | Tool: the estimate. Article: whether the published claims are believable, and which crops earn their space.                                 |
| `square-foot-gardening-for-beginners` ↔ square-foot-garden-planner               | Tool: plan a grid. Article: how the method works and where it gets in the way.                                                              |
| `starting-seeds-indoors-timeline` ↔ planting-date-calculator                     | Tool: dates from your frost date. Article: weeks-indoors per crop and why the pair has to add up.                                           |
| `greens-vs-browns-in-compost` ↔ `composting-mistakes` ↔ compost-ratio-calculator | Tool: C:N by mass. Greens/browns: what the terms mean. Mistakes: symptom-to-cause diagnosis only.                                           |

Two further overlaps are softer but worth watching: `planning-a-vegetable-garden-layout`
against `square-foot-gardening-for-beginners` (split by siting versus grid
method), and `when-to-fertilize-vegetables` against `how-to-read-a-fertilizer-label`
(split by schedule versus label arithmetic).

No merges are proposed. Every article has a defensible distinct question once
the splits above are applied.

## Two things to decide before Part 2

1. **`how-much-potting-soil-a-container-needs` is already published.** If its
   slug changes to match a chosen keyword, it needs a redirect. Static export
   has no redirect layer, so that means a `_redirects` entry on Cloudflare —
   and note that Workers static assets rejected our last `_redirects` file, so
   this needs testing rather than assuming.
2. **Our yield figures are unverified.** `how-much-food-can-a-small-garden-produce`
   is the one article whose whole premise rests on numbers the verification
   report never checked. It can still be written — honestly, as estimates, with
   the inflated competitor claims as the contrast — but it cannot assert
   pounds-per-plant as fact.

---

## Crop guide keywords

The 30 crop guides each target one long-tail question. The 10 original guides
were written before the article keywords were chosen; the 20 added in September
2026 were checked against this map and against the tool pages before they went
in, and four were re-pointed as a result.

### The overlap audit, September 2026

Twenty new crop questions were checked against the article keywords above and
against the tool pages. Three were genuinely competing with
`starting-seeds-indoors-weeks-before-frost`, whose schedule table answers them
outright, and one with the planting date calculator. All four were re-pointed at
a question only the crop page can own:

| Crop        | Was                             | Now                                 | Why it had to move                                                                                                         |
| ----------- | ------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Parsley     | when to start parsley seeds     | why is parsley so slow to germinate | The seed-starting article's table answers the old question exactly. Germination is the crop's real search.                 |
| Cauliflower | when to start cauliflower seeds | why is my cauliflower curd loose    | Same table, same answer. The curd failure is what people actually look up and nothing else covers it.                      |
| Eggplant    | when to plant eggplant          | what temperature does eggplant need | The article covers both the 8-week count and the 50°F-nights condition. The temperature is the distinctive claim.          |
| Cabbage     | when to plant cabbage           | why do cabbage heads split          | Weaker overlap than the three above, but the article carries the 9-week figure and cabbage has no second timing condition. |

**Left alone deliberately.** `when to plant peas` overlaps the seed-starting
article by one row of one table, and the pea page's 45°F soil condition is
enough differentiation. `when to plant garlic` looks like an overlap and is the
opposite: garlic's autumn timing is the one thing the planting date calculator
cannot compute, and the page's FAQ is "Why does garlic not get a date?".

**No overlap found** for the ten `how far apart to plant X` questions. The plant
spacing calculator targets tool intent, and its own table is organised by
spacing distance rather than by crop, so it never competes for a crop-named
phrase. `when to plant cilantro`, `when to plant dill`, `when to plant sweet
potato slips` and `how long do radishes take to grow` are likewise clear.

### Herb pages, Batch 3 (September 2026)

Herbs were the largest single gap in coverage: 290 keywords and 59,910 monthly
searches across the merged Semrush Keyword Gap and Keyword Magic exports, of
which 129 keywords and 19,460 searches sit at KD 20 or below, against one herb
page (basil). The pattern held independently across three separate sets of four
competitors, which is what made it worth acting on.

| Crop     | Primary keyword                    | Volume | KD  | Checked against                                                                                                                                                                                                    |
| -------- | ---------------------------------- | -----: | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lavender | how to plant lavender              | 60,500 | 20  | No page targets any "how to plant X" phrase. No overlap with the planting date calculator: lavender has no frost-offset date at all.                                                                               |
| Dill     | dill companion plants              |  2,900 | 20  | Follows the established one-crop-one-companion-phrase pattern (marigold, strawberry, swiss chard, watermelon). The companion planting article targets "does companion planting actually work", a different intent. |
| Rosemary | how to grow rosemary from cuttings |    880 | 20  | Nothing on the site covers propagation. No overlap with the seed-starting article, which is about frost-offset indoor sowing.                                                                                      |
| Parsley  | parsley seeds                      |  3,600 | 11  | Retargeted from "why is parsley so slow to germinate", which is now a supporting question answered in the body and in an FAQ. Not a "when do I plant this" phrase, so the seed-starting rule below does not bite.  |

**Parsley's retarget.** The September audit moved parsley from "when to start
parsley seeds" to "why is parsley so slow to germinate" to get clear of the
seed-starting article's schedule table. Batch 3 moves it again, to "parsley
seeds" at 3,600 and KD 11 — a higher-volume, lower-difficulty phrase that the
germination material still answers. The old question is kept as a supporting
keyword and an FAQ, so nothing is lost. The page was still a draft both times,
so no slug moved and no live URL changed.

### Herb pages, Batch 3 part two (September 2026)

The remaining four herbs. All spacing from the same UGA Bulletin 1170 herb
table, with Cornell's list settled, so all four shipped verified on day one.

| Crop     | Primary keyword             | Volume | KD  | Checked against                                                                                                                                      |
| -------- | --------------------------- | -----: | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sage     | types of sage               |  1,300 | 17  | No page targets a "types of X" phrase. The keyword set is identification rather than cultivation, which is why the varieties section leads the page. |
| Thyme    | thyme companion plants      |    720 | 25  | Follows the one-crop-one-companion-phrase pattern (marigold, strawberry, swiss chard, watermelon, dill, oregano).                                    |
| Oregano  | oregano companion plants    |  1,000 | 12  | Same pattern. Lowest difficulty of the four.                                                                                                         |
| Cilantro | cilantro growing conditions |    480 | 19  | Retargeted from "when to plant cilantro". Nothing else targets a "growing conditions" phrase.                                                        |

**Cilantro's retarget, and why it beats the old keyword.** The draft targeted
"when to plant cilantro", which the September audit passed as clear. It was
still the weaker choice. Five of the supporting keywords are phrasings of
"how long does cilantro take to grow", and a "when to plant" page is the wrong
hub for them — worse, the honest answer to "when to plant cilantro" is a frost
offset, which is what the planting date calculator owns under the rule below.
"Cilantro growing conditions" owns the whole supporting cluster, sits clear of
the calculator, and lets the page reframe the "how long" question as how long
the leaf harvest lasts before bolting. The old phrase stays as a supporting
keyword. The page was a draft, so no live URL moved.

**Sage and the lavender overlap.** The lavender page already owns
"salvia vs lavender" (590), and the sage page discusses ornamental salvias. They
are kept apart deliberately: sage owns "types of sage" and does not target the
comparison, and the two pages link to each other instead, since a reader
confused about one is usually confused about the other.

**Now buildable.** All eight herb pages exist, so the herbs hub and the
companion planting chart are unblocked.

### The rule going forward

A crop guide may not target a question that the seed-starting article's schedule
table or the planting date calculator answers directly. Where the honest answer
to "when do I plant this" is a frost offset, that belongs to the tool; the crop
page takes the crop's characteristic failure or condition instead.

### Retired: when-to-apply-lime-to-garden-soil

Deleted September 2026, never published. It targeted "when to apply lime to
garden soil" at under 100 searches a month, while
`how-to-raise-soil-ph.mdx` targets "how to raise ph in soil" at 1,300 — and
the two shared sections on timing, how long lime takes, lime types and buffer
pH. Retiring the draft before it went live cost nothing; doing it afterwards
would have meant a 404 with no redirect layer.

What was distinct moved into the raise-pH page: liming alongside ammonium
fertilizer, how to apply it, and timing around a potato-brassica rotation.
Seven pages that linked to the old slug now point at the new one.
