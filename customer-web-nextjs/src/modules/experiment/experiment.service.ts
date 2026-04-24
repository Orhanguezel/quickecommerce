"use client";

import { useMutation } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

interface AssignResponse {
  status: boolean;
  assignments: Record<string, string>;
}

export function useAssignExperimentsMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.EXPERIMENTS_ASSIGN);
  return useMutation({
    mutationFn: async (subject: string) => {
      const res = await getAxiosInstance().post<AssignResponse>(
        API_ENDPOINTS.EXPERIMENTS_ASSIGN,
        { subject }
      );
      return res.data;
    },
    retry: false,
  });
}

export function useTrackExperimentMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.EXPERIMENTS_TRACK);
  return useMutation({
    mutationFn: async (data: {
      experiment_key: string;
      subject: string;
      event: "exposed" | "converted";
    }) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.EXPERIMENTS_TRACK, data);
      return res.data;
    },
    retry: false,
  });
}
