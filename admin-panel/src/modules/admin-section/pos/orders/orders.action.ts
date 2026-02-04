
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useOrdersQueryService
} from "./orders.service";
import { OrdersQueryOptions } from "./orders.type";

export const useOrdersQuery = (options: Partial<OrdersQueryOptions>) => {
  const { findAll } = useOrdersQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_ORDER_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    Orders: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useOrdersQueryById = (id: string) => {
  const { find } = useOrdersQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_ORDER_DETAILS, id],
    queryFn: () => find(id),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    SellerOrderDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};