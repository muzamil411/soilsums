import type { ComponentType } from 'react';
import Asparagus from './asparagus.mdx';
import Blueberry from './blueberry.mdx';
import Marigold from './marigold.mdx';
import SwissChard from './swiss-chard.mdx';
import Basil from './basil.mdx';
import Bean from './bean.mdx';
import Beet from './beet.mdx';
import Broccoli from './broccoli.mdx';
import Cabbage from './cabbage.mdx';
import Carrot from './carrot.mdx';
import Cauliflower from './cauliflower.mdx';
import Cilantro from './cilantro.mdx';
import Corn from './corn.mdx';
import Cucumber from './cucumber.mdx';
import Dill from './dill.mdx';
import Eggplant from './eggplant.mdx';
import Garlic from './garlic.mdx';
import Kale from './kale.mdx';
import Lavender from './lavender.mdx';
import Lettuce from './lettuce.mdx';
import Okra from './okra.mdx';
import Onion from './onion.mdx';
import Oregano from './oregano.mdx';
import Parsley from './parsley.mdx';
import Pea from './pea.mdx';
import Pepper from './pepper.mdx';
import Potato from './potato.mdx';
import Pumpkin from './pumpkin.mdx';
import Radish from './radish.mdx';
import Rosemary from './rosemary.mdx';
import Sage from './sage.mdx';
import Spinach from './spinach.mdx';
import Squash from './squash.mdx';
import Strawberry from './strawberry.mdx';
import SweetPotato from './sweet-potato.mdx';
import Thyme from './thyme.mdx';
import Tomato from './tomato.mdx';
import Watermelon from './watermelon.mdx';
import Zucchini from './zucchini.mdx';

/**
 * Slug to crop guide. Static imports, so a guide that is registered but
 * missing is a build error rather than a blank page.
 *
 * Every crop in data/crops.ts now has a guide. Whether it gets a page is
 * decided by the `draft` flag in its own frontmatter, the same way articles
 * work — see content/blog/publish-order.json for the release order.
 */
export const cropContent: Record<string, ComponentType> = {
  'swiss-chard': SwissChard,
  marigold: Marigold,
  blueberry: Blueberry,
  asparagus: Asparagus,
  tomato: Tomato,
  pepper: Pepper,
  cucumber: Cucumber,
  zucchini: Zucchini,
  lettuce: Lettuce,
  spinach: Spinach,
  kale: Kale,
  carrot: Carrot,
  radish: Radish,
  beet: Beet,
  onion: Onion,
  garlic: Garlic,
  potato: Potato,
  'sweet-potato': SweetPotato,
  bean: Bean,
  pea: Pea,
  corn: Corn,
  squash: Squash,
  pumpkin: Pumpkin,
  broccoli: Broccoli,
  cabbage: Cabbage,
  cauliflower: Cauliflower,
  eggplant: Eggplant,
  okra: Okra,
  basil: Basil,
  cilantro: Cilantro,
  parsley: Parsley,
  dill: Dill,
  lavender: Lavender,
  rosemary: Rosemary,
  sage: Sage,
  thyme: Thyme,
  oregano: Oregano,
  strawberry: Strawberry,
  watermelon: Watermelon,
};
