import { crops, type Crop } from '@/data/crops';
import { DataTable } from './DataTable';

export type BedPlanRow = {
  /** A crop slug in data/crops.ts. */
  readonly crop: string;
  readonly plants: number;
  readonly squareFeet: number;
  /** Overrides the crop's own name, e.g. "Lettuce, two sowings". */
  readonly label?: string;
  /**
   * How many harvests the plants give in a season. Two sowings of lettuce in
   * the same square feet yield twice, and the arithmetic has to say so.
   */
  readonly harvests?: number;
};

/**
 * A worked bed plan, with the yields computed from data/crops.ts rather than
 * written out.
 *
 * The totals are the reason this is a component. A hand-written example table
 * is wrong in two places the moment a yield range is corrected — the row and
 * the total — and the total is the figure the surrounding prose quotes.
 */
export function BedPlanTable({ rows }: { rows: readonly BedPlanRow[] }) {
  const resolved = rows.flatMap((row) => {
    const crop: Crop | undefined = crops.find((entry) => entry.slug === row.crop);
    // A crop with no published per-plant yield cannot appear in a bed plan
    // whose whole point is adding those yields up.
    if (crop === undefined || crop.yieldPerPlantLb === null) return [];
    const yieldLb = crop.yieldPerPlantLb;
    const harvests = row.harvests ?? 1;
    return [
      {
        ...row,
        name: row.label ?? crop.name,
        low: yieldLb[0] * row.plants * harvests,
        high: yieldLb[1] * row.plants * harvests,
      },
    ];
  });

  const totals = resolved.reduce(
    (sum, row) => ({
      squareFeet: sum.squareFeet + row.squareFeet,
      low: sum.low + row.low,
      high: sum.high + row.high,
    }),
    { squareFeet: 0, low: 0, high: 0 },
  );

  const round = (value: number) => Math.round(value);

  return (
    <DataTable columns={['Crop', 'Plants', 'Space used', 'Low', 'High']}>
      {resolved.map((row) => (
        <tr key={row.crop}>
          <td>{row.name}</td>
          <td>{row.plants}</td>
          <td>{row.squareFeet} sq ft</td>
          <td>{round(row.low)} lb</td>
          <td>{round(row.high)} lb</td>
        </tr>
      ))}
      <tr>
        <td>
          <strong>Total</strong>
        </td>
        <td />
        <td>
          <strong>{totals.squareFeet} sq ft</strong>
        </td>
        <td>
          <strong>{round(totals.low)} lb</strong>
        </td>
        <td>
          <strong>{round(totals.high)} lb</strong>
        </td>
      </tr>
    </DataTable>
  );
}
