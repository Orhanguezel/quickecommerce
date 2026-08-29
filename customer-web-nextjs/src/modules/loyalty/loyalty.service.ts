"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  LoyaltyCampaignResponse,
  LoyaltyInfoResponse,
  LoyaltyRedeemResponse,
  LoyaltyVouchersResponse,
} from "./loyalty.type";

export function useLoyaltyInfoQuery(page = 1, enabled = true) {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.LOYALTY);

  return useQuery({
    queryKey: ["loyalty", page],
    enabled,
    queryFn: async () => {
      const res = await getAxiosInstance().get<LoyaltyInfoResponse>(
        API_ENDPOINTS.LOYALTY,
        { params: { page, per_page: 20 } }
      );
      return res.data;
    },
  });
}

export function useLoyaltyVouchersQuery(enabled = true) {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.LOYALTY_VOUCHERS);

  return useQuery({
    queryKey: ["loyalty-vouchers"],
    enabled,
    queryFn: async () => {
      const res = await getAxiosInstance().get<LoyaltyVouchersResponse>(
        API_ENDPOINTS.LOYALTY_VOUCHERS
      );
      return res.data;
    },
  });
}

export function useLoyaltyRedeemMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.LOYALTY_REDEEM);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (points: number) => {
      const res = await getAxiosInstance().post<LoyaltyRedeemResponse>(
        API_ENDPOINTS.LOYALTY_REDEEM,
        { points }
      );
      return res.data;
    },
    onSuccess: () => {
      // Bakiye ve cek listesi ayni anda degisir; ikisini de tazele.
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-vouchers"] });
    },
  });
}

/**
 * Kampanya bilgisi. Auth gerektirmez, giris yapmamis ziyaretci de gorebilir.
 * Sunucuda 5 dk cache'li; burada da uzun stale suresi verilir.
 */
export function useLoyaltyCampaignQuery() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.LOYALTY_CAMPAIGN);

  return useQuery({
    queryKey: ["loyalty-campaign"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await getAxiosInstance().get<LoyaltyCampaignResponse>(
        API_ENDPOINTS.LOYALTY_CAMPAIGN
      );
      return res.data;
    },
  });
}
