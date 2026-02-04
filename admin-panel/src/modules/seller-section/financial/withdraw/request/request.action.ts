import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RequestFormData } from "./request.schema";
import {
  useRequestAddService,
  useRequestDetailsService,
  useRequestQueryService,
  useWithdrawMethodDropdownQueryService
} from "./request.service";
import { RequestQueryOptions } from "./request.type";

export const useRequestQuery = (options: Partial<RequestQueryOptions>) => {
  const { findAll } = useRequestQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_LIST,  options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id
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
    Requests: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRequestDetailsQueryById = (id: string) => {
  const { find } = useRequestDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_DETAILS, id],
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
    RequestDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useWithdrawMethodDropdownQuery = (options: Partial<RequestQueryOptions>) => {
  const { findAll } = useWithdrawMethodDropdownQueryService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WITHDRAW_METHOD_DROPDOWN],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    WithdrawMethodList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRequestStoreMutation = () => {
  const { create } = useRequestAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: RequestFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.withdrawRequestList);
      } else {
        toast.error(data?.data?.message);
      }
    },
   onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

