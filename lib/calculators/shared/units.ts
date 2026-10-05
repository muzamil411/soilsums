/**
 * Unit conversion constants and helpers.
 *
 * Every constant here is an exact legal definition, not an estimate, so these
 * are the only figures on the site that need no verification:
 *
 *  - The international yard and pound agreement of 1959 defines 1 inch as
 *    exactly 25.4 mm and 1 pound as exactly 0.45359237 kg.
 *  - The US liquid gallon is exactly 231 cubic inches.
 *  - The US dry gallon is exactly 268.8025 cubic inches, so a US dry quart is
 *    exactly 67.200625 cubic inches.
 *
 * Potting soil and other bagged growing media are sold in the United States by
 * DRY quart, which is why `US_DRY_QUARTS_PER_CUBIC_FOOT` (25.714) and not the
 * liquid figure (29.922) is the headline conversion on the container
 * calculator. Mixing the two overstates a container's capacity by about 16%.
 */
export type UnitSystem = 'imperial' | 'metric';

// Length
export const INCHES_PER_FOOT = 12;
export const FEET_PER_YARD = 3;
export const MM_PER_INCH = 25.4;
export const CM_PER_INCH = 2.54;
export const METERS_PER_FOOT = 0.3048;

// Area
export const SQUARE_FEET_PER_SQUARE_METER = 1 / (METERS_PER_FOOT * METERS_PER_FOOT);

// Volume
export const CUBIC_INCHES_PER_CUBIC_FOOT = INCHES_PER_FOOT ** 3;
export const CUBIC_FEET_PER_CUBIC_YARD = FEET_PER_YARD ** 3;
export const LITERS_PER_CUBIC_FOOT = METERS_PER_FOOT ** 3 * 1000;
export const CUBIC_INCHES_PER_US_GALLON = 231;
export const CUBIC_INCHES_PER_US_DRY_QUART = 67.200625;
export const US_GALLONS_PER_CUBIC_FOOT = CUBIC_INCHES_PER_CUBIC_FOOT / CUBIC_INCHES_PER_US_GALLON;
export const US_DRY_QUARTS_PER_CUBIC_FOOT =
  CUBIC_INCHES_PER_CUBIC_FOOT / CUBIC_INCHES_PER_US_DRY_QUART;
export const US_LIQUID_QUARTS_PER_CUBIC_FOOT = US_GALLONS_PER_CUBIC_FOOT * 4;

// Mass
export const KILOGRAMS_PER_POUND = 0.45359237;
export const GRAMS_PER_OUNCE = 28.349523125;
export const OUNCES_PER_POUND = 16;

// Bulk volume: a cubic yard is 27 cubic feet, each 0.3048 m on a side.
export const CUBIC_METERS_PER_CUBIC_YARD =
  METERS_PER_FOOT ** 3 * CUBIC_FEET_PER_CUBIC_YARD;

// Bulk density: 1 lb/yd³ in kg/m³. Exact, from the 1959 definitions above.
export const KG_PER_CUBIC_METER_PER_LB_PER_CUBIC_YARD =
  KILOGRAMS_PER_POUND / CUBIC_METERS_PER_CUBIC_YARD;

/**
 * Gallons of water to put one inch over one square foot: 144 cubic inches,
 * divided by 231 cubic inches per gallon. The widely quoted 0.623 is this
 * number rounded.
 */
export const US_GALLONS_PER_SQFT_INCH =
  (INCHES_PER_FOOT * INCHES_PER_FOOT) / CUBIC_INCHES_PER_US_GALLON;

/** Liters of water to put one millimetre over one square metre. */
export const LITERS_PER_SQM_MM = 1;

/**
 * An application rate of 1 kg per 100 m2 expressed as lb per 1,000 sq ft.
 * Both the mass and the area change: kilograms become pounds, and 1,000 sq ft
 * is 0.929 of 100 m2.
 */
export const KG_PER_100SQM_TO_LB_PER_1000SQFT =
  (1 / KILOGRAMS_PER_POUND) * (1000 / SQUARE_FEET_PER_SQUARE_METER / 100);

/** Converts an application rate in lb per 1,000 sq ft to kg per 100 m2. */
export function lbPer1000SqFtToKgPer100SqM(rate: number): number {
  return rate / KG_PER_100SQM_TO_LB_PER_1000SQFT;
}

export function feetToMeters(feet: number): number {
  return feet * METERS_PER_FOOT;
}

export function metersToFeet(meters: number): number {
  return meters / METERS_PER_FOOT;
}

export function inchesToCentimeters(inches: number): number {
  return inches * CM_PER_INCH;
}

export function centimetersToInches(centimeters: number): number {
  return centimeters / CM_PER_INCH;
}

export function squareFeetToSquareMeters(squareFeet: number): number {
  return squareFeet / SQUARE_FEET_PER_SQUARE_METER;
}

export function squareMetersToSquareFeet(squareMeters: number): number {
  return squareMeters * SQUARE_FEET_PER_SQUARE_METER;
}

export function cubicFeetToLiters(cubicFeet: number): number {
  return cubicFeet * LITERS_PER_CUBIC_FOOT;
}

export function cubicFeetToCubicYards(cubicFeet: number): number {
  return cubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
}

export function poundsToKilograms(pounds: number): number {
  return pounds * KILOGRAMS_PER_POUND;
}

export function kilogramsToPounds(kilograms: number): number {
  return kilograms / KILOGRAMS_PER_POUND;
}

export function poundsToGrams(pounds: number): number {
  return pounds * KILOGRAMS_PER_POUND * 1000;
}

export function cubicYardsToCubicMeters(cubicYards: number): number {
  return cubicYards * CUBIC_METERS_PER_CUBIC_YARD;
}

export function cubicMetersToCubicYards(cubicMeters: number): number {
  return cubicMeters / CUBIC_METERS_PER_CUBIC_YARD;
}

export function lbPerCubicYardToKgPerCubicMeter(lbPerCubicYard: number): number {
  return lbPerCubicYard * KG_PER_CUBIC_METER_PER_LB_PER_CUBIC_YARD;
}

export function kgPerCubicMeterToLbPerCubicYard(kgPerCubicMeter: number): number {
  return kgPerCubicMeter / KG_PER_CUBIC_METER_PER_LB_PER_CUBIC_YARD;
}

/** Area in square feet, whichever system the user is working in. */
export function areaToSquareFeet(area: number, units: UnitSystem): number {
  return units === 'imperial' ? area : squareMetersToSquareFeet(area);
}

/** A depth entered in inches (imperial) or centimetres (metric), as inches. */
export function depthToInches(depth: number, units: UnitSystem): number {
  return units === 'imperial' ? depth : centimetersToInches(depth);
}

/** A span entered in feet (imperial) or metres (metric), as feet. */
export function lengthToFeet(length: number, units: UnitSystem): number {
  return units === 'imperial' ? length : metersToFeet(length);
}

/** A short span entered in inches (imperial) or centimetres (metric), as inches. */
export function spacingToInches(spacing: number, units: UnitSystem): number {
  return units === 'imperial' ? spacing : centimetersToInches(spacing);
}
