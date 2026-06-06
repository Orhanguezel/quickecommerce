"use client";

import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Grid3X3,
  List,
  Search,
} from "lucide-react";
import type { StoreDetail } from "@/modules/store/store.type";
import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import {
  FilterSidebar,
  type FilterState,
  type FilterBrand,
  type FilterCategory,
  type FilterAttribute,
} from "@/components/product/filter-sidebar";

interface StoreDetailTranslations {
  stores: string;
  details: string;
  all_products: string;
  featured_products: string;
  products: string;
  delivery_time: string;
  delivery_time_min: string;
  open_hours: string;
  closed_day: string;
  contact: string;
  member_since: string;
  started_from: string;
  reviews: string;
  no_products: string;
  home: string;
  add_to_cart: string;
  // Filter + sort + pagination
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
  sort: string;
  sort_default: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_newest: string;
  sort_popular: string;
  previous: string;
  next: string;
  search_placeholder: string;
}

interface StoreDetailClientProps {
  store: StoreDetail;
  slug: string;
  locale: string;
  products: Product[];
  totalPages: number;
  totalProducts: number;
  currentPage: number;
  perPage: number;
  currentSort?: string;
  currentFilters: FilterState;
  currentSearch?: string;
  categories: FilterCategory[];
  brands: FilterBrand[];
  attributes: FilterAttribute[];
  translations: StoreDetailTranslations;
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

function pickFilterTranslations(t: StoreDetailTranslations) {
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

export function StoreDetailClient({
  store,
  slug,
  locale,
  products,
  totalPages,
  totalProducts,
  currentPage,
  perPage,
  currentSort,
  currentFilters,
  currentSearch,
  categories,
  brands,
  attributes,
  translations: t,
}: StoreDetailClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState<string>(currentSearch ?? "");
  const [, startTransition] = useTransition();

  const basePath = `/magaza/${slug}`;

  function buildQuery(overrides: Record<string, string | string[] | undefined> = {}) {
    const params = new URLSearchParams();

    // current filters
    const newSort = overrides.sort !== undefined ? overrides.sort : currentSort;
    const newSearch =
      overrides.search !== undefined ? overrides.search : currentSearch;
    const newPage = overrides.page !== undefined ? overrides.page : undefined;
    const newCats =
      (overrides.category_id as string[] | undefined) ??
      currentFilters.category_id;
    const newBrands =
      (overrides.brand_id as string[] | undefined) ?? currentFilters.brand_id;
    const newMin =
      overrides.min_price !== undefined
        ? (overrides.min_price as string | undefined)
        : currentFilters.min_price;
    const newMax =
      overrides.max_price !== undefined
        ? (overrides.max_price as string | undefined)
        : currentFilters.max_price;
    const newRating =
      overrides.min_rating !== undefined
        ? (overrides.min_rating as string | undefined)
        : currentFilters.min_rating;

    if (newPage && newPage !== "1") params.set("page", String(newPage));
    if (typeof newSort === "string" && newSort) params.set("sort", newSort);
    if (typeof newSearch === "string" && newSearch.trim()) {
      params.set("search", newSearch.trim());
    }
    newCats?.forEach((id) => params.append("category_id", id));
    newBrands?.forEach((id) => params.append("brand_id", id));
    if (newMin) params.set("min_price", newMin);
    if (newMax) params.set("max_price", newMax);
    if (newRating) params.set("min_rating", newRating);

    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  }

  function handleSort(sort: string) {
    startTransition(() => {
      router.push(buildQuery({ sort: sort || undefined, page: undefined }));
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => {
      router.push(
        buildQuery({ search: searchInput || undefined, page: undefined })
      );
    });
  }

  const filterTranslations = pickFilterTranslations(t);

  const formatStartedFrom = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  };

  const featured = store.featured_products ?? [];

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/magazalar" className="hover:text-foreground">
          {t.stores}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary">{store.name}</span>
      </nav>

      {/* ── Hero Banner ── */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-slate-800">
        {store.banner_url && (
          <Image
            src={store.banner_url}
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
        )}

        <div className="relative flex min-h-[220px] items-center justify-between gap-6 p-6 sm:min-h-[260px] sm:p-8 lg:p-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white/10 sm:h-20 sm:w-20">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                {store.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/80">
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {store.phone}
                  </a>
                )}
                {store.email && (
                  <a
                    href={`mailto:${store.email}`}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {store.email}
                  </a>
                )}
              </div>

              {store.address && (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{store.address}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(store.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/20 text-white/20"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-white/70">
                  ({store.total_product})
                </span>
              </div>
            </div>
          </div>

          {store.started_from && (
            <span className="absolute bottom-4 right-6 text-sm text-white/60 sm:bottom-6 sm:right-8">
              {t.started_from}: {formatStartedFrom(store.started_from)}
            </span>
          )}
        </div>
      </div>

      {/* ── Featured Products (yatay kaydirilabilir) ── */}
      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">{t.featured_products}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      )}

      {/* ── Tüm Ürünler: filter + sort + search + grid + pagination ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">{t.all_products}</h2>

        <div className="flex gap-6">
          {/* Left Sidebar — Filter */}
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-1 filter-sidebar-scroll">
              <FilterSidebar
                categories={categories}
                brands={brands}
                attributes={attributes}
                currentFilters={currentFilters}
                basePath={basePath}
                translations={filterTranslations}
              />
            </div>
          </aside>

          {/* Right Content */}
          <div className="min-w-0 flex-1">
            {/* Top bar: search + sort + view */}
            <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-background px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 max-w-md"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.search_placeholder}
                  className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </form>

              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <div className="lg:hidden">
                  <FilterSidebar
                    categories={categories}
                    brands={brands}
                    attributes={attributes}
                    currentFilters={currentFilters}
                    basePath={basePath}
                    translations={filterTranslations}
                  />
                </div>

                {/* Sort */}
                <select
                  value={currentSort || ""}
                  onChange={(e) => handleSort(e.target.value)}
                  className="h-10 rounded-lg border bg-background px-3 text-sm transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
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
                    aria-label="grid"
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
                    aria-label="list"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">{t.showing}</p>

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
                <p className="text-lg text-muted-foreground">{t.no_products}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1.5">
                {currentPage > 1 && (
                  <Link
                    href={buildQuery({ page: String(currentPage - 1) })}
                    className="flex h-10 items-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t.previous}
                  </Link>
                )}

                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={buildQuery({ page: String(pageNum) })}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border hover:bg-muted"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {currentPage < totalPages && (
                  <Link
                    href={buildQuery({ page: String(currentPage + 1) })}
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
      </section>

      {/* perPage var (unused but keeping for parity) */}
      <span className="hidden">{perPage}</span>
    </div>
  );
}
