import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { VehicleTypeFormData, statusUpdateData } from "./vehicle-type.schema";
import {
  useVehicleTypeDeleteService,
  useVehicleTypeDropdownQueryService,
  useVehicleTypeEditService,
  useVehicleTypeQueryService,
  useVehicleTypeStatusUpdateService,
  useVehicleTypeStoreService,
  useVehicleTypeUpdateService,
} from "./vehicle-type.service";
import { VehicleTypeQueryOptions } from "./vehicle-type.type";

export const useVehicleTypeQuery = (
  options: Partial<VehicleTypeQueryOptions>
) => {
  const { findAll } = useVehicleTypeQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.VEHICLE_TYPE_LIST],
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
    VehicleType: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useVehicleTypeDropdownQuery = (
  options: Partial<VehicleTypeQueryOptions>
) => {
  const { findAll } = useVehicleTypeDropdownQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.VEHICLE_TYPE_DROPDOWN_LIST],
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
    VehicleTypeDropdownList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useVehicleTypeQueryById = (id: string) => {
  const { find } = useVehicleTypeEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.VEHICLE_TYPE_EDIT, id],
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
    VehicleTypeByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useVehicleTypeStoreMutation = () => {
  const router = useRouter();
  const { create } = useVehicleTypeStoreService();
  return useMutation({
    mutationFn: (values: VehicleTypeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.VEHICLE_TYPE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.vehicleTypeList);
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
export const useVehicleTypeUpdateMutation = () => {
  const router = useRouter();
  const { create } = useVehicleTypeUpdateService();
  return useMutation({
    mutationFn: (values: VehicleTypeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.VEHICLE_TYPE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.vehicleTypeList);
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

export const useVehicleTypeStatusUpdate = () => {
  const { create } = useVehicleTypeStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.VEHICLE_TYPE_STATUS_UPDATE],
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

export const useVehicleTypeDelete = () => {
  const { delete: deleteItem } = useVehicleTypeDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.VEHICLE_TYPE_REMOVE],
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
