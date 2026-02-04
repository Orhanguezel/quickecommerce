
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import {
  useNoticeDetailsService,
  useNoticesQueryService
} from "./notices.service";
import { NoticesQueryOptions } from "./notices.type";

// Hook for Join Request action
export const useNoticesQuery = (
  options: Partial<NoticesQueryOptions>
) => {
  const { findAll } = useNoticesQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.NOTICES_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    NoticesData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useNoticeDetailsQuery = (options: Partial<NoticesQueryOptions>) => {
  const { findAll } = useNoticeDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.NOTICES_DETAILS, options?.id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.id,
  });

  return {
    NoticeDetails: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
