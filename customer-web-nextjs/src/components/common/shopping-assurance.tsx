import { getTranslations } from "next-intl/server";
import { CreditCard, RotateCcw, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

/**
 * Icerik ve kampanya sayfalarinda gercek alisveris guvencesi: iade suresi,
 * odeme isleme bicimi, kargo sureleri ve politika linkleri. Metinler iade /
 * kargo politikasi sayfalariyla ayni kaynaktan (locales `assurance`); kargo
 * bedava esigi aktif kampanyadan okunur, kodda sabit tutar yoktur.
 * (Derin analiz 2026-09-29: blog/kampanya/kupon/iletisim sayfalarinda guvence
 * bilgisi yoktu; onceki "garanti/iade" gecen sablon paragraflari kaldirilinca
 * bu bilgi tamamen kaybolmustu.)
 */
async function getFreeShippingThreshold(locale: string): Promise<number | null> {
  try {
    const res = await fetchAPI<{ free_shipping_min_order_value?: number | string | null }>(
      API_ENDPOINTS.SHIPPING_CAMPAIGNS_ACTIVE,
      {},
      locale,
      600
    );
    const value = Number(res?.free_shipping_min_order_value);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export async function ShoppingAssurance({
  locale,
  className = "",
}: {
  locale: string;
  className?: string;
}) {
  const [t, threshold] = await Promise.all([
    getTranslations({ locale, namespace: "assurance" }),
    getFreeShippingThreshold(locale),
  ]);

  const items = [
    { icon: RotateCcw, title: t("returns_title"), text: t("returns_text") },
    { icon: CreditCard, title: t("payment_title"), text: t("payment_text") },
    {
      icon: Truck,
      title: t("shipping_title"),
      text:
        t("shipping_text") +
        (threshold != null
          ? ` ${t("shipping_free", { amount: threshold.toLocaleString("tr-TR") })}`
          : ""),
    },
  ];

  return (
    <section
      aria-labelledby="shopping-assurance-title"
      className={`container mx-auto px-4 py-8 ${className}`}
    >
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="shopping-assurance-title" className="mb-4 text-lg font-semibold">
          {t("title")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/iade-politikasi" className="text-primary hover:underline">
            {t("returns_link")}
          </Link>
          <Link href="/kargo-politikasi" className="text-primary hover:underline">
            {t("shipping_link")}
          </Link>
          <Link href="/mesafeli-satis-sozlesmesi" className="text-primary hover:underline">
            {t("contract_link")}
          </Link>
        </p>
      </div>
    </section>
  );
}
