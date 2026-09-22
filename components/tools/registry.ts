import type { ComponentType } from 'react';
import { CompostRatioCalculator } from './CompostRatioCalculator';
import { FertilizerCalculator } from './FertilizerCalculator';
import { GardenWateringCalculator } from './GardenWateringCalculator';
import { GardenYieldEstimator } from './GardenYieldEstimator';
import { GrassSeedCalculator } from './GrassSeedCalculator';
import { LimeCalculator } from './LimeCalculator';
import { MulchCalculator } from './MulchCalculator';
import { PlantSpacingCalculator } from './PlantSpacingCalculator';
import { PlantingDateCalculator } from './PlantingDateCalculator';
import { PottingSoilCalculator } from './PottingSoilCalculator';
import { RaisedBedSoilCalculator } from './RaisedBedSoilCalculator';
import { SoilVolumeConverter } from './SoilVolumeConverter';
import { SquareFootGardenPlanner } from './SquareFootGardenPlanner';

export type ToolProps = {
  toolSlug: string;
  /**
   * Crop slugs that have a published guide page. Supplied by the tool page,
   * which can read the content directory; a client component cannot. Crops not
   * in this list render as plain text instead of links to pages that do not
   * exist yet.
   */
  linkedCrops?: readonly string[];
};

export type ToolComponent = ComponentType<ToolProps>;

/**
 * Slug to calculator. Written out rather than resolved dynamically so the
 * bundler can see every component at build time, and so a tool cannot ship
 * with no interface by accident.
 */
export const toolComponents: Record<string, ToolComponent> = {
  'raised-bed-soil-calculator': RaisedBedSoilCalculator,
  'fertilizer-calculator': FertilizerCalculator,
  'mulch-calculator': MulchCalculator,
  'plant-spacing-calculator': PlantSpacingCalculator,
  'grass-seed-calculator': GrassSeedCalculator,
  'compost-ratio-calculator': CompostRatioCalculator,
  'garden-watering-calculator': GardenWateringCalculator,
  'planting-date-calculator': PlantingDateCalculator,
  'square-foot-garden-planner': SquareFootGardenPlanner,
  'potting-soil-calculator': PottingSoilCalculator,
  'lime-calculator': LimeCalculator,
  'garden-yield-estimator': GardenYieldEstimator,
  'soil-volume-converter': SoilVolumeConverter,
};
