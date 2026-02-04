import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  MenuCustomizationFormData,
  statusUpdateData,
} from "./menu-customization.schema";
import {
  useMenuCustomizationDeleteService,
  useMenuCustomizationEditService,
  useMenuCustomizationQueryService,
  useMenuCustomizationStatusUpdateService,
  useMenuCustomizationStoreService,
  useMenuCustomizationUpdateService,
  useMenuPositionUpdateService
} from "./menu-customization.service";
import { MenuCustomizationQueryOptions } from "./menu-customization.type";

export const useMenuCustomizationQuery = (
  options: Partial<MenuCustomizationQueryOptions>
) => {
  const { findAll } = useMenuCustomizationQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_LIST],
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
    MenuCustomizations: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useMenuCustomizationDropdownList = (
  options: Partial<MenuCustomizationQueryOptions>
) => {
  const { findAll } = useMenuCustomizationQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_LIST, options.pagination],
    queryFn: () => findAll(options),
    enabled: options.pagination == "false",
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
    MenuCustomizations: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useMenuCustomizationQueryById = (id: string) => {
  const { find } = useMenuCustomizationEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_EDIT, id],
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
    MenuCustomization: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useMenuCustomizationStoreMutation = () => {
  const router = useRouter();
  const { create } = useMenuCustomizationStoreService();
  return useMutation({
    mutationFn: (values: MenuCustomizationFormData) => create(values),
    mutationKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
      
        toast.success(data?.data?.message);
        router.push(Routes.MenuCustomizationList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
          // @ts-ignore
          const errorText = data?.response?.data?.errors;
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
export const useMenuCustomizationUpdateMutation = () => {
  const router = useRouter();
  const { create } = useMenuCustomizationUpdateService();
  return useMutation({
    mutationFn: (values: MenuCustomizationFormData) => create(values),
    mutationKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.MenuCustomizationList);
      } else {
        toast.error(data?.data?.message);
      }
    },
   onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data?.errors;
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

export const useMenuCustomizationStatusUpdate = () => {
  const { create } = useMenuCustomizationStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.BANNER_STATUS_CHANGE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useMenuCustomizationDelete = () => {
  const { delete: deleteItem } = useMenuCustomizationDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_DELETE],
    onSuccess: async (data) => {
    
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};



export const useMenuPositionChange = () => {
  const { create } = useMenuPositionUpdateService();
  return useMutation({
    mutationFn: (values: MenuCustomizationFormData) => create(values),
    mutationKey: [API_ENDPOINTS.MENU_CUSTOMIZATION_POSITION_CHANGE],
    onSuccess: async (data) => {
       //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.position[0]);
    },
  });
};