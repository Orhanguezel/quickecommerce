"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { Search } from "lucide-react";
import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import { getApiBaseUrl } from "@/lib/api-url";
import { trackViewItemList } from "@/lib/gtm";
import { resolveProductPricing } from "@/lib/product-pricing";

interface SearchTranslations {
  title: string;
  results_for: string;
  no_results: string;
  try_different: string;
  placeholder: string;
  products: string;
  sort: string;
  sort_default: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_newest: string;
  sort_popular: string;
  previous: string;
  next: string;
  search: string;
}

interface SearchPageClientProps {
  products: Product[];
  query: string;
  totalPages: number;
  totalProducts: number;
  suggestedProducts: Product[];
  currentPage: number;
  currentSort?: string;
  translations: SearchTranslations;
}

export function SearchPageClient({
  products,
  query,
  totalPages,
  totalProducts,
  suggestedProducts,
  currentPage,
  currentSort,
  translations: t,
}: SearchPageClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const [searchInput, setSearchInput] = useState(query);
  const trackedSearchRef = useRef<string | null>(null);
  const trackedListRef = useRef<string | null>(null);

  // Bir gecis render'inda totalProducts hala 0 olabilirken listede urun bulunabilir.
  // Rapora giden sayi, ekranda gercekten duran sonucla tutarli olmali.
  const resolvedResultCount = Math.max(totalProducts, products.length);

  const trackSearch = (clickedProductId?: number) => {
    if (!query.trim()) return;
    void fetch(`${getApiBaseUrl()}/search/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-localization": locale,
      },
      body: JSON.stringify({
        term: query,
        results_count: resolvedResultCount,
        ...(clickedProductId ? { clicked_product_id: clickedProductId } : {}),
      }),
      keepalive: true,
    }).catch(() => undefined);
  };

  // Aramayi terim basina bir kez, sonuc sayisi oturduktan sonra kaydet.
  // Anahtar sayiyi icermez: aksi halde ayni arama once 0, sonra gercek sayiyla
  // iki kez kaydediliyor ve "sonucsuz arama" orani sisiyordu.
  useEffect(() => {
    if (!query.trim() || currentPage !== 1) return;
    const key = query.trim().toLocaleLowerCase("tr-TR");
    if (trackedSearchRef.current === key) return;

    const timer = setTimeout(() => {
      trackedSearchRef.current = key;
      trackSearch();
    }, 800);

    return () => clearTimeout(timer);
  }, [query, resolvedResultCount, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const key = `${query}:${currentPage}:${products.map((product) => product.id).join(",")}`;
    if (!products.length || trackedListRef.current === key) return;
    trackedListRef.current = key;
    trackViewItemList(products.map((product) => ({
      item_id: String(product.id),
      item_name: product.name,
      price: resolveProductPricing(product, product.default_variant_id).displayPrice ?? undefined,
      quantity: 1,
    })), `search:${query}`);
  }, [currentPage, products, query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/ara?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  function handleSort(sort: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort) params.set("sort", sort);
    router.push(`/ara?${params.toString()}`);
  }

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (page > 1) params.set("page", String(page));
    if (currentSort) params.set("sort", currentSort);
    return `/ara?${params.toString()}`;
  }

  return (
    <div className="container py-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.placeholder}
            className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>

      {query && (
        <>
          {/* Title + Sort */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                &ldquo;{query}&rdquo; {t.results_for}
              </h1>
              {totalProducts > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {totalProducts} {t.products}
                </p>
              )}
            </div>

            {products.length > 0 && (
              <select
                value={currentSort || ""}
                onChange={(e) => handleSort(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">{t.sort_default}</option>
                <option value="price_low_high">{t.sort_price_asc}</option>
                <option value="price_high_low">{t.sort_price_desc}</option>
                <option value="newest">{t.sort_newest}</option>
                <option value="popular">{t.sort_popular}</option>
              </select>
            )}
          </div>

          {/* Results */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact
                  onProductClick={trackSearch}
                  itemListName={`search:${query}`}
                  itemIndex={(currentPage - 1) * products.length + index}
                />
              ))}
            </div>
          ) : (
            <div className="py-12">
              <div className="mb-8 flex flex-col items-center text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium">{t.no_results}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.try_different}</p>
              </div>
              {suggestedProducts.length > 0 ? (
                <section aria-labelledby="nearby-products-title">
                  <h2 id="nearby-products-title" className="mb-4 text-lg font-semibold">
                    Bunları mı aradınız?
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {suggestedProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        compact
                        onProductClick={trackSearch}
                        itemListName={`search-suggestions:${query}`}
                        itemIndex={index}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
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
                    className={`rounded-md border px-3 py-2 text-sm ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  {t.next}
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
