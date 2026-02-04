import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useReviewsApproveService,
  useReviewsDeleteService,
  useReviewsQueryService,
  useReviewsRejectService,
} from "./reviews.service";
import { ReviewsQueryOptions } from "./reviews.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useEffect, useRef } from "react";

export const useReviewsQuery = (options: Partial<ReviewsQueryOptions>) => {
  const { findAll } = useReviewsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.REVIEWS_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
    ReviewsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useReviewsApproveMutation = () => {
  const { create } = useReviewsApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.REVIEWS_APPROVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
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
export const useReviewsRejectMutation = () => {
  const { create } = useReviewsRejectService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.REVIEWS_REJECT],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
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
export const useReviewsDeleteMutation = () => {
  const { create } = useReviewsDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.REVIEWS_DELETE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
