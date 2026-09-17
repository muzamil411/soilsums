/**
 * The bag sizes bagged growing media is actually sold in.
 *
 * These are product conventions rather than agronomic figures — they describe
 * what is on the pallet, not how a plant behaves — so they need no source
 * verification. Always read the bag in front of you: sizes vary by brand and
 * by country.
 */
export type BagOption = {
  readonly label: string;
  readonly cubicFeet: number;
};

/** Bagged topsoil, garden soil and compost, sold by cubic foot in the US. */
export const soilBagSizes: readonly BagOption[] = [
  { label: '1 cu ft', cubicFeet: 1 },
  { label: '1.5 cu ft', cubicFeet: 1.5 },
  { label: '2 cu ft', cubicFeet: 2 },
  { label: '3 cu ft', cubicFeet: 3 },
];

/** Bagged mulch. Two cubic feet is the near-universal US bag. */
export const mulchBagSizes: readonly BagOption[] = [
  { label: '2 cu ft', cubicFeet: 2 },
  { label: '3 cu ft', cubicFeet: 3 },
  { label: '1 cu ft', cubicFeet: 1 },
];

/**
 * Potting mix, sold in the US by DRY quart. One cubic foot is about 25.7 dry
 * quarts, so a "50 quart" bag is roughly 1.9 cubic feet.
 */
export type PottingBagOption = {
  readonly label: string;
  readonly dryQuarts: number;
};

export const pottingMixBagSizes: readonly PottingBagOption[] = [
  { label: '8 dry qt', dryQuarts: 8 },
  { label: '16 dry qt', dryQuarts: 16 },
  { label: '25 dry qt', dryQuarts: 25 },
  { label: '32 dry qt', dryQuarts: 32 },
  { label: '50 dry qt', dryQuarts: 50 },
];

/** Metric bag sizes, sold by volume in liters across the UK, EU and Australia. */
export const metricBagSizes: readonly { label: string; liters: number }[] = [
  { label: '20 L', liters: 20 },
  { label: '40 L', liters: 40 },
  { label: '50 L', liters: 50 },
  { label: '60 L', liters: 60 },
  { label: '70 L', liters: 70 },
];

/**
 * A default raised bed fill mix. Editable by the user — this is a starting
 * point, not a prescription, and plenty of gardeners use different splits.
 */
export const defaultBedMix: readonly { label: string; percent: number }[] = [
  { label: 'Topsoil', percent: 60 },
  { label: 'Compost', percent: 30 },
  { label: 'Aeration (perlite, coarse bark or sand)', percent: 10 },
];
