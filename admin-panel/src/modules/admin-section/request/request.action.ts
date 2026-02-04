import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useRequestApproveService,
  useRequestQueryService,
} from "./request.service";
import { RequestQueryOptions } from "./request.type";


export const useRequestApproveQuery = (
  options: Partial<RequestQueryOptions>
) => {
  const { findAll } = useRequestQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REQUEST_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    RequestApproveData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRequestApproveMutation = () => {
  const { create } = useRequestApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.REQUEST_APPROVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      toast.error((data as any)?.response?.data?.errors.product_ids[0]);
    },
  });
};
