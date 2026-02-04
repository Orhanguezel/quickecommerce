import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BlogPostFormData, statusUpdateData } from "./blog-post.schema";
import {
  useBlogPostAddService,
  useBlogPostDeleteService,
  useBlogPostEditService,
  useBlogPostService,
  useBlogPostStatusUpdateService,
  useBlogPostUpdateService,
} from "./blog-post.service";
import { BlogPostQueryOptions } from "./blog-post.type";
import { useEffect, useRef } from "react";

export const useBlogPostQuery = (options: Partial<BlogPostQueryOptions>) => {
  const { findAll } = useBlogPostService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BLOG_POST],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    blogPosts: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBlogPostQueryById = (id: string) => {
  const { find } = useBlogPostEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BLOG_POST_EDIT, id],
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
    BlogPost: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBlogPostStoreMutation = () => {
  const { create } = useBlogPostAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: BlogPostFormData) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_POST_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.blogPost);
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
export const useBlogPostUpdateMutation = () => {
  const { create } = useBlogPostUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: BlogPostFormData) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_POST_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.blogPost);
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

export const useBlogPostStatusUpdate = () => {
  const { patchItem } = useBlogPostStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.BLOG_POST_STATUS_UPDATE],
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

export const useBlogPostDelete = () => {
  const { create } = useBlogPostDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_POST_DELETE],
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
