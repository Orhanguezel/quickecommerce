"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

interface SubmitReviewInput {
  order_id: number;
  store_id: number;
  reviewable_id: number;
  reviewable_type: "product";
  review: string;
  rating: number;
}

interface ReviewReactionInput {
  review_id: number;
  reaction_type: "like" | "dislike";
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.REVIEW_ADD);

  return useMutation({
    mutationFn: async (data: SubmitReviewInput) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.REVIEW_ADD, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useReviewReactionMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.REVIEW_REACTION);

  return useMutation({
    mutationFn: async (data: ReviewReactionInput) => {
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.REVIEW_REACTION,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
