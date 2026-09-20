import { crops } from '@/data/crops';
import { DataTable } from './DataTable';

/**
 * Water requirement in inches per week, from data/crops.ts, grouped so the
 * table stays short — most crops fall on one of two figures.
 */
export function CropWaterTable() {
  const byNeed = new Map<number, string[]>();
  for (const crop of crops) {
    const names = byNeed.get(crop.waterInchesPerWeek) ?? [];
    names.push(crop.name);
    byNeed.set(crop.waterInchesPerWeek, names);
  }

  const rows = [...byNeed.entries()].sort(([a], [b]) => b - a);

  return (
    <DataTable columns={['Inches per week', 'Crops']}>
      {rows.map(([need, names]) => (
        <tr key={need}>
          <td>{need} in</td>
          <td>{[...names].sort((a, b) => a.localeCompare(b)).join(', ')}</td>
        </tr>
      ))}
    </DataTable>
  );
}
