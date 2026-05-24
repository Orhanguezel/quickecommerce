"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import type { Product } from "@/modules/product/product.type";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "./section-header";
import type { Category } from "@/modules/site/site.type";
import { isDisplayableProductCategory, sortCategoriesForNavigation } from "@/modules/site/category-utils";

interface ProductListPage {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  meta?: {
    current_page: number;
    last_page: number;
  };
}

const PER_PAGE = 20;

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function hourlyRotationSeed() {
  return Math.floor(Date.now() / (1000 * 60 * 60));
}

function rotate<T>(items: T[], offset: number): T[] {
  if (!items.length) return items;
  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

export function InfiniteProductsSection({
  title: titleProp,
  categories = [],
}: {
  title?: string | null;
  categories?: Category[];
}) {
  const t = useTranslations("home");
  const { findAll } = useBaseService<ProductListPage>(API_ENDPOINTS.PRODUCTS);
  const title = titleProp || t("all_products_title");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rotatedCategories = rotate(
    categories
      .filter(isDisplayableProductCategory)
      .sort(sortCategoriesForNavigation),
    hourlyRotationSeed()
  );
  const primaryCategoryId = rotatedCategories[0]?.id;

  // Store mutable refs to avoid recreating the IntersectionObserver on every render
  const hasNextPageRef = useRef(false);
  const isFetchingNextPageRef = useRef(false);
  const fetchNextPageRef = useRef<() => void>(() => {});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["home-all-products", primaryCategoryId],
    queryFn: async ({ pageParam }) => {
      const res = await findAll({
        page: pageParam,
        per_page: PER_PAGE,
        ...(primaryCategoryId ? { category_id: [primaryCategoryId] } : {}),
      });
      return res.data as unknown as ProductListPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current =
        lastPage?.meta?.current_page ?? lastPage?.current_page ?? 0;
      const last = lastPage?.meta?.last_page ?? lastPage?.last_page ?? 0;
      return current < last ? current + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    hasNextPageRef.current = hasNextPage ?? false;
    isFetchingNextPageRef.current = isFetchingNextPage;
    fetchNextPageRef.current = fetchNextPage;
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Create IntersectionObserver once and use refs inside the callback
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
  }, []); // Only created once — refs handle freshness

  const allProducts =
    data?.pages.flatMap((page) => (page as ProductListPage).data ?? []) ?? [];

  if (isError) return null;

  return (
    <section className="border-t pt-8">
      <SectionHeader
        title={title}
        subtitle={t("all_products_subtitle")}
        viewAllHref="/urunler"
      />

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}

        {/* Skeleton cards while loading first page */}
        {isLoading &&
          Array.from({ length: 10 }).map((_, i) => (
            <ProductSkeleton key={`skeleton-${i}`} />
          ))}

        {/* Skeleton cards while loading next pages */}
        {isFetchingNextPage &&
          Array.from({ length: 5 }).map((_, i) => (
            <ProductSkeleton key={`next-skeleton-${i}`} />
          ))}
      </div>

      {/* Sentinel + Status area */}
      <div
        ref={sentinelRef}
        className="mt-8 flex min-h-[48px] items-center justify-center"
      >
        {isFetchingNextPage && !isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
        {!hasNextPage && allProducts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("all_products_loaded")}
          </p>
        )}
      </div>
    </section>
  );
}
