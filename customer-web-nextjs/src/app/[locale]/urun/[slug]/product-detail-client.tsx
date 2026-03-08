"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import {
  Star,
  Heart,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  Link2,
  Mail,
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Award,
  Sparkles,
  Flame,
  Clock,
  MapPin,
  Package,
  Ticket,
  Copy,
  Check,
  MessageCircleQuestion,
  Send,
  LogIn,
} from "lucide-react";
import type {
  ProductDetail,
  Product,
  ProductVariant,
} from "@/modules/product/product.type";
import type { ShippingCampaign } from "@/modules/shipping-campaign/shipping-campaign.type";
import type { Banner, BannerGroupedResponse } from "@/modules/banner/banner.type";
import type { PublicCoupon } from "@/modules/coupon/coupon.type";
import { ProductCard } from "@/components/product/product-card";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import {
  useWishlistRemoveMutation,
  useWishlistToggleMutation,
} from "@/modules/wishlist/wishlist.service";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { trackViewItem, trackAddToCart } from "@/lib/gtm";
import {
  useProductQuestionsQuery,
  useAskQuestionMutation,
} from "@/modules/product/product-qa.service";

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
  free_shipping_note: string;
  questions_coming_soon: string;
  ask_seller: string;
  your_question: string;
  send_question: string;
  no_questions: string;
  login_to_ask: string;
  question_sent: string;
  seller_reply: string;
  load_more: string;
  anonymous: string;
  decrease_quantity: string;
  increase_quantity: string;
  facebook: string;
  twitter: string;
  whatsapp: string;
  email: string;
  copy_link: string;
  coupon_code: string;
  apply_coupon: string;
}

interface ProductDetailClientProps {
  product: ProductDetail;
  relatedProducts: Product[];
  shippingCampaigns: ShippingCampaign[];
  banners: BannerGroupedResponse;
  coupons: PublicCoupon[];
  translations: ProductDetailTranslations;
}

/* ── Kuponlar (Hepsiburada tarzı) ── */
function CouponSection({ coupons }: { coupons: PublicCoupon[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Show max 3 coupons
  const visibleCoupons = coupons.slice(0, 3);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <Ticket className="h-4 w-4 text-primary" />
        Kuponlar
      </h3>
      <div className="space-y-2.5">
        {visibleCoupons.map((coupon) => {
          const isPercentage = coupon.discount_type === "percentage";
          const discountLabel = isPercentage
            ? `%${Math.round(coupon.discount)}`
            : `${Math.round(coupon.discount)} TL`;
          const endDate = coupon.end_date
            ? new Date(coupon.end_date)
            : null;
          const endDateText = endDate
            ? `${String(endDate.getDate()).padStart(2, "0")}.${String(endDate.getMonth() + 1).padStart(2, "0")}.${endDate.getFullYear()} ${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`
            : null;

          return (
            <div
              key={coupon.id}
              className="relative overflow-hidden rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30"
            >
              <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-lg font-extrabold text-foreground">
                    {discountLabel}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      {isPercentage ? "indirim" : "indirim"}
                    </span>
                  </p>
                  {coupon.min_order_value != null && coupon.min_order_value > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Alt limit: {Math.round(coupon.min_order_value)} TL
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(coupon.coupon_code, coupon.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-orange-400 bg-white px-3 py-1.5 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-400 dark:hover:bg-orange-900"
                >
                  {copiedId === coupon.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Kodu Al
                    </>
                  )}
                </button>
              </div>
              {endDateText && (
                <div className="border-t border-dashed border-orange-200 px-3.5 py-1.5 dark:border-orange-800">
                  <p className="text-[11px] text-muted-foreground">
                    Geçerlilik {endDateText}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Teslimat Seçenekleri ── */
function DeliveryOptions({
  product,
  isFreeShippingEnabled,
  applicableCampaigns,
  displayPrice,
}: {
  product: ProductDetail;
  isFreeShippingEnabled: boolean;
  applicableCampaigns: ShippingCampaign[];
  displayPrice: number | null;
}) {
  const deliveryMin = product.delivery_time_min ?? 2;
  const deliveryMax = product.delivery_time_max ?? 5;

  // Compute estimated delivery date range
  const estimatedDates = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(minDate.getDate() + Number(deliveryMin));
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + Number(deliveryMax));

    const fmt = (d: Date) => {
      const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
      const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
      return `${d.getDate()} ${months[d.getMonth()]} ${days[d.getDay()]}`;
    };

    return { min: fmt(minDate), max: fmt(maxDate) };
  }, [deliveryMin, deliveryMax]);

  // Check if free shipping applies via campaigns
  const freeShippingCampaign = applicableCampaigns.find(
    (c) => c.min_order_value > 0 && displayPrice != null && displayPrice >= c.min_order_value
  );
  const hasFreeShipping = isFreeShippingEnabled || !!freeShippingCampaign;

  return (
    <div className="mt-5 rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <Truck className="h-4 w-4 text-primary" />
        Teslimat Seçenekleri
      </h3>

      <div className="space-y-3">
        {/* Estimated delivery */}
        <div className="flex items-start gap-3 rounded-md border bg-card px-3 py-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {product.delivery_time_text || (
                <>
                  Tahmini <span className="text-primary">{estimatedDates.min}</span> - <span className="text-primary">{estimatedDates.max}</span> arası kargoda
                </>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Standart Teslimat</p>
          </div>
        </div>

        {/* Free shipping */}
        {hasFreeShipping && (
          <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-900 dark:bg-green-950">
            <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Ücretsiz Kargo
              </p>
              <p className="mt-0.5 text-xs text-green-600/80 dark:text-green-400/70">
                {freeShippingCampaign
                  ? freeShippingCampaign.title
                  : "Bu ürün için kargo ücretsizdir"}
              </p>
            </div>
          </div>
        )}

        {/* Non-free shipping campaign hint */}
        {!hasFreeShipping && applicableCampaigns.length > 0 && (
          <div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5 dark:border-orange-900 dark:bg-orange-950">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                {applicableCampaigns[0].title}
              </p>
              {applicableCampaigns[0].description && (
                <p className="mt-0.5 text-xs text-orange-600/80 dark:text-orange-400/70">
                  {applicableCampaigns[0].description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Nationwide shipping */}
        <div className="flex items-start gap-3 rounded-md border bg-card px-3 py-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Tüm Türkiye&apos;ye Teslimat
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Hızlı ve güvenli kargo ile kapınıza kadar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts,
  shippingCampaigns,
  banners,
  coupons,
  translations: t,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "questions" | "delivery" | "refund"
  >("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );
  const [isWishlisted, setIsWishlisted] = useState(Boolean(product.wishlist));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { productDetailsConfig } = useThemeConfig();
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistToggleMutation();
  const wishlistRemove = useWishlistRemoveMutation();
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  // Q&A
  const [qaPage, setQaPage] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [questionSuccess, setQuestionSuccess] = useState(false);
  const questionsQuery = useProductQuestionsQuery(product.id, qaPage);
  const askQuestionMutation = useAskQuestionMutation();

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      router.push("/giris");
      return;
    }
    if (!questionText.trim()) return;
    const storeId = product.store?.id;
    if (!storeId) return;
    askQuestionMutation.mutate(
      { product_id: product.id, store_id: storeId, question: questionText.trim() },
      {
        onSuccess: () => {
          setQuestionText("");
          setQuestionSuccess(true);
          setTimeout(() => setQuestionSuccess(false), 3000);
        },
      }
    );
  };

  const scrollToQuestions = () => {
    if (!isAuthenticated) {
      router.push("/giris");
      return;
    }
    setActiveTab("questions");
    document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth" });
  };

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

  // GA4: view_item
  useEffect(() => {
    const p = product;
    const itemPrice = p.special_price != null ? Number(p.special_price) : (p.price != null ? Number(p.price) : 0);
    trackViewItem({
      item_id: String(p.id),
      item_name: p.name,
      item_category: p.category?.category_name,
      price: itemPrice,
      quantity: 1,
      ...(p.discount_percentage ? { discount: p.discount_percentage } : {}),
    });
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const price = selectedVariant
    ? Number(selectedVariant.price)
    : product.price != null
      ? Number(product.price)
      : null;

  const specialPrice = selectedVariant?.special_price && Number(selectedVariant.special_price) > 0
    ? Number(selectedVariant.special_price)
    : product.special_price != null && Number(product.special_price) > 0
      ? Number(product.special_price)
      : null;

  const hasSpecialPriceDiscount = specialPrice != null && price != null && specialPrice < price;
  let displayPrice: number | null = hasSpecialPriceDiscount ? specialPrice : price;
  if (displayPrice != null && product.flash_sale && product.flash_sale.discount_amount > 0) {
    const fs = product.flash_sale;
    const fsDiscount =
      fs.discount_type === "percentage"
        ? Math.round((displayPrice * fs.discount_amount) / 100)
        : fs.discount_amount;
    displayPrice = Math.max(0, displayPrice - fsDiscount);
  }
  const hasDiscount = displayPrice != null && price != null && displayPrice < price;
  const savingsAmount = hasDiscount ? Math.round(price! - displayPrice!) : 0;
  const effectiveDiscountPercent = hasDiscount
    ? Math.round(((price! - displayPrice!) / price!) * 100)
    : 0;

  const stock = selectedVariant
    ? selectedVariant.stock_quantity
    : product.stock ?? 0;
  const inStock = stock > 0;

  // "Yeni Ürün" badge: son 30 gün içinde eklenen ürünler
  const isNewProduct = useMemo(() => {
    if (!product.created_at) return false;
    const created = new Date(product.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
  }, [product.created_at]);

  // "Çok Satan" badge: 10+ sipariş alan ürünler
  const isBestSeller = (product.order_count ?? 0) >= 10;

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

  const isChangeOfMindEnabled = product.allow_change_in_mind === 1 || product.allow_change_in_mind === "1";
  const COD_ALLOWED_STORE_TYPES = new Set(["restaurant", "cafe", "fast-food"]);
  const isFoodStore = COD_ALLOWED_STORE_TYPES.has(String(product.store?.store_type ?? "").toLowerCase());
  const isCashOnDeliveryEnabled =
    (product.cash_on_delivery === 1 || product.cash_on_delivery === "1") && isFoodStore;
  const isFreeShippingEnabled = product.free_shipping === 1 || product.free_shipping === "1";
  const infoRows = [
    { label: t.sku, value: selectedVariant?.sku || String(product.id) },
    { label: t.category, value: product.category?.category_name || "-" },
    ...(isChangeOfMindEnabled ? [{ label: t.change_of_mind_allowed, value: t.yes }] : []),
    ...(isCashOnDeliveryEnabled ? [{ label: t.cash_on_delivery, value: t.yes }] : []),
    ...(isFreeShippingEnabled ? [{ label: t.free_shipping, value: t.yes }] : []),
    ...(product.available_time_starts ? [{ label: t.available_start_time, value: product.available_time_starts }] : []),
    ...(product.available_time_ends ? [{ label: t.available_end_time, value: product.available_time_ends }] : []),
  ];

  // Filter applicable shipping campaigns based on product price
  const applicableCampaigns = useMemo(() => {
    if (!shippingCampaigns?.length || displayPrice == null) return [];
    return shippingCampaigns.filter(
      (c) => c.min_order_value <= 0 || displayPrice! >= c.min_order_value
    );
  }, [shippingCampaigns, displayPrice]);

  // Collect all banners into a flat list for product page display
  const applicableBanners = useMemo(() => {
    if (!banners) return [];
    return Object.values(banners)
      .flat()
      .filter((b): b is Banner => b != null && b.status === 1)
      .slice(0, 3);
  }, [banners]);

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

    // GA4: add_to_cart
    trackAddToCart({
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.category?.category_name,
      item_variant: variantOptions.find((v) => v.id === selectedVariant.id)?.text,
      price: displayPrice,
      quantity,
      ...(price && displayPrice < price ? { discount: price - displayPrice } : {}),
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/odeme");
  };

  const tabs = [
    { key: "description" as const, label: t.description, badge: 0 },
    { key: "reviews" as const, label: t.reviews, badge: product.review_count || 0 },
    { key: "questions" as const, label: t.questions, badge: questionsQuery.data?.meta.total || 0 },
    ...(product.specifications?.length > 0
      ? [{ key: "specs" as const, label: t.specifications, badge: 0 }]
      : []),
    ...(productDetailsConfig.isDeliveryEnabled
      ? [{ key: "delivery" as const, label: t.delivery_info, badge: 0 }]
      : []),
    ...(productDetailsConfig.isRefundEnabled
      ? [{ key: "refund" as const, label: t.return_policy, badge: 0 }]
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

  // Lightbox handlers
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev <= 0 ? allImages.length - 1 : prev - 1));
  }, [allImages.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev >= allImages.length - 1 ? 0 : prev + 1));
  }, [allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") lightboxPrev();
      else if (e.key === "ArrowRight") lightboxNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  return (
    <div className="container overflow-x-hidden py-6 lg:py-8">
      {/* Image Lightbox Modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div
            className="relative mx-2 flex max-h-[90vh] w-full max-w-4xl flex-col items-center overflow-hidden rounded-xl bg-white p-2 shadow-2xl sm:mx-4 sm:p-4 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-foreground transition-colors hover:bg-muted"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Thumbnails at top */}
            {allImages.length > 1 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      lightboxIndex === i
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image with nav */}
            <div className="relative flex w-full items-center justify-center px-2 sm:px-12">
              {/* Prev button */}
              {allImages.length > 1 && (
                <button
                  onClick={lightboxPrev}
                  className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-md transition-colors hover:bg-muted"
                  aria-label="Önceki"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div className="relative h-[50vh] w-full max-w-2xl sm:h-[65vh]">
                <Image
                  src={allImages[lightboxIndex]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 95vw, 700px"
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>

              {/* Next button */}
              {allImages.length > 1 && (
                <button
                  onClick={lightboxNext}
                  className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-md transition-colors hover:bg-muted"
                  aria-label="Sonraki"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Image counter */}
            {allImages.length > 1 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {lightboxIndex + 1} / {allImages.length}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 overflow-hidden text-sm text-muted-foreground">
        <Link href="/" className="shrink-0 hover:text-foreground">
          {t.home}
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/kategori/${product.category.category_slug}`}
              className="shrink-0 hover:text-foreground"
            >
              {product.category.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)_minmax(0,320px)]">
        {/* Gallery */}
        <div className="space-y-3 overflow-hidden rounded-lg border bg-card p-2 sm:p-4">
          <div
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-md border bg-muted"
            onClick={() => allImages[normalizedImageIndex] && openLightbox(normalizedImageIndex)}
          >
            {allImages[normalizedImageIndex] ? (
              <Image
                src={allImages[normalizedImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
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

            {/* Badges - stacked vertically */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
              {!!product.is_featured && (
                <span className="flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-700 to-blue-500 px-2 py-1 text-xs font-bold text-white shadow-md sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  Sporcunun Seçimi
                </span>
              )}
              {isBestSeller && (
                <span className="flex items-center gap-1 rounded-md bg-gradient-to-r from-orange-600 to-amber-500 px-2 py-1 text-xs font-bold text-white shadow-md sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm">
                  <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
                  Çok Satan
                </span>
              )}
              {isNewProduct && (
                <span className="flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-500 px-2 py-1 text-xs font-bold text-white shadow-md sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Yeni Ürün
                </span>
              )}
              {hasDiscount && effectiveDiscountPercent > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-gradient-to-r from-red-600 to-red-500 px-2 py-1 text-sm font-bold text-white shadow-md sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-base">
                  {product.flash_sale && (
                    <Zap className="h-3 w-3 fill-white sm:h-4 sm:w-4" />
                  )}
                  %{effectiveDiscountPercent} İndirim
                </span>
              )}
            </div>
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
        <div className="overflow-hidden rounded-lg border bg-card p-4 sm:p-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              {product.name}
            </h1>

            {/* Badges */}
            {(!!product.is_featured || isNewProduct || isBestSeller) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {!!product.is_featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
                    <Award className="h-4 w-4" />
                    Sporcunun Seçimi
                    <ShieldCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  </span>
                )}
                {isBestSeller && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400">
                    <Flame className="h-4 w-4" />
                    Çok Satan
                  </span>
                )}
                {isNewProduct && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    Yeni Ürün
                  </span>
                )}
              </div>
            )}

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
              <span className="text-muted-foreground/40">|</span>
              <button
                onClick={scrollToQuestions}
                className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
              >
                <MessageCircleQuestion className="h-4 w-4" />
                {t.ask_seller}
              </button>
            </div>
          </div>

          {/* Flash Sale Banner */}
          {product.flash_sale && (
            <div className="mt-4 flex flex-wrap items-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-4 py-3 text-white shadow-lg sm:px-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Zap className="h-6 w-6 fill-white" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">
                  Flash Satış
                </span>
                <span className="text-base font-extrabold sm:text-lg">
                  {product.flash_sale.discount_type === "percentage"
                    ? `%${Math.round(product.flash_sale.discount_amount)} İndirim`
                    : `₺${product.flash_sale.discount_amount} İndirim`}
                </span>
              </div>
              {savingsAmount > 0 && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  ₺{savingsAmount} Kazanç
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                {displayPrice != null ? `₺${displayPrice.toFixed(2)}` : ""}
              </span>
              {hasDiscount && price != null && (
                <span className="text-lg text-muted-foreground line-through sm:text-xl">
                  ₺{price.toFixed(2)}
                </span>
              )}
              {hasDiscount && savingsAmount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                  Kazancınız ₺{savingsAmount}
                </span>
              )}
            </div>
            {hasDiscount && effectiveDiscountPercent > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">
                <Zap className="h-4 w-4" />
                %{effectiveDiscountPercent} indirimli fiyat
              </div>
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

          {/* Teslimat Seçenekleri */}
          <DeliveryOptions
            product={product}
            isFreeShippingEnabled={isFreeShippingEnabled}
            applicableCampaigns={applicableCampaigns}
            displayPrice={displayPrice}
          />
        </div>

        {/* Right Sidebar */}
        <aside className="min-w-0 space-y-4">
          {/* Product Discount Highlight */}
          {hasDiscount && effectiveDiscountPercent > 0 && (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">
                    %{effectiveDiscountPercent} İndirim
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/70">
                    ₺{savingsAmount} tasarruf edin
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns */}
          {applicableCampaigns.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <p className="mb-3 text-sm font-bold">Kampanyalar</p>
              <div className="space-y-2">
                {applicableCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-start gap-2.5 rounded-md border px-3 py-2"
                    style={{
                      backgroundColor: campaign.background_color || undefined,
                    }}
                  >
                    <Truck
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: campaign.title_color || "hsl(var(--primary))" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{ color: campaign.title_color || undefined }}
                      >
                        {campaign.title}
                      </p>
                      {campaign.description && (
                        <p
                          className="mt-0.5 text-xs leading-tight text-muted-foreground"
                          style={{ color: campaign.description_color || undefined }}
                        >
                          {campaign.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banners */}
          {applicableBanners.length > 0 && (
            <div className="space-y-2">
              {applicableBanners.map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.redirect_url || "#"}
                  className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
                  style={{
                    backgroundColor: banner.background_color || undefined,
                  }}
                >
                  {banner.thumbnail_image && (
                    <Image
                      src={banner.thumbnail_image}
                      alt={banner.title}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold group-hover:underline"
                      style={{ color: banner.title_color || undefined }}
                    >
                      {banner.title}
                    </p>
                    {banner.description && (
                      <p
                        className="text-xs text-muted-foreground truncate"
                        style={{ color: banner.description_color || undefined }}
                      >
                        {banner.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}

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

            {/* Kupon */}
            {productDetailsConfig.isCouponEnabled && coupons.length > 0 && (() => {
              const themeCouponCode = productDetailsConfig.couponCode;
              const filteredCoupons = themeCouponCode
                ? coupons.filter((c) => c.coupon_code === themeCouponCode)
                : coupons;
              return filteredCoupons.length > 0 ? (
                <div className="mt-4">
                  <CouponSection coupons={filteredCoupons.slice(0, productDetailsConfig.couponCount)} />
                </div>
              ) : null;
            })()}

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
              {isCashOnDeliveryEnabled && (
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
              {isFreeShippingEnabled && (
                <div className="flex items-start gap-3">
                  <PackageCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{t.free_shipping}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.free_shipping_note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Tabs */}
      <div id="product-tabs" className="mt-8">
        <div className="flex overflow-x-auto border-b scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div
              className="prose prose-sm max-w-none overflow-x-auto break-words"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />
          )}

          {activeTab === "specs" && product.specifications?.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
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
            <div className="space-y-6">
              {/* Soru Sorma Formu */}
              <div className="rounded-lg border bg-card p-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder={t.your_question}
                      rows={3}
                      maxLength={1000}
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center justify-between">
                      {questionSuccess && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          {t.question_sent}
                        </span>
                      )}
                      <button
                        onClick={handleAskQuestion}
                        disabled={!questionText.trim() || askQuestionMutation.isPending}
                        className="ml-auto flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        {t.send_question}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push("/giris")}
                    className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <LogIn className="h-4 w-4" />
                    {t.login_to_ask}
                  </button>
                )}
              </div>

              {/* Soru Listesi */}
              {questionsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : questionsQuery.data && questionsQuery.data.questions.length > 0 ? (
                <div className="space-y-4">
                  {questionsQuery.data.questions.map((q) => (
                    <div key={q.id} className="rounded-lg border bg-card">
                      {/* Soru */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <MessageCircleQuestion className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{q.customer || t.anonymous}</span>
                                {q.created_at && (
                                  <span className="text-xs text-muted-foreground">{q.created_at}</span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-foreground">{q.question}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cevap */}
                      {q.reply && (
                        <div className="border-t bg-muted/30 p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                              <Store className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                  {t.seller_reply}
                                </span>
                                {q.replied_at && (
                                  <span className="text-xs text-muted-foreground">{q.replied_at}</span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-foreground">{q.reply}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {questionsQuery.data.meta.current_page < questionsQuery.data.meta.last_page && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setQaPage((p) => p + 1)}
                        className="rounded-md border px-6 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {t.load_more}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t.no_questions}
                </p>
              )}
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

          {activeTab === "delivery" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{productDetailsConfig.deliveryTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {productDetailsConfig.deliverySubtitle}
                  </p>
                </div>
              </div>
              {product.delivery_time_min != null && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{t.delivery_info}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.delivery_time_min}-{product.delivery_time_max} {t.days}
                    </p>
                  </div>
                </div>
              )}
              {(product.free_shipping === 1 || product.free_shipping === "1") && (
                <div className="flex items-start gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-600">{t.free_shipping}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.free_shipping_note}</p>
                  </div>
                </div>
              )}
              {isCashOnDeliveryEnabled && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{t.cash_on_delivery}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.cash_on_delivery_note}</p>
                  </div>
                </div>
              )}
              {productDetailsConfig.deliveryUrl && (
                <Link
                  href={productDetailsConfig.deliveryUrl}
                  className="inline-block text-sm font-medium text-primary hover:underline"
                >
                  {t.delivery_info} →
                </Link>
              )}
            </div>
          )}

          {activeTab === "refund" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <RotateCcw className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{productDetailsConfig.refundTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {productDetailsConfig.refundSubtitle}
                  </p>
                </div>
              </div>
              {isChangeOfMindEnabled && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{t.change_of_mind_allowed}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.yes}</p>
                  </div>
                </div>
              )}
              {product.return_in_days != null && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{t.return_policy}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.return_in_days} {t.days}
                    </p>
                  </div>
                </div>
              )}
              {productDetailsConfig.refundUrl && (
                <Link
                  href={productDetailsConfig.refundUrl}
                  className="inline-block text-sm font-medium text-primary hover:underline"
                >
                  {t.return_policy} →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-6 text-xl font-bold">{productDetailsConfig.relatedTitle || t.related_products}</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {relatedProducts.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
