/**
 * Raised bed soil calculator.
 *
 * Volume of fill for one or more raised beds, in cubic feet, cubic yards and
 * liters, plus how many bags that is and an optional mix breakdown.
 */
import { fillCubicFeet, footprintSquareFeet } from './shared/geometry';
import {
  cubicFeetToCubicYards,
  cubicFeetToLiters,
  depthToInches,
  lengthToFeet,
  squareFeetToSquareMeters,
  type UnitSystem,
} from './shared/units';
import { round, roundUp, toSignificant } from './shared/round';
import {
  collect,
  fail,
  ok,
  requireCount,
  requirePositive,
  requireRange,
  type Calculation,
  type FieldError,
} from './shared/validate';

export type BedShape = 'rectangle' | 'circle';

export type MixComponent = {
  readonly label: string;
  /** Share of the total fill, 0–100. All components must sum to 100. */
  readonly percent: number;
};

export type RaisedBedSoilInput = {
  readonly units: UnitSystem;
  readonly shape: BedShape;
  /** Feet (imperial) or meters (metric). Rectangle only. */
  readonly length?: number;
  readonly width?: number;
  /** Feet (imperial) or meters (metric). Circle only. */
  readonly diameter?: number;
  /** Inches (imperial) or centimeters (metric). The depth you will fill to. */
  readonly depth: number;
  readonly beds: number;
  /** Cubic feet (imperial) or liters (metric) per bag. */
  readonly bagSize: number;
  /** Optional, user-editable. Omit for no breakdown. */
  readonly mix?: readonly MixComponent[];
};

export type MixResult = {
  readonly label: string;
  readonly percent: number;
  readonly cubicFeet: number;
  readonly liters: number;
  readonly bags: number;
};

export type RaisedBedSoilOutput = {
  readonly areaSquareFeetPerBed: number;
  readonly areaSquareMetersPerBed: number;
  readonly cubicFeetPerBed: number;
  readonly cubicFeet: number;
  readonly cubicYards: number;
  readonly liters: number;
  readonly cubicMeters: number;
  readonly bags: number;
  readonly bagSize: number;
  readonly mix: readonly MixResult[];
};

export function calculateRaisedBedSoil(
  input: RaisedBedSoilInput,
): Calculation<RaisedBedSoilOutput> {
  const { units, shape } = input;
  const spanLabel = units === 'imperial' ? 'length in feet' : 'length in meters';
  const widthLabel = units === 'imperial' ? 'width in feet' : 'width in meters';
  const diameterLabel = units === 'imperial' ? 'diameter in feet' : 'diameter in meters';

  const errors: FieldError[] = collect([
    shape === 'rectangle' ? requirePositive(input.length, 'length', spanLabel) : null,
    shape === 'rectangle' ? requirePositive(input.width, 'width', widthLabel) : null,
    shape === 'circle' ? requirePositive(input.diameter, 'diameter', diameterLabel) : null,
    requirePositive(input.depth, 'depth', 'depth'),
    requireCount(input.beds, 'beds', 'number of beds'),
    requirePositive(input.bagSize, 'bagSize', 'bag size'),
  ]);

  const mix = input.mix ?? [];
  if (mix.length > 0) {
    for (const [index, component] of mix.entries()) {
      const invalid = requireRange(component.percent, 0, 100, `mix.${index}`, 'mix percentage');
      if (invalid) errors.push(invalid);
    }
    const total = mix.reduce((sum, component) => sum + (component.percent || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      errors.push({
        field: 'mix',
        message: `Mix percentages add up to ${round(total, 1)}% — adjust them to total 100%`,
      });
    }
  }

  if (errors.length > 0) {
    return fail(errors);
  }

  const footprint =
    shape === 'rectangle'
      ? ({
          shape: 'rectangle' as const,
          lengthFeet: lengthToFeet(input.length as number, units),
          widthFeet: lengthToFeet(input.width as number, units),
        } as const)
      : ({
          shape: 'circle' as const,
          diameterFeet: lengthToFeet(input.diameter as number, units),
        } as const);

  const areaSquareFeet = footprintSquareFeet(footprint);
  const depthInches = depthToInches(input.depth, units);
  const cubicFeetPerBed = fillCubicFeet(areaSquareFeet, depthInches);
  const cubicFeet = cubicFeetPerBed * input.beds;
  const liters = cubicFeetToLiters(cubicFeet);

  // A bag is quoted in cubic feet in imperial and liters in metric, so bag
  // counts are worked out in whichever unit the bag is actually labelled in.
  const totalInBagUnits = units === 'imperial' ? cubicFeet : liters;
  const bags = roundUp(totalInBagUnits / input.bagSize);

  const mixResults: MixResult[] = mix.map((component) => {
    const share = component.percent / 100;
    const componentCubicFeet = cubicFeet * share;
    const componentLiters = liters * share;
    return {
      label: component.label,
      percent: component.percent,
      cubicFeet: toSignificant(componentCubicFeet, 4),
      liters: toSignificant(componentLiters, 4),
      bags: roundUp((units === 'imperial' ? componentCubicFeet : componentLiters) / input.bagSize),
    };
  });

  return ok({
    areaSquareFeetPerBed: toSignificant(areaSquareFeet, 4),
    areaSquareMetersPerBed: toSignificant(squareFeetToSquareMeters(areaSquareFeet), 4),
    cubicFeetPerBed: toSignificant(cubicFeetPerBed, 4),
    cubicFeet: toSignificant(cubicFeet, 4),
    cubicYards: toSignificant(cubicFeetToCubicYards(cubicFeet), 3),
    liters: toSignificant(liters, 4),
    cubicMeters: toSignificant(liters / 1000, 3),
    bags,
    bagSize: input.bagSize,
    mix: mixResults,
  });
}
