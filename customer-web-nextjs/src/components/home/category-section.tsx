"use client";

import type { Category } from "@/modules/site/site.type";
import { Link } from "@/i18n/routing";
import Image from "next/image";

interface CategorySectionProps {
  categories: Category[];
}

function CategoryItem({ cat }: { cat: Category }) {
  return (
    <Link
      href={`/kategori/${cat.category_slug}`}
      className="group flex shrink-0 flex-col items-center gap-2 px-3"
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-muted transition-all group-hover:border-primary group-hover:shadow-md sm:h-24 sm:w-24">
        {cat.category_thumb_url ? (
          <Image
            src={cat.category_thumb_url}
            alt={cat.category_name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">
            {cat.category_name.charAt(0)}
          </span>
        )}
      </div>
      <span className="max-w-[96px] truncate text-center text-xs font-medium sm:text-sm">
        {cat.category_name}
      </span>
    </Link>
  );
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (!categories.length) return null;

  return (
    <div className="relative overflow-hidden group/carousel">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling track */}
      <div className="flex w-max animate-marquee group-hover/carousel:[animation-play-state:paused]">
        {categories.map((cat) => (
          <CategoryItem key={`a-${cat.id}`} cat={cat} />
        ))}
        {categories.map((cat) => (
          <CategoryItem key={`b-${cat.id}`} cat={cat} />
        ))}
      </div>
    </div>
  );
}
