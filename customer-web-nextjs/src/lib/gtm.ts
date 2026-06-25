/**
 * GA4 E-commerce dataLayer helpers
 * Google's recommended e-commerce events via GTM dataLayer
 * @see https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

type GtagItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  discount?: number;
};

type GoogleEventParams = Record<string, string | number | boolean | undefined | null>;

type GtagCommand = [string, string, GoogleEventParams] | [string, Date] | [string, string];
type WindowWithAnalytics = Window & {
  dataLayer?: Array<Record<string, unknown> | GtagCommand>;
  gtag?: (command: string, event: string, params?: GoogleEventParams) => void;
  __GOOGLE_ADS_CONVERSION_ID__?: string;
  __GOOGLE_ADS_PURCHASE_LABEL__?: string;
};

export function analyticsConsentGranted(): boolean {
  if (typeof window === 'undefined') return false;

  const cookieSource = `${document.cookie};`;
  const declinedCookie = /(?:^|;\s*)(sportoonline_cookie_consent|cookie_consent|gdpr_cookie_consent|CookieConsent)=([^;]*)/i.exec(cookieSource);
  const declinedValue = declinedCookie?.[2] ? decodeURIComponent(declinedCookie[2]).toLowerCase() : '';

  if (declinedValue && /decline|denied|reject|false|necessary/.test(declinedValue)) {
    return false;
  }

  try {
    const stored = window.localStorage.getItem('sportoonline_cookie_consent')
      || window.localStorage.getItem('cookie_consent')
      || window.localStorage.getItem('gdpr_cookie_consent');
    if (stored && /decline|denied|reject|false|necessary/i.test(stored)) {
      return false;
    }
  } catch {
    return true;
  }

  return true;
}

function pushDataLayer(event: string, ecommerce: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!analyticsConsentGranted()) return;
  const analyticsWindow = window as WindowWithAnalytics;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  // Clear previous ecommerce data to avoid stale values
  analyticsWindow.dataLayer.push({ ecommerce: null });
  analyticsWindow.dataLayer.push({ event, ecommerce });
}

export function trackGoogleEvent(event: string, params: GoogleEventParams = {}) {
  if (typeof window === 'undefined') return;
  if (!analyticsConsentGranted()) return;

  const analyticsWindow = window as WindowWithAnalytics;
  if (typeof analyticsWindow.gtag === 'function') {
    analyticsWindow.gtag('event', event, params);
    return;
  }

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push({ event, ...params });
}

function trackGoogleAdsPurchase(value: number, currency: string, transactionId: string) {
  if (typeof window === 'undefined') return;
  if (!analyticsConsentGranted()) return;

  const analyticsWindow = window as WindowWithAnalytics;
  const conversionId = analyticsWindow.__GOOGLE_ADS_CONVERSION_ID__;
  const purchaseLabel = analyticsWindow.__GOOGLE_ADS_PURCHASE_LABEL__;

  // Diagnostic — surfaces silent-skip cases to the browser console so admins
  // can verify why Ads conversions aren't firing without needing server access.
  if (typeof analyticsWindow.gtag !== 'function') {
    console.warn('[GoogleAds] gtag() is not available — Ads script may have failed to load.');
    return;
  }
  if (!conversionId || !purchaseLabel) {
    console.warn(
      '[GoogleAds] Purchase conversion skipped — missing configuration.',
      { conversionId: conversionId || '(empty)', purchaseLabel: purchaseLabel || '(empty)' }
    );
    return;
  }

  const sendTo = `${conversionId}/${purchaseLabel}`;
  analyticsWindow.gtag('event', 'conversion', {
    send_to: sendTo,
    value,
    currency,
    transaction_id: transactionId,
  });
  console.info('[GoogleAds] Purchase conversion fired', {
    send_to: sendTo, value, currency, transaction_id: transactionId,
  });
}

export function trackViewItem(item: GtagItem, currency = 'TRY') {
  pushDataLayer('view_item', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackAddToCart(item: GtagItem, currency = 'TRY') {
  pushDataLayer('add_to_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackRemoveFromCart(item: GtagItem, currency = 'TRY') {
  pushDataLayer('remove_from_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackViewCart(items: GtagItem[], value: number, currency = 'TRY') {
  pushDataLayer('view_cart', {
    currency,
    value,
    items,
  });
}

export function trackBeginCheckout(items: GtagItem[], value: number, currency = 'TRY', coupon?: string) {
  pushDataLayer('begin_checkout', {
    currency,
    value,
    ...(coupon ? { coupon } : {}),
    items,
  });
}

export function trackAddPaymentInfo(
  items: GtagItem[],
  value: number,
  currency = 'TRY',
  paymentType?: string,
) {
  pushDataLayer('add_payment_info', {
    currency,
    value,
    ...(paymentType ? { payment_type: paymentType } : {}),
    items,
  });
}

export function trackPurchase(
  transactionId: string,
  items: GtagItem[],
  value: number,
  currency = 'TRY',
  shipping?: number,
  coupon?: string,
) {
  pushDataLayer('purchase', {
    transaction_id: transactionId,
    currency,
    value,
    ...(shipping != null ? { shipping } : {}),
    ...(coupon ? { coupon } : {}),
    items,
  });
  trackGoogleAdsPurchase(value, currency, transactionId);
}
