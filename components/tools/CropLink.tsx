'use client';

import Link from 'next/link';

/**
 * Names a crop, linking to its guide only when that guide exists. Keeps the
 * calculators from pointing at pages that have not been written yet.
 */
export function CropLink({
  slug,
  name,
  linkedCrops,
}: {
  slug: string;
  name: string;
  linkedCrops?: readonly string[];
}) {
  if (linkedCrops?.includes(slug)) {
    return (
      <Link href={`/crops/${slug}/`} className="font-semibold">
        {name}
      </Link>
    );
  }
  return <span className="font-semibold">{name}</span>;
}
