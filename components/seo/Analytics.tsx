import Script from 'next/script';
import { analytics } from '@/lib/seo/site';

/** GA4, loaded only when NEXT_PUBLIC_GA4_ID is set to a valid measurement ID. */
export function Analytics() {
  if (!analytics.enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analytics.ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${analytics.ga4Id}');`}
      </Script>
    </>
  );
}
