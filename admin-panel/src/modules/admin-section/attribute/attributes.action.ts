import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  attributeDelete,
  AttributeFormData,
  attributeStatusChange,
} from "./attributes.schema";
import {
  useAttributeAddService,
  useAttributeDeleteService,
  useAttributeEditService,
  useAttributeListService,
  useAttributeStatusUpdateService,
  useAttributeUpdateService,
  useAttributeTypeWiseService,
} from "./attributes.service";
import { AttributeQueryOptions, AttributeTypeWiseQueryOptions } from "./attributes.type";
import { useEffect, useRef } from "react";

export const useProductAttributeQuery = (options: Partial<AttributeTypeWiseQueryOptions>) => {
  const { findAll } = useAttributeTypeWiseService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ATTRIBUTE_TYPE_WISE, options?.type, options?.category_id],
    queryFn: () => findAll({ type: options?.type, category_id: options?.category_id }),
    enabled: !!options?.type || !!options?.category_id,
  });
  const raw = (data?.data as any);
  return {
    productAttribute: Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAttributeListQuery = (
  options: Partial<AttributeQueryOptions>
) => {
  const { findAll } = useAttributeListService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ATTRIBUTE_LIST],
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
      toast?.error(`Error: ${errorToast}`, {
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

export const useAttributeQueryById = (id: any) => {
  const { find } = useAttributeEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ATTRIBUTE_EDIT, id],
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
    mutationKey: [API_ENDPOINTS.ATTRIBUTE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.attributeList);
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
export const useAttributeUpdateMutation = () => {
  const { create } = useAttributeUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AttributeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ATTRIBUTE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.attributeList);
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

export const useAttributeStatusChange = () => {
  const { putItem: updateStatus } = useAttributeStatusUpdateService();
  return useMutation({
    mutationFn: (id: string) => updateStatus(id),
    mutationKey: [API_ENDPOINTS.ATTRIBUTE_STATUS_CHANGE],
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
export const useAttributeDelete = () => {
  const { delete: deleteItem } = useAttributeDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.ATTRIBUTE_REMOVE],
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

