import { limeRates } from '@/data/lime-rates';
import { DataTable } from './DataTable';

/**
 * Limestone requirement by soil texture, from data/lime-rates.ts.
 *
 * The half-unit and one-and-a-half-unit columns are the linear scaling the
 * calculator itself applies, so a reader can see the approximation rather than
 * having it hidden inside the tool. The published range is beside the midpoint
 * because a single figure per texture is a starting point, not an answer.
 */
export function LimeRateTable() {
  return (
    <DataTable
      columns={['Soil texture', 'Per 1.0 pH unit', 'Published range', '0.5 unit', '1.5 units']}
    >
      {limeRates.map((rate) => (
        <tr key={rate.slug}>
          <td>{rate.name}</td>
          <td>{rate.lbPer1000SqFtPerPhUnit} lb</td>
          <td>
            {rate.rangeLbPer1000SqFt[0]}-{rate.rangeLbPer1000SqFt[1]} lb
          </td>
          <td>{rate.lbPer1000SqFtPerPhUnit * 0.5} lb</td>
          <td>{rate.lbPer1000SqFtPerPhUnit * 1.5} lb</td>
        </tr>
      ))}
    </DataTable>
  );
}
