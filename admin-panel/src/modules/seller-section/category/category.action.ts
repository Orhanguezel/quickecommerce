import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { CategoryFormData, categoryStatusChange } from "./category.schema";
import {
  useCategoryAddService,
  useCategoryEditService,
  useCategoryListService,
  useCategoryRemoveService,
  useCategoryStatusService,
  useCategoryUpdateService,
} from "./category.service";
import { CategoryQueryOptions } from "./category.type";

export const useCategoryListQuery = (options: Partial<CategoryQueryOptions>) => {
  const { findAll } = useCategoryListService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_CATEGORY_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id,
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
    categories: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCategoryQueryById = (id: string) => {
  const { find } = useCategoryEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_CATEGORY_EDIT, id],
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
    category: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCategoryStoreMutation = () => {
  const { create } = useCategoryAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: CategoryFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_CATEGORY_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
        router.push(SellerRoutes.categoryList);
      } else {
        toast.error((data as any)?.data?.message);
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

export const useCategoryUpdateMutation = () => {
  const { create } = useCategoryUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: CategoryFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_CATEGORY_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
        router.push(SellerRoutes.categoryList);
      } else {
        toast.error((data as any)?.data?.message);
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

export const useCategoryStatusChange = () => {
  const { create } = useCategoryStatusService();
  return useMutation({
    mutationFn: (values: categoryStatusChange) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_CATEGORY_STATUS],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
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

export const useCategoryDelete = () => {
  const { delete: deleteItem } = useCategoryRemoveService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_CATEGORY_REMOVE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
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
