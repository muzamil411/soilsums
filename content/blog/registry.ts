import type { ComponentType } from 'react';
import BestMulchForAVegetableGarden from './best-mulch-for-a-vegetable-garden.mdx';
import CanYouMowWetGrass from './can-you-mow-wet-grass.mdx';
import CloverInLawns from './clover-in-lawns.mdx';
import HowLongDoesGrassSeedTakeToGrow from './how-long-does-grass-seed-take-to-grow.mdx';
import DoesCompanionPlantingActuallyWork from './does-companion-planting-actually-work.mdx';
import GardenSoilVsPottingSoil from './garden-soil-vs-potting-soil-vs-topsoil.mdx';
import GreensVsBrownsInCompost from './greens-vs-browns-in-compost.mdx';
import GrowingVegetablesIn5GallonBuckets from './growing-vegetables-in-5-gallon-buckets.mdx';
import HowDeepShouldARaisedBedBe from './how-deep-should-a-raised-bed-be.mdx';
import HowMuchIsAYardOfDirt from './how-much-is-a-yard-of-dirt.mdx';
import HowToAddNitrogenToSoil from './how-to-add-nitrogen-to-soil.mdx';
import HowToRaiseSoilPh from './how-to-raise-soil-ph.mdx';
import HowDoesSquareFootGardeningWork from './how-does-square-foot-gardening-work.mdx';
import HowMuchFoodFromA4x8RaisedBed from './how-much-food-from-a-4x8-raised-bed.mdx';
import HowMuchPottingSoilAContainerNeeds from './how-much-potting-soil-a-container-needs.mdx';
import HowMuchSulfurToLowerSoilPh from './how-much-sulfur-to-lower-soil-ph.mdx';
import HowMuchToWaterAVegetableGarden from './how-much-to-water-a-vegetable-garden.mdx';
import HowOftenShouldYouFertilizeVegetables from './how-often-should-you-fertilize-vegetables.mdx';
import PlanningAVegetableGardenLayout from './planning-a-vegetable-garden-layout.mdx';
import StartingSeedsIndoorsWeeksBeforeFrost from './starting-seeds-indoors-weeks-before-frost.mdx';
import SuccessionPlantingSchedule from './succession-planting-schedule.mdx';
import WhatDoesLastFrostDateMean from './what-does-last-frost-date-mean.mdx';
import WhatTheThreeNumbersOnFertilizerMean from './what-the-three-numbers-on-fertilizer-mean.mdx';
import WhatToFillRaisedGardenBedsWith from './what-to-fill-raised-garden-beds-with.mdx';
import WhenToOverseedALawn from './when-to-overseed-a-lawn.mdx';
import WhyIsMyCompostNotBreakingDown from './why-is-my-compost-not-breaking-down.mdx';

/**
 * Slug to article. Static imports, so the bundler resolves every file at build
 * time. Everything here is registered whether or not it is a draft — the page
 * route and the sitemap filter on the `draft` flag in each file's frontmatter,
 * so a draft can be committed safely and published by flipping one line.
 *
 * Slugs are built from each article's target keyword, which is recorded in its
 * own frontmatter and in docs/keyword-map.md. Only one of these has ever been
 * published, so the renames cost no redirects; changing any of them from here
 * on would.
 */
export const articleContent: Record<string, ComponentType> = {
  'how-much-is-a-yard-of-dirt': HowMuchIsAYardOfDirt,
  'how-to-raise-soil-ph': HowToRaiseSoilPh,
  'how-to-add-nitrogen-to-soil': HowToAddNitrogenToSoil,
  'garden-soil-vs-potting-soil-vs-topsoil': GardenSoilVsPottingSoil,
  'best-mulch-for-a-vegetable-garden': BestMulchForAVegetableGarden,
  'does-companion-planting-actually-work': DoesCompanionPlantingActuallyWork,
  'greens-vs-browns-in-compost': GreensVsBrownsInCompost,
  'growing-vegetables-in-5-gallon-buckets': GrowingVegetablesIn5GallonBuckets,
  'how-deep-should-a-raised-bed-be': HowDeepShouldARaisedBedBe,
  'how-does-square-foot-gardening-work': HowDoesSquareFootGardeningWork,
  'how-much-food-from-a-4x8-raised-bed': HowMuchFoodFromA4x8RaisedBed,
  'how-much-potting-soil-a-container-needs': HowMuchPottingSoilAContainerNeeds,
  'how-much-sulfur-to-lower-soil-ph': HowMuchSulfurToLowerSoilPh,
  'how-much-to-water-a-vegetable-garden': HowMuchToWaterAVegetableGarden,
  'how-often-should-you-fertilize-vegetables': HowOftenShouldYouFertilizeVegetables,
  'planning-a-vegetable-garden-layout': PlanningAVegetableGardenLayout,
  'starting-seeds-indoors-weeks-before-frost': StartingSeedsIndoorsWeeksBeforeFrost,
  'succession-planting-schedule': SuccessionPlantingSchedule,
  'what-does-last-frost-date-mean': WhatDoesLastFrostDateMean,
  'what-the-three-numbers-on-fertilizer-mean': WhatTheThreeNumbersOnFertilizerMean,
  'what-to-fill-raised-garden-beds-with': WhatToFillRaisedGardenBedsWith,
  'when-to-overseed-a-lawn': WhenToOverseedALawn,
  'why-is-my-compost-not-breaking-down': WhyIsMyCompostNotBreakingDown,
  'can-you-mow-wet-grass': CanYouMowWetGrass,
  'clover-in-lawns': CloverInLawns,
  'how-long-does-grass-seed-take-to-grow': HowLongDoesGrassSeedTakeToGrow,
};
