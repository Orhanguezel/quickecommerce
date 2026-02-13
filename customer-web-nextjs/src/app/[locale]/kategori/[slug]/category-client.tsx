"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Grid3X3,
  List,
  ShoppingBag,
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
  totalPages: number;
  totalProducts: number;
  currentPage: number;
  perPage: number;
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
  totalPages,
  totalProducts,
  currentPage,
  currentSort,
  currentFilters,
  translations: t,
}: CategoryPageClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const basePath = `/kategori/${categorySlug}`;

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (currentSort) params.set("sort", currentSort);
    currentFilters.brand_id?.forEach((id) => params.append("brand_id", id));
    currentFilters.category_id?.forEach((id) => params.append("category_id", id));
    if (currentFilters.min_price)
      params.set("min_price", currentFilters.min_price);
    if (currentFilters.max_price)
      params.set("max_price", currentFilters.max_price);
    if (currentFilters.min_rating)
      params.set("min_rating", currentFilters.min_rating);
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  }

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
                <option value="price_low_high">{t.sort_price_asc}</option>
                <option value="price_high_low">{t.sort_price_desc}</option>
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
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">{t.no_results}</p>
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
