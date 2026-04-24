"use client";

import { useMutation } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

interface ValidateRequest {
  items: Array<{
    product_id: number;
    variant_id?: number | null;
    quantity: number;
    bundle_id?: number | null;
  }>;
}

export interface BundleValidationSummary {
  id: number;
  name: string;
  bundle_price: number;
  standalone_total: number;
  items_in_cart: number;
  items_required: number;
  complete: boolean;
  savings: number;
}

export interface ValidateResponse {
  status: boolean;
  computed_subtotal: number;
  bundles: BundleValidationSummary[];
  line_items: Array<{
    product_id: number;
    variant_id: number | null;
    quantity: number;
    bundle_id: number | null;
    standalone_unit_price: number;
    standalone_line_total: number;
  }>;
}

/**
 * Asks the server to recompute the cart subtotal with authoritative bundle
 * pricing. Frontend should call this right before navigating to checkout
 * and warn if the local subtotal drifts from the server's.
 */
export function useValidateBundlesMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CART_VALIDATE_BUNDLES);
  return useMutation({
    mutationFn: async (data: ValidateRequest) => {
      const res = await getAxiosInstance().post<ValidateResponse>(
        API_ENDPOINTS.CART_VALIDATE_BUNDLES,
        data
      );
      return res.data;
    },
    retry: false,
  });
}
