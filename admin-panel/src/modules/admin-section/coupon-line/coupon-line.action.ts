import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  CouponLineFormData
} from "./coupon-line.schema";
import {
  useCouponLineDeleteService,
  useCouponLineEditService,
  useCouponLineQueryService,
  useCouponLineStoreService,
  useCouponLineUpdateService
} from "./coupon-line.service";
import { CouponLineQueryOptions } from "./coupon-line.type";

export const useCouponLineQuery = (
  options: Partial<CouponLineQueryOptions>
) => {
  const { findAll } = useCouponLineQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.COUPON_LINE_LIST],
    queryFn: () => findAll(options),
    ...options,
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
    couponLineList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCouponLineQueryById = (id: string) => {
  const { find } = useCouponLineEditService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.COUPON_LINE_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id, 
  });

  return {
    couponLine: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCouponLineStoreMutation = () => {
  const router = useRouter();
  const { create } = useCouponLineStoreService();
  return useMutation({
    mutationFn: (values: CouponLineFormData) => create(values),
    mutationKey: [API_ENDPOINTS.COUPON_LINE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.couponLineList);
      } else {
        toast.success(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useCouponLineUpdateMutation = () => {
  const router = useRouter();
  const { create } = useCouponLineUpdateService();
  return useMutation({
    mutationFn: (values: CouponLineFormData) => create(values),
    mutationKey: [API_ENDPOINTS.COUPON_LINE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.couponLineList);
      } else {
        toast.success(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useCouponLineDelete = () => {
  const { delete: deleteItem } = useCouponLineDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.COUPON_LINE_DELETE],
    onSuccess: async () => {
      toast.success("Coupon line deleted successfully");
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
