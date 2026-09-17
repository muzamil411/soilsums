import Script from 'next/script';
import { adsense } from '@/lib/seo/site';

/**
 * Loads the AdSense library, and is the one place a consent management
 * platform belongs.
 *
 * For visitors in the EEA, UK and Switzerland, Google requires a
 * Google-certified CMP before personalised ads may be served. The simplest
 * route is Google's own "Privacy & messaging" GDPR message in the AdSense
 * dashboard, which needs no code here. If you adopt a third-party CMP instead,
 * add its script immediately above the AdSense script below with
 * strategy="beforeInteractive" so it can gate ad requests.
 */
export function AdScript() {
  if (!adsense.enabled) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.pubId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
