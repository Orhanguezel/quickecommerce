# Sporto Online — `add_payment_info` GA4 Event Brief

> Tarih: 2026-06-25 · Repo: quickecommerce (customer-web-nextjs) · Implement: Codex
> Kaynak: ekosistem-sosyal-medya Google Ads/GA4 analizi. GA4 e-ticaret hunisinde **`add_payment_info` adımı eksik** → huni "ödeme bilgisi" basamağında %100 kayıp gösteriyor (oysa satış var: 39 sipariş/28g).

## Sorun
GA4 e-ticaret event'leri kurulu ve çalışıyor: `view_item → add_to_cart → begin_checkout → purchase`. Ama **`add_payment_info` hiç gönderilmiyor** → funnel'da o adım boş, drop-off yanlış görünüyor. Google'ın önerdiği standart e-ticaret hunisinde bu adım olmalı (checkout optimizasyonu + Ads sinyali için).

## Mevcut durum (kod)
- `src/lib/gtm.ts`: `trackViewItem / trackAddToCart / trackViewCart / trackBeginCheckout / trackPurchase` var — **`trackAddPaymentInfo` YOK**.
- `src/app/[locale]/odeme/checkout-client.tsx`:
  - `trackBeginCheckout(...)` sayfa yüklenince atılıyor (≈satır 207).
  - `paymentMethod` state'i var; seçilince **funnel event** `payment_selected` atılıyor (≈satır 231-236, `trackFunnelEvent`) — ama bu iç funnel tracker, GA4 `add_payment_info` DEĞİL.

## Yapılacak (2 küçük adım)

### 1) `src/lib/gtm.ts` — `trackAddPaymentInfo` ekle (trackBeginCheckout kalıbı)
```ts
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
```

### 2) `src/app/[locale]/odeme/checkout-client.tsx` — ödeme yöntemi seçilince ateşle
- importa ekle: `import { trackBeginCheckout, trackPurchase, trackAddPaymentInfo } from "@/lib/gtm";`
- `paymentMethod` seçildiğinde (mevcut `payment_selected` funnel effect'inin yanında), **bir kez** `add_payment_info` gönder:
```ts
// paymentMethod seçilince GA4 add_payment_info (funnel tam olsun)
const paymentInfoSentRef = useRef(false);
useEffect(() => {
  if (!paymentMethod || paymentInfoSentRef.current) return;
  paymentInfoSentRef.current = true;
  trackAddPaymentInfo(
    /* items */  begin_checkout'ta kullanılan items dizisi,
    /* value */  sepet toplam değeri (begin_checkout ile aynı),
    'TRY',
    paymentMethod,           // payment_type
  );
}, [paymentMethod]);
```
> `items` ve `value`'yu `trackBeginCheckout` çağrısındaki aynı kaynaktan al (sepet). Tek sefer atılsın (ref guard) — kullanıcı yöntem değiştirse de tekrar göndermesin (veya değişimde tekrar mantıklıysa guard kaldırılır).

## Doğrulama
- GA4 DebugView / Network `g/collect`: ödeme yöntemi seçilince `en=add_payment_info` (value+items+payment_type ile).
- Birkaç gün sonra GA4 e-ticaret hunisi: `begin_checkout → add_payment_info → purchase` dolu görünmeli (ekosistem `/analytics-ga4` funnel uyarısı kalkar).

## Notlar
- Sadece **frontend (customer-web-nextjs)** değişikliği; backend (Laravel) dokunulmuyor.
- Consent Mode: mevcut `pushDataLayer`/`trackGoogleEvent` consent kalıbı neyse aynısı geçerli (ek consent kontrolü gerekmez — diğer event'lerle aynı yol).
- İlgili ekosistem takip: `ekosistem-sosyal-medya/yapilacak-isler/sportoonline/02-google-ads-kampanya.md` (madde #3).
