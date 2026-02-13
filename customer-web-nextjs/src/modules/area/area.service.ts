"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Area } from "./area.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

async function fetchAreas(): Promise<Area[]> {
  const res = await api.get(API_ENDPOINTS.AREA_LIST);
  // API returns flat array directly, or wrapped in { data: [...] }
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export function useAreaListQuery() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: fetchAreas,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
}
