import {
  MISSOURI,
  PENN_STATE,
  RENOVATION_RYEGRASS,
  TURF_SPECIES,
  rateLabel,
} from '@/data/turfgrass';
import { DataTable } from './DataTable';

/**
 * Seeding rates as two publications actually give them, side by side.
 *
 * Generated rather than written out, for the reason every table on this site is:
 * a hand-written copy of a data file drifts from it. But the shape matters more
 * than usual here. Penn State gives one range per species for an open, sunny
 * location; Missouri gives two figures, one for fall and a higher one for
 * spring. On perennial ryegrass that is 4 to 5 lb against 7 and 10 — a factor of
 * two at the extremes.
 *
 * So the columns stay separate and nothing is averaged. A single blended number
 * would be a figure neither service publishes, and picking one publication would
 * hide a real disagreement between a Pennsylvania recommendation and a Missouri
 * one. An empty cell means that publication does not cover that species, which
 * is different from it recommending nothing.
 */
export function SeedingRateTable() {
  return (
    <>
      <DataTable
        columns={['Grass', 'Penn State, sunny site', 'Missouri, autumn', 'Missouri, spring']}
        align={['left', 'right', 'right', 'right']}
      >
        {TURF_SPECIES.map((species) => (
          <tr key={species.slug}>
            <td>{species.name}</td>
            <td style={{ textAlign: 'right' }}>{rateLabel(species.pennState)}</td>
            <td style={{ textAlign: 'right' }}>{rateLabel(species.missouriFall)}</td>
            <td style={{ textAlign: 'right' }}>{rateLabel(species.missouriSpring)}</td>
          </tr>
        ))}
      </DataTable>
      <p>
        Pounds of seed per 1,000 square feet for a new lawn on bare ground. From{' '}
        <a href={PENN_STATE.url} rel="nofollow">
          {PENN_STATE.institution}
        </a>
        , {PENN_STATE.title}, and{' '}
        <a href={MISSOURI.url} rel="nofollow">
          {MISSOURI.institution}
        </a>
        , {MISSOURI.title}. An empty cell means that publication does not name that grass, not that
        it recommends nothing. Penn State separately gives {rateLabel(RENOVATION_RYEGRASS)} for
        renovation seeding of turf-type perennial ryegrass into existing turf, which is a different
        job at a much lower rate.
      </p>
    </>
  );
}
