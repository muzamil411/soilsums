import { resolveCompanion, type Crop } from '@/data/crops';

/**
 * Why two plants are said to belong together, or apart.
 *
 * The point of this file, and of the chart it feeds, is that the reason is the
 * part nobody publishes. Every companion planting chart online is a grid of
 * names; the useful question is always "why, and how well is that known", and
 * for most traditional pairings the honest answer is "nobody has tested it".
 *
 * So every pairing gets a mechanism and a confidence, and the weakest
 * confidence is stated rather than hidden. A pairing with nothing behind it
 * says so on the chart — dropping it silently would be worse, because a reader
 * who has met the claim elsewhere would think we simply missed it. This is the
 * treatment the marigold-and-beans claim got when it turned out to be folklore.
 *
 * Mechanisms are DERIVED from the crop data rather than written out per pair.
 * A hand-written pair table would drift from the crop pages the way every
 * hand-written figure in this project eventually has, and with 28 crops it
 * would be several hundred rows nobody could maintain.
 */

export type Confidence = 'supported' | 'plausible' | 'traditional';

export type CompanionReason = {
  /** Short mechanism name, for a label on the chart. */
  readonly mechanism: string;
  readonly confidence: Confidence;
  /** One sentence, written to be read in this direction: A next to B. */
  readonly text: string;
};

export const CONFIDENCE_NOTE: Record<Confidence, string> = {
  supported: 'A mechanism that has been studied and holds up. Worth planning a bed around.',
  plausible: 'A mechanism that makes sense and has little or no testing behind it. Free to try.',
  traditional:
    'Repeated in garden lore with no mechanism worth citing. We list it because you will meet it elsewhere, not because we can stand behind it.',
};

/**
 * Herbs whose flowers feed the small beneficial insects — hoverflies, parasitic
 * wasps, lacewings — whose larvae eat aphids and caterpillars.
 *
 * The shape of the flower is what matters: small, shallow and open, which an
 * insect with tiny mouthparts can actually feed from. This is the
 * best-supported of the companion planting mechanisms, and it comes with a
 * catch worth repeating every time: it only works from a plant in flower, so a
 * patch clipped for the kitchen all season feeds nobody.
 */
const INSECTARY = new Set(['dill', 'cilantro', 'parsley', 'oregano', 'thyme', 'marigold']);

/**
 * The woody Mediterranean herbs. Their requirements — full sun, sharp drainage,
 * poor soil, very little water — are close to the opposite of what a leafy or
 * fruiting vegetable wants, which is a real and practical conflict rather than
 * a traditional one.
 */
const WOODY_HERBS = new Set(['lavender', 'rosemary', 'sage', 'thyme', 'oregano']);

/** Crops that want steady moisture and feeding, so they clash with the above. */
function wantsRichAndMoist(crop: Crop): boolean {
  return crop.type !== 'herb' && !WOODY_HERBS.has(crop.slug);
}

/**
 * The reason A is listed as a good neighbour for B, read in that direction.
 *
 * Order of precedence runs from the best-evidenced mechanism to the weakest, so
 * a pairing that has a real mechanism is never labelled as folklore.
 */
export function goodReason(subject: Crop, neighbour: Crop): CompanionReason {
  if (neighbour.slug === 'marigold') {
    return {
      mechanism: 'Nematode suppression',
      confidence: 'supported',
      text: `Marigolds do suppress root-knot nematodes, but only grown as a dense stand across the ground for a season and then dug in — a few plants dotted beside ${subject.name.toLowerCase()} will not do it.`,
    };
  }
  // Two woody Mediterranean herbs first, even where one of them is also an
  // insectary plant. Both claims are true, but "these two want identical
  // treatment" is the one a reader can act on when planning a bed.
  if (WOODY_HERBS.has(subject.slug) && WOODY_HERBS.has(neighbour.slug)) {
    return {
      mechanism: 'Same conditions',
      confidence: 'supported',
      text: `Both are woody Mediterranean herbs wanting full sun, sharp drainage and poor soil, so a bed of them can be watered, fed and pruned as one thing with no compromise.`,
    };
  }
  if (INSECTARY.has(neighbour.slug)) {
    return {
      mechanism: 'Feeds beneficial insects',
      confidence: 'supported',
      text: `${neighbour.name} in flower feeds the hoverflies and parasitic wasps whose larvae eat aphids and caterpillars. It has to be allowed to flower — a plant kept clipped for the kitchen does nothing here.`,
    };
  }
  if (neighbour.family === 'Fabaceae') {
    return {
      mechanism: 'Nitrogen fixing',
      confidence: 'plausible',
      text: `${neighbour.name} fixes its own nitrogen, but it keeps most of it until the plant is dug in — the crop that follows benefits more than the neighbour standing next to it.`,
    };
  }
  if (subject.family === neighbour.family) {
    return {
      mechanism: 'Same family',
      confidence: 'plausible',
      text: `Both are ${subject.family}, so they suit the same conditions and are easy to grow together — but they also share pests and diseases, so do not follow one with the other in the same ground.`,
    };
  }
  if (WOODY_HERBS.has(neighbour.slug) && wantsRichAndMoist(subject)) {
    return {
      mechanism: 'Aromatic neighbour',
      confidence: 'plausible',
      text: `${neighbour.name} is said to confuse pests by scent. It also wants far drier, poorer soil than ${subject.name.toLowerCase()} does, so grow it at the edge of the bed rather than in the watered middle.`,
    };
  }
  return {
    mechanism: 'Traditional pairing',
    confidence: 'traditional',
    text: `A long-standing pairing with no mechanism worth citing. Nothing says not to do it, and the two are in different families so they share no pests — but do not expect it to do anything for the crop.`,
  };
}

/** The reason A is listed as one to keep away from B, read in that direction. */
export function avoidReason(subject: Crop, neighbour: Crop): CompanionReason {
  if (subject.family === neighbour.family) {
    return {
      mechanism: 'Shared pests',
      confidence: 'supported',
      text: `Both are ${subject.family}. Close relatives share pests and diseases, so planting them together concentrates a problem instead of dividing it, and they belong in different parts of a rotation.`,
    };
  }
  if (WOODY_HERBS.has(neighbour.slug) && wantsRichAndMoist(subject)) {
    return {
      mechanism: 'Opposite needs',
      confidence: 'supported',
      text: `Not a pest problem but a watering one: ${neighbour.name.toLowerCase()} wants poor, sharply drained soil kept dry, and ${subject.name.toLowerCase()} wants steady moisture and feeding. Whichever regime you follow, one of them suffers.`,
    };
  }
  return {
    mechanism: 'Traditional caution',
    confidence: 'traditional',
    text: `Named on the usual avoid-lists without a tested mechanism behind it. We show it because you will meet the claim elsewhere; we would not rearrange a bed for it.`,
  };
}

export type ChartEntry = {
  readonly name: string;
  /** The crop's own page, where the name refers to a crop we cover. */
  readonly slug?: string;
  readonly reason: CompanionReason;
};

export type CropChart = {
  readonly crop: Crop;
  readonly good: readonly ChartEntry[];
  readonly avoid: readonly ChartEntry[];
};

/**
 * Both lists for one crop, with a reason on every entry.
 *
 * A name that is not a crop we cover still gets an entry and a reason — the
 * mechanism is worked out from what we do know about it, which for a plant with
 * no page of its own is the traditional claim. It just carries no link.
 */
export function chartFor(crop: Crop): CropChart {
  const entry = (name: string, kind: 'good' | 'avoid'): ChartEntry => {
    const other = resolveCompanion(name);
    if (!other) {
      return {
        name,
        reason: {
          mechanism: kind === 'good' ? 'Traditional pairing' : 'Traditional caution',
          confidence: 'traditional',
          text:
            kind === 'good'
              ? `A traditional pairing. We have no guide for ${name.toLowerCase()}, so there is nothing here beyond the claim itself.`
              : `A traditional caution. We have no guide for ${name.toLowerCase()}, so there is nothing here beyond the claim itself.`,
        },
      };
    }
    return {
      name: other.name,
      slug: other.slug,
      reason: kind === 'good' ? goodReason(crop, other) : avoidReason(crop, other),
    };
  };

  return {
    crop,
    good: crop.companionPlants.map((name) => entry(name, 'good')),
    avoid: crop.avoidPlanting.map((name) => entry(name, 'avoid')),
  };
}
