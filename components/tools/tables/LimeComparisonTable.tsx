import { limeRates } from '@/data/lime-rates';
import { DataTable } from './DataTable';

/**
 * How Kentucky and Colorado express a lime recommendation, side by side.
 *
 * The Kentucky column is read from data/lime-rates.ts, because those are the
 * same figures the calculator uses and a comparison that quietly disagreed
 * with the tool would be worse than no comparison. The Colorado column is
 * prose from GardenNotes #222, which publishes no texture table at all — that
 * absence is the point the section is making, so it is written here rather
 * than modelled as missing data.
 */
export function LimeComparisonTable() {
  const rate = (slug: string) =>
    limeRates.find((entry) => entry.slug === slug)?.lbPer1000SqFtPerPhUnit;

  const rows: readonly [string, string, string][] = [
    [
      'How it is expressed',
      'lb per 1,000 sq ft per 1.0 pH unit, by texture',
      'a cap on a single application, plus adjustments',
    ],
    ['Sandy', `${rate('sandy')} lb`, 'not broken out by texture'],
    ['Loam', `${rate('loam')} lb`, 'not broken out by texture'],
    ['Clay', `${rate('clay')} lb`, 'not broken out by texture'],
    ['Single-application limit', 'not stated', '50 lb per 1,000 sq ft on established turf'],
    ['Organic matter', 'assumes low', 'add about 20% at 4-5% organic matter'],
    [
      'Hydrated or burned lime',
      'not covered',
      'halve the rate, and never above 10 lb per 1,000 sq ft',
    ],
    [
      'Context it was written for',
      'cool-season lawns on Kentucky soils',
      'Colorado soils, most of which are alkaline already',
    ],
  ];

  return (
    <DataTable columns={['', 'Kentucky (AGR-214)', 'Colorado (GardenNotes #222)']}>
      {rows.map(([label, kentucky, colorado]) => (
        <tr key={label}>
          <td>
            <strong>{label}</strong>
          </td>
          <td>{kentucky}</td>
          <td>{colorado}</td>
        </tr>
      ))}
    </DataTable>
  );
}
