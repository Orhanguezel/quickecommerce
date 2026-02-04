import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { UserFormData } from "./user.schema";
import {
  useUserService,
  useUserStatusUpdateService,
  useUserUpdateService,
} from "./user.service";
import { UserQueryOptions } from "./user.type";

export const useUsersQuery = (options: Partial<UserQueryOptions>) => {
  const { findAll } = useUserService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STAFF],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    users: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useUsersStatus = () => {
  const { postItem: updateStatus } = useUserStatusUpdateService();
  return useMutation({
    mutationFn: (id: string) => updateStatus(id),
    mutationKey: [API_ENDPOINTS.STAFF_STATUS],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
     onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
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

export const useUserStoreMutation = () => {
  const router = useRouter();
  const { create } = useUserService();
  return useMutation({
    mutationFn: (values: UserFormData) => create(values),
    mutationKey: [API_ENDPOINTS.STAFF],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.users);
      } else {
        toast.error(data?.data?.message);
      }
    },
     onError: async (data) => {
          // @ts-ignore
          const errorText = data?.response?.data;
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

export const useUserUpdateMutation = () => {
  const router = useRouter();
  const { create } = useUserUpdateService();
  return useMutation({
    mutationFn: (values: UserFormData) => create(values),
    mutationKey: [API_ENDPOINTS.STAFF_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.users);
      } else {
        toast.error(data?.data?.message);
      }
    },
     onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
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
