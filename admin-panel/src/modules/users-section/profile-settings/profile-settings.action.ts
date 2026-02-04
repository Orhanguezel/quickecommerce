import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ProfileSettingsFormData,
  statusUpdateData,
} from "./profile-settings.schema";
import {
  useChangePasswordService,
  useProfileSettingsQueryService,
  useProfileSettingsService,
} from "./profile-settings.service";
import { ProfileSettingsQueryOptions } from "./profile-settings.type";

export const useProfileSettingsQuery = (
  options: Partial<ProfileSettingsQueryOptions>
) => {
  const { findAll } = useProfileSettingsQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PROFILE_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    profileSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useProfileSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useProfileSettingsService();

  return useMutation({
    mutationFn: (values: ProfileSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PROFILE_SETTINGS_EDIT],
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

export const useChangePassword = () => {
  const { create } = useChangePasswordService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.PROFILE_SETTINGS_PASSWORD_CHANGE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
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
