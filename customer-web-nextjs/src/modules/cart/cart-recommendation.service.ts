"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  CartRecommendationRequest,
  CartRecommendationResponse,
} from "./cart-recommendation.type";

interface UseCartRecommendationsOptions {
  cartItems: CartRecommendationRequest["cart_items"];
  enabled?: boolean;
  maxBlocks?: number;
  productsPerBlock?: number;
}

/**
 * Stable fingerprint so react-query doesn't refetch when quantities change
 * but products remain the same. Only product_id + variant_id affect which
 * recommendations make sense.
 */
function cartFingerprint(
  items: CartRecommendationRequest["cart_items"]
): string {
  return items
    .map((i) => `${i.product_id}:${i.variant_id ?? 0}`)
    .sort()
    .join(",");
}

export function useCartRecommendations({
  cartItems,
  enabled = true,
  maxBlocks = 3,
  productsPerBlock = 6,
}: UseCartRecommendationsOptions) {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CART_RECOMMENDATIONS);
  const locale = useLocale();
  const fingerprint = cartFingerprint(cartItems);

  return useQuery({
    queryKey: [
      API_ENDPOINTS.CART_RECOMMENDATIONS,
      locale,
      fingerprint,
      maxBlocks,
      productsPerBlock,
    ],
    queryFn: async () => {
      const res = await getAxiosInstance().post<CartRecommendationResponse>(
        API_ENDPOINTS.CART_RECOMMENDATIONS,
        {
          cart_items: cartItems,
          max_blocks: maxBlocks,
          products_per_block: productsPerBlock,
        }
      );
      return res.data;
    },
    enabled: enabled && cartItems.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
