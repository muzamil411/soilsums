import type { Crop } from '@/data/crops';
import { inchesToCentimeters, poundsToKilograms } from '@/lib/calculators/shared/units';
import { toSignificant } from '@/lib/calculators/shared/round';

function cm(inches: number): string {
  return `${Math.round(inchesToCentimeters(inches))} cm`;
}

function kg(pounds: number): string {
  return `${toSignificant(poundsToKilograms(pounds), 2)} kg`;
}

function weeks(value: number | null, direction: 'before' | 'after' | 'relative'): string {
  if (value === null) return '—';
  if (value === 0) return 'On your last frost date';
  if (direction === 'before') {
    return `${value} week${value === 1 ? '' : 's'} before last frost`;
  }
  const magnitude = Math.abs(value);
  const word = magnitude === 1 ? 'week' : 'weeks';
  return value < 0
    ? `${magnitude} ${word} before last frost`
    : `${magnitude} ${word} after last frost`;
}

/**
 * The quick-facts table, read straight from data/crops.ts. Every agronomic
 * figure here is still marked verified: false in that file, which is why the
 * page carries a note saying so.
 */
export function CropFacts({ crop }: { crop: Crop }) {
  const rows: { label: string; value: string }[] = [
    {
      label: 'Spacing between plants',
      value: `${crop.spacingInches} in (${cm(crop.spacingInches)})`,
    },
    {
      label: 'Spacing between rows',
      value: `${crop.rowSpacingInches} in (${cm(crop.rowSpacingInches)})`,
    },
    {
      label: 'Square foot gardening',
      value:
        crop.plantsPerSquareFoot >= 1
          ? `${crop.plantsPerSquareFoot} per square`
          : `1 plant per ${Math.ceil(1 / crop.plantsPerSquareFoot)} squares`,
    },
    { label: 'Sun', value: `${crop.sunHours}+ hours a day` },
    {
      label: 'Water',
      value: `${crop.waterInchesPerWeek} in a week (${Math.round(crop.waterInchesPerWeek * 25.4)} mm)`,
    },
    { label: 'Soil pH', value: `${crop.soilPh[0]} to ${crop.soilPh[1]}` },
    {
      label: 'Days to maturity',
      value: crop.daysToMaturity
        ? `${crop.daysToMaturity[0]} to ${crop.daysToMaturity[1]} days`
        : 'Perennial — see the timing note',
    },
    {
      label: 'Yield per plant',
      value: `${crop.yieldPerPlantLb[0]} to ${crop.yieldPerPlantLb[1]} lb (${kg(crop.yieldPerPlantLb[0])} to ${kg(crop.yieldPerPlantLb[1])})`,
    },
    {
      label: 'Start seeds indoors',
      value: weeks(crop.sowIndoorsWeeksBeforeLastFrost, 'before'),
    },
    {
      label: 'Transplant out',
      value: weeks(crop.transplantWeeksAfterLastFrost, 'relative'),
    },
    {
      label: 'Direct sow',
      value: weeks(crop.directSowWeeksRelativeToLastFrost, 'relative'),
    },
  ];

  return (
    <div className="border-ink/20 border">
      <div className="bg-kale text-paper flex items-baseline justify-between px-3 py-1.5">
        <span className="font-display text-sm">Quick facts</span>
        <span aria-hidden="true" className="bg-radish h-2 w-8" />
      </div>
      <dl className="divide-rule divide-y">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-2 gap-2 px-3 py-2 text-sm">
            <dt className="text-ink/80">{row.label}</dt>
            <dd className="tabular font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="border-rule text-ink/70 border-t px-3 py-2 text-xs">
        Scientific name: <em>{crop.scientificName}</em>. Figures are typical published ranges
        awaiting verification against a primary source — see{' '}
        <span className="whitespace-nowrap">the note below</span>.
      </p>
    </div>
  );
}
