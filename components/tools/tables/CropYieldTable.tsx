import { crops } from '@/data/crops';
import { DataTable } from './DataTable';

/**
 * Yield per plant from data/crops.ts, low to high, as the estimator on this
 * page uses it.
 *
 * This table agreed with the data when it was hand-written. So did the
 * planting-offset table on the planting date page, once. Generating it is
 * what keeps that true after the next data correction.
 */
export function CropYieldTable({ withSpacing = false }: { withSpacing?: boolean }) {
  const ranked = [...crops].sort(
    (a, b) => b.yieldPerPlantLb[1] - a.yieldPerPlantLb[1] || a.name.localeCompare(b.name),
  );

  const columns = withSpacing
    ? ['Crop', 'Low', 'High', 'In-row spacing']
    : ['Crop', 'Low', 'High'];

  return (
    <DataTable columns={columns}>
      {ranked.map((crop) => (
        <tr key={crop.slug}>
          <td>{crop.name}</td>
          <td>{crop.yieldPerPlantLb[0]} lb</td>
          <td>{crop.yieldPerPlantLb[1]} lb</td>
          {withSpacing ? <td>{crop.spacingInches} in</td> : null}
        </tr>
      ))}
    </DataTable>
  );
}
