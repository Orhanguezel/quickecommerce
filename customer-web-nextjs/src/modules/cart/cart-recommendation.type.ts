import type { Product } from "@/modules/product/product.type";

/**
 * One recommendation block returned by the API.
 * `type` tells the UI which block template to pick; `title_key` is the
 * i18n key used by the frontend to localize the section header.
 */
export interface CartRecommendationBlock {
  type:
    | "frequently_bought_together"
    | "wishlist_triggered"
    | "category_popular"
    | (string & {});
  title_key: string;
  priority: number;
  meta: Record<string, unknown>;
  products: Product[];
}

export interface CartRecommendationRequest {
  cart_items: Array<{
    product_id: number;
    variant_id?: number | null;
    quantity?: number;
    price?: number;
  }>;
  max_blocks?: number;
  products_per_block?: number;
}

export interface CartRecommendationResponse {
  status: boolean;
  message: string;
  subtotal: number;
  blocks: CartRecommendationBlock[];
}
