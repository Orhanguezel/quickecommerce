"use client";

import type { Category } from "@/modules/site/site.type";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useRef, useEffect, useCallback } from "react";

interface CategorySectionProps {
  categories: Category[];
}

function CategoryItem({ cat, targetSlug }: { cat: Category; targetSlug: string }) {
  const bgColor = cat.category_banner || undefined;

  return (
    <Link
      href={`/kategori/${targetSlug}`}
      className="group flex shrink-0 flex-col items-center px-4 sm:px-5"
    >
      <div
        className="flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-muted transition-transform duration-200 group-hover:scale-105 sm:h-[120px] sm:w-[120px]"
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        {cat.category_thumb_url ? (
          <Image
            src={cat.category_thumb_url}
            alt={cat.category_name}
            width={120}
            height={120}
            className="h-[90px] w-[90px] rounded-full object-cover sm:h-[120px] sm:w-[120px]"
          />
        ) : (
          <span className="text-xl font-bold text-foreground sm:text-2xl">
            {cat.category_name.charAt(0)}
          </span>
        )}
      </div>

      <span className="mt-2 line-clamp-2 w-[110px] text-center text-xs font-medium sm:text-sm">
        {cat.category_name}
      </span>
    </Link>
  );
}

export function CategorySection({ categories }: CategorySectionProps) {
  const allCats = categories;
  const hasDirectProducts = (cat: Category) => Number(cat.product_count || 0) > 0;
  const getChildren = (parentId: number) => {
    const flatChildren = allCats.filter((c) => Number(c.parent_id) === Number(parentId));
    if (flatChildren.length > 0) return flatChildren;
    const parent = allCats.find((c) => c.id === parentId);
    return parent?.children ?? [];
  };

  const renderableCategories = allCats
    .filter((c) => c.parent_id === null)
    .map((parent) => {
      const renderableChildren = getChildren(parent.id).filter((child) =>
        hasDirectProducts(child)
      );
      const keep = hasDirectProducts(parent) || renderableChildren.length > 0;
      const targetSlug = hasDirectProducts(parent)
        ? parent.category_slug
        : renderableChildren[0]?.category_slug ?? parent.category_slug;
      return { parent, keep, targetSlug };
    })
    .filter((item) => item.keep);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  // Sonsuz çevrim: scrollLeft yarıyı geçince başa sar
  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isDragging.current || isPaused.current) return;
    el.scrollLeft += 1;
    const half = el.scrollWidth / 2;
    if (el.scrollLeft >= half) {
      el.scrollLeft -= half;
    }
  }, []);

  useEffect(() => {
    autoScrollRef.current = setInterval(tick, 20);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [tick]);

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.pageX;
    dragScrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartX.current) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  if (!categories.length || !renderableCategories.length) return null;

  return (
    <div
      ref={scrollRef}
      className="cursor-grab select-none overflow-hidden active:cursor-grabbing"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => {
        isDragging.current = false;
        isPaused.current = false;
      }}
      onMouseEnter={() => {
        isPaused.current = true;
      }}
    >
      <div className="flex w-max gap-0 py-1">
        {renderableCategories.map((item) => (
          <CategoryItem key={item.parent.id} cat={item.parent} targetSlug={item.targetSlug} />
        ))}
        {renderableCategories.map((item) => (
          <CategoryItem
            key={`dup-${item.parent.id}`}
            cat={item.parent}
            targetSlug={item.targetSlug}
          />
        ))}
      </div>
    </div>
  );
}
