import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { AttributeFormData } from "./attributes.schema";
import {
  useAttributeAddService,
  useAttributeDeleteService,
  useAttributeEditService,
  useAttributeListService,
  useAttributeStatusUpdateService,
  useAttributeUpdateService,
} from "./attributes.service";
import { AttributeQueryOptions } from "./attributes.type";

export const useAttributeListQuery = (
  options: Partial<AttributeQueryOptions>
) => {
  const { findAll } = useAttributeListService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.ATTRIBUTE_LIST, options?.store_id],
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
    attributes: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAttributeQueryById = (id: string) => {
  const { find } = useAttributeEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.ATTRIBUTE_EDIT, id],
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
    attribute: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAttributeStoreMutation = () => {
  const { create } = useAttributeAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AttributeFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.ATTRIBUTE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.AttributeList);
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
export const useAttributeUpdateMutation = () => {
  const { create } = useAttributeUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AttributeFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.ATTRIBUTE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.AttributeList);
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

export const useAttributeStatusChange = () => {
  const { putItem: updateStatus } = useAttributeStatusUpdateService();
  return useMutation({
    mutationFn: (id: string) => updateStatus(id),
    mutationKey: [SELLER_API_ENDPOINTS.ATTRIBUTE_STATUS_CHANGE],
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
export const useAttributeDelete = () => {
  const { delete: deleteItem } = useAttributeDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [SELLER_API_ENDPOINTS.ATTRIBUTE_REMOVE],
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
