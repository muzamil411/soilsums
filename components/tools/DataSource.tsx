import Link from 'next/link';
import type { Crop } from '@/data/crops';

/**
 * The provenance line under a result. Small, but it is the difference between
 * a number a reader can check and a number they have to take on faith.
 *
 * It names the institutions actually used for the crops in front of the
 * reader, rather than a generic claim about the whole site.
 */
export function CropDataSource({
  crops,
  what,
}: {
  crops: readonly Crop[];
  /** Which fields this tool actually reads, e.g. "Spacing". */
  what: string;
}) {
  const institutions = [
    ...new Set(crops.flatMap((crop) => (crop.source ? [crop.source.institution] : []))),
  ].sort();

  const unverified = crops.filter((crop) => !crop.verified);

  return (
    <p className="text-ink/70 mt-4 text-xs">
      {what} checked against{' '}
      {institutions.length > 0 ? institutions.join(', ') : 'US extension service guides'}.
      {unverified.length > 0 ? (
        <>
          {' '}
          {unverified.length} of the {crops.length} crop{crops.length === 1 ? '' : 's'} here{' '}
          {unverified.length === 1 ? 'has' : 'have'} at least one figure no source could be found
          for: {unverified.map((crop) => crop.name.toLowerCase()).join(', ')}.
        </>
      ) : null}{' '}
      <Link href="/data-sources/">How this data is checked</Link>
    </p>
  );
}
