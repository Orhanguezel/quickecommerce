"use client";

import type { Category } from "@/modules/site/site.type";
import { Link } from "@/i18n/routing";
import {
  isDisplayableProductCategory,
  isBuyPayCampaignCategory,
  sortCategoriesForNavigation,
} from "@/modules/site/category-utils";
import Image from "next/image";
import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";

interface CategorySectionProps {
  categories: Category[];
}

function CategoryItem({
  cat,
  targetSlug,
  imageUrl,
}: {
  cat: Category;
  targetSlug: string;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={`/kategori/${targetSlug}`}
      className="group flex w-[96px] shrink-0 flex-col items-center gap-2 px-1 text-center sm:w-[112px]"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-transparent bg-primary/10 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md sm:h-[76px] sm:w-[76px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="104px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Grid3X3 className="h-8 w-8 text-muted-foreground/60" />
          </div>
        )}
      </div>
      <span className="line-clamp-2 min-h-[32px] text-[11px] font-bold leading-snug text-foreground sm:text-xs">
        {cat.category_name}
      </span>
    </Link>
  );
}

export function CategorySection({ categories }: CategorySectionProps) {
  const allCats = categories;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUsableImageUrl = (value?: string | null) =>
    Boolean(value && (/^https?:\/\//.test(value) || value.startsWith("/")));

  const getOwnImageUrl = (category: Category): string | null => {
    if (isUsableImageUrl(category.category_thumb_url)) return category.category_thumb_url;
    if (isUsableImageUrl(category.category_banner)) return category.category_banner;
    if (isUsableImageUrl(category.representative_product_image_url)) {
      return category.representative_product_image_url ?? null;
    }
    return null;
  };

  const renderableCategories = useMemo(() => {
    const categoryById = new Map(allCats.map((category) => [Number(category.id), category]));
    const childrenByParent = new Map<number, Category[]>();
    for (const category of allCats) {
      if (category.parent_id === null) continue;
      const parentId = Number(category.parent_id);
      const children = childrenByParent.get(parentId) ?? [];
      children.push(category);
      childrenByParent.set(parentId, children);
    }
    const getChildren = (parentId: number) =>
      childrenByParent.get(Number(parentId)) ?? categoryById.get(Number(parentId))?.children ?? [];
    const fallbackImageUrl =
      allCats.map(getOwnImageUrl).find((imageUrl): imageUrl is string => Boolean(imageUrl)) ?? null;

    const hasDisplayableDescendant = (parentId: number, visited = new Set<number>()): boolean => {
      if (visited.has(parentId)) return false;
      visited.add(parentId);
      return getChildren(parentId).some(
        (child) =>
          !isBuyPayCampaignCategory(child) &&
          (isDisplayableProductCategory(child) || hasDisplayableDescendant(child.id, visited))
      );
    };
    const findDescendantImageUrl = (parentId: number, visited = new Set<number>()): string | null => {
      if (visited.has(parentId)) return null;
      visited.add(parentId);
      for (const child of getChildren(parentId)) {
        const image = getOwnImageUrl(child) ?? findDescendantImageUrl(child.id, visited);
        if (image) return image;
      }
      return null;
    };
    const getCategoryImageUrl = (category: Category): string | null => {
      const ownImage = getOwnImageUrl(category);
      if (ownImage) return ownImage;

      const visited = new Set<number>();
      let current = category.parent_id ? categoryById.get(Number(category.parent_id)) : null;
      while (current && !visited.has(current.id)) {
        const parentImage = getOwnImageUrl(current);
        if (parentImage) return parentImage;
        visited.add(current.id);
        current = current.parent_id ? categoryById.get(Number(current.parent_id)) : null;
      }

      return findDescendantImageUrl(category.id) ?? fallbackImageUrl;
    };

    return allCats
      .filter((category) => category.parent_id === null)
      .filter((parent) => !isBuyPayCampaignCategory(parent))
      .filter(
        (parent) =>
          isDisplayableProductCategory(parent) || hasDisplayableDescendant(parent.id)
      )
      .sort(sortCategoriesForNavigation)
      .map((parent) => ({
        parent,
        targetSlug: parent.category_slug,
        imageUrl: getCategoryImageUrl(parent),
      }));
  }, [allCats]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = Math.max(el.clientWidth * 0.75, 320);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!categories.length || !renderableCategories.length) return null;

  return (
    <div className="relative overflow-hidden px-7 lg:px-8">
      <div
        ref={scrollRef}
        className="scrollbar-hide overflow-x-auto"
      >
        <div className="flex w-max gap-4 py-2 pr-3">
          {renderableCategories.map((item) => (
            <CategoryItem
              key={item.parent.id}
              cat={item.parent}
              targetSlug={item.targetSlug}
              imageUrl={item.imageUrl}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Previous categories"
        className="absolute left-3 top-1/2 z-[90] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-lg transition-colors hover:bg-muted lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Next categories"
        className="absolute right-3 top-1/2 z-[90] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-lg transition-colors hover:bg-muted lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
