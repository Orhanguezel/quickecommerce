"use client";

import { Link, useRouter } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { ChevronRight, Grid3X3, List, ChevronLeft } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import {
  FilterSidebar,
  type FilterState,
  type FilterBrand,
  type FilterCategory,
  type FilterAttribute,
} from "@/components/product/filter-sidebar";

interface Translations {
  title: string;
  showing: string;
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
  no_products: string;
  home: string;
  sort: string;
  sort_default: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_newest: string;
  sort_popular: string;
  previous: string;
  next: string;
}

interface ProductsPageClientProps {
  products: Product[];
  totalPages: number;
  totalProducts: number;
  currentPage: number;
  perPage: number;
  currentSort?: string;
  currentFilters: FilterState;
  categories: FilterCategory[];
  brands: FilterBrand[];
  attributes: FilterAttribute[];
  translations: Translations;
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

function pickFilterTranslations(t: Translations) {
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

export function ProductsPageClient({
  products,
  totalPages,
  totalProducts,
  currentPage,
  perPage,
  currentSort,
  currentFilters,
  categories,
  brands,
  attributes,
  translations: t,
}: ProductsPageClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (currentSort) params.set("sort", currentSort);
    currentFilters.category_id?.forEach((id) =>
      params.append("category_id", id)
    );
    currentFilters.brand_id?.forEach((id) => params.append("brand_id", id));
    if (currentFilters.min_price)
      params.set("min_price", currentFilters.min_price);
    if (currentFilters.max_price)
      params.set("max_price", currentFilters.max_price);
    if (currentFilters.min_rating)
      params.set("min_rating", currentFilters.min_rating);
    const query = params.toString();
    return `${ROUTES.PRODUCTS}${query ? `?${query}` : ""}`;
  }

  function handleSort(sort: string) {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    currentFilters.category_id?.forEach((id) =>
      params.append("category_id", id)
    );
    currentFilters.brand_id?.forEach((id) => params.append("brand_id", id));
    if (currentFilters.min_price)
      params.set("min_price", currentFilters.min_price);
    if (currentFilters.max_price)
      params.set("max_price", currentFilters.max_price);
    if (currentFilters.min_rating)
      params.set("min_rating", currentFilters.min_rating);
    const query = params.toString();
    router.push(`${ROUTES.PRODUCTS}${query ? `?${query}` : ""}`);
  }

  const filterTranslations = pickFilterTranslations(t);

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Left Sidebar — Filter */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-1 filter-sidebar-scroll">
            <FilterSidebar
              categories={categories}
              brands={brands}
              attributes={attributes}
              currentFilters={currentFilters}
              basePath={ROUTES.PRODUCTS}
              translations={filterTranslations}
            />
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-background px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <div className="lg:hidden">
                <FilterSidebar
                  categories={categories}
                  brands={brands}
                  currentFilters={currentFilters}
                  basePath={ROUTES.PRODUCTS}
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
                <option value="price_asc">{t.sort_price_asc}</option>
                <option value="price_desc">{t.sort_price_desc}</option>
                <option value="newest">{t.sort_newest}</option>
                <option value="popular">{t.sort_popular}</option>
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

          {/* Products Grid / List */}
          {products.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                  : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact
                  variant={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-background py-24 text-center shadow-sm">
              <p className="text-lg text-muted-foreground">{t.no_products}</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1.5">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="flex h-10 items-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.previous}
                </Link>
              )}

              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                let page: number;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }

                return (
                  <Link
                    key={page}
                    href={buildPageUrl(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border hover:bg-muted"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="flex h-10 items-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {t.next}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
