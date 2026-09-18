# Lime data: what is cited, and how well each claim is checked

The lime calculator is the one tool on the site that quotes four separate
extension services by name, so this file records where each claim came from and
how firmly it stands. `npm run verify-data` cannot express this — it only knows
about the `verified` flag on data entries — so the prose claims live here.

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

| Claim                                                                                                                                                                                                                                                         | Where it appears                                                       | Source to check                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| No single turf application above 100 lb per 1,000 sq ft; split larger corrections into two or more, 4-6 months apart                                                                                                                                          | `SINGLE_APPLICATION_LIMIT_LB_PER_1000SQFT`, the split callout, the MDX | Penn State Extension, _Liming Turfgrass Areas_ <https://extension.psu.edu/liming-turfgrass-areas>                                         |
| No more than 50 lb per 1,000 sq ft in one application on established turf                                                                                                                                                                                     | `COLORADO.establishedTurfLimitLbPer1000SqFt`                           | CSU Extension, _Changing Soil pH_ (CMG GardenNotes #222)                                                                                  |
| Increase the rate by about 20% where organic matter runs 4-5%                                                                                                                                                                                                 | `COLORADO.organicMatterUplift`                                         | as above                                                                                                                                  |
| Halve the rate for hydrated or burned lime, and never exceed 10 lb per 1,000 sq ft                                                                                                                                                                            | `COLORADO.hydratedLimeLimitLbPer1000SqFt`                              | as above                                                                                                                                  |
| Oregon expresses rates per 100 sq ft against CEC rather than texture; 5-10 lb per 100 sq ft worked in before planting, 5 lb per 100 sq ft stated as the rate for established lawns and plants; a clay at CEC 35 needs about twice a fine sandy loam at CEC 15 | the regional comparison table in `content/tools/lime-calculator.mdx`   | OSU Extension, EC 1478 _Soil Test Interpretation Guide_ and EM 9057 _Applying Lime to Raise Soil pH for Crop Production (Western Oregon)_ |

The Oregon row remains the weakest of these. The verification report opened
EM 9057 and notes two things worth acting on: OSU states its rates in tons per
acre, which only becomes lb per 1,000 sq ft through a conversion the report did
itself, and **EM 9057's Table 2 says explicitly that it should not be used for
lime rate recommendations.** The comparison table on the page describes the
_shape_ of Oregon's guidance rather than quoting a rate, which stays within
that, but the column should be reviewed against the publication once. If it
cannot be made accurate, cut it rather than soften it — the point of the table
is that the sources genuinely differ, and it survives with two columns.
