"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

export interface ProductQuestion {
  id: number;
  customer_name: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  created_at: string;
  answered_at: string | null;
}

export interface ProductQAResponse {
  success: boolean;
  data: ProductQuestion[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// --- Get Product Questions ---

export function useProductQuestionsQuery(
  productId: number | null,
  page: number = 1
) {
  const { getAxiosInstance } = useBaseService<ProductQuestion[]>(
    API_ENDPOINTS.PRODUCT_QA
  );

  return useQuery({
    queryKey: ["product-questions", productId, page],
    enabled: !!productId,
    queryFn: async () => {
      const res = await getAxiosInstance().get<ProductQAResponse>(
        API_ENDPOINTS.PRODUCT_QA,
        {
          params: { product_id: productId, page, per_page: 10 },
        }
      );
      return {
        questions: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
      };
    },
  });
}

// --- Ask Question ---

export function useAskQuestionMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.PRODUCT_QA_ASK);

  return useMutation({
    mutationFn: async (data: {
      product_id: number;
      store_id: number;
      question: string;
    }) => {
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.PRODUCT_QA_ASK,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-questions"] });
    },
  });
}
