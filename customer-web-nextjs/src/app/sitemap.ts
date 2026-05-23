export const dynamic = 'force-dynamic';

import type { MetadataRoute } from "next";
import axios from "axios";
import {
  isDisplayableProductCategory,
} from "@/modules/site/category-utils";
import type { Category } from "@/modules/site/site.type";
import { SITE_URL, toIsoDate } from "@/lib/seo";

const BASE_URL =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
  "https://sportoonline.com/api/v1";
interface SitemapItem {
  slug: string;
  updatedAt?: string;
}

type SitemapRawItem = Record<string, unknown>;

function normalizeSitemapItem(item: SitemapRawItem): SitemapItem | null {
  const slug =
    item.slug ||
    item.category_slug ||
    item.blog_slug ||
    item.product_slug ||
    item.store_slug;

  if (!slug || typeof slug !== "string") return null;

  const updatedAt =
    typeof item.updated_at === "string"
      ? item.updated_at
      : typeof item.created_at === "string"
        ? item.created_at
        : undefined;

  return { slug, updatedAt };
}

function normalizeLastModified(value: string | undefined, fallback: string): string {
  return (toIsoDate(value) || fallback).slice(0, 10);
}

function encodeSlug(slug: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
}

async function fetchSlugs(endpoint: string): Promise<SitemapItem[]> {
  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { per_page: 1000, language: "tr" },
      timeout: 60000,
    });
    const items = res.data?.data ?? [];
    return items
      .map((item: Record<string, unknown>) => normalizeSitemapItem(item))
      .filter(Boolean) as SitemapItem[];
  } catch {
    return [];
  }
}

async function fetchCategorySlugs(): Promise<SitemapItem[]> {
  try {
    const res = await axios.get(`${BASE_URL}/product-category/list`, {
      params: { per_page: 1000, language: "tr" },
      timeout: 60000,
    });
    const items = (res.data?.data ?? []) as SitemapRawItem[];

    return items
      .filter((item) => isDisplayableProductCategory(item as unknown as Category))
      .map((item) => normalizeSitemapItem(item))
      .filter(Boolean) as SitemapItem[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["tr", "en"];
  const now = new Date().toISOString().slice(0, 10);

  // Static pages
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/yazar/engin-eser", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/kampanyalar", priority: 0.6, changeFrequency: "daily" as const },
    { path: "/magazalar", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/kuponlar", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/hakkimizda", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/iletisim", priority: 0.3, changeFrequency: "monthly" as const },
    {
      path: "/kullanim-kosullari",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/gizlilik-politikasi",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/iade-degisim",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/iade-politikasi",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/kargo-politikasi",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/kargo-teslimat",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/mesafeli-satis-sozlesmesi",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/uye-sozlesmesi",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}${page.path}`])
        ),
      },
    }))
  );

  // Dynamic pages — fetch slugs in parallel
  const [productSlugs, categorySlugs, brandSlugs, blogSlugs, storeSlugs] =
    await Promise.all([
      fetchSlugs("/product-list"),
      fetchCategorySlugs(),
      fetchSlugs("/brand-list"),
      fetchSlugs("/blogs"),
      fetchSlugs("/store-list"),
    ]);

  const dynamicEntries: MetadataRoute.Sitemap = [];

  // Products
  for (const item of productSlugs) {
    const slug = encodeSlug(item.slug);
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/urun/${slug}`,
        lastModified: normalizeLastModified(item.updatedAt, now),
        changeFrequency: "daily",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/urun/${slug}`])
          ),
        },
      });
    }
  }

  // Categories
  for (const item of categorySlugs) {
    const slug = encodeSlug(item.slug);
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/kategori/${slug}`,
        lastModified: normalizeLastModified(item.updatedAt, now),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/kategori/${slug}`])
          ),
        },
      });
    }
  }

  // Brands
  for (const item of brandSlugs) {
    const slug = encodeSlug(item.slug);
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/marka/${slug}`,
        lastModified: normalizeLastModified(item.updatedAt, now),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/marka/${slug}`])
          ),
        },
      });
    }
  }

  // Blog posts
  for (const item of blogSlugs) {
    const slug = encodeSlug(item.slug);
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: normalizeLastModified(item.updatedAt, now),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`])
          ),
        },
      });
    }
  }

  // Stores
  for (const item of storeSlugs) {
    const slug = encodeSlug(item.slug);
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/magaza/${slug}`,
        lastModified: normalizeLastModified(item.updatedAt, now),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/magaza/${slug}`])
          ),
        },
      });
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
