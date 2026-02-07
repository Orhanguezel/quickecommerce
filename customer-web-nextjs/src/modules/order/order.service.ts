"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Order, OrderDetailResponse, OrderListResponse } from "./order.type";

// --- Order List ---

export function useOrderListQuery(params: {
  page?: number;
  status?: string;
  search?: string;
}) {
  const { getAxiosInstance } = useBaseService<Order[]>(API_ENDPOINTS.ORDERS);

  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const res = await getAxiosInstance().get<OrderListResponse>(
        API_ENDPOINTS.ORDERS,
        {
          params: {
            page: params.page ?? 1,
            per_page: 10,
            ...(params.status && { status: params.status }),
            ...(params.search && { search: params.search }),
          },
        }
      );
      return {
        orders: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
        },
      };
    },
  });
}

// --- Order Detail ---

export function useOrderDetailQuery(orderId: number | null) {
  const { getAxiosInstance } = useBaseService<OrderDetailResponse>(
    API_ENDPOINTS.ORDERS
  );

  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await getAxiosInstance().get<OrderDetailResponse>(
        `${API_ENDPOINTS.ORDERS}/${orderId}`
      );
      return res.data;
    },
  });
}

// --- Cancel Order ---

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.ORDER_CANCEL);

  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.ORDER_CANCEL, {
        order_id: orderId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
