import Link from 'next/link';

/** A nursery stake tag: pointed bottom edge, used for crop chips. */
export function PlantLabel({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="plant-label border-ink/30 bg-paper text-ink hover:border-radish hover:text-radish inline-block border px-3 pt-1.5 text-sm no-underline"
    >
      {children}
    </Link>
  );
}
