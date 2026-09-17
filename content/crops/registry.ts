import type { ComponentType } from 'react';
import Basil from './basil.mdx';
import Bean from './bean.mdx';
import Carrot from './carrot.mdx';
import Cucumber from './cucumber.mdx';
import Lettuce from './lettuce.mdx';
import Pepper from './pepper.mdx';
import Potato from './potato.mdx';
import Spinach from './spinach.mdx';
import Tomato from './tomato.mdx';
import Zucchini from './zucchini.mdx';

/**
 * Slug to crop guide. Static imports, so a guide that is registered but
 * missing is a build error rather than a blank page. The remaining crops in
 * data/crops.ts have data but no guide yet, and get no page.
 */
export const cropContent: Record<string, ComponentType> = {
  tomato: Tomato,
  pepper: Pepper,
  cucumber: Cucumber,
  zucchini: Zucchini,
  lettuce: Lettuce,
  spinach: Spinach,
  carrot: Carrot,
  bean: Bean,
  potato: Potato,
  basil: Basil,
};
