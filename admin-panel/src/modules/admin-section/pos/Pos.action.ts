import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import {
  useCouponCheckService,
  usePlaceOrderService,
  usePosCategoryService,
  usePosCustomerListService,
  usePosCustomerStoreService,
  usePosInvoiceService,
  usePosSettingsService,
  useProductDetailsService,
  useProductListService,
} from "./Pos.service";
import { CategoryQueryOptions, ProductQueryOptions } from "./Pos.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { PosCustomerFormData } from "./Pos.schema";

import { keepPreviousData } from "@tanstack/react-query";

export const useProductListQuery = (options: Partial<ProductQueryOptions>) => {
  const { findAll } = useProductListService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_PRODUCT_LIST, options],
    queryFn: () => findAll(options),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,   // ✅ v5 way to keep old data
  });

  return {
    product: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useProductDetailsQueryBySKU = (id: string, locale: string) => {
  const { findPageBySlug } = useProductDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_PRODUCT_DETAILS, id],
    queryFn: () => findPageBySlug(id, { language: locale }),
    refetchOnWindowFocus: false,
    enabled: !!id,
    retry: false,
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
    productdetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const usePosCustomerList = (options: Partial<ProductQueryOptions>) => {
  const { findAll } = usePosCustomerListService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_CUSTOMER_LIST, options],
    queryFn: () => findAll(options),
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    posCustomers: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const usePosCustomerStoreMutation = () => {
  const { create } = usePosCustomerStoreService();
  return useMutation({
    mutationFn: (values: PosCustomerFormData) => create(values),
    mutationKey: [API_ENDPOINTS.POS_CUSTOMER_STORE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data?.message;
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

export const useCouponMutation = () => {
  const { create } = useCouponCheckService();
  return useMutation({
    mutationFn: (values: { coupon_code: string | null; sub_total: string }) =>
      create(values),
    mutationKey: [API_ENDPOINTS.COUPON_CHECK],
    onSuccess: async (data) => {
      toast.success("Coupon applied successfully!");
    },
    onError: async (data: any) => {
      const message = data?.response?.data?.message;
      if (typeof message === "string") {
        toast.error(message);
      } else if (typeof message === "object") {
        const errorMessages = Object.values(message).flat().join("\n");

        toast.error(errorMessages);
      } else {
        toast.error("An unknown error occurred.");
      }
    },
  });
};

export const usePlaceOrderMutation = () => {
  const { create } = usePlaceOrderService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.POS_PLACE_ORDER],
    onSuccess: async (data) => {
      toast.success("Place order successfully!");
    },
    onError: async (data: any) => {
      const message = data?.response?.data?.message;
      if (typeof message === "string") {
        toast.error(message);
      } else if (typeof message === "object") {
        const errorMessages = Object.values(message).flat().join("\n");

        toast.error(errorMessages);
      } else {
        toast.error("An unknown error occurred.");
      }
    },
  });
};

export const usePosInvoiceMutation = () => {
  const { create } = usePosInvoiceService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.POS_INVOICE],
    onSuccess: async (data) => {
      // toast.success("Invoice download successfully!");
    },
    onError: async (data: any) => {
      const message = data?.response?.data?.message;
      if (typeof message === "string") {
        toast.error(message);
      } else if (typeof message === "object") {
        const errorMessages = Object.values(message).flat().join("\n");

        toast.error(errorMessages);
      } else {
        toast.error("An unknown error occurred.");
      }
    },
  });
};




export const usePosCategoriesQuery = (options: Partial<CategoryQueryOptions>) => {
  const { findAll } = usePosCategoryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_CATEGORY, options?.type],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    categories: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const usePosSettingsQuery = (options: Partial<any>) => {
  const { findAll } = usePosSettingsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.POS_SETTINGS, options],
    queryFn: () => findAll(options),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,   // ✅ v5 way to keep old data
  });

  return {
    PosSettings: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const usePosSettingsMutation = () => {
  const { update } = usePosSettingsService();
  return useMutation({
    mutationFn: (values: any) => update(values),
    mutationKey: [API_ENDPOINTS.POS_SETTINGS],
    onSuccess: async (data) => {
      toast.success("Place order successfully!");
    },
    onError: async (data: any) => {
      const message = data?.response?.data?.message;
      if (typeof message === "string") {
        toast.error(message);
      } else if (typeof message === "object") {
        const errorMessages = Object.values(message).flat().join("\n");

        toast.error(errorMessages);
      } else {
        toast.error("An unknown error occurred.");
      }
    },
  });
};