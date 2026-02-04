import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DepartmentFormData } from "./department.schema";
import {
  useDepartmentAllService,
  useDepartmentAddService,
  useDepartmentUpdateService,
  useDepartmentRemoveService,
  useDepartmentService,
} from "./department.service";
import { DepartmentQueryOptions } from "./department.type";
import { useEffect, useRef } from "react";

export const useDepartmentAllQuery = (options: Partial<DepartmentQueryOptions>) => {
  const { findAll } = useDepartmentAllService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DEPARTMENT],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    Departments: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useDepartmentQueryById = (id: string) => {
  const { find } = useDepartmentService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GET_DEPARTMENT, id],
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
    GetDepartmentByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useDepartmentStoreMutation = () => {
  const { create } = useDepartmentAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: DepartmentFormData) => create(values),
    mutationKey: [API_ENDPOINTS.DEPARTMENT_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.DepartmentList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      toast.error((data as any)?.response?.data?.errors?.status[0]);
    },
  });
};
export const useDepartmentUpdateMutation = () => {
  const { update } = useDepartmentUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: DepartmentFormData) => update(values),
    mutationKey: [API_ENDPOINTS.DEPARTMENT_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.DepartmentList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      toast.error((data as any)?.response?.data?.message);
    },
  });
};
export const useDepartmentDeleteMutation = () => {
  const { delete: deleteItem } = useDepartmentRemoveService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.DEPARTMENT_REMOVE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      toast.error((data as any)?.response?.data?.message);
    },
  });
};
