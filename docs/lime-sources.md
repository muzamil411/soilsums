# Soil pH sources: what is cited, and how well each claim is checked

The lime calculator and the two soil pH articles quote several extension
services by name, so this file records where each claim came from and how firmly
it stands. `npm run verify-data` cannot express this — it only knows about the
`verified` flag on data entries — so the prose claims live here.

## Verified

**Rate table — 25 / 60 / 95 lb per 1,000 sq ft per pH unit, ranges 20-30,
45-75, 90-100.** University of Kentucky Cooperative Extension, AGR-214
_Liming Kentucky Lawns_ (2014), Table 1.
<https://publications.mgcafe.uky.edu/files/AGR214.pdf>
Supplied and checked against the publication by Muzamil Ali. The publication's
existence, title, authors (Munshaw and Ritchey) and 2014 date are independently
confirmed; `data/lime-rates.ts` carries `verified: true` on this basis.

The September 2026 data verification report independently reached the same
figures, describing 25 / 60 / 95 as the UKY midpoints for sand, loam and clay,
and confirming the 20-30, 45-75 and 90-100 ranges.

## Confirmed by the verification report

The sandbox this site is built in blocks outbound requests to
`extension.psu.edu`, `extension.colostate.edu` and `extension.oregonstate.edu`,
so these were originally taken from search-engine summaries rather than the
pages themselves. The September 2026 verification report opened all of them and
reached the same figures, which is what moved them out of "unchecked":

| Claim                                                                                                                | Where it appears                                                       | Source                                                                                            |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| No single turf application above 100 lb per 1,000 sq ft; split larger corrections into two or more, 4-6 months apart | `SINGLE_APPLICATION_LIMIT_LB_PER_1000SQFT`, the split callout, the MDX | Penn State Extension, _Liming Turfgrass Areas_ <https://extension.psu.edu/liming-turfgrass-areas> |
| No more than 50 lb per 1,000 sq ft in one application on established turf                                            | `COLORADO.establishedTurfLimitLbPer1000SqFt`                           | CSU Extension, _Changing Soil pH_ (CMG GardenNotes #222)                                          |
| Increase the rate by about 20% where organic matter runs 4-5%                                                        | `COLORADO.organicMatterUplift`                                         | as above                                                                                          |
| Halve the rate for hydrated or burned lime, and never exceed 10 lb per 1,000 sq ft                                   | `COLORADO.hydratedLimeLimitLbPer1000SqFt`                              | as above                                                                                          |

No Oregon figure appears anywhere on the site. The verification report opened
EM 9057 and found two problems with using it: OSU states rates in tons per
acre, which only become lb per 1,000 sq ft through a conversion the report did
itself, and **Table 2 of that publication says explicitly that it must not be
used for lime rate recommendations.** The comparison table on the lime page now
covers Kentucky and Colorado only. Oregon State is mentioned in prose, with a
link, for its soil-test-led approach and with no numbers attached — which is
all the publication supports. Nothing here is outstanding.

## How long lime takes, and the ceilings by material (September 2026)

Both supplied and quoted from the publications by Muzamil Ali, who read them in
full. This environment cannot reach either host, so nothing here was checked
against the page from inside the repo.

**Four to six months for limestone to raise soil pH.** UMass Amherst Soil and
Plant Nutrient Testing Laboratory, _Timing of Lime and Fertilizer
Applications_: "limestone can take a long time (4-6 months) to raise soil pH,
it's best to start as soon as possible." The same publication says an
established planting may be limed twice a year, spring and autumn, with the
amount limited to avoid damage. **No URL is recorded** because none was supplied
and the host is unreachable from here; the publication is cited by title in the
rendered copy rather than linked.

**Corroboration without a range.** Ohio State University Extension, _Lime and
the Home Lawn_ (Ohioline HYG-4026): "it may be several months before the soil pH
changes." The URL <https://ohioline.osu.edu/factsheet/hyg-4026> is constructed
from the fact sheet number, in the pattern the site already uses for Ohio State
AGF-507, and was not opened from here.

`LIME_TIMING` in `data/lime-rates.ts` holds the figure, the quote, the
corroborating quote and the reason it is a range. Everything that states it
reads from there, and `lib/content/lime-timing.test.ts` plus `npm run seo-audit`
fail on any rendered page that gives a different number.

### What this replaced

The site held three answers at once, none of them cited on the page that gave
it: three to six months on `/blog/how-to-raise-soil-ph/` (meta description,
opening, an FAQ answer, the timing section and the closing questions), six months
to a year on `/tools/lime-calculator/` and in the calculator component, three to
six months in the generated timeline figure, and "no sourced figure exists" on
`/blog/lime-for-your-lawn/`. The pH article's description also reached five
further pages as a card excerpt. None of it was a retraction: the figure was
replaced with a sourced one.

### Maximum single application, by material

| Material                      | lb per 1,000 sq ft | Source                                                  |
| ----------------------------- | -----------------: | ------------------------------------------------------- |
| Ground limestone              |                100 | Penn State Extension, _Liming Turfgrass Areas_          |
| Lime, material not broken out |                 50 | University of Maryland Extension, _Lime and Lawns_      |
| Lime on established turf      |                 50 | CSU Extension, _Changing Soil pH_ (GardenNotes #222)    |
| Ground limestone              |                 50 | Ohio State Extension, _Lime and the Home Lawn_ HYG-4026 |
| Dolomitic limestone           |                 50 | as above                                                |
| Pelletized limestone          |                 50 | as above                                                |
| Hydrated lime                 |                 20 | as above                                                |
| Burned lime                   |                 10 | as above                                                |
| Hydrated or burned lime       |                 10 | CSU Extension, as above                                 |

All nine rows are in `LAWN_LIME_CEILINGS`. Two things follow.

**Three of the four publications put the limestone ceiling at 50**, so the
calculator's conservative choice — made in September 2026 from Maryland and Penn
State alone — is the consensus rather than a house preference, and Penn State is
the outlier. `CEILING_AGREEMENT` derives the three names for the copy.

**Ohio State and Colorado disagree on hydrated lime**, 20 against 10. Both are
recorded and the pages work to the lower figure, which is
`CAUSTIC_CEILING_LB_PER_1000SQFT`. The `caustic` flag keeps those rows out of the
calculator's own ceiling: a `Math.min` across all nine would cap a limestone user
at 10 lb, and `lib/calculators/lime.test.ts` fails if that filter is removed.

### Ideal lawn pH, three services

Penn State 6.0 to 7.2, Maryland 6.0 to 6.8, Ohio State 6.0 to 7.0. The pages
state the **overlap, 6.0 to 6.8**, rather than adopting one service's range;
`LAWN_PH_OVERLAP` derives it from the rows flagged `scope: 'general'`, so a
fourth service narrows it automatically.

## Lowering pH — `content/blog/how-much-sulfur-to-lower-soil-ph.mdx`

**Verified.** The elemental sulfur table is Table 1 of Ohio State University
Extension, AGF-507 _Soil Acidification: How to Lower Soil pH_,
<https://ohioline.osu.edu/factsheet/agf-507>. Opened and read by Muzamil Ali.
Rates are lb per acre for the top six inches; the lb per 1,000 sq ft column is
the publication's own instruction to divide by 43.56, and the arithmetic was
checked against every cell.

The publication's assumptions are on the page because a rate without them is
not usable: CEC of 5, 10 and 20 meq/100 g for the sand, silt loam and clay
columns, and **soils that are not calcareous**. Where free lime is present the
acid is neutralised as fast as the microbes produce it, so sulfur may barely
move pH at all — the page says so, because calcareous soils are common across
the arid West and a reader there would otherwise buy sulfur for nothing.

**Verified.** The 20 lb per 1,000 sq ft per-application cap is University of
Wisconsin soil lab guidance, relayed through Extension Foundation Ask Extension,
<https://ask.extension.org/kb/faq.php?id=902254>.

**Removed.** Earlier drafts of this page carried a University of Maine figure of
15 lb per 1,000 sq ft and a "10-15 lb for a one-unit drop" range. Both came from
search-engine summaries rather than documents anyone had opened, and both are
gone. Nothing on the page now rests on a source that was not read.
