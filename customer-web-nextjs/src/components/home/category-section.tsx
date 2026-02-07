import type { Category } from "@/modules/site/site.type";
import { Link } from "@/i18n/routing";
import Image from "next/image";

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (!categories.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori/${cat.category_slug}`}
          className="group flex shrink-0 flex-col items-center gap-2"
        >
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-muted transition-colors group-hover:border-primary sm:h-24 sm:w-24">
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
      ))}
    </div>
  );
}
