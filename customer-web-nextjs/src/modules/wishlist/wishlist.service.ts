"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";

export interface WishlistProduct extends Product {
  price_alert_enabled?: boolean;
  price_alert_email?: boolean;
  price_alert_push?: boolean;
}

interface WishlistResponse {
  wishlist: WishlistProduct[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export function useWishlistQuery(page: number = 1, enabled = true) {
  const { getAxiosInstance } = useBaseService<WishlistResponse>(
    API_ENDPOINTS.WISHLIST_LIST
  );

  return useQuery({
    queryKey: ["wishlist", page],
    enabled,
    queryFn: async () => {
      const res = await getAxiosInstance().get<WishlistResponse>(
        API_ENDPOINTS.WISHLIST_LIST,
        { params: { page, per_page: 12 } }
      );
      return res.data;
    },
  });
}

export function useWishlistToggleMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.WISHLIST_STORE);

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.WISHLIST_STORE, {
        product_id: productId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useWishlistRemoveMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.WISHLIST_REMOVE);

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await getAxiosInstance().put(API_ENDPOINTS.WISHLIST_REMOVE, {
        product_id: productId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useWishlistPriceAlertMutation() {
  const queryClient = useQueryClient();
  const endpoint = "/customer/wish-list/price-alerts";
  const { getAxiosInstance } = useBaseService(endpoint);
  return useMutation({
    mutationFn: async (data: { product_id: number; price_alert_enabled?: boolean; price_alert_email?: boolean; price_alert_push?: boolean }) => {
      const response = await getAxiosInstance().patch(endpoint, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}
