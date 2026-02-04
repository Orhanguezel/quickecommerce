import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BlogCategoryFormData, statusUpdateData } from "./blog-category.schema";
import {
    useBlogCategoryService,
    useBlogCategoryAddService,
    useBlogCategoryFetchService,
    useBlogCategoryEditService,
    useBlogCategoryUpdateService,
    useBlogCategoryStatusUpdateService,
    useBlogCategoryDeleteService
} from "./blog-category.service";
import { BlogCategoryQueryOptions } from "./blog-category.type";
import { useEffect, useRef } from "react";

export const useBlogCategoriesQuery = (options: Partial<BlogCategoryQueryOptions>) => {
  const { findAll } = useBlogCategoryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BLOG_CATEGORY],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    blogCategories: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBlogCategoryQueryById = (id: string) => {
  const { find } = useBlogCategoryEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BLOG_CATEGORY_EDIT, id],
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
    BlogCategory: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};




export const useBlogCategoriesFetchQuery = (options: Partial<BlogCategoryQueryOptions>) => {
  const { findAll } = useBlogCategoryFetchService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BLOG_CATEGORY_FETCH],
    queryFn: () => findAll(options),
    ...options,
  });
  return {    
    blogcategories: data?.data ?? [{}],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useBlogCategoryStoreMutation = () => {
  const { create } = useBlogCategoryAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: BlogCategoryFormData) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_CATEGORY_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.blogCategories);
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
export const useBlogCategoryUpdateMutation = () => {
  const { create } = useBlogCategoryUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: BlogCategoryFormData) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_CATEGORY_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.blogCategories);
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
export const useBlogCategoryStatusUpdate = () => {
  const { create } = useBlogCategoryStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_CATEGORY_STATUS_UPDATE],
    onSuccess: async (data) => {
        toast.success(data?.data?.message);
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

export const useBlogCategoryDelete = () => {
  const { delete: deleteItem } = useBlogCategoryDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.BLOG_CATEGORY_REMOVE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
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