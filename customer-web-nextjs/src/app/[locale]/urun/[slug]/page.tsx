import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { fetchAPI, isMissingResourceError } from "@/lib/api-server";
import { encodeImageUrl } from "@/lib/image-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { ProductDetailResponse } from "@/modules/product/product.type";
import type { ShippingCampaign } from "@/modules/shipping-campaign/shipping-campaign.type";
import type { BannerGroupedResponse } from "@/modules/banner/banner.type";
import type { PublicCoupon } from "@/modules/coupon/coupon.type";
import { resolveProductPricing } from "@/lib/product-pricing";
import { ProductDetailClient } from "./product-detail-client";
import { ProductFaq, buildProductFaq, buildProductFaqJsonLd } from "./product-faq";
import { absoluteUrl, buildPageTitle, buildProductDescription, stripHtml, truncateText, SITE_NAME } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// Meta, Product JSON-LD ve SSS, sayfada gorunen fiyatla ayni cozucuyu
// kullanir. Once ham `special_price || price` okunuyordu; flash sale
// indirimi disarida kaldigi icin ornegin Argivit'te gorunen 765 TL iken
// Google'a 850 TL gidiyordu (derin analiz 2026-09-29, P0).
function resolveSeoPrice(
  product: Parameters<typeof resolveProductPricing>[0]
): number | null {
  return resolveProductPricing(product).displayPrice ?? null;
}

interface CurrencyListItem {
  value: string;
  exchange_rate: number;
  is_default: boolean;
}

interface CurrencyListResponse {
  data?: CurrencyListItem[];
}

const getCurrencyList = cache(async (locale: string): Promise<CurrencyListItem[]> => {
  try {
    const res = await fetchAPI<CurrencyListResponse>(API_ENDPOINTS.CURRENCY_LIST, {}, locale);
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
});

async function getSeoCurrencyCodeAndRates(locale: string) {
  const currencies = await getCurrencyList(locale);
  const defaultCurrency = currencies.find((c) => c.is_default) ?? currencies[0] ?? null;
  const tryCurrency = currencies.find((c) => c.value === "TRY");

  const targetCurrency =
    locale === "tr" ? (tryCurrency ?? defaultCurrency) : defaultCurrency;

  return {
    code: targetCurrency?.value || (locale === "tr" ? "TRY" : "USD"),
    defaultRate: Number(defaultCurrency?.exchange_rate ?? 1),
    targetRate: Number(targetCurrency?.exchange_rate ?? 1),
  };
}

function convertPriceFromDefault(
  amount: number | null,
  defaultRate: number,
  targetRate: number
): number | null {
  if (amount == null || !Number.isFinite(amount)) return null;
  if (!defaultRate || !targetRate) return amount;
  const converted = amount * (targetRate / defaultRate);
  return Number(converted.toFixed(2));
}

function findSpecificationValue(
  specifications: Array<{ name: string; value: string }> | undefined,
  patterns: RegExp[]
) {
  return specifications?.find((spec) =>
    patterns.some((pattern) => pattern.test(spec.name))
  )?.value;
}

async function getShippingCampaigns(locale: string): Promise<ShippingCampaign[]> {
  try {
    const res = await fetchAPI<{ data?: ShippingCampaign[] }>(
      API_ENDPOINTS.SHIPPING_CAMPAIGNS_ACTIVE,
      {},
      locale
    );
    return (res?.data ?? []) as ShippingCampaign[];
  } catch {
    return [];
  }
}

async function getBanners(locale: string): Promise<BannerGroupedResponse> {
  try {
    const res = await fetchAPI<BannerGroupedResponse>(
      API_ENDPOINTS.BANNER_LIST,
      {},
      locale
    );
    return res ?? {};
  } catch {
    return {};
  }
}

async function getActiveCoupons(locale: string): Promise<PublicCoupon[]> {
  try {
    const res = await fetchAPI<{ data?: PublicCoupon[] }>(
      `${API_ENDPOINTS.COUPONS}?per_page=50`,
      {},
      locale
    );
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

async function getProductDetail(slug: string, locale: string) {
  try {
    const res = await fetchAPI<ProductDetailResponse>(
      `${API_ENDPOINTS.PRODUCT_DETAIL}/${slug}`,
      {},
      locale
    );
    return res;
  } catch (err) {
    // Yalniz gercekten olmayan urun 404; gecici API hatasi hata sayfasi (5xx).
    if (isMissingResourceError(err)) return null;
    throw err;
  }
}

const getSiteName = cache(async (locale: string): Promise<string> => {
  try {
    const res = await fetchAPI<{ site_settings?: { com_site_title?: string } }>(
      API_ENDPOINTS.SITE_GENERAL_INFO,
      {},
      locale
    );
    return res?.site_settings?.com_site_title?.trim() || "";
  } catch {
    return "";
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await getProductDetail(slug, locale);

  if (!res?.data) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("no_data") };
  }

  const product = res.data;
  const canonicalSlug = res.canonical_slug || product.slug || slug;
  // "en" locale kaldirildi (2026-07-27): backend hala locales dondurse de
  // (bazi urunlerin EN cevirisi var) yayinlanan tek dil tr. Aksi halde
  // hreflang="en" 308 redirect'e isaret eder — Google'a kirik sinyal.
  const availableLocales = ["tr"];
  const isLocalized = availableLocales.includes(locale);
  const canonicalLocale = isLocalized ? locale : "tr";
  const rawPrice = resolveSeoPrice(product);
  const seoCurrency = await getSeoCurrencyCodeAndRates(locale);
  const price = convertPriceFromDefault(
    rawPrice,
    seoCurrency.defaultRate,
    seoCurrency.targetRate
  );
  // Baslik/aciklama SEO katalogu bulgulari (2026-09-11) icin normalize edilir:
  // 60 karakteri asan basliklar ve 70 karakterin altinda kalan aciklamalar
  // SERP'te kirpiliyor ya da bos kaliyordu.
  const siteName = await getSiteName(locale);
  const title = buildPageTitle([product.meta_title, product.name], siteName);
  const description = buildProductDescription({
    metaDescription: product.meta_description,
    description: product.description,
    name: product.name,
    brand: product.brand?.label,
    category: product.category?.category_name,
    siteName: siteName || product.name,
  });

  return {
    // absolute: layout'taki `%s | ${siteName}` sablonu ikinci kez marka eki
    // ekleyip basligi 60 karakterin uzerine cikariyordu.
    title: { absolute: title },
    description,
    keywords: product.meta_keywords || undefined,
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(`/${canonicalLocale}/urun/${canonicalSlug}`),
      locale: canonicalLocale === "tr" ? "tr_TR" : "en_US",
      siteName: SITE_NAME,
      images: product.meta_image_url || product.image_url
        ? [{ url: encodeImageUrl(product.meta_image_url || product.image_url), width: 800, height: 800, alt: product.name }]
        : undefined,
    },
    alternates: {
      canonical: `/${canonicalLocale}/urun/${canonicalSlug}`,
      languages: Object.fromEntries(
        availableLocales.map((availableLocale) => [
          availableLocale,
          absoluteUrl(`/${availableLocale}/urun/${canonicalSlug}`),
        ])
      ),
    },
    // Pasif urun / kapali magaza: sayfa kullaniciya acik kalir ama indeks
    // adayi olmaz; follow ile icindeki linkler taranmaya devam eder.
    robots:
      isLocalized && res.indexable !== false
        ? undefined
        : { index: false, follow: true },
    other: price
      ? {
          "product:price:amount": String(price),
          "product:price:currency": seoCurrency.code,
        }
      : undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const [res, shippingCampaigns, banners, coupons] = await Promise.all([
    getProductDetail(slug, locale),
    getShippingCampaigns(locale),
    getBanners(locale),
    getActiveCoupons(locale),
  ]);

  if (!res?.data) {
    notFound();
  }

  if (res.canonical_slug && res.canonical_slug !== slug) {
    permanentRedirect(`/${locale}/urun/${encodeURIComponent(res.canonical_slug)}`);
  }
  if (res.locales?.length && !res.locales.includes(locale)) {
    permanentRedirect(`/tr/urun/${encodeURIComponent(res.data.slug)}`);
  }

  const product = res.data;
  const relatedProducts = res.related_products ?? [];
  const t = await getTranslations({ locale, namespace: "product" });

  const rawPrice = resolveSeoPrice(product);
  const seoCurrency = await getSeoCurrencyCodeAndRates(locale);
  const price = convertPriceFromDefault(
    rawPrice,
    seoCurrency.defaultRate,
    seoCurrency.targetRate
  );
  const variantStock = product.variants?.reduce(
    (sum, variant) => sum + Number(variant.stock_quantity || 0),
    0
  );
  const availableStock =
    product.stock != null ? Number(product.stock) : variantStock;
  const hasReviews = Number(product.review_count || 0) > 0 && parseFloat(product.rating) > 0;
  const rawGtin = findSpecificationValue(product.specifications, [
    /^gtin$/i,
    /^ean$/i,
    /^upc$/i,
    /barkod/i,
    /barcode/i,
  ]);
  // Gecersiz barkod yayinlamaktansa hic yayinlamamak: GTIN 8/12/13/14 hane.
  const gtinDigits = rawGtin?.replace(/\s+/g, "");
  const gtin = gtinDigits && /^(\d{8}|\d{12,14})$/.test(gtinDigits) ? gtinDigits : undefined;
  const mpn = findSpecificationValue(product.specifications, [
    // Yalniz acik uretici parca kodu alanlari; "Model" gibi serbest alanlar
    // ("Erkek", "Klasik") MPN diye yayinlanmamali.
    /^mpn$/i,
    /^model (kodu|no|numarası|numarasi)$/i,
    /^(uretici|üretici) (kodu|parça kodu|parca kodu)$/i,
  ]);

  // Kargo ucreti sepete ve adrese gore hesaplanir; dogrulanabilir tek sabit
  // bilgi aktif "X TL uzeri kargo bedava" kampanyasidir. Urun tek basina esigi
  // geciyorsa 0 TL kargo + kargo politikasindaki sureler; aksi halde uydurma
  // ucret basmak yerine alan hic eklenmez. Iade: 14 gun (iade politikasi).
  const freeShippingThreshold = shippingCampaigns
    .map((campaign) => Number(campaign.min_order_value))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b)[0];
  const shippingDetails =
    price != null && freeShippingThreshold != null && rawPrice != null && rawPrice >= freeShippingThreshold
      ? {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: seoCurrency.code },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
          },
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: truncateText(stripHtml(product.description), 1000),
    image: Array.isArray(product.gallery_images_urls)
      ? product.gallery_images_urls
      : product.gallery_images_urls
        ? String(product.gallery_images_urls).split(",").map((url) => url.trim()).filter(Boolean)
        : [product.image_url],
    sku: product.variants?.[0]?.sku || String(product.id),
    ...(gtin ? { gtin } : {}),
    ...(mpn ? { mpn } : {}),
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.label }
      : undefined,
    category: product.category?.category_name,
    offers: {
      "@type": "Offer",
      url: `https://sportoonline.com/${locale}/urun/${slug}`,
      priceCurrency: seoCurrency.code,
      ...(price != null ? { price } : {}),
      // Yalniz gercek kampanya bitisi varsa; her gun kayan "bugun+90"
      // tarihi dogrulanmis bir gecerlilik bilgisi degildi.
      ...(product.flash_sale?.end_time
        ? { priceValidUntil: product.flash_sale.end_time.slice(0, 10) }
        : {}),
      availability:
        availableStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(shippingDetails ? { shippingDetails } : {}),
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
      seller: product.store
        ? { "@type": "Organization", name: product.store.name }
        : undefined,
    },
    aggregateRating:
      hasReviews
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.review_count,
          }
        : undefined,
    review:
      product.reviews?.length > 0
        ? product.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.reviewed_by?.name || "Anonim" },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
            },
            reviewBody: r.review,
          }))
        : undefined,
  };

  // GEO citability + E-E-A-T: sunucuda uretilen, urun verisine dayali SSS.
  const faqItems = buildProductFaq({
    product,
    price,
    currency: seoCurrency.code,
    availableStock: Number(availableStock || 0),
  });
  const faqJsonLd = buildProductFaqJsonLd(faqItems);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "tr" ? "Ana Sayfa" : "Home",
        item: `https://sportoonline.com/${locale}`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.category.category_name,
              item: `https://sportoonline.com/${locale}/kategori/${product.category.category_slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.name,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        shippingCampaigns={shippingCampaigns}
        banners={banners}
        coupons={coupons}
        translations={{
          home: t("home"),
          add_to_cart: t("add_to_cart"),
          add_to_wishlist: t("add_to_wishlist"),
          remove_from_wishlist: t("remove_from_wishlist"),
          in_stock: t("in_stock"),
          stock_supplier_note: t("stock_supplier_note"),
          out_of_stock: t("out_of_stock"),
          preorder: t("preorder"),
          preorder_note: t("preorder_note"),
          preorder_button: t("preorder_button"),
          quantity: t("quantity"),
          description: t("description"),
          reviews: t("reviews"),
          questions: t("questions"),
          related_products: t("related_products"),
          free_shipping: t("free_shipping"),
          rating: t("rating"),
          specifications: t("specifications"),
          delivery_info: t("delivery_info"),
          return_policy: t("return_policy"),
          seller: t("seller"),
          no_reviews: t("no_reviews"),
          all_products: t("all_products"),
          no_image: t("no_image"),
          sku: t("sku"),
          category: t("category"),
          stock: t("stock"),
          change_of_mind_allowed: t("change_of_mind_allowed"),
          cash_on_delivery: t("cash_on_delivery"),
          available_start_time: t("available_start_time"),
          available_end_time: t("available_end_time"),
          yes: t("yes"),
          no: t("no"),
          options: t("options"),
          visit_store: t("visit_store"),
          buy_now: t("buy_now"),
          share_connect: t("share_connect"),
          days: t("days"),
          cash_on_delivery_note: t("cash_on_delivery_note"),
          free_shipping_note: t("free_shipping_note"),
          questions_coming_soon: t("questions_coming_soon"),
          ask_seller: t("ask_seller"),
          your_question: t("your_question"),
          send_question: t("send_question"),
          no_questions: t("no_questions"),
          login_to_ask: t("login_to_ask"),
          question_sent: t("question_sent"),
          seller_reply: t("seller_reply"),
          load_more: t("load_more"),
          anonymous: t("anonymous"),
          decrease_quantity: t("decrease_quantity"),
          increase_quantity: t("increase_quantity"),
          facebook: t("facebook"),
          twitter: t("twitter"),
          whatsapp: t("whatsapp"),
          email: t("email"),
          copy_link: t("copy_link"),
          coupon_code: t("coupon_code"),
          apply_coupon: t("apply_coupon"),
        }}
      />
      <ProductFaq items={faqItems} />
    </>
  );
}
