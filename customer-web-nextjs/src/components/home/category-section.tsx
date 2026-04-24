"use client";

import type { Category } from "@/modules/site/site.type";
import { Link } from "@/i18n/routing";
import {
  isDisplayableProductCategory,
  isBuyPayCampaignCategory,
  sortCategoriesForNavigation,
} from "@/modules/site/category-utils";
import Image from "next/image";
import { useEffect, useRef } from "react";
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
            alt={cat.category_name}
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
  const pauseAutoScrollRef = useRef(false);
  const autoScrollPositionRef = useRef(0);
  const resumeAutoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const fallbackImageUrl =
    allCats.map(getOwnImageUrl).find((imageUrl): imageUrl is string => Boolean(imageUrl)) ??
    null;

  const getParent = (category: Category) =>
    category.parent_id ? allCats.find((cat) => Number(cat.id) === Number(category.parent_id)) : null;

  const getCategoryImageUrl = (category: Category): string | null => {
    const ownImageUrl = getOwnImageUrl(category);
    if (ownImageUrl) return ownImageUrl;

    const visited = new Set<number>();
    let current = getParent(category);
    while (current && !visited.has(current.id)) {
      const parentImageUrl = getOwnImageUrl(current);
      if (parentImageUrl) return parentImageUrl;
      visited.add(current.id);
      current = getParent(current);
    }

    const findDescendantImageUrl = (parentId: number): string | null => {
      for (const child of getChildren(parentId)) {
        const childImage = getOwnImageUrl(child) ?? findDescendantImageUrl(child.id);
        if (childImage) return childImage;
      }
      return null;
    };

    const childImageUrl = findDescendantImageUrl(category.id);
    if (childImageUrl) return childImageUrl;

    const siblingImageUrl = category.parent_id
      ? getChildren(category.parent_id)
          .map(getOwnImageUrl)
          .find((imageUrl): imageUrl is string => Boolean(imageUrl))
      : null;

    return siblingImageUrl ?? fallbackImageUrl;
  };

  const getChildren = (parentId: number) => {
    const flatChildren = allCats.filter((c) => Number(c.parent_id) === Number(parentId));
    if (flatChildren.length > 0) return flatChildren;
    const parent = allCats.find((c) => c.id === parentId);
    return parent?.children ?? [];
  };

  const getDisplayableDescendants = (parentId: number): Category[] =>
    getChildren(parentId)
      .filter((child) => !isBuyPayCampaignCategory(child))
      .sort(sortCategoriesForNavigation)
      .flatMap((child) =>
        isDisplayableProductCategory(child)
          ? [child, ...getDisplayableDescendants(child.id)]
          : getDisplayableDescendants(child.id)
      );

  const renderableCategories = allCats
    .filter((c) => c.parent_id === null)
    .filter((parent) => !isBuyPayCampaignCategory(parent))
    .filter(
      (parent) =>
        isDisplayableProductCategory(parent) ||
        getDisplayableDescendants(parent.id).length > 0
    )
    .sort(sortCategoriesForNavigation)
    .map((parent) => ({
      parent,
      targetSlug: parent.category_slug,
      imageUrl: getCategoryImageUrl(parent),
    }));

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;

    if (resumeAutoScrollTimeoutRef.current) {
      clearTimeout(resumeAutoScrollTimeoutRef.current);
    }
    pauseAutoScrollRef.current = true;

    const loopPoint = el.scrollWidth / 2;
    const amount = Math.max(el.clientWidth * 0.75, 320);
    let target = el.scrollLeft + direction * amount;
    if (loopPoint > el.clientWidth) {
      if (target >= loopPoint) target -= loopPoint;
      if (target < 0) target = Math.max(loopPoint + target, 0);
    }

    el.scrollTo({
      left: target,
      behavior: "smooth",
    });
    autoScrollPositionRef.current = target;

    resumeAutoScrollTimeoutRef.current = setTimeout(() => {
      pauseAutoScrollRef.current = false;
      resumeAutoScrollTimeoutRef.current = null;
    }, 1200);
  };

  const shouldLoop = renderableCategories.length > 8;
  const carouselItems = shouldLoop
    ? [...renderableCategories, ...renderableCategories]
    : renderableCategories;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !shouldLoop) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) return;

    let frameId = 0;
    let lastTime = performance.now();
    autoScrollPositionRef.current = el.scrollLeft;
    const speed = 0.18; // px per ms

    const tick = (time: number) => {
      const delta = Math.min(time - lastTime, 50);
      lastTime = time;

      const loopPoint = el.scrollWidth / 2;
      if (!pauseAutoScrollRef.current && loopPoint > el.clientWidth) {
        autoScrollPositionRef.current += delta * speed;
        if (autoScrollPositionRef.current >= loopPoint) {
          autoScrollPositionRef.current -= loopPoint;
        }
        el.scrollLeft = autoScrollPositionRef.current;
      } else {
        autoScrollPositionRef.current = el.scrollLeft;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      if (resumeAutoScrollTimeoutRef.current) {
        clearTimeout(resumeAutoScrollTimeoutRef.current);
        resumeAutoScrollTimeoutRef.current = null;
      }
    };
  }, [shouldLoop, renderableCategories.length]);

  if (!categories.length || !renderableCategories.length) return null;

  return (
    <div className="relative overflow-hidden px-7 lg:px-8">
      <div
        ref={scrollRef}
        className="scrollbar-hide overflow-x-auto"
        onMouseEnter={() => {
          pauseAutoScrollRef.current = true;
        }}
        onMouseLeave={() => {
          pauseAutoScrollRef.current = false;
        }}
        onFocus={() => {
          pauseAutoScrollRef.current = true;
        }}
        onBlur={() => {
          pauseAutoScrollRef.current = false;
        }}
        onTouchStart={() => {
          pauseAutoScrollRef.current = true;
        }}
        onTouchEnd={() => {
          pauseAutoScrollRef.current = false;
        }}
      >
        <div className="flex w-max gap-4 py-2 pr-3">
          {carouselItems.map((item, index) => (
            <CategoryItem
              key={`${item.parent.id}-${index}`}
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
