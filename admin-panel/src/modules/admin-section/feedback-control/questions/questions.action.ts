import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useQuestionsApproveService,
  useQuestionsDeleteService,
  useQuestionsQueryService,
  useQuestionsRejectService,
  useQuestionsStatusUpdateService
} from "./questions.service";
import { QuestionsQueryOptions } from "./questions.type";
import { statusUpdateData } from "./questions.schema";

// Hook for Join Request action
export const useQuestionsQuery = (
  options: Partial<QuestionsQueryOptions>
) => {
  const { findAll } = useQuestionsQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.QUESTIONS_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    QuestionsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useQuestionsStatusUpdate = () => {
  const { create } = useQuestionsStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.QUESTIONS_STATUS_CHANGE],
    onSuccess: async (data) => {
        toast.success(data?.data?.message);
      },
      onError: async (data) => {
        //@ts-ignore
        const errorText = data?.response?.data;
        toast.error(errorText?.message);
      },
  });
};

export const useQuestionsApproveMutation = () => {
  const { create } = useQuestionsApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.QUESTIONS_APPROVE],
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
export const useQuestionsRejectMutation = () => {
  const { create } = useQuestionsRejectService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.QUESTIONS_REJECT],
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
export const useQuestionsDeleteMutation = () => {
  const { create } = useQuestionsDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.QUESTIONS_DELETE],
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

