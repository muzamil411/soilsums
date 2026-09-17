/**
 * Footprint area and fill volume, shared by the raised bed, mulch and
 * container calculators so the three cannot drift apart.
 */
import { INCHES_PER_FOOT } from './units';

export type Footprint =
  | { readonly shape: 'rectangle'; readonly lengthFeet: number; readonly widthFeet: number }
  | { readonly shape: 'circle'; readonly diameterFeet: number }
  | { readonly shape: 'area'; readonly squareFeet: number };

/** Square feet of ground covered. */
export function footprintSquareFeet(footprint: Footprint): number {
  switch (footprint.shape) {
    case 'rectangle':
      return footprint.lengthFeet * footprint.widthFeet;
    case 'circle': {
      const radius = footprint.diameterFeet / 2;
      return Math.PI * radius * radius;
    }
    case 'area':
      return footprint.squareFeet;
  }
}

/**
 * Cubic feet of fill: area in square feet times depth in inches, divided by
 * twelve. Forgetting that division by twelve is the single most common way
 * this sum goes wrong.
 */
export function fillCubicFeet(squareFeet: number, depthInches: number): number {
  return (squareFeet * depthInches) / INCHES_PER_FOOT;
}

/** Cylinder volume in cubic feet, from inches — pots and half barrels. */
export function cylinderCubicFeet(diameterInches: number, depthInches: number): number {
  const radius = diameterInches / 2;
  const cubicInches = Math.PI * radius * radius * depthInches;
  return cubicInches / INCHES_PER_FOOT ** 3;
}

/** Rectangular box volume in cubic feet, from inches. */
export function boxCubicFeet(
  lengthInches: number,
  widthInches: number,
  depthInches: number,
): number {
  return (lengthInches * widthInches * depthInches) / INCHES_PER_FOOT ** 3;
}
