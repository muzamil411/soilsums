/**
 * The marker on a figure no extension source could be found for.
 *
 * Deliberately quiet: the number is still the best available and the page is
 * not apologising for it. It is ochre rather than red because it flags
 * provenance, not an error, and it carries its own explanation rather than a
 * tooltip, which a phone cannot show.
 */
export function Estimate({ what = 'this figure' }: { what?: string }) {
  return (
    <span className="border-ochre text-ochre ml-1.5 border px-1 text-xs font-normal">
      <span aria-hidden="true">estimate</span>
      <span className="sr-only">
        Estimate: no extension source was found for {what}, so it is a typical published value
        rather than a checked one.
      </span>
    </span>
  );
}
