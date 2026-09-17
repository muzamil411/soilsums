import type { ComponentType } from 'react';
import BestSoilMixForRaisedBeds from './best-soil-mix-for-raised-beds.mdx';
import BestVegetablesForContainers from './best-vegetables-for-containers.mdx';
import CompanionPlantingBasics from './companion-planting-basics.mdx';
import CompostingMistakes from './composting-mistakes.mdx';
import GreensVsBrownsInCompost from './greens-vs-browns-in-compost.mdx';
import HowDeepShouldARaisedBedBe from './how-deep-should-a-raised-bed-be.mdx';
import HowMuchFoodCanASmallGardenProduce from './how-much-food-can-a-small-garden-produce.mdx';
import HowMuchPottingSoilAContainerNeeds from './how-much-potting-soil-a-container-needs.mdx';
import HowMuchToWaterAVegetableGarden from './how-much-to-water-a-vegetable-garden.mdx';
import HowToFindYourLastFrostDate from './how-to-find-your-last-frost-date.mdx';
import HowToLowerSoilPh from './how-to-lower-soil-ph.mdx';
import HowToRaiseSoilPhWithLime from './how-to-raise-soil-ph-with-lime.mdx';
import HowToReadAFertilizerLabel from './how-to-read-a-fertilizer-label.mdx';
import MulchTypesCompared from './mulch-types-compared.mdx';
import OverseedingALawn from './overseeding-a-lawn.mdx';
import PlanningAVegetableGardenLayout from './planning-a-vegetable-garden-layout.mdx';
import SquareFootGardeningForBeginners from './square-foot-gardening-for-beginners.mdx';
import StartingSeedsIndoorsTimeline from './starting-seeds-indoors-timeline.mdx';
import SuccessionPlantingExplained from './succession-planting-explained.mdx';
import WhenToFertilizeVegetables from './when-to-fertilize-vegetables.mdx';

/**
 * Slug to article. Static imports, so the bundler resolves every file at build
 * time. Everything here is registered whether or not it is a draft — the page
 * route and the sitemap filter on the `draft` flag in each file's frontmatter,
 * so a draft can be committed safely and published by flipping one line.
 */
export const articleContent: Record<string, ComponentType> = {
  'best-soil-mix-for-raised-beds': BestSoilMixForRaisedBeds,
  'best-vegetables-for-containers': BestVegetablesForContainers,
  'companion-planting-basics': CompanionPlantingBasics,
  'composting-mistakes': CompostingMistakes,
  'greens-vs-browns-in-compost': GreensVsBrownsInCompost,
  'how-deep-should-a-raised-bed-be': HowDeepShouldARaisedBedBe,
  'how-much-food-can-a-small-garden-produce': HowMuchFoodCanASmallGardenProduce,
  'how-much-potting-soil-a-container-needs': HowMuchPottingSoilAContainerNeeds,
  'how-much-to-water-a-vegetable-garden': HowMuchToWaterAVegetableGarden,
  'how-to-find-your-last-frost-date': HowToFindYourLastFrostDate,
  'how-to-lower-soil-ph': HowToLowerSoilPh,
  'how-to-raise-soil-ph-with-lime': HowToRaiseSoilPhWithLime,
  'how-to-read-a-fertilizer-label': HowToReadAFertilizerLabel,
  'mulch-types-compared': MulchTypesCompared,
  'overseeding-a-lawn': OverseedingALawn,
  'planning-a-vegetable-garden-layout': PlanningAVegetableGardenLayout,
  'square-foot-gardening-for-beginners': SquareFootGardeningForBeginners,
  'starting-seeds-indoors-timeline': StartingSeedsIndoorsTimeline,
  'succession-planting-explained': SuccessionPlantingExplained,
  'when-to-fertilize-vegetables': WhenToFertilizeVegetables,
};
