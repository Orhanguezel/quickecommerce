import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Permission, PermissionQueryOptions } from "./permissions.type";
import {
  useModuleWisePermissionService,
  usePermissionForStoreOwnerService,
  usePermissionService,
} from "./permissions.service";
import { permissionsForStoreOwner } from "./permissions.schema";
import { toast } from "react-toastify";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const usePermissionsQuery = (
  options: Partial<PermissionQueryOptions>
) => {
  const { findAll } = usePermissionService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PERMISSIONS],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    permissions: data?.data ?? ([] as Permission[]),
    error,
    isPending: isPending,
    refetch,
    isFetching,
  };
};

export const useModuleWisePermissionsQuery = (
  options: Partial<PermissionQueryOptions>
) => {
  const { findAll } = useModuleWisePermissionService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.MODULE_WISE_PERMISSIONS],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    modules: data?.data ?? ([] as Permission[]),
    error,
    isPending: isPending,
    refetch,
    isFetching,
  };
};

export const usePermissionsForStoreOwner = () => {
  const { create } = usePermissionForStoreOwnerService();
  return useMutation({
    mutationFn: (values: permissionsForStoreOwner) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PERMISSIONS_FOR_STORE_OWNER],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
