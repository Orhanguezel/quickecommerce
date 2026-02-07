"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";

interface BrandTranslations {
  products: string;
  sort: string;
  sort_default: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_newest: string;
  sort_popular: string;
  no_results: string;
  previous: string;
  next: string;
  home: string;
}

interface BrandPageClientProps {
  products: Product[];
  brandName: string;
  brandSlug: string;
  totalPages: number;
  totalProducts: number;
  currentPage: number;
  currentSort?: string;
  translations: BrandTranslations;
}

export function BrandPageClient({
  products,
  brandName,
  brandSlug,
  totalPages,
  totalProducts,
  currentPage,
  currentSort,
  translations: t,
}: BrandPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleSort(sort: string) {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (currentSort) params.set("sort", currentSort);
    const query = params.toString();
    return `/marka/${brandSlug}${query ? `?${query}` : ""}`;
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{brandName}</span>
      </nav>

      {/* Title + Sort */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{brandName}</h1>
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
            <option value="price_asc">{t.sort_price_asc}</option>
            <option value="price_desc">{t.sort_price_desc}</option>
            <option value="newest">{t.sort_newest}</option>
            <option value="popular">{t.sort_popular}</option>
          </select>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">{t.no_results}</p>
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
    </div>
  );
}
