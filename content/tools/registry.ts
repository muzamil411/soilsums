import type { ComponentType } from 'react';
import CompostRatio from './compost-ratio-calculator.mdx';
import Fertilizer from './fertilizer-calculator.mdx';
import GardenWatering from './garden-watering-calculator.mdx';
import GardenYield from './garden-yield-estimator.mdx';
import GrassSeed from './grass-seed-calculator.mdx';
import Lime from './lime-calculator.mdx';
import Mulch from './mulch-calculator.mdx';
import PlantSpacing from './plant-spacing-calculator.mdx';
import PlantingDate from './planting-date-calculator.mdx';
import PottingSoil from './potting-soil-calculator.mdx';
import RaisedBedSoil from './raised-bed-soil-calculator.mdx';
import BulkSoil from './bulk-soil-calculator.mdx';
import CompanionPlantingChart from './companion-planting-chart.mdx';
import SoilVolume from './soil-volume-converter.mdx';
import SquareFootGarden from './square-foot-garden-planner.mdx';

/**
 * Slug to written content. Static imports, so the bundler resolves every file
 * at build time and a missing one is a build error rather than a blank page.
 */
export const toolContent: Record<string, ComponentType> = {
  'raised-bed-soil-calculator': RaisedBedSoil,
  'fertilizer-calculator': Fertilizer,
  'mulch-calculator': Mulch,
  'plant-spacing-calculator': PlantSpacing,
  'grass-seed-calculator': GrassSeed,
  'compost-ratio-calculator': CompostRatio,
  'garden-watering-calculator': GardenWatering,
  'planting-date-calculator': PlantingDate,
  'square-foot-garden-planner': SquareFootGarden,
  'potting-soil-calculator': PottingSoil,
  'lime-calculator': Lime,
  'garden-yield-estimator': GardenYield,
  'soil-volume-converter': SoilVolume,
  'bulk-soil-calculator': BulkSoil,
  'companion-planting-chart': CompanionPlantingChart,
};
