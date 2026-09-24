import Link from 'next/link';
import {
  CHECKED_FIELDS,
  inchesLabel,
  plantsPerSquareFoot,
  type Crop,
  type Inches,
} from '@/data/crops';
import { DENSITY_NOTE, perSquare } from '@/lib/content/density';
import { Estimate } from '@/components/ui/Estimate';
import { inchesToCentimeters, poundsToKilograms } from '@/lib/calculators/shared/units';
import { toSignificant } from '@/lib/calculators/shared/round';

function cm(inches: number): string {
  return `${Math.round(inchesToCentimeters(inches))} cm`;
}

/** "12 to 18 in (30 to 46 cm)", or the single-figure form. */
function spacingLabel(value: Inches): string {
  if (Array.isArray(value)) {
    const [low, high] = value as readonly [number, number];
    return `${inchesLabel(value)} (${Math.round(inchesToCentimeters(low))} to ${cm(high)})`;
  }
  return `${inchesLabel(value)} (${cm(value as number)})`;
}

function kg(pounds: number): string {
  return `${toSignificant(poundsToKilograms(pounds), 2)} kg`;
}

function weeks(
  value: number | null,
  direction: 'before' | 'after' | 'relative',
  reason?: string,
): string {
  // A blank row tells the reader nothing. Every crop that does not use a
  // planting step carries a reason for it in data/crops.ts.
  if (value === null) return reason ?? 'Does not apply to this crop';
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
  const unverified = new Set(
    CHECKED_FIELDS.filter((field) => !crop.verifiedFields.includes(field)),
  );

  const rows: {
    label: string;
    value: string;
    isReason?: boolean;
    second?: string;
    /** A checked field, so the row can carry an estimate marker when unconfirmed. */
    field?: (typeof CHECKED_FIELDS)[number];
    /**
     * Puts the estimate marker on the second line instead of the value. The
     * plants-per-square-foot row needs this: its headline figure is arithmetic
     * from the spacing and is never an estimate, while the square foot
     * gardening figure beside it may be.
     */
    markSecond?: boolean;
  }[] = [
    {
      label: 'Spacing between plants',
      value: spacingLabel(crop.spacingInches),
      second: crop.spacingByType
        ? crop.spacingByType.map((type) => `${type.name} ${inchesLabel(type.inches)}`).join('; ')
        : undefined,
      field: 'spacingInches' as const,
    },
    {
      label: 'Spacing between rows',
      value:
        crop.rowSpacingInches === null
          ? 'No separate row figure is published for this crop'
          : spacingLabel(crop.rowSpacingInches),
      isReason: crop.rowSpacingInches === null,
      field: 'rowSpacingInches' as const,
    },
    {
      // The spacing-derived figure leads, because it follows from the row above
      // it. The square foot gardening figure is a different kind of claim and
      // is labelled as one rather than being blended into the same number.
      label: 'Plants per square foot',
      value: perSquare(plantsPerSquareFoot(crop)),
      second:
        crop.sfgPlantsPerSquare !== null
          ? `${perSquare(crop.sfgPlantsPerSquare)}, square foot gardening method`
          : unverified.has('sfgPlantsPerSquare')
            ? 'No square foot gardening figure confirmed for this crop'
            : 'Not named on the square foot gardening page',
      field: 'sfgPlantsPerSquare' as const,
      markSecond: true,
    },
    { label: 'Sun', value: `${crop.sunHours}+ hours a day` },
    {
      label: 'Water',
      value:
        crop.waterInchesPerWeek === null
          ? (crop.waterNote ?? 'No weekly figure is published for this crop')
          : `${crop.waterInchesPerWeek} in a week (${Math.round(crop.waterInchesPerWeek * 25.4)} mm)`,
      isReason: crop.waterInchesPerWeek === null,
    },
    {
      label: 'Soil pH',
      value: crop.soilPh
        ? `${crop.soilPh[0]} to ${crop.soilPh[1]}`
        : (crop.soilPhNote ?? 'No range is published for this crop'),
      isReason: crop.soilPh === null,
    },
    {
      label: 'Days to maturity',
      value: crop.daysToMaturity
        ? `${crop.daysToMaturity[0]} to ${crop.daysToMaturity[1]} days`
        : 'A perennial, so it has no days-to-maturity from planting',
      isReason: crop.daysToMaturity === null,
    },
    {
      // Reported in whatever unit the source used. Asparagus is published per
      // 10-foot row, and dividing that into a per-crown figure would invent
      // one nobody gave.
      label: crop.yieldPer10FtRowLb ? 'Yield per 10-foot row' : 'Yield per plant',
      value: crop.yieldPer10FtRowLb
        ? `${crop.yieldPer10FtRowLb[0]} to ${crop.yieldPer10FtRowLb[1]} lb a year (${kg(crop.yieldPer10FtRowLb[0])} to ${kg(crop.yieldPer10FtRowLb[1])})`
        : crop.yieldPerPlantLb
          ? `${crop.yieldPerPlantLb[0]} to ${crop.yieldPerPlantLb[1]} lb (${kg(crop.yieldPerPlantLb[0])} to ${kg(crop.yieldPerPlantLb[1])})`
          : 'No yield figure is published for this crop',
      isReason: !crop.yieldPer10FtRowLb && crop.yieldPerPlantLb === null,
    },
    {
      label: 'Start seeds indoors',
      value: weeks(crop.sowIndoorsWeeksBeforeLastFrost, 'before', crop.noSowIndoorsReason),
      isReason: crop.sowIndoorsWeeksBeforeLastFrost === null,
    },
    {
      label: 'Transplant out',
      // A sourced note beats the computed phrase where a publication gives a
      // condition rather than a week count.
      value:
        crop.transplantNote ??
        weeks(crop.transplantWeeksAfterLastFrost, 'relative', crop.noTransplantReason),
      isReason: crop.transplantWeeksAfterLastFrost === null,
    },
    {
      label: 'Direct sow',
      value:
        crop.directSowNote ??
        weeks(crop.directSowWeeksRelativeToLastFrost, 'relative', crop.noDirectSowReason),
      isReason: crop.directSowWeeksRelativeToLastFrost === null,
    },
  ];

  return (
    <div className="border-ink/20 border">
      <div className="bg-kale text-paper flex items-baseline justify-between px-3 py-1.5">
        {/* A heading, so the page runs h1 -> h2 -> h3 without a skip. */}
        <h2 className="font-display text-sm">Quick facts</h2>
        <span aria-hidden="true" className="bg-radish h-2 w-8" />
      </div>
      <dl className="divide-rule divide-y">
        {rows.map((row) =>
          row.isReason ? (
            <div key={row.label} className="px-3 py-2 text-sm">
              <dt className="text-ink/80">{row.label}</dt>
              <dd className="text-ink/90 mt-0.5">{row.value}</dd>
            </div>
          ) : (
            <div key={row.label} className="grid grid-cols-2 gap-2 px-3 py-2 text-sm">
              <dt className="text-ink/80">{row.label}</dt>
              <dd className="tabular font-semibold">
                {row.value}
                {row.field && !row.markSecond && unverified.has(row.field) ? <Estimate /> : null}
                {row.second ? (
                  <span className="text-ink/75 block font-normal">
                    {row.second}
                    {/* Only badge a figure that exists. Where the square foot
                        gardening figure is simply absent, the line already says
                        so and a marker reading "typical published value" would
                        describe something that is not there. */}
                    {row.field &&
                    row.markSecond &&
                    crop.sfgPlantsPerSquare !== null &&
                    unverified.has(row.field) ? (
                      <Estimate what="the square foot gardening figure" />
                    ) : null}
                  </span>
                ) : null}
              </dd>
            </div>
          ),
        )}
      </dl>
      {crop.soilOrAirTempNote ? (
        <div className="border-rule border-ochre border-t border-l-4 px-3 py-2">
          <p className="text-sm font-semibold">Also wait for the temperature</p>
          <p className="text-ink/90 mt-1 text-sm">{crop.soilOrAirTempNote}</p>
        </div>
      ) : null}

      {crop.notes && crop.notes.length > 0 ? (
        <ul className="border-rule space-y-2 border-t px-3 py-2 text-sm">
          {crop.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <p className="border-rule text-ink/70 border-t px-3 py-2 text-xs">{DENSITY_NOTE}</p>

      <p className="border-rule text-ink/70 border-t px-3 py-2 text-xs">
        Scientific name: <em>{crop.scientificName}</em>.{' '}
        {crop.source ? (
          <>
            Spacing and planting dates checked against{' '}
            <a href={crop.source.url} rel="nofollow">
              {crop.source.institution}
            </a>
            .{' '}
          </>
        ) : null}
        Yields, days to maturity and companion lists were never systematically checked — see{' '}
        <Link href="/data-sources/">how this data is checked</Link>.
      </p>
    </div>
  );
}
