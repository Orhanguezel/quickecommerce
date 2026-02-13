"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocale } from "next-intl";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { ThemeResponse } from "./theme.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function useThemeQuery() {
  const locale = useLocale();

  return useQuery({
    queryKey: ["theme", locale],
    queryFn: async () => {
      const res = await api.get<ThemeResponse>(API_ENDPOINTS.THEME);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
