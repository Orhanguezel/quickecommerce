"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  CustomerProfile,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./profile.type";

// --- Get Profile ---

export function useProfileQuery() {
  const { getAxiosInstance } = useBaseService<CustomerProfile>(
    API_ENDPOINTS.PROFILE
  );

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getAxiosInstance().get<{ data: CustomerProfile }>(
        API_ENDPOINTS.PROFILE
      );
      return res.data?.data ?? null;
    },
  });
}

// --- Update Profile ---

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.UPDATE_PROFILE);

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.UPDATE_PROFILE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// --- Change Password ---

export function useChangePasswordMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CHANGE_PASSWORD);

  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const res = await getAxiosInstance().patch(
        API_ENDPOINTS.CHANGE_PASSWORD,
        data
      );
      return res.data;
    },
  });
}

// --- Delete Account ---

export function useDeleteAccountMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.DELETE_ACCOUNT);

  return useMutation({
    mutationFn: async () => {
      const res = await getAxiosInstance().get(API_ENDPOINTS.DELETE_ACCOUNT);
      return res.data;
    },
  });
}
