"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  CustomerProfile,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./profile.type";

function isCustomerProfile(value: unknown): value is CustomerProfile {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  const hasId = typeof obj.id === "number" || typeof obj.id === "string";
  const hasProfileField =
    "first_name" in obj || "email" in obj || "full_name" in obj;
  return hasId && hasProfileField;
}

// --- Get Profile ---

export function useProfileQuery() {
  const { getAxiosInstance } = useBaseService<CustomerProfile>(
    API_ENDPOINTS.PROFILE
  );

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getAxiosInstance().get<{
        data?: unknown;
      } & Record<string, unknown>>(
        API_ENDPOINTS.PROFILE
      );
      const nestedData = res.data?.data;
      if (isCustomerProfile(nestedData)) return nestedData;
      if (isCustomerProfile(res.data)) return res.data;
      return null;
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
