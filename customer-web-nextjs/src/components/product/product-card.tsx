import type { Product } from "@/modules/product/product.type";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.price != null ? Number(product.price) : null;
  const specialPrice = product.special_price != null ? Number(product.special_price) : null;
  const hasDiscount = specialPrice != null && price != null && specialPrice < price;
  const displayPrice = hasDiscount ? specialPrice : price;

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && product.discount_percentage > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
            -%{Math.round(product.discount_percentage)}
          </span>
        )}

        {/* Flash Sale Badge */}
        {product.flash_sale && (
          <span className="absolute right-2 top-2 rounded-md bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
            Flash
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {parseFloat(product.rating) > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.review_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {displayPrice != null ? `₺${displayPrice.toFixed(2)}` : ""}
          </span>
          {hasDiscount && price != null && (
            <span className="text-xs text-muted-foreground line-through">
              ₺{price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
