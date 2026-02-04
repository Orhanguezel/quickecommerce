import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CategoryFormData, statusUpdateData } from "./category.schema";
import {
    useCategoryService,
    useCategoryStatusUpdateService
} from "./category.service";
import { CategoryQueryOptions } from "./category.type";

export const useCategoriesQuery = (options: Partial<CategoryQueryOptions>) => {
  const { findAll } = useCategoryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CATEGORY_LIST,options?.type],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    categories: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCategoryStoreMutation = () => {
  const { create } = useCategoryService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: CategoryFormData) => create(values),
    mutationKey: [API_ENDPOINTS.CATEGORY],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success("Category Store Successfully");
        router.push(Routes.categories);
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
export const useCategoryStatusUpdate = () => {
  const { create } = useCategoryStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.CATEGORY_STATUS],
    onSuccess: async () => {
        toast.success("Category status updated successfully");
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
