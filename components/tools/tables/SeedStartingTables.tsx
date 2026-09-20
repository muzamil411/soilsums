import { crops } from '@/data/crops';
import { offsetCompact } from '@/lib/content/planting';
import { DataTable } from './DataTable';

/**
 * The indoor-sowing schedule, grouped by how many weeks before the last frost
 * the seed goes in — the order a gardener actually works in, since one evening
 * of sowing covers every crop on a row.
 *
 * Read from data/crops.ts, so the article and the planting date calculator
 * cannot give different answers for the same crop. They already had: the
 * article put cabbage at nine weeks and broccoli at eight while the tool page
 * beside it said six for both.
 */
export function IndoorSowingTable() {
  const byWeeks = new Map<number, typeof crops>();
  for (const crop of crops) {
    const weeks = crop.sowIndoorsWeeksBeforeLastFrost;
    if (weeks === null) continue;
    byWeeks.set(weeks, [...(byWeeks.get(weeks) ?? []), crop]);
  }

  const rows = [...byWeeks.entries()].sort(([a], [b]) => b - a);

  return (
    <DataTable columns={['Weeks before last frost', 'Sow indoors', 'Transplant out']}>
      {rows.map(([weeks, group]) => {
        // Crops sown on the same week can still go out on different weeks, so
        // the transplant cell names the crop whenever the group disagrees.
        const transplants = new Set(
          group.map((crop) => offsetCompact(crop.transplantWeeksAfterLastFrost, 'after') ?? '—'),
        );
        const sorted = [...group].sort((a, b) => a.name.localeCompare(b.name));
        return (
          <tr key={weeks}>
            <td>{weeks}</td>
            <td>{sorted.map((crop) => crop.name).join(', ')}</td>
            <td>
              {transplants.size === 1
                ? [...transplants][0]
                : sorted
                    .map(
                      (crop) =>
                        `${crop.name} ${offsetCompact(crop.transplantWeeksAfterLastFrost, 'after') ?? '—'}`,
                    )
                    .join('; ')}
            </td>
          </tr>
        );
      })}
    </DataTable>
  );
}

/**
 * The crops that are not started indoors, each with the reason from the data
 * file and the direct-sow offset the calculator uses.
 */
export function DirectSowOnlyTable() {
  const direct = crops
    .filter((crop) => crop.sowIndoorsWeeksBeforeLastFrost === null)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DataTable columns={['Crop', 'Why not indoors', 'Sow direct']}>
      {direct.map((crop) => (
        <tr key={crop.slug}>
          <td>{crop.name}</td>
          <td className="text-sm">{crop.noSowIndoorsReason ?? 'Sown where it will grow.'}</td>
          <td>
            {crop.plantingSeason === 'fall'
              ? 'In autumn'
              : (offsetCompact(crop.directSowWeeksRelativeToLastFrost, 'relative') ?? '—')}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
