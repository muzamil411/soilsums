/**
 * Analytics events. No-ops unless GA4 is configured, so calculators can call
 * these unconditionally.
 */
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const firedThisPageView = new Set<string>();

/**
 * Fired the first time a calculator produces a valid result. Debounced to once
 * per tool per page view so a live-updating input does not send an event per
 * keystroke.
 */
export function trackCalculatorUsed(toolSlug: string): void {
  if (typeof window === 'undefined' || firedThisPageView.has(toolSlug)) {
    return;
  }
  firedThisPageView.add(toolSlug);
  window.gtag?.('event', 'calculator_used', { tool: toolSlug });
}

/** Test seam, and used on client-side navigation between tool pages. */
export function resetAnalyticsPageView(): void {
  firedThisPageView.clear();
}
