
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { statusUpdateData } from "./questions.schema";
import {
  useQuestionsApproveService,
  useQuestionsDeleteService,
  useQuestionsQueryService,
  useQuestionsRejectService,
  useQuestionsReplyService,
  useQuestionsStatusUpdateService
} from "./questions.service";
import { QuestionsQueryOptions } from "./questions.type";

export const useQuestionsQuery = (
  options: Partial<QuestionsQueryOptions>
) => {
  const { findAll } = useQuestionsQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.QUESTIONS_LIST],
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
    mutationKey: [SELLER_API_ENDPOINTS.QUESTIONS_STATUS_CHANGE],
    onSuccess: async () => {
        toast.success("Questions status updated successfully");
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

export const useQuestionsApproveMutation = () => {
  const { create } = useQuestionsApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.QUESTIONS_APPROVE],
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
export const useQuestionsRejectMutation = () => {
  const { create } = useQuestionsRejectService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.QUESTIONS_REJECT],
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
export const useQuestionsDeleteMutation = () => {
  const { create } = useQuestionsDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.QUESTIONS_DELETE],
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

export const useQuestionsReply = () => {
  const { create } = useQuestionsReplyService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.QUESTIONS_REPLY],
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