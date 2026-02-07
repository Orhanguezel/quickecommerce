"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store,
  ChevronRight,
} from "lucide-react";
import type {
  ProductDetail,
  Product,
  ProductVariant,
} from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";

interface ProductDetailTranslations {
  add_to_cart: string;
  add_to_wishlist: string;
  remove_from_wishlist: string;
  in_stock: string;
  out_of_stock: string;
  quantity: string;
  description: string;
  reviews: string;
  questions: string;
  related_products: string;
  free_shipping: string;
  rating: string;
  specifications: string;
  delivery_info: string;
  return_policy: string;
  seller: string;
  no_reviews: string;
  all_products: string;
}

interface ProductDetailClientProps {
  product: ProductDetail;
  relatedProducts: Product[];
  translations: ProductDetailTranslations;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  translations: t,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );

  const price = selectedVariant
    ? Number(selectedVariant.price)
    : product.price != null
      ? Number(product.price)
      : null;

  const specialPrice = selectedVariant?.special_price
    ? Number(selectedVariant.special_price)
    : product.special_price != null
      ? Number(product.special_price)
      : null;

  const hasDiscount = specialPrice != null && price != null && specialPrice < price;
  const displayPrice = hasDiscount ? specialPrice : price;

  const stock = selectedVariant
    ? selectedVariant.stock_quantity
    : product.stock ?? 0;
  const inStock = stock > 0;

  const allImages = [
    product.image_url,
    ...(product.gallery_images_urls ?? []),
  ].filter(Boolean);

  const tabs = [
    { key: "description" as const, label: t.description },
    ...(product.specifications?.length > 0
      ? [{ key: "specs" as const, label: t.specifications }]
      : []),
    { key: "reviews" as const, label: `${t.reviews} (${product.review_count})` },
  ];

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/kategori/${product.category.category_slug}`}
              className="hover:text-foreground"
            >
              {product.category.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {allImages[selectedImage] ? (
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}

            {hasDiscount && product.discount_percentage > 0 && (
              <span className="absolute left-3 top-3 rounded-md bg-destructive px-2.5 py-1 text-sm font-semibold text-destructive-foreground">
                -%{Math.round(product.discount_percentage)}
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            {parseFloat(product.rating) > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(parseFloat(product.rating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.review_count} {t.rating})
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              {displayPrice != null ? `₺${displayPrice.toFixed(2)}` : ""}
            </span>
            {hasDiscount && price != null && (
              <span className="text-lg text-muted-foreground line-through">
                ₺{price.toFixed(2)}
              </span>
            )}
            {hasDiscount && product.discount_percentage > 0 && (
              <span className="rounded bg-destructive/10 px-2 py-0.5 text-sm font-semibold text-destructive">
                -%{Math.round(product.discount_percentage)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                inStock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {inStock ? t.in_stock : t.out_of_stock}
            </span>
            {product.brand && (
              <span className="text-sm text-muted-foreground">
                Marka: <strong>{product.brand.label}</strong>
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants?.length > 1 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const variantLabel =
                    variant.size ||
                    variant.color ||
                    (variant.attributes
                      ? Object.values(variant.attributes).join(" / ")
                      : variant.sku);
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {variantLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(
                    Math.min(product.max_cart_qty || 99, quantity + 1)
                  )
                }
                className="px-3 py-2 hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              disabled={!inStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {t.add_to_cart}
            </button>

            <button className="rounded-md border p-2.5 transition-colors hover:bg-muted">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Delivery & Return Info */}
          <div className="space-y-2 rounded-lg border p-4">
            {product.delivery_time_text && (
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>{product.delivery_time_text}</span>
              </div>
            )}
            {product.delivery_time_min != null && product.delivery_time_max != null && !product.delivery_time_text && (
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>{product.delivery_time_min}-{product.delivery_time_max} gün</span>
              </div>
            )}
            {product.return_in_days != null && product.return_in_days > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span>
                  {product.return_text || `${product.return_in_days} gün iade`}
                </span>
              </div>
            )}
            {(product.cash_on_delivery === 1 || product.cash_on_delivery === "1") && (
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span>Kapıda ödeme</span>
              </div>
            )}
          </div>

          {/* Seller Info */}
          {product.store && (
            <Link
              href={`/magaza/${product.store.slug}`}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {product.store.logo ? (
                  <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Store className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{product.store.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.store.total_product} {t.all_products}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />
          )}

          {activeTab === "specs" && product.specifications?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-muted/50" : "bg-background"}
                    >
                      <td className="w-1/3 px-4 py-3 font-medium text-muted-foreground">
                        {spec.name}
                      </td>
                      <td className="px-4 py-3">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {product.reviews?.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {review.reviewed_by?.name || "Anonim"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {review.reviewed_at}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.review}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t.no_reviews}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-6 text-xl font-bold">{t.related_products}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedProducts.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
