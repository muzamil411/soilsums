import { LIME_TIMING } from '@/data/lime-rates';

/**
 * How long lime takes to move pH, rendered from data/lime-rates.ts.
 *
 * Prose components rather than typed words, because this figure was wrong in
 * three different ways across seven surfaces for months. MDX frontmatter cannot
 * import a module, so a meta description and an FAQ answer are still literal
 * text — lib/content/lime-timing.test.ts reads the rendered pages to cover
 * those, and this component covers everything written in the body.
 */
export function LimeMonths() {
  return <>{LIME_TIMING.label}</>;
}

/** The same figure at the start of a sentence. */
export function LimeMonthsCapitalised() {
  return <>{LIME_TIMING.label.charAt(0).toUpperCase() + LIME_TIMING.label.slice(1)}</>;
}

/**
 * The attribution, the corroborating statement and why it is a range at all.
 *
 * Both publications are named in the rendered text rather than in a comment,
 * because a figure whose source only exists in the repo is, to a reader, an
 * unsourced figure — which is what this one was.
 */
export function LimeTimingNote() {
  const { source, corroboration, whyARange } = LIME_TIMING;

  return (
    <p>
      The range is {source.institution}&rsquo;s, in <em>{source.title}</em>: &ldquo;{source.quote}
      .&rdquo;{' '}
      <a href={corroboration.url} rel="nofollow">
        {corroboration.institution}
      </a>
      &rsquo;s <em>{corroboration.title}</em> ({corroboration.detail}) agrees without naming a
      range: &ldquo;{corroboration.quote}.&rdquo; It is a range rather than one number because{' '}
      {whyARange} — which is also why nobody can give you a date.
    </p>
  );
}
