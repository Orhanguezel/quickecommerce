import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CurrencyFormData, statusUpdateData } from "./currency.schema";
import {
  useCurrencyDeleteService,
  useCurrencyEditService,
  useCurrencyQueryService,
  useCurrencyStatusUpdateService,
  useCurrencyStoreService,
  useCurrencyUpdateService,
} from "./currency.service";
import { CurrencyQueryOptions } from "./currency.type";
import { useEffect, useRef } from "react";

export const useCurrencysQuery = (options: Partial<CurrencyQueryOptions>) => {
  const { findAll } = useCurrencyQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CURRENCY_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    CurrencyList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCurrencyQueryById = (id: string) => {
  const { find } = useCurrencyEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CURRENCY_BY_ID, id],
    queryFn: () => find(id),
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
    CurrencyByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCurrencyStoreMutation = () => {
  const router = useRouter();
  const { create } = useCurrencyStoreService();
  return useMutation({
    mutationFn: (values: CurrencyFormData) => create(values),
    mutationKey: [API_ENDPOINTS.CURRENCY_CREATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.ManageCurrency);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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
export const useCurrencyUpdateMutation = () => {
  const router = useRouter();
  const { update } = useCurrencyUpdateService();
  return useMutation({
    mutationFn: (values: CurrencyFormData) => update(values),
    mutationKey: [API_ENDPOINTS.CURRENCY_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.ManageCurrency);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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

export const useCurrencyStatusUpdate = () => {
  const { patchItem } = useCurrencyStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_BRAND_STATUS],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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

export const useCurrencyDelete = () => {
  const { delete: deleteItem } = useCurrencyDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.CURRENCY_DELETE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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
