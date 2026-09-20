import { crops, type Crop } from '@/data/crops';
import { plantingOffsets } from '@/lib/content/planting';
import { DataTable, NotApplicable } from './DataTable';

/**
 * Planting offsets in weeks from the last frost, read from data/crops.ts —
 * the same records the calculator on this page computes its dates from.
 *
 * This replaces a hand-written Markdown table that had drifted from the data
 * on seven of its ten rows, so a reader could watch the calculator say one
 * thing and the table below it say another. Generated from the data, the two
 * cannot disagree.
 */
export function PlantingOffsetTable({ only }: { only?: readonly string[] }) {
  const shown: readonly Crop[] = only
    ? only.flatMap((slug) => crops.filter((crop) => crop.slug === slug))
    : crops;

  return (
    <DataTable columns={['Crop', 'Start indoors', 'Transplant', 'Direct sow']}>
      {shown.map((crop) => {
        const offsets = plantingOffsets(crop);
        // Garlic and anything else outside the spring frost window has no
        // offset at all. Spreading the note across the row says why, where
        // three dashes would just look like missing data.
        if (crop.plantingSeason === 'fall') {
          return (
            <tr key={crop.slug}>
              <td>{crop.name}</td>
              <td colSpan={3}>
                <NotApplicable reason={crop.timingNote ?? 'Planted in autumn, not from frost'} />
              </td>
            </tr>
          );
        }
        return (
          <tr key={crop.slug}>
            <td>{crop.name}</td>
            <td>
              {offsets.indoors ?? <NotApplicable reason={offsets.indoorsReason} short />}
            </td>
            <td>
              {offsets.transplant ?? <NotApplicable reason={offsets.transplantReason} short />}
            </td>
            <td>
              {offsets.directSow ?? <NotApplicable reason={offsets.directSowReason} short />}
            </td>
          </tr>
        );
      })}
    </DataTable>
  );
}
