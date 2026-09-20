import { crops, plantsPerSquareFoot, type Crop } from '@/data/crops';
import { perSquare } from '@/lib/content/density';
import { DataTable } from './DataTable';

/**
 * In-row and row spacing from data/crops.ts — the figures the plant spacing
 * calculator and every crop page work from.
 *
 * Spacing was the field most often copied into an article by hand, and the
 * copies had started to disagree: one draft grouped carrot and radish at the
 * same 3 inches when the data has radish at 2.
 */
export function CropSpacingTable({
  only,
  withRowSpacing = true,
  withImpliedDensity = false,
}: {
  /** Slugs to show, in the order given. Omitted shows every crop. */
  only?: readonly string[];
  withRowSpacing?: boolean;
  withImpliedDensity?: boolean;
}) {
  const shown: readonly Crop[] = only
    ? only.flatMap((slug) => crops.filter((crop) => crop.slug === slug))
    : [...crops].sort((a, b) => a.spacingInches - b.spacingInches || a.name.localeCompare(b.name));

  const columns = [
    'Crop',
    'In-row spacing',
    ...(withRowSpacing ? ['Row spacing'] : []),
    ...(withImpliedDensity ? ['Implied per square foot'] : []),
  ];

  return (
    <DataTable columns={columns}>
      {shown.map((crop) => (
        <tr key={crop.slug}>
          <td>{crop.name}</td>
          <td>{crop.spacingInches} in</td>
          {withRowSpacing ? <td>{crop.rowSpacingInches} in</td> : null}
          {withImpliedDensity ? <td>{perSquare(plantsPerSquareFoot(crop))}</td> : null}
        </tr>
      ))}
    </DataTable>
  );
}

/**
 * Crops grouped by their in-row spacing, with how many fit a bed of the given
 * size on a square grid and staggered.
 *
 * Both counts are arithmetic from the spacing, and the crop column is drawn
 * from the data rather than listed by hand, so a spacing correction moves a
 * crop between rows by itself.
 */
export function SpacingGridTable({
  bedFeet = [4, 8],
}: {
  bedFeet?: readonly [number, number];
}) {
  const [widthFt, lengthFt] = bedFeet;
  const bySpacing = new Map<number, string[]>();
  for (const crop of crops) {
    const names = bySpacing.get(crop.spacingInches) ?? [];
    names.push(crop.name);
    bySpacing.set(crop.spacingInches, names);
  }

  const rows = [...bySpacing.entries()].sort(([a], [b]) => a - b);

  return (
    <DataTable columns={['Spacing', 'Square grid', 'Staggered', 'Crops at this spacing']}>
      {rows.map(([spacing, names]) => {
        const across = Math.floor((widthFt * 12) / spacing);
        const along = Math.floor((lengthFt * 12) / spacing);
        const square = across * along;
        // Offsetting alternate rows by half a spacing brings the rows closer
        // by a factor of sqrt(3)/2 while keeping every plant the same distance
        // from its neighbours.
        const staggeredRows = Math.floor((lengthFt * 12) / (spacing * 0.866)) || 1;
        const staggered = Math.floor(staggeredRows / 2) * (across + (across - 1));

        return (
          <tr key={spacing}>
            <td>{spacing} in</td>
            <td>{square.toLocaleString('en-US')}</td>
            <td>{staggered.toLocaleString('en-US')}</td>
            <td>{[...names].sort((a, b) => a.localeCompare(b)).join(', ')}</td>
          </tr>
        );
      })}
    </DataTable>
  );
}
