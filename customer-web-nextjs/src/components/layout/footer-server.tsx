import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { PaymentGateway } from "@/modules/checkout/checkout.type";
import type { FooterContent, SiteSettings } from "@/modules/site/site.type";
import { Footer } from "./footer";

/**
 * Footer'i sunucu tarafinda veriyle besler.
 *
 * Tanitio SEO katalogu (2026-09-11) "Sosyal profil linki: Yok" ve "Iletisim
 * sayfasi linki: Yok" bulgulari verdi. Sebep ayarlarin kapali olmasi degildi —
 * ayarlar acikti; Footer saf client bileseniydi ve React Query verisi ancak
 * hydration sonrasi geliyordu. Sunucudan donen HTML'de footer yalniz logo ve
 * copyright iceriyordu, dolayisiyla tarayici botlari iletisim/sosyal/hizli
 * erisim baglantilarinin hicbirini gormuyordu. Ayni eksiklik Google Merchant
 * "yanlis beyan" cezasinin da ana sebebiydi (iletisim verisi sayfada yok).
 */
async function getFooterData(locale: string): Promise<FooterContent | null> {
  try {
    const res = await fetchAPI<{ data?: { content?: FooterContent } }>(
      API_ENDPOINTS.FOOTER,
      {},
      locale
    );
    return res?.data?.content ?? null;
  } catch {
    return null;
  }
}

async function getSiteInfo(locale: string): Promise<SiteSettings | null> {
  try {
    const res = await fetchAPI<{ site_settings?: SiteSettings }>(
      API_ENDPOINTS.SITE_GENERAL_INFO,
      {},
      locale
    );
    return res?.site_settings ?? null;
  } catch {
    return null;
  }
}

async function getPaymentGateways(locale: string): Promise<PaymentGateway[]> {
  try {
    const res = await fetchAPI<{ paymentGateways?: PaymentGateway[] }>(
      API_ENDPOINTS.PAYMENT_GATEWAYS,
      {},
      locale
    );
    return res?.paymentGateways ?? [];
  } catch {
    return [];
  }
}

export async function FooterServer({ locale }: { locale: string }) {
  const [footerData, siteInfo, paymentGateways] = await Promise.all([
    getFooterData(locale),
    getSiteInfo(locale),
    getPaymentGateways(locale),
  ]);

  return (
    <Footer
      initialFooterData={footerData}
      initialSiteInfo={siteInfo}
      initialPaymentGateways={paymentGateways}
    />
  );
}
