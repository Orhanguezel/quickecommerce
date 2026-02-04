import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useReviewsApproveService,
  useReviewsDeleteService,
  useReviewsQueryService,
  useReviewsRejectService
} from "./reviews.service";
import { ReviewsQueryOptions } from "./reviews.type";

// Hook for Join Request action
export const useReviewsQuery = (
  options: Partial<ReviewsQueryOptions>
) => {
  const { findAll } = useReviewsQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REVIEWS_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

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
    mutationKey: [API_ENDPOINTS.REVIEWS_APPROVE],
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
export const useReviewsRejectMutation = () => {
  const { create } = useReviewsRejectService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.REVIEWS_REJECT],
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

export const useReviewsDeleteMutation = () => {
  const { create } = useReviewsDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.REVIEWS_DELETE],
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

