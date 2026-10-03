import { grassSeedRates } from '@/data/grass-seed-rates';
import { rateLabel } from '@/data/turfgrass';
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
    <DataTable
      columns={['Grass', 'Season', 'New lawn, as published', 'Overseeding', 'Rate written for']}
    >
      {ordered.map((grass) => (
        <tr key={grass.slug}>
          <td>{grass.name}</td>
          <td>{grass.season === 'cool' ? 'Cool' : 'Warm'}</td>
          <td>
            {/* The published range, not the midpoint the calculator works from.
                Showing only the derived figure would hide that Penn State gives
                a band rather than a number. The PLS marker matters: Arkansas
                publishes zoysiagrass as pure live seed, not bulk. */}
            {rateLabel(grass.newLawnRange)}
            {grass.rateBasis === 'pls' ? ' PLS' : ''}
            {!grass.verified ? <Estimate what={`the new-lawn rate for ${grass.name}`} /> : null}
          </td>
          <td>
            {grass.overseedLbPer1000SqFt} lb{grass.rateBasis === 'pls' ? ' PLS' : ''}
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
