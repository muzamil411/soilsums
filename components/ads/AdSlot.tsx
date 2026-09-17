import { adsense } from '@/lib/seo/site';

export type AdPlacement = 'below-result' | 'mid-content' | 'end-of-content';

/**
 * A single in-content ad unit.
 *
 * When ads are disabled (the default, and the state the site is reviewed in)
 * this renders nothing at all — no wrapper, no reserved height — so pages have
 * no empty gaps. Reserved space exists only once ads are actually being
 * served, where it prevents the layout shift an injected iframe would cause.
 *
 * Never place this between a calculator's inputs and its result.
 */
export function AdSlot({
  placement,
  slotId,
  minHeight = 280,
}: {
  placement: AdPlacement;
  slotId?: string;
  minHeight?: number;
}) {
  if (!adsense.enabled) {
    return null;
  }

  return (
    <div
      className="no-print my-8"
      // Reserved only while ads are live, so CLS stays at zero.
      style={{ minHeight }}
      data-ad-placement={placement}
    >
      <p className="text-ink/50 mb-1 text-xs">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={adsense.pubId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
