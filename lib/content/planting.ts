import type { Crop } from '@/data/crops';

/**
 * Wording for frost-date offsets, shared by the crop pages, the planting date
 * calculator page and the seed-starting article.
 *
 * The offsets in data/crops.ts are weeks relative to the average LAST SPRING
 * FROST, negative before and positive after. Turning that sign convention into
 * English in more than one place is how the tool page ended up saying
 * "2 after" for a crop the calculator put on the frost date itself, so the
 * conversion lives here and nowhere else.
 */

/** Long form for a quick-facts row: "6 weeks before last frost". */
export function offsetSentence(
  value: number | null,
  direction: 'before' | 'after' | 'relative',
  reason?: string,
): string {
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

/** Compact form for a table cell: "6 before", "on the date". */
export function offsetCompact(
  value: number | null,
  direction: 'before' | 'after' | 'relative',
): string | null {
  if (value === null) return null;
  if (value === 0) return 'on the date';
  if (direction === 'before') return `${value} before`;
  return value < 0 ? `${Math.abs(value)} before` : `${value} after`;
}

/** The three planting offsets of one crop, already turned into cell text. */
export function plantingOffsets(crop: Crop): {
  indoors: string | null;
  transplant: string | null;
  directSow: string | null;
  indoorsReason: string;
  transplantReason: string;
  directSowReason: string;
} {
  return {
    indoors: offsetCompact(crop.sowIndoorsWeeksBeforeLastFrost, 'before'),
    transplant: offsetCompact(crop.transplantWeeksAfterLastFrost, 'after'),
    directSow: offsetCompact(crop.directSowWeeksRelativeToLastFrost, 'relative'),
    indoorsReason: crop.noSowIndoorsReason ?? 'Not started indoors',
    transplantReason: crop.noTransplantReason ?? 'Not transplanted',
    directSowReason: crop.noDirectSowReason ?? 'Not sown outdoors',
  };
}
