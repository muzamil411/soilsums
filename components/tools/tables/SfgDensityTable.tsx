import {
  crops,
  inchesLabel,
  plantsPerSquareFoot,
  spacingConfirmed,
  spacingFor,
} from '@/data/crops';
import { DENSITY_NOTE, perSquare } from '@/lib/content/density';
import { DataTable, NotApplicable } from './DataTable';

/**
 * Plants per square under the square foot gardening method, from
 * data/crops.ts.
 *
 * The hand-written table this replaces carried a number for every crop on it,
 * including eight the Cornell CALS page does not name at all — invented
 * figures wearing the authority of the method. Where `sfgPlantsPerSquare` is
 * null the component says so in the same words the crop pages use, and never
 * substitutes the spacing-derived density, which is a different claim.
 */
export function SfgDensityTable({ grouped = false }: { grouped?: boolean }) {
  if (grouped) return <GroupedByDensity />;

  // Every row here prints the crop's spacing beside the method figure, so an
  // unconfirmed spacing would ride in on a table about something else.
  const ranked = crops.filter(spacingConfirmed).sort((a, b) => {
    const left = a.sfgPlantsPerSquare;
    const right = b.sfgPlantsPerSquare;
    if (left === null && right === null) return a.name.localeCompare(b.name);
    if (left === null) return 1;
    if (right === null) return -1;
    return right - left || a.name.localeCompare(b.name);
  });

  return (
    <>
      <DataTable columns={['Crop', 'Per square, square foot gardening method']}>
        {ranked.map((crop) => (
          <tr key={crop.slug}>
            <td>{crop.name}</td>
            <td>
              {crop.sfgPlantsPerSquare !== null ? (
                perSquare(crop.sfgPlantsPerSquare)
              ) : (
                <NotApplicable reason="No square foot gardening figure confirmed for this crop" />
              )}
            </td>
          </tr>
        ))}
      </DataTable>
      <p>{DENSITY_NOTE}</p>
    </>
  );
}

/** The same data the other way round: one row per density, crops listed. */
function GroupedByDensity() {
  const byDensity = new Map<number, string[]>();
  for (const crop of crops) {
    if (crop.sfgPlantsPerSquare === null) continue;
    const names = byDensity.get(crop.sfgPlantsPerSquare) ?? [];
    names.push(crop.name);
    byDensity.set(crop.sfgPlantsPerSquare, names);
  }

  const rows = [...byDensity.entries()].sort(([a], [b]) => b - a);

  return (
    <DataTable columns={['Per square', 'Crops (square foot gardening method)']}>
      {rows.map(([density, names]) => (
        <tr key={density}>
          <td>{perSquare(density)}</td>
          <td>{[...names].sort((a, b) => a.localeCompare(b)).join(', ')}</td>
        </tr>
      ))}
    </DataTable>
  );
}

/**
 * The crops the Cornell CALS page does not name, with the density their own
 * in-row spacing implies.
 *
 * That figure is arithmetic, not a recommendation, and the distinction is the
 * whole point of the section this sits in — so the two never share a table.
 */
export function SfgFallbackTable() {
  const missing = crops
    .filter((crop) => crop.sfgPlantsPerSquare === null && spacingConfirmed(crop))
    .sort(
      (a, b) =>
        spacingFor(a.spacingInches) - spacingFor(b.spacingInches) || a.name.localeCompare(b.name),
    );

  return (
    <DataTable columns={['Crop', 'In-row spacing', 'Implied per square foot']}>
      {missing.map((crop) => (
        <tr key={crop.slug}>
          <td>{crop.name}</td>
          <td>{inchesLabel(crop.spacingInches)}</td>
          <td>{perSquare(plantsPerSquareFoot(crop))}</td>
        </tr>
      ))}
    </DataTable>
  );
}
