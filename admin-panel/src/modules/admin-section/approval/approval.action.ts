
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useStoreRequestApproveService, useStoreRequestQueryService } from "./approval.service";
import { ApprovalQueryOptions } from "./approval.type";



export const useStoreRequestApprovalQuery = (options: Partial<ApprovalQueryOptions>) => {
  const { findAll } = useStoreRequestQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STORE_REQUEST_APPROVAL_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    StoreRequestApprovalData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStoreRequestApproveMutation = () => {
  const { create } = useStoreRequestApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.STORE_REQUEST_APPROVE],
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