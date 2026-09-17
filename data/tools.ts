/**
 * The tool registry. Nav, the home page, /tools/, related-tool blocks and the
 * sitemap all read from here, so a tool exists in exactly one place.
 *
 * `published` gates a tool out of the build until its calculator and MDX
 * content both exist (Phase 3). Nothing thin ships.
 */
export type ToolCategory = 'soil-and-beds' | 'feeding-and-soil-health' | 'timing-and-planning';

export type Tool = {
  /** Catalogue number stamped on the seed packet card. */
  readonly no: string;
  readonly slug: string;
  readonly name: string;
  /** One line, shown on cards. Sentence case, no trailing period. */
  readonly summary: string;
  readonly category: ToolCategory;
  readonly related: readonly string[];
  readonly published: boolean;
};

export const toolCategories: Record<ToolCategory, { name: string; blurb: string }> = {
  'soil-and-beds': {
    name: 'Soil and beds',
    blurb: 'Work out volumes and bag counts before you get to the garden centre.',
  },
  'feeding-and-soil-health': {
    name: 'Feeding and soil health',
    blurb: 'Fertilizer rates, compost balance and pH corrections.',
  },
  'timing-and-planning': {
    name: 'Timing and planning',
    blurb: 'Sowing dates, spacing, watering and what a bed will actually produce.',
  },
};

export const tools: readonly Tool[] = [
  {
    no: 'No. 01',
    slug: 'raised-bed-soil-calculator',
    name: 'Raised bed soil calculator',
    summary: 'Cubic feet, cubic yards, liters and how many bags',
    category: 'soil-and-beds',
    related: ['mulch-calculator', 'potting-soil-calculator', 'plant-spacing-calculator'],
    published: true,
  },
  {
    no: 'No. 02',
    slug: 'fertilizer-calculator',
    name: 'Fertilizer calculator',
    summary: 'Turn an N-P-K label into pounds of product for your plot',
    category: 'feeding-and-soil-health',
    related: ['lime-calculator', 'compost-ratio-calculator', 'grass-seed-calculator'],
    published: true,
  },
  {
    no: 'No. 03',
    slug: 'mulch-calculator',
    name: 'Mulch calculator',
    summary: 'How much mulch a bed needs at the depth you want',
    category: 'soil-and-beds',
    related: [
      'raised-bed-soil-calculator',
      'garden-watering-calculator',
      'potting-soil-calculator',
    ],
    published: true,
  },
  {
    no: 'No. 04',
    slug: 'plant-spacing-calculator',
    name: 'Plant spacing calculator',
    summary: 'How many plants fit, in square or triangular layout',
    category: 'timing-and-planning',
    related: ['square-foot-garden-planner', 'garden-yield-estimator', 'planting-date-calculator'],
    published: true,
  },
  {
    no: 'No. 05',
    slug: 'grass-seed-calculator',
    name: 'Grass seed calculator',
    summary: 'Seed by the pound for a new lawn or for overseeding',
    category: 'feeding-and-soil-health',
    related: ['fertilizer-calculator', 'lime-calculator', 'garden-watering-calculator'],
    published: true,
  },
  {
    no: 'No. 06',
    slug: 'compost-ratio-calculator',
    name: 'Compost ratio calculator',
    summary: 'Check the carbon to nitrogen balance of your pile',
    category: 'feeding-and-soil-health',
    related: ['fertilizer-calculator', 'raised-bed-soil-calculator', 'lime-calculator'],
    published: true,
  },
  {
    no: 'No. 07',
    slug: 'garden-watering-calculator',
    name: 'Garden watering calculator',
    summary: 'Gallons or liters per week, adjusted for rainfall',
    category: 'timing-and-planning',
    related: ['mulch-calculator', 'garden-yield-estimator', 'planting-date-calculator'],
    published: true,
  },
  {
    no: 'No. 08',
    slug: 'planting-date-calculator',
    name: 'Planting date calculator',
    summary: 'Sow, transplant and direct-sow dates from your frost date',
    category: 'timing-and-planning',
    related: ['square-foot-garden-planner', 'plant-spacing-calculator', 'garden-yield-estimator'],
    published: true,
  },
  {
    no: 'No. 09',
    slug: 'square-foot-garden-planner',
    name: 'Square foot garden planner',
    summary: 'Fill a grid crop by crop and print the plan',
    category: 'timing-and-planning',
    related: ['plant-spacing-calculator', 'raised-bed-soil-calculator', 'garden-yield-estimator'],
    published: true,
  },
  {
    no: 'No. 10',
    slug: 'potting-soil-calculator',
    name: 'Container potting soil calculator',
    summary: 'Dry quarts, gallons, cubic feet and liters per pot',
    category: 'soil-and-beds',
    related: ['raised-bed-soil-calculator', 'mulch-calculator', 'garden-watering-calculator'],
    published: true,
  },
  {
    no: 'No. 11',
    slug: 'lime-calculator',
    name: 'Lime calculator',
    summary: 'Limestone needed to raise soil pH, by soil texture',
    category: 'feeding-and-soil-health',
    related: ['fertilizer-calculator', 'compost-ratio-calculator', 'grass-seed-calculator'],
    published: true,
  },
  {
    no: 'No. 12',
    slug: 'garden-yield-estimator',
    name: 'Garden yield estimator',
    summary: 'A realistic harvest range for what you have planted',
    category: 'timing-and-planning',
    related: ['plant-spacing-calculator', 'square-foot-garden-planner', 'planting-date-calculator'],
    published: true,
  },
];

export const publishedTools = tools.filter((tool) => tool.published);

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function toolsByCategory(category: ToolCategory): readonly Tool[] {
  return tools.filter((tool) => tool.category === category);
}
