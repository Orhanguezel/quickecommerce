"use client";

import { useQuery } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  WalletInfoResponse,
  WalletTransactionsResponse,
} from "./wallet.type";

export function useWalletInfoQuery() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.WALLET);

  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res =
        await getAxiosInstance().get<WalletInfoResponse>(API_ENDPOINTS.WALLET);
      return res.data;
    },
  });
}

export function useWalletTransactionsQuery(params: {
  page?: number;
  type?: string;
}) {
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.WALLET_TRANSACTIONS
  );

  return useQuery({
    queryKey: ["wallet-transactions", params],
    queryFn: async () => {
      const res = await getAxiosInstance().get<WalletTransactionsResponse>(
        API_ENDPOINTS.WALLET_TRANSACTIONS,
        {
          params: {
            page: params.page ?? 1,
            per_page: 15,
            ...(params.type && { type: params.type }),
          },
        }
      );
      return {
        transactions: res.data?.wallets ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
        },
      };
    },
  });
}
