"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

interface SubmitReviewInput {
  order_id: number;
  store_id: number;
  reviewable_id: number;
  reviewable_type: "product";
  review: string;
  rating: number;
  images?: File[];
}

interface ReviewReactionInput {
  review_id: number;
  reaction_type: "like" | "dislike";
}

export interface CustomerReview {
  id: number;
  reviewable_type: string;
  review: string;
  images: string[];
  rating: number;
  status: "pending" | "approved" | "rejected";
  like_count: number;
  dislike_count: number;
  reviewed: string | null;
  product_slug: string | null;
  product_image: string | null;
  store: string | null;
  reviewed_at: string | null;
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.REVIEW_ADD);

  return useMutation({
    mutationFn: async (data: SubmitReviewInput) => {
      const hasImages = data.images && data.images.length > 0;

      if (hasImages) {
        const formData = new FormData();
        formData.append("order_id", String(data.order_id));
        formData.append("store_id", String(data.store_id));
        formData.append("reviewable_id", String(data.reviewable_id));
        formData.append("reviewable_type", data.reviewable_type);
        formData.append("review", data.review);
        formData.append("rating", String(data.rating));
        data.images!.forEach((file) => formData.append("images[]", file));

        const res = await getAxiosInstance().post(
          API_ENDPOINTS.REVIEW_ADD,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return res.data;
      }

      const { images: _images, ...payload } = data;
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.REVIEW_ADD,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
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

/** Müşterinin kendi yorumları (hesabım > Değerlendirmelerim). */
export function useMyReviewsQuery(enabled = true) {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.REVIEW_MY);

  return useQuery({
    queryKey: ["my-reviews"],
    enabled,
    queryFn: async (): Promise<CustomerReview[]> => {
      const res = await getAxiosInstance().get(API_ENDPOINTS.REVIEW_MY, {
        params: { per_page: 50 },
      });
      return res.data?.data ?? [];
    },
  });
}
