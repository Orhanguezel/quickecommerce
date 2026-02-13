"use client";

import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/modules/site/site.type";

interface Translations {
  home: string;
  all_categories: string;
  shop_now: string;
  no_categories: string;
}

interface CategoriesPageClientProps {
  categories: Category[];
  translations: Translations;
}

function CategoryCard({
  category,
  shopNowLabel,
}: {
  category: Category;
  shopNowLabel: string;
}) {
  return (
    <Link
      href={ROUTES.CATEGORY(category.category_slug)}
      className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md dark:border-border/60 dark:bg-muted/50 dark:hover:border-primary/40 dark:hover:bg-muted/70"
    >
      {/* Image */}
      <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full bg-muted sm:h-[120px] sm:w-[120px]">
        {category.category_thumb_url ? (
          <Image
            src={category.category_thumb_url}
            alt={category.category_name}
            width={120}
            height={120}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <span className="text-3xl font-bold text-muted-foreground">
              {category.category_name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="mt-4 text-center text-sm font-semibold text-foreground sm:text-base">
        {category.category_name}
      </h3>

      {/* Shop Now button */}
      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors group-hover:bg-primary/90 sm:text-sm">
        {shopNowLabel}
      </span>
    </Link>
  );
}

export function CategoriesPageClient({
  categories,
  translations: t,
}: CategoriesPageClientProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-primary">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t.all_categories}</span>
      </nav>

      {/* Title */}
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        {t.all_categories}
      </h1>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            shopNowLabel={t.shop_now}
          />
        ))}
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">{t.no_categories}</p>
        </div>
      )}
    </div>
  );
}
