"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  CustomerAddress,
  AddressInput,
  CouponCheckInput,
  CouponCheckResponse,
  CreateGatewaySessionResponse,
  PlaceOrderInput,
  PlaceOrderResponse,
  PaymentGateway,
  CheckoutExtraInfoResponse,
} from "./checkout.type";

// --- Address Hooks ---

export function useAddressListQuery() {
  const { getAxiosInstance } = useBaseService<CustomerAddress[]>(
    API_ENDPOINTS.ADDRESS_LIST
  );

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await getAxiosInstance().get<{ data: CustomerAddress[] }>(
        API_ENDPOINTS.ADDRESS_LIST
      );
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.ADDRESS_ADD);

  return useMutation({
    mutationFn: async (data: AddressInput) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.ADDRESS_ADD, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.ADDRESS_UPDATE);

  return useMutation({
    mutationFn: async (data: AddressInput) => {
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.ADDRESS_UPDATE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.ADDRESS_DELETE);

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await getAxiosInstance().delete(
        `${API_ENDPOINTS.ADDRESS_DELETE}/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

// --- Payment Gateways Hook ---

export function usePaymentGatewaysQuery() {
  const { getAxiosInstance } = useBaseService<PaymentGateway[]>(
    API_ENDPOINTS.PAYMENT_GATEWAYS
  );

  return useQuery({
    queryKey: ["payment-gateways"],
    queryFn: async () => {
      const res = await getAxiosInstance().get<{
        paymentGateways: PaymentGateway[];
      }>(API_ENDPOINTS.PAYMENT_GATEWAYS);
      return res.data?.paymentGateways ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

// --- Coupon Hook ---

export function useCheckCouponMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CHECK_COUPON);

  return useMutation({
    mutationFn: async (data: CouponCheckInput) => {
      const res = await getAxiosInstance().post<CouponCheckResponse>(
        API_ENDPOINTS.CHECK_COUPON,
        data
      );
      return res.data;
    },
  });
}

// --- Place Order Hook ---

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.ORDER_CHECKOUT);

  return useMutation({
    mutationFn: async (data: PlaceOrderInput) => {
      const res = await getAxiosInstance().post<PlaceOrderResponse>(
        API_ENDPOINTS.ORDER_CHECKOUT,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCheckoutExtraInfoQuery(productIds: number[]) {
  const { getAxiosInstance } = useBaseService<CheckoutExtraInfoResponse>(
    API_ENDPOINTS.CHECKOUT_EXTRA_INFO
  );
  const sortedProductIds = [...productIds].sort((a, b) => a - b);

  return useQuery({
    queryKey: ["checkout-extra-info", sortedProductIds.join(",")],
    queryFn: async () => {
      const res = await getAxiosInstance().post<CheckoutExtraInfoResponse>(
        API_ENDPOINTS.CHECKOUT_EXTRA_INFO,
        {
          product_ids: sortedProductIds,
        }
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: sortedProductIds.length > 0,
  });
}

// --- Stripe Session Hook ---

export function useCreateStripeSessionMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.STRIPE_SESSION);

  return useMutation({
    mutationFn: async (orderMasterId: number) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.STRIPE_SESSION, {
        order_master_id: orderMasterId,
      });
      return res.data;
    },
  });
}

export function useCreateIyzicoSessionMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.IYZICO_SESSION);

  return useMutation({
    mutationFn: async (orderMasterId: number) => {
      const res = await getAxiosInstance().post<CreateGatewaySessionResponse>(
        API_ENDPOINTS.IYZICO_SESSION,
        {
          order_master_id: orderMasterId,
        }
      );
      return res.data;
    },
  });
}
