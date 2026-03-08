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

function pushDataLayer(event: string, ecommerce: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  // Clear previous ecommerce data to avoid stale values
  (window as any).dataLayer.push({ ecommerce: null });
  (window as any).dataLayer.push({ event, ecommerce });
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
}
