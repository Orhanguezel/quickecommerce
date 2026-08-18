"use client";

import { useMutation } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

interface SnapshotPayload {
  session_id?: string;
  email?: string;
  currency_code?: string;
  cart_items: Array<{
    product_id: number;
    variant_id?: number | null;
    quantity: number;
    price?: number;
    name?: string;
    image?: string;
    slug?: string;
  }>;
}

export function useCartSnapshotMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CART_SNAPSHOT);
  return useMutation({
    mutationFn: async (data: SnapshotPayload) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.CART_SNAPSHOT, data);
      return res.data;
    },
    // Fire-and-forget semantics — network flakiness shouldn't surface to UI
    retry: false,
  });
}

export function useCartRecoverMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CART_RECOVER);
  return useMutation({
    mutationFn: async (data: { session_id?: string; order_master_id: number }) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.CART_RECOVER, data);
      return res.data;
    },
    retry: false,
  });
}

export function useCartUnsubscribeMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CART_UNSUBSCRIBE);
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.CART_UNSUBSCRIBE, data);
      return res.data;
    },
  });
}
