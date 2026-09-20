import { grassSeedRates } from '@/data/grass-seed-rates';
import { Estimate } from '@/components/ui/Estimate';
import { DataTable } from './DataTable';

/**
 * Seeding rates from data/grass-seed-rates.ts, in pounds per 1,000 square
 * feet, as used by the calculator on this page.
 *
 * Overseeding rates carry the estimate marker far more often than new-lawn
 * rates do: the verification pass found a source for only three of the eleven.
 * The region is a column rather than a footnote because a rate written for
 * Florida is not advice for New England.
 */
export function GrassSeedRateTable() {
  const ordered = [...grassSeedRates].sort(
    (a, b) => a.season.localeCompare(b.season) || a.name.localeCompare(b.name),
  );

  return (
    <DataTable columns={['Grass', 'Season', 'New lawn', 'Overseeding', 'Rate written for']}>
      {ordered.map((grass) => (
        <tr key={grass.slug}>
          <td>{grass.name}</td>
          <td>{grass.season === 'cool' ? 'Cool' : 'Warm'}</td>
          <td>
            {grass.newLawnLbPer1000SqFt} lb
            {!grass.verified ? <Estimate what={`the new-lawn rate for ${grass.name}`} /> : null}
          </td>
          <td>
            {grass.overseedLbPer1000SqFt} lb
            {!grass.overseedVerified ? (
              <Estimate what={`the overseeding rate for ${grass.name}`} />
            ) : null}
          </td>
          <td className="text-sm">{grass.region}</td>
        </tr>
      ))}
    </DataTable>
  );
}
