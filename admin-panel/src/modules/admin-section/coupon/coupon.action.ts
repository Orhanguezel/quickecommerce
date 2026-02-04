import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CouponQueryOptions } from "./coupon.type";
import {
  useCouponDeleteService,
  useCouponEditService,
  useCouponQueryService,
  useCouponStatusUpdateService,
  useCouponStoreService,
  useCouponUpdateService,
} from "./coupon.service";
import { CouponFormData, couponStatusChange } from "./coupon.schema";
import { useEffect, useRef } from "react";

export const useCouponQuery = (options: Partial<CouponQueryOptions>) => {
  const { findAll } = useCouponQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.COUPON_LIST],
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
    couponList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useCouponQueryById = (id: string) => {
  const { find } = useCouponEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.COUPON_EDIT, id],
    queryFn: () => find(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
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
    coupon: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCouponStoreMutation = () => {
  const router = useRouter();
  const { create } = useCouponStoreService();
  return useMutation({
    mutationFn: (values: CouponFormData) => create(values),
    mutationKey: [API_ENDPOINTS.COUPON_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.couponList);
      } else {
        toast.success(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useCouponUpdateMutation = () => {
  const router = useRouter();
  const { create } = useCouponUpdateService();
  return useMutation({
    mutationFn: (values: CouponFormData) => create(values),
    mutationKey: [API_ENDPOINTS.COUPON_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.couponList);
      } else {
        toast.success(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useCouponStatusChange = () => {
  const { patchItem } = useCouponStatusUpdateService();
  return useMutation({
    mutationFn: (values: couponStatusChange) => patchItem(values),
    mutationKey: [API_ENDPOINTS.COUPON_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useCouponDelete = () => {
  const { delete: deleteItem } = useCouponDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.COUPON_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
