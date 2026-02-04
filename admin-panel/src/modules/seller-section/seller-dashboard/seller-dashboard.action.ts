
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useSellerDashboardService,
  useSellerOrderGrowthService,
  useSellerOtherSummaryService,
  useSellerSalesService
} from "./seller-dashboard.service";
import { SellerDashboardQueryOptions } from "./seller-dashboard.type";

export const useSellerDashboardQuery = (options: Partial<SellerDashboardQueryOptions>) => {
  const { findAll } = useSellerDashboardService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_DASHBOARD_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
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
    SellerDashboard: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useSellerSalesSummaryQuery = (options: Partial<SellerDashboardQueryOptions>) => {
  const { findAll } = useSellerSalesService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_SALES_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
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
    SellerSalesSummary: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useSellerGrowthOrderQuery = (options: Partial<SellerDashboardQueryOptions>) => {
  const { findAll } = useSellerOrderGrowthService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_ORDER_GROWTH_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
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
    SellerOrderGrowth: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useSellerOtherSummaryQuery = (options: Partial<SellerDashboardQueryOptions>) => {
  const { findAll } = useSellerOtherSummaryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_OTHER_SUMMARY_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
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
    SellerOtherSummary: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

