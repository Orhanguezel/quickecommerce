import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useAdminDashboardService,
  useAdminOrderGrowthService,
  useAdminOtherSummaryService,
  useAdminSalesService,
  useStoreTypeListService,
} from "./admin-dashboard.service";
import { AdminDashboardQueryOptions } from "./admin-dashboard.type";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

export const useAdminDashboardQuery = (
  options: Partial<AdminDashboardQueryOptions>
) => {
  const { findAll } = useAdminDashboardService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_DASHBOARD_LIST],
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
    AdminDashboard: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useAdminSalesSummaryQuery = (
  options: Partial<AdminDashboardQueryOptions>
) => {
  const { findAll } = useAdminSalesService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SALES_LIST],
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
    AdminSalesSummary: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useAdminGrowthOrderQuery = (
  options: Partial<AdminDashboardQueryOptions>
) => {
  const { findAll } = useAdminOrderGrowthService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ORDER_GROWTH_LIST],
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
    AdminOrderGrowth: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useAdminOtherSummaryQuery = (
  options: Partial<AdminDashboardQueryOptions>
) => {
  const { findAll } = useAdminOtherSummaryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_OTHER_SUMMARY_LIST],
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
    AdminOtherSummary: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};




export const useStoreTypeListQuery = (options: Partial<AdminDashboardQueryOptions>) => {
    const { findAll } = useStoreTypeListService();
    const { data, isPending, error, refetch, isFetching } = useQuery({
        queryKey: [API_ENDPOINTS.STORE_TYPE_LIST],
        queryFn: () => findAll(options),
        ...options,
    });
    return {
        Stype: data?.data ?? [],
        error,
        isPending,
        refetch,
        isFetching,
    };
}; 
