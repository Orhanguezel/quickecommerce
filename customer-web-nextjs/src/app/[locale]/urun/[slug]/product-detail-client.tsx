"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import {
  Star,
  Heart,
  Store,
  ChevronRight,
  Link2,
  Mail,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import type {
  ProductDetail,
  Product,
  ProductVariant,
} from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { useLocale } from "next-intl";
import {
  useWishlistRemoveMutation,
  useWishlistToggleMutation,
} from "@/modules/wishlist/wishlist.service";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";

interface ProductDetailTranslations {
  home: string;
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
  no_image: string;
  sku: string;
  category: string;
  stock: string;
  change_of_mind_allowed: string;
  cash_on_delivery: string;
  available_start_time: string;
  available_end_time: string;
  yes: string;
  no: string;
  options: string;
  visit_store: string;
  buy_now: string;
  share_connect: string;
  days: string;
  cash_on_delivery_note: string;
  questions_coming_soon: string;
  anonymous: string;
  decrease_quantity: string;
  increase_quantity: string;
  facebook: string;
  twitter: string;
  whatsapp: string;
  email: string;
  copy_link: string;
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
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "questions"
  >("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );
  const [isWishlisted, setIsWishlisted] = useState(Boolean(product.wishlist));
  const { productDetailsConfig } = useThemeConfig();
  const router = useRouter();
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistToggleMutation();
  const wishlistRemove = useWishlistRemoveMutation();
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  // Track recently viewed
  useEffect(() => {
    addRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.image_url,
      price: product.price != null ? Number(product.price) : null,
      special_price: product.special_price != null ? Number(product.special_price) : null,
      discount_percentage: product.discount_percentage ?? 0,
      rating: product.rating || "0",
      review_count: product.review_count ?? 0,
    });
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // gallery_images_urls is a comma-separated string from the backend, not an array
  const galleryUrls = product.gallery_images_urls
    ? String(product.gallery_images_urls).split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  const allImages = [
    selectedVariant?.image_url,
    product.image_url,
    ...galleryUrls,
  ].filter(Boolean) as string[];

  const normalizedImageIndex = Math.min(
    selectedImage,
    Math.max(allImages.length - 1, 0)
  );

  const infoRows = [
    { label: t.sku, value: selectedVariant?.sku || String(product.id) },
    { label: t.category, value: product.category?.category_name || "-" },
    { label: t.stock, value: String(stock) },
    {
      label: t.change_of_mind_allowed,
      value:
        product.allow_change_in_mind === 1 || product.allow_change_in_mind === "1"
          ? t.yes
          : t.no,
    },
    {
      label: t.cash_on_delivery,
      value:
        product.cash_on_delivery === 1 || product.cash_on_delivery === "1"
          ? t.yes
          : t.no,
    },
    {
      label: t.available_start_time,
      value: product.available_time_starts || "-",
    },
    {
      label: t.available_end_time,
      value: product.available_time_ends || "-",
    },
  ];

  const variantOptions = useMemo(() => {
    return (product.variants ?? []).map((variant) => {
      const text =
        variant.size ||
        variant.color ||
        (variant.attributes ? Object.values(variant.attributes).join(" / ") : "");
      return { id: variant.id, text: text || variant.sku };
    });
  }, [product.variants]);

  const handleAddToCart = () => {
    if (displayPrice == null || !selectedVariant) return;
    const cartItem: CartItem = {
      id: product.id,
      product_id: product.id,
      variant_id: selectedVariant.id,
      store_id: product.store?.id ?? undefined,
      name: product.name,
      slug: product.slug,
      image: selectedVariant.image_url || product.image_url || "",
      price: displayPrice,
      original_price: price ?? undefined,
      quantity,
      max_cart_qty: product.max_cart_qty || 99,
      variant_label: variantOptions.find((v) => v.id === selectedVariant.id)?.text,
    };
    addItem(cartItem);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/odeme");
  };

  const tabs = [
    { key: "description" as const, label: t.description },
    { key: "questions" as const, label: t.questions },
    { key: "reviews" as const, label: t.reviews },
    ...(product.specifications?.length > 0
      ? [{ key: "specs" as const, label: t.specifications }]
      : []),
  ];

  const isWishlistLoading =
    wishlistToggle.isPending || wishlistRemove.isPending;

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      router.push("/giris");
      return;
    }

    const previous = isWishlisted;
    setIsWishlisted(!previous);

    const mutation = previous ? wishlistRemove : wishlistToggle;
    mutation.mutate(product.id, {
      onError: () => {
        setIsWishlisted(previous);
      },
    });
  };

  return (
    <div className="container py-6 lg:py-8 xl:pl-[248px] 2xl:pl-[248px]">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)_320px]">
        {/* Gallery */}
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
            {allImages[normalizedImageIndex] ? (
              <Image
                src={allImages[normalizedImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t.no_image}
              </div>
            )}
            <button
              type="button"
              onClick={handleWishlistClick}
              disabled={isWishlistLoading}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background/95 text-muted-foreground hover:text-foreground"
              aria-label={isWishlisted ? t.remove_from_wishlist : t.add_to_wishlist}
            >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>

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
                  className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded border transition-colors ${
                    selectedImage === i
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground/40"
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
        <div className="rounded-lg border bg-card p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(parseFloat(product.rating || "0"))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || "0.0"} ({product.review_count} {t.reviews})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-bold text-foreground">
              {displayPrice != null ? `₺${displayPrice.toFixed(2)}` : ""}
            </span>
            {hasDiscount && price != null && (
              <span className="text-4xl text-muted-foreground line-through">
                ₺{price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3 border-y py-4">
            {infoRows.map((row) => (
              <p key={row.label} className="text-sm leading-6">
                <span className="font-semibold text-foreground">{row.label}:</span>{" "}
                <span className="text-muted-foreground">{row.value}</span>
              </p>
            ))}
          </div>

          {variantOptions.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">{t.options}</p>
              <div className="flex flex-wrap gap-2">
                {(product.variants ?? []).map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => { setSelectedVariant(variant); setSelectedImage(0); }}
                    className={`rounded px-3 py-1.5 text-sm transition-colors ${
                      selectedVariant?.id === variant.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {variantOptions[idx]?.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-4">
          {product.store && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {product.store.logo ? (
                    <Image
                      src={product.store.logo}
                      alt={product.store.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-primary">{product.store.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(product.store?.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {product.store.total_product} {t.all_products}
                </p>
                <Link
                  href={`/magaza/${product.store.slug}`}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t.visit_store}
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center justify-between rounded-md border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted"
                disabled={quantity <= 1}
                aria-label={t.decrease_quantity}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.max_cart_qty || 99, quantity + 1))
                }
                className="px-3 py-2 hover:bg-muted"
                aria-label={t.increase_quantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4" />
              {t.add_to_cart}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="mt-2 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.buy_now}
            </button>

            <div className="mt-5">
              <p className="text-sm font-semibold">{t.share_connect}</p>
              <div className="mt-3 flex items-center gap-2">
                {[
                  {
                    icon: "/assets/icons/facebook.png",
                    label: t.facebook,
                    buttonClass: "bg-[#1877F2]",
                  },
                  {
                    icon: "/assets/icons/twitter.png",
                    label: t.twitter,
                    buttonClass: "bg-[#1DA1F2]",
                  },
                  {
                    icon: "/assets/icons/whatsapp.png",
                    label: t.whatsapp,
                    buttonClass: "bg-[#25D366]",
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-black/5 transition-opacity hover:opacity-90 ${item.buttonClass}`}
                    aria-label={item.label}
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                    />
                  </button>
                ))}
                {[
                  { icon: Mail, label: t.email },
                  { icon: Link2, label: t.copy_link },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={item.label}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <div className="space-y-4">
              {productDetailsConfig.isDeliveryEnabled && (
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">
                      {productDetailsConfig.deliveryTitle || t.delivery_info}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {productDetailsConfig.deliverySubtitle ||
                        product.delivery_time_text ||
                        (product.delivery_time_min != null &&
                        product.delivery_time_max != null
                          ? `${product.delivery_time_min}-${product.delivery_time_max} ${t.days}`
                          : "")}
                    </p>
                  </div>
                </div>
              )}
              {productDetailsConfig.isRefundEnabled && (
                <div className="flex items-start gap-3">
                  <RotateCcw className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">
                      {productDetailsConfig.refundTitle || t.return_policy}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {productDetailsConfig.refundSubtitle ||
                        product.return_text ||
                        (product.return_in_days
                          ? `${product.return_in_days} ${t.days}`
                          : "")}
                    </p>
                  </div>
                </div>
              )}
              {(product.cash_on_delivery === 1 || product.cash_on_delivery === "1") && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{t.cash_on_delivery}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.cash_on_delivery_note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Tabs */}
      <div className="mt-8">
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

          {activeTab === "questions" && (
            <p className="text-sm text-muted-foreground">
              {t.questions_coming_soon}
            </p>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {product.reviews?.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {review.reviewed_by?.name || t.anonymous}
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
          <h2 className="mb-6 text-xl font-bold">{productDetailsConfig.relatedTitle || t.related_products}</h2>
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
