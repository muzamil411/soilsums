/**
 * A diagram in an article or tool page.
 *
 * Width and height are required rather than optional: without them the page
 * reflows as the image arrives, which is the single largest avoidable source
 * of layout shift on a text page. Everything below the fold is lazy; the
 * first figure on a page passes `priority` so it is not deferred.
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
}: {
  src: string;
  /** What the diagram shows, described for someone who cannot see it. */
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
}) {
  return (
    <figure className="my-6">
      {/* A plain img, not next/image: the export is static and these are
          already sized and compressed WebP, so the optimiser has nothing to
          add and would only add an unoptimised-image build warning. */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className="border-rule h-auto w-full border"
      />
      {caption ? (
        <figcaption className="text-ink/70 mt-2 text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
