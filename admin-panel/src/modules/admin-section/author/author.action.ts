
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AuthorFormData, statusUpdateData } from "./author.schema";
import {
  useAuthorDeleteService,
  useAuthorEditService,
  useAuthorListService,
  useAuthorRequestListService,
  useAuthorRequestService,
  useAuthorSaveService,
  useAuthorStatusUpdateService,
  useAuthorUpdateService,
} from "./author.service";
import { AuthorQueryOptions } from "./author.type";


export const useAuthorRequestQuery = (options: Partial<AuthorQueryOptions>) => {
  const { findAll } = useAuthorRequestListService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AUTHOR_REQUEST_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    authorRequest: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAuthorRequestMutation = () => {
  const { create } = useAuthorRequestService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.AUTHOR_REQUEST_APPROVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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






export const useAuthorsQuery = (options: Partial<AuthorQueryOptions>) => {
  const { findAll } = useAuthorListService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AUTHOR_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    author: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAuthorQueryById = (id: string) => {
  const { find } = useAuthorEditService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AUTHOR_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id, 
  });
  return {
    author: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAuthorStoreMutation = () => {
  const router = useRouter();
  const { create } = useAuthorSaveService();
  return useMutation({
    mutationFn: (values: AuthorFormData) => create(values),
    mutationKey: [API_ENDPOINTS.AUTHOR_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.authorList);
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

// Hook for Update
export const useAuthorUpdateMutation = () => {
  const router = useRouter();
  const { create } = useAuthorUpdateService();
  return useMutation({
    mutationFn: (values: AuthorFormData) => create(values),
    mutationKey: [API_ENDPOINTS.AUTHOR_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.authorList);
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

// Hook for updating brand status
export const useAuthorStatusUpdate = () => {
  const { patchItem } = useAuthorStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.AUTHOR_STATUS],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
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

export const useAuthorDelete = () => {
  const { create } = useAuthorDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.AUTHOR_REMOVE],
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
