"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_STORAGE_KEY = "sportoonline_cookie_consent_v1";
const CONSENT_EVENT = "sportoonline:cookie-consent";

function hasAnalyticsConsent(): boolean {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const stored = JSON.parse(raw) as {
      analytics_granted?: boolean;
      categories?: Record<string, boolean>;
    };
    if (typeof stored.analytics_granted === "boolean") {
      return stored.analytics_granted;
    }
    // Backwards compatibility for consent saved before the explicit flag.
    const choices = Object.values(stored.categories || {});
    return choices.length > 0 && choices.every(Boolean);
  } catch {
    return false;
  }
}

interface AnalyticsScriptsProps {
  gtmId: string;
  gtagIds: string[];
  primaryGtagId: string;
  loadDirectGtagRuntime: boolean;
  googleAdsConversionId: string;
  googleAdsPurchaseLabel: string;
  metaPixelId: string;
}

export function AnalyticsScripts({
  gtmId,
  gtagIds,
  primaryGtagId,
  loadDirectGtagRuntime,
  googleAdsConversionId,
  googleAdsPurchaseLabel,
  metaPixelId,
}: AnalyticsScriptsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => setEnabled(hasAnalyticsConsent());
    update();
    window.addEventListener(CONSENT_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CONSENT_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {gtmId ? (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}

      {primaryGtagId ? (
        <>
          {loadDirectGtagRuntime ? (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
              strategy="afterInteractive"
            />
          ) : null}
          <Script id="ga-script" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});gtag('js',new Date());${gtagIds.map((id) => `gtag('config','${id}');`).join("")}window.__GOOGLE_ADS_CONVERSION_ID__='${googleAdsConversionId}';window.__GOOGLE_ADS_PURCHASE_LABEL__='${googleAdsPurchaseLabel}';`}
          </Script>
        </>
      ) : null}

      {metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
