import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AuthorFormData, statusUpdateData } from "./author.schema";
import {
  useAuthorDeleteService,
  useAuthorEditService,
  useAuthorListService,
  useAuthorSaveService,
  useAuthorStatusUpdateService,
  useAuthorUpdateService,
} from "./author.service";
import { AuthorQueryOptions } from "./author.type";

interface CustomError {
  response: {
    data: {
      message: string;
    };
  };
}

export const useAuthorsQuery = (options: Partial<AuthorQueryOptions>) => {
  const { findAll } = useAuthorListService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.AUTHOR_LIST],
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
    queryKey: [SELLER_API_ENDPOINTS.AUTHOR_EDIT, id],
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

export const useAuthorStatusUpdate = () => {
  const { create } = useAuthorStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.AUTHOR_STATUS],
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

// Hook for Save
export const useAuthorStoreMutation = () => {
  const router = useRouter();
  const { create } = useAuthorSaveService();
  return useMutation({
    mutationFn: (values: AuthorFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.AUTHOR_SAVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.authorList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data: CustomError) => {
      toast.error(data?.response?.data?.message);
    },
  });
};

// Hook for Update
export const useAuthorUpdateMutation = () => {
  const router = useRouter();
  const { create } = useAuthorUpdateService();
  return useMutation({
    mutationFn: (values: AuthorFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.AUTHOR_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.authorList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data: CustomError) => {
      toast.error(data?.response?.data?.message);
    },
  });
};

export const useAuthorDelete = () => {
  const { delete: deleteItem } = useAuthorDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [SELLER_API_ENDPOINTS.AUTHOR_REMOVE],
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