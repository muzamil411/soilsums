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
