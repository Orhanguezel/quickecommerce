import type {
  FlashSaleInfo,
  ProductVariant,
} from "@/modules/product/product.type";

type PriceLike = string | number | null | undefined;

type ProductWithPricing = {
  price?: PriceLike;
  special_price?: PriceLike;
  variants?: ProductVariant[] | null;
  singleVariant?: ProductVariant[] | null;
  default_variant_id?: number | null;
  flash_sale?: FlashSaleInfo | null;
};

function toPositiveNumber(value: PriceLike): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function resolveVariantPricing(
  variant: ProductVariant | null | undefined
): { price: number | null; specialPrice: number | null } | null {
  if (!variant) return null;

  const price = toPositiveNumber(variant.price);
  const specialPrice = toPositiveNumber(variant.special_price);

  if (price == null && specialPrice == null) return null;

  return {
    price: price ?? specialPrice,
    specialPrice:
      price != null && specialPrice != null && specialPrice < price
        ? specialPrice
        : null,
  };
}

function resolveCandidateVariant(
  product: ProductWithPricing,
  variantId?: number | null
): { price: number | null; specialPrice: number | null } | null {
  const variants = [
    ...(product.variants ?? []),
    ...(product.singleVariant ?? []),
  ];

  if (!variants.length) return null;

  const prioritizedIds = [variantId, product.default_variant_id].filter(
    (id): id is number => typeof id === "number" && id > 0
  );

  for (const id of prioritizedIds) {
    const match = variants.find((variant) => variant.id === id);
    const pricing = resolveVariantPricing(match);
    if (pricing) return pricing;
  }

  for (const variant of variants) {
    const pricing = resolveVariantPricing(variant);
    if (pricing) return pricing;
  }

  return null;
}

export function resolveProductPricing(
  product: ProductWithPricing,
  variantId?: number | null
) {
  const variantPricing = resolveCandidateVariant(product, variantId);
  const rootPrice = toPositiveNumber(product.price);
  const rootSpecialPrice = toPositiveNumber(product.special_price);

  const originalPrice =
    variantPricing?.price ??
    rootPrice ??
    variantPricing?.specialPrice ??
    rootSpecialPrice;

  const discountedBasePrice =
    variantPricing?.specialPrice ??
    (originalPrice != null &&
    rootSpecialPrice != null &&
    rootSpecialPrice < originalPrice
      ? rootSpecialPrice
      : null);

  let displayPrice = discountedBasePrice ?? originalPrice;

  if (
    displayPrice != null &&
    product.flash_sale &&
    Number(product.flash_sale.discount_amount) > 0
  ) {
    const flashSaleDiscount =
      product.flash_sale.discount_type === "percentage"
        ? (displayPrice * Number(product.flash_sale.discount_amount)) / 100
        : Number(product.flash_sale.discount_amount);

    displayPrice = Math.max(0, displayPrice - flashSaleDiscount);
  }

  if (displayPrice != null && displayPrice <= 0) {
    displayPrice = null;
  }

  const hasDiscount =
    displayPrice != null &&
    originalPrice != null &&
    displayPrice < originalPrice;

  const discountPercentage =
    hasDiscount && originalPrice! > 0
      ? Math.round(((originalPrice! - displayPrice!) / originalPrice!) * 100)
      : 0;

  return {
    originalPrice,
    discountedBasePrice,
    displayPrice,
    hasDiscount,
    discountPercentage,
  };
}
