"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { ThemeResponse } from "./theme.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function useThemeQuery() {
  return useQuery({
    queryKey: ["theme"],
    queryFn: async () => {
      const res = await api.get<ThemeResponse>(API_ENDPOINTS.THEME);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes (shorter for testing)
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}
