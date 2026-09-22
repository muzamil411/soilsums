import { SOIL_DENSITY, bagReference } from '@/lib/calculators/soil-volume';
import { Estimate } from '@/components/ui/Estimate';
import { DataTable } from './DataTable';

/**
 * The bag sizes people search for, converted by the same function the
 * converter on this page uses.
 *
 * Written out by hand this table would be seven more rows of arithmetic
 * waiting to drift from the tool beside it, which is precisely the failure
 * lib/content/mdx-figures.test.ts exists to stop.
 */
export function BagVolumeTable() {
  const rows = bagReference();

  return (
    <>
      <DataTable columns={['Bag size', 'Cubic feet', 'Liters', 'Rough weight']}>
        {rows.map((row) => (
          <tr key={row.dryQuarts}>
            <td>{row.dryQuarts} dry qt</td>
            <td>{row.cubicFeet}</td>
            <td>{row.liters}</td>
            <td>
              {row.weightLb[0]}–{row.weightLb[1]} lb
            </td>
          </tr>
        ))}
      </DataTable>
      <p>
        Weights use {SOIL_DENSITY.lowLbPerCuFt} to {SOIL_DENSITY.highLbPerCuFt} lb per cubic foot
        <Estimate what="the bulk density of bagged growing medium" />, which is a typical
        published spread rather than a checked figure.
      </p>
    </>
  );
}
