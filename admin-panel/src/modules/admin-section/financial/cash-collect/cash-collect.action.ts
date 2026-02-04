import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { CashCollectFormData } from "./cash-collect.schema";
import {
  useCashCollectAddService,
  useCashCollectQueryService,
} from "./cash-collect.service";
import { CashCollectQueryOptions } from "./cash-collect.type";


export const useCashCollectQuery = (
  options: Partial<CashCollectQueryOptions>
) => {
  const { findAll } = useCashCollectQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CASH_COLLECT_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
    CashCollects: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useCashCollectStoreMutation = () => {
  const { create } = useCashCollectAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: CashCollectFormData) => create(values),
    mutationKey: [API_ENDPOINTS.CASH_COLLECT_LIST],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.CashCollectList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
    
      //@ts-ignore
      const errorText = data?.response?.data;
      if (errorText?.order_id) {
        toast.error(errorText?.order_id[0]);
      } 
      if (errorText?.activity_value) {
        toast.error(errorText?.activity_value[0]);
      } 
      else {
        toast.error(errorText?.message);
      }
    },
  });
};
