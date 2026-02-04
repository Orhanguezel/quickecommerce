import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useMediaManageDeleteService,
  useMediaManageQueryService
} from "./media-manage.service";
import { MediaManageQueryOptions } from "./media-manage.type";

// Hook for querying MediaManage data
export const useMediaManagesQuery = (options: Partial<MediaManageQueryOptions>) => {
  const { findAll } = useMediaManageQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_MEDIA_MANAGE_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    MediaManages: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useMediaManageDelete = () => {
  const { create } = useMediaManageDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_MEDIA_MANAGE_REMOVE],
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