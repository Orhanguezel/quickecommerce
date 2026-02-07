import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";
import { BrandPageClient } from "./brand-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

interface Brand {
  id: number;
  value: number;
  label: string;
  slug: string;
}

async function findBrandBySlug(slug: string, locale: string) {
  try {
    const res = await fetchAPI<any>(API_ENDPOINTS.BRANDS, { per_page: 200 }, locale);
    const brands = (res?.data ?? []) as Brand[];
    return brands.find((b) => b.slug === slug) ?? null;
  } catch {
    return null;
  }
}

async function getBrandProducts(slug: string, locale: string, page: number, sort?: string) {
  const brand = await findBrandBySlug(slug, locale);

  if (!brand) {
    return {
      products: [] as Product[],
      totalPages: 0,
      totalProducts: 0,
      brandName: slug.replace(/-/g, " "),
    };
  }

  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.PRODUCTS,
      {
        "brand_id[]": brand.id,
        per_page: 20,
        page,
        ...(sort ? { sort } : {}),
      },
      locale
    );
    return {
      products: (res?.data ?? []) as Product[],
      totalPages: res?.meta?.last_page ?? res?.last_page ?? 1,
      totalProducts: res?.meta?.total ?? res?.total ?? 0,
      brandName: brand.label,
    };
  } catch {
    return {
      products: [] as Product[],
      totalPages: 0,
      totalProducts: 0,
      brandName: brand.label,
    };
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "seo" });
  const data = await getBrandProducts(slug, locale, Number(sp.page) || 1);

  const name = data.brandName;
  const title = t("brand_title", { name });
  const description = t("brand_description", { name });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}/marka/${slug}`,
      languages: {
        tr: `/tr/marka/${slug}`,
        en: `/en/marka/${slug}`,
      },
    },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const sort = sp.sort;

  const data = await getBrandProducts(slug, locale, page, sort);
  const t = await getTranslations({ locale, namespace: "common" });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("home"),
        item: `https://sportoonline.com/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: data.brandName,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BrandPageClient
        products={data.products}
        brandName={data.brandName}
        brandSlug={slug}
        totalPages={data.totalPages}
        totalProducts={data.totalProducts}
        currentPage={page}
        currentSort={sort}
        translations={{
          products: t("products"),
          sort: t("sort"),
          sort_default: t("sort_default"),
          sort_price_asc: t("sort_price_asc"),
          sort_price_desc: t("sort_price_desc"),
          sort_newest: t("sort_newest"),
          sort_popular: t("sort_popular"),
          no_results: t("no_results"),
          previous: t("previous"),
          next: t("next"),
          home: t("home"),
        }}
      />
    </>
  );
}
