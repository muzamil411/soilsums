import { compostMaterials } from '@/data/compost-materials';
import { Estimate } from '@/components/ui/Estimate';
import { DataTable } from './DataTable';

/**
 * Carbon-to-nitrogen ratios from data/compost-materials.ts, the same records
 * the compost calculator mixes.
 *
 * The published range travels with the working figure. Cornell's own wording
 * is that its numbers "should be viewed as representative ranges, not as
 * universal values", and wood chips run from 200 to 1,300 — a reader shown
 * only "400" would trust it far more than anyone should.
 */
export function CompostMaterialTable({
  only,
  showCategory = true,
}: {
  /** Slugs to show, in data order. Omitted shows every material. */
  only?: readonly string[];
  showCategory?: boolean;
}) {
  const shown = only
    ? compostMaterials.filter((material) => only.includes(material.slug))
    : compostMaterials;

  const ranked = [...shown].sort(
    (a, b) => b.cnRatio - a.cnRatio || a.name.localeCompare(b.name),
  );

  const columns = showCategory
    ? ['Material', 'Type', 'C:N ratio', 'Published range']
    : ['Material', 'C:N ratio', 'Published range'];

  return (
    <DataTable columns={columns}>
      {ranked.map((material) => (
        <tr key={material.slug}>
          <td>{material.name}</td>
          {showCategory ? <td>{material.category === 'brown' ? 'Brown' : 'Green'}</td> : null}
          <td>
            {material.cnRatio}:1
            {!material.verified ? <Estimate what={`the C:N ratio of ${material.name}`} /> : null}
          </td>
          <td>
            {material.range ? (
              `${material.range[0]}:1 to ${material.range[1]}:1`
            ) : (
              <span className="text-ink/60 text-sm">No published range found</span>
            )}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
