import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Routes } from "@/config/routes";
import { UnitQueryOptions, CustomError } from "./unit.type";
import {
  useUnitDeleteService,
  useUnitEditService,
  useUnitListService,
  useUnitSaveService,
  useUnitUpdateService,
} from "./unit.service";
import { UnitFormData } from "./unit.schema";

export const useUnitsQuery = (options: Partial<UnitQueryOptions>) => {
  const { findAll } = useUnitListService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_UNIT_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    unit: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useUnitQueryById = (id: string) => {
  const { find } = useUnitEditService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.UNIT_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id,
  });
  return {
    unit: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useUnitStoreMutation = () => {
  const router = useRouter();
  const { create } = useUnitSaveService();
  return useMutation({
    mutationFn: (values: UnitFormData) => create(values),
    mutationKey: [API_ENDPOINTS.UNIT_SAVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.unitList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data: CustomError) => {
      toast.error(data?.response?.data?.order[0]);
    },
  });
};

export const useUnitUpdateMutation = () => {
  const router = useRouter();
  const { create } = useUnitUpdateService();
  return useMutation({
    mutationFn: (values: UnitFormData) => create(values),
    mutationKey: [API_ENDPOINTS.UNIT_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.unitList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data: CustomError) => {
      toast.error(data?.response?.data?.order[0]);
    },
  });
};

export const useUnitDelete = () => {
  const { delete: deleteItem } = useUnitDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.UNIT_DELETE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data: CustomError) => {
      toast.error(data?.response?.data?.message);
    },
  });
};
