import type { ProductDetail } from "@/modules/product/product.type";

/**
 * Urun sayfasi icin sunucuda uretilen SSS blogu.
 *
 * Tanitio SEO katalogu (2026-09-11) urun sayfalarinda uc bagli bulgu verdi:
 *   - GEO "citability: 9/100 · optimal blok 0" — sayfada kendi basina anlam
 *     tasiyan, alintilanabilir paragraf yoktu; HTML agirlikla urun adi, fiyat
 *     ve buton metinlerinden olusuyordu.
 *   - E-E-A-T "faq: Hayir", "trust: Hayir" — iade/kargo/odeme guvencesi
 *     metinleri sekme icinde ve client tarafinda kaliyordu.
 *   - "Icerik durumu: Sinirda" (225-293 kelime).
 *
 * Cevaplar tamamen urun verisinden turetilir; sabit pazarlama metni degildir.
 * Bilgi yoksa o soru hic uretilmez — uydurulmus guvence yazmaktansa soruyu
 * atlamak dogru olan.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Backend bu bayraklari kimi yerde 1/0 sayisi, kimi yerde "1"/"0" metni olarak
 * doner. Duz truthy kontrolu "0" metnini DOGRU sayar — kapida odeme kapaliyken
 * "kapida odeme kullanilabilir" yazardi.
 */
function isEnabled(value: string | number | boolean | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return false;
  return Number(value) === 1;
}

/**
 * Backend bazi metin alanlarini bos yerine "null"/"undefined" STRING'i olarak
 * doner (ilk surumde SSS'de "Garanti bilgisi: null." yaziyordu). Anlamsiz
 * degerleri burada eleriz.
 */
function cleanText(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (/^(null|undefined|-|n\/a)$/i.test(text)) return null;
  return text;
}

/** Cumleleri birlestirirken cift nokta olusmasini onler. */
function asSentence(text: string): string {
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

function formatPrice(value: number | null, currency: string): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export function buildProductFaq(input: {
  product: ProductDetail;
  price: number | null;
  currency: string;
  availableStock: number;
}): FaqItem[] {
  const { product, price, currency, availableStock } = input;
  const name = product.name;
  const items: FaqItem[] = [];

  // 1) Kim satiyor, hangi kategoride, fiyat ve stok durumu ne?
  const sellerName = product.store?.name;
  const categoryName = product.category?.category_name;
  const brandName = product.brand?.label;
  const priceLabel = formatPrice(price, currency);
  if (sellerName || priceLabel) {
    const parts: string[] = [];
    if (sellerName) {
      parts.push(`${name}, ${sellerName} mağazası tarafından satılmaktadır.`);
    }
    if (brandName) parts.push(`Ürünün markası ${brandName}.`);
    if (categoryName) parts.push(`${categoryName} kategorisinde listelenir.`);
    if (priceLabel) {
      parts.push(
        `Güncel satış fiyatı ${priceLabel}; fiyat ve kampanyalar değişebileceği için ürün sayfasındaki değer esastır.`
      );
    }
    parts.push(
      availableStock > 0
        ? "Ürün şu anda stokta ve siparişe açıktır."
        : "Ürün şu anda stokta bulunmamaktadır."
    );
    items.push({
      question: `${name} kim tarafından satılıyor, fiyatı ve stok durumu nedir?`,
      answer: parts.join(" "),
    });
  }

  // 2) Teslimat
  const minDay = Number(product.delivery_time_min ?? 0);
  const maxDay = Number(product.delivery_time_max ?? 0);
  const deliveryParts: string[] = [];
  if (minDay > 0 && maxDay > 0) {
    deliveryParts.push(
      minDay === maxDay
        ? `Sipariş onaylandıktan sonra tahmini teslimat süresi ${minDay} gündür.`
        : `Sipariş onaylandıktan sonra tahmini teslimat süresi ${minDay}-${maxDay} gündür.`
    );
  } else if (cleanText(product.delivery_time_text)) {
    deliveryParts.push(
      `Tahmini teslimat süresi: ${asSentence(cleanText(product.delivery_time_text)!)}`
    );
  }
  if (isEnabled(product.free_shipping)) {
    deliveryParts.push("Bu ürün ücretsiz kargo kapsamındadır.");
  }
  if (isEnabled(product.cash_on_delivery)) {
    deliveryParts.push("Kapıda ödeme seçeneği kullanılabilir.");
  }
  if (deliveryParts.length > 0) {
    deliveryParts.push(
      "Kargo takip bilgisi, ürün kargoya verildiğinde sipariş detay sayfasından ve e-posta ile paylaşılır."
    );
    items.push({
      question: `${name} ne kadar sürede teslim edilir?`,
      answer: deliveryParts.join(" "),
    });
  }

  // 3) Iade / degisim
  const returnDays = Number(product.return_in_days ?? 0);
  const returnParts: string[] = [];
  if (returnDays > 0) {
    returnParts.push(
      `${name} için iade süresi teslimat tarihinden itibaren ${returnDays} gündür.`
    );
  }
  if (isEnabled(product.allow_change_in_mind)) {
    returnParts.push(
      "Cayma hakkı kapsamında, ürün kullanılmamış ve orijinal ambalajındaysa gerekçe belirtmeden iade edilebilir."
    );
  }
  const returnText = cleanText(product.return_text);
  if (returnText) {
    returnParts.push(asSentence(returnText));
  }
  const warranty = cleanText(product.warranty);
  if (warranty) {
    returnParts.push(`Garanti bilgisi: ${asSentence(warranty)}`);
  }
  if (returnParts.length > 0) {
    returnParts.push(
      "İade talebi sipariş detay sayfasından başlatılır; onaylanan iadelerde ödeme, ödemenin yapıldığı yönteme geri aktarılır."
    );
    items.push({
      question: `${name} iade veya değişim yapılabilir mi?`,
      answer: returnParts.join(" "),
    });
  }

  return items;
}

export function buildProductFaqJsonLd(items: FaqItem[]) {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function ProductFaq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="urun-sss-basligi"
      className="container mb-10 mt-2"
    >
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <h2
          id="urun-sss-basligi"
          className="mb-4 text-lg font-bold text-foreground"
        >
          Sıkça Sorulan Sorular
        </h2>
        <dl className="space-y-4">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-semibold text-foreground">
                {item.question}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
