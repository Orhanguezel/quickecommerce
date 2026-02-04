import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RoleFormData, statusUpdateData } from "./roles.schema";
import { useRoleDeleteService, useRoleEditService, useRoleService, useRolesStatusUpdateService, useRoleStoreService, useRoleUpdateService } from "./roles.service";
import { Roles, RolesQueryOptions } from "./roles.type";

export const useRolesQuery = (options: Partial<RolesQueryOptions>) => {
  const { findAll } = useRoleService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ROLES],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    roles: data?.data ?? ([] as Roles[]),
    error,
    isPending: isPending,
    refetch,
    isFetching,
  };
};

export const useRolesQueryById = (id: string) => {
  const { find } = useRoleEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ROLES_EDIT, id],
    queryFn: () => find(id),
    retry: false,
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
    Role: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useRolesStoreMutation = () => {
  const router = useRouter();
  const { create } = useRoleStoreService();
  return useMutation({
    mutationFn: (values: RoleFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ROLES_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.roles);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useRolesUpdateMutation = () => {
  const router = useRouter();
  const { create } = useRoleUpdateService();
  return useMutation({
    mutationFn: (values: RoleFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ROLES_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.roles);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useRolesStatusUpdate = () => {
  const { create } = useRolesStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.ROLES_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useRoleDelete = () => {
  const { delete: deleteItem } = useRoleDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.ROLES_REMOVE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data
      toast.error(errorText?.message);
    },
  });
};
