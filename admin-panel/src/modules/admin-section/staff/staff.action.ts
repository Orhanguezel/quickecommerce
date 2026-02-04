import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { StaffFormData, statusUpdateData } from "./staff.schema";
import {
  useChangePasswordService,
  useRolesQueryService,
  useStaffDeleteService,
  useStaffEditService,
  useStaffQueryService,
  useStaffStatusUpdateService,
  useStaffStoreService,
  useStaffUpdateService,
} from "./staff.service";
import { StaffQueryOptions } from "./staff.type";

export const useRolesQuery = (options: Partial<StaffQueryOptions>) => {
  const { findAll } = useRolesQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ROLES],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    Roles: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useStaffQuery = (options: Partial<StaffQueryOptions>) => {
  const { findAll } = useStaffQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_STAFF_LIST],
    queryFn: () => findAll(options),
    enabled: !!options,
    ...options,
  });
  return {
    staffList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStaffQueryById = (id: string) => {
  const { find } = useStaffEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_STAFF_EDIT, id],
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
    StaffByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStaffStoreMutation = () => {
  const router = useRouter();
  const { create } = useStaffStoreService();
  return useMutation({
    mutationFn: (values: StaffFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STAFF_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.StaffList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      if (errorText?.email) {
        toast.error(errorText?.email[0]);
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};
export const useStaffUpdateMutation = () => {
  const router = useRouter();
  const { create } = useStaffUpdateService();
  return useMutation({
    mutationFn: (values: StaffFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STAFF_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.StaffList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText?.email) {
        toast.error(errorText?.email[0]);
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

export const useStaffStatusUpdate = () => {
  const { patchItem } = useStaffStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STAFF_STATUS],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useStaffDelete = () => {
  const { create } = useStaffDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STAFF_REMOVE],
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

export const useChangePassword = () => {
  const { patchItem } = useChangePasswordService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STAFF_PASSWORD_CHANGE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
