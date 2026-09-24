import {
  AVAILABILITY_DEFINITIONS,
  MANURE_CAVEAT,
  nitrogenLabel,
  nitrogenSources,
} from '@/data/nitrogen-sources';
import { DataTable } from './DataTable';

/**
 * Nitrogen content and release speed, read from data/nitrogen-sources.ts.
 *
 * Every row is University of Georgia Circular 853 Table 1, and the citation
 * sits under the table rather than in a footnote elsewhere, so a figure and
 * its source are never separated. The availability column carries the
 * circular's own definitions because "Slow" means nothing on its own — it is
 * the difference between a material that feeds a crop this season and one
 * that does not.
 */
export function NitrogenSourceTable() {
  const manures = nitrogenSources.filter((entry) => entry.isManure);

  return (
    <>
      <DataTable columns={['Material', 'Nitrogen', 'How fast it releases']}>
        {nitrogenSources.map((entry) => (
          <tr key={entry.slug}>
            <td>{entry.name}</td>
            <td>{nitrogenLabel(entry)}</td>
            <td>{entry.availability}</td>
          </tr>
        ))}
      </DataTable>
      <p>
        Release ratings are the circular&rsquo;s own:{' '}
        {Object.entries(AVAILABILITY_DEFINITIONS).map(([rating, meaning], index, all) => (
          <span key={rating}>
            <strong>{rating}</strong> is {meaning}
            {index === all.length - 1 ? '. ' : '; '}
          </span>
        ))}
        A hyphenated rating such as Slow-Medium falls between the two.
      </p>
      <p>
        On the manures — {manures.map((entry) => entry.name.toLowerCase()).join(', ')} — the
        circular adds a caveat that has to travel with the figure: {MANURE_CAVEAT} A manure
        percentage is a starting point, not a rate.
      </p>
    </>
  );
}
