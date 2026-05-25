"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronRight,
  Grid3X3,
  List,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import type { Product } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import { ProductCard } from "@/components/product/product-card";
import {
  FilterSidebar,
  type FilterState,
  type FilterBrand,
  type FilterCategory,
} from "@/components/product/filter-sidebar";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

interface ProductListPage {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  meta?: { current_page: number; last_page: number };
}

interface CategoryTranslations {
  products: string;
  showing: string;
  sort: string;
  sort_default: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_newest: string;
  sort_popular: string;
  no_results: string;
  previous: string;
  next: string;
  subcategories: string;
  home: string;
  filter_options: string;
  reset_filter: string;
  categories: string;
  brands: string;
  price: string;
  min_price: string;
  max_price: string;
  rating: string;
  rating_up: string;
  apply_filters: string;
  clear_filters: string;
}

interface CategoryPageClientProps {
  products: Product[];
  categoryName: string;
  categorySlug: string;
  subcategories: Category[];
  brands: FilterBrand[];
  totalPages?: number; // SSR'dan gelir ama infinite scroll kullanmiyor
  totalProducts: number;
  currentPage?: number; // SSR'dan gelir ama infinite scroll kullanmiyor
  perPage: number;
  filterCategoryIds: string[];
  currentSort?: string;
  currentFilters: FilterState;
  translations: CategoryTranslations;
}

const filterTranslationKeys = [
  "filter_options",
  "reset_filter",
  "categories",
  "brands",
  "price",
  "min_price",
  "max_price",
  "rating",
  "rating_up",
  "apply_filters",
  "clear_filters",
] as const;

function pickFilterTranslations(t: CategoryTranslations) {
  const result: Record<string, string> = {};
  for (const key of filterTranslationKeys) {
    result[key] = t[key];
  }
  return result as {
    filter_options: string;
    reset_filter: string;
    categories: string;
    brands: string;
    price: string;
    min_price: string;
    max_price: string;
    rating: string;
    rating_up: string;
    apply_filters: string;
    clear_filters: string;
  };
}

export function CategoryPageClient({
  products,
  categoryName,
  categorySlug,
  subcategories,
  brands,
  totalProducts,
  perPage,
  filterCategoryIds,
  currentSort,
  currentFilters,
  translations: t,
}: CategoryPageClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const basePath = `/kategori/${categorySlug}`;

  // Infinite scroll: SSR ilk sayfayı verir, client devamını paginated fetch eder
  const { getAxiosInstance } = useBaseService<ProductListPage>(API_ENDPOINTS.PRODUCTS);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasNextPageRef = useRef(false);
  const isFetchingNextPageRef = useRef(false);
  const fetchNextPageRef = useRef<() => void>(() => {});

  // queryKey: kategori_id + filter + sort değişince yeniden başla
  const queryKey = [
    "category-products",
    categorySlug,
    filterCategoryIds.join(","),
    currentFilters.brand_id?.join(",") ?? "",
    currentFilters.min_price ?? "",
    currentFilters.max_price ?? "",
    currentFilters.min_rating ?? "",
    currentFilters.has_discount ?? "",
    currentSort ?? "",
  ];

  const productsQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const extraParams = new URLSearchParams();
      extraParams.set("per_page", String(perPage));
      extraParams.set("page", String(pageParam));
      if (currentSort) extraParams.set("sort", currentSort);
      if (currentFilters.min_price) extraParams.set("min_price", currentFilters.min_price);
      if (currentFilters.max_price) extraParams.set("max_price", currentFilters.max_price);
      if (currentFilters.min_rating) extraParams.set("min_rating", currentFilters.min_rating);
      if (currentFilters.has_discount) extraParams.set("has_discount", currentFilters.has_discount);
      filterCategoryIds.forEach((id) => extraParams.append("category_id[]", id));
      currentFilters.brand_id?.forEach((id) => extraParams.append("brand_id[]", id));
      const endpoint = `${API_ENDPOINTS.PRODUCTS}?${extraParams.toString()}`;
      const res = await getAxiosInstance().get(endpoint);
      return res.data as unknown as ProductListPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage?.meta?.current_page ?? lastPage?.current_page ?? 0;
      const last = lastPage?.meta?.last_page ?? lastPage?.last_page ?? 0;
      return current && last && current < last ? current + 1 : undefined;
    },
    initialData:
      products.length > 0
        ? {
            pages: [
              {
                data: products,
                current_page: 1,
                last_page: Math.max(1, Math.ceil(totalProducts / perPage)),
                per_page: perPage,
                total: totalProducts,
                meta: {
                  current_page: 1,
                  last_page: Math.max(1, Math.ceil(totalProducts / perPage)),
                },
              },
            ],
            pageParams: [1],
          }
        : undefined,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    hasNextPageRef.current = productsQuery.hasNextPage ?? false;
    isFetchingNextPageRef.current = productsQuery.isFetchingNextPage;
    fetchNextPageRef.current = productsQuery.fetchNextPage;
  }, [
    productsQuery.fetchNextPage,
    productsQuery.hasNextPage,
    productsQuery.isFetchingNextPage,
  ]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          fetchNextPageRef.current();
        }
      },
      { threshold: 0, rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allProducts =
    productsQuery.data?.pages.flatMap((p) => p?.data ?? []) ?? products;

  function handleSort(sort: string) {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    currentFilters.brand_id?.forEach((id) => params.append("brand_id", id));
    currentFilters.category_id?.forEach((id) => params.append("category_id", id));
    if (currentFilters.min_price)
      params.set("min_price", currentFilters.min_price);
    if (currentFilters.max_price)
      params.set("max_price", currentFilters.max_price);
    if (currentFilters.min_rating)
      params.set("min_rating", currentFilters.min_rating);
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  }

  const filterTranslations = pickFilterTranslations(t);

  const filterCategories: FilterCategory[] = subcategories.map((sub) => ({
    id: sub.id,
    category_name: sub.category_name,
    category_slug: sub.category_slug,
    parent_id: null,
    children: sub.children?.map((child) => ({
      id: child.id,
      category_name: child.category_name,
      category_slug: child.category_slug,
      parent_id: sub.id,
    })),
  }));

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{categoryName}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-normal text-foreground sm:text-3xl">
          {categoryName}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {t.home === "Ana Sayfa"
            ? `${categoryName} kategorisindeki ürünleri, markaları ve güncel fiyat seçeneklerini karşılaştırın.`
            : `Compare products, brands, and current price options in the ${categoryName} category.`}
        </p>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            {t.subcategories}
          </h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/kategori/${sub.category_slug}`}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {sub.category_thumb_url && (
                  <Image
                    src={sub.category_thumb_url}
                    alt={sub.category_name}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                )}
                {sub.category_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Left Sidebar — Filter */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="filter-sidebar-scroll max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            <FilterSidebar
              categories={filterCategories}
              brands={brands}
              currentFilters={currentFilters}
              basePath={basePath}
              translations={filterTranslations}
            />
          </div>
        </aside>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-background px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <div className="lg:hidden">
                <FilterSidebar
                  categories={filterCategories}
                  brands={brands}
                  currentFilters={currentFilters}
                  basePath={basePath}
                  translations={filterTranslations}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t.showing}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={currentSort || ""}
                onChange={(e) => handleSort(e.target.value)}
                className="h-10 rounded-lg border bg-background px-4 text-sm transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">{t.sort_default}</option>
                <option value="newest">{t.sort_newest}</option>
                <option value="popular">{t.sort_popular}</option>
                <option value="price_low_high">{t.sort_price_asc}</option>
                <option value="price_high_low">{t.sort_price_desc}</option>
                <option value="name_asc">A → Z</option>
                <option value="name_desc">Z → A</option>
              </select>

              {/* View toggle */}
              <div className="flex overflow-hidden rounded-lg border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-10 w-10 items-center justify-center transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex h-10 w-10 items-center justify-center transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid / List (infinite scroll) */}
          {allProducts.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                    : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                }
              >
                {allProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    compact
                    variant={viewMode}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div
                ref={sentinelRef}
                className="mt-8 flex min-h-[48px] items-center justify-center"
              >
                {productsQuery.isFetchingNextPage && (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-background py-24 text-center shadow-sm">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">{t.no_results}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
