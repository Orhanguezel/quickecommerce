import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useScraperOverviewService,
  useScraperSourcesService,
  useScraperSourceDetailService,
  useScraperAlertsService,
} from "./scraper-dashboard.service";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

/**
 * Tum scraper dashboard hook'lari 30 saniyede bir refetch ile yenilenir.
 * Dashboard sayfasi pol-style canli kalir.
 */
const POLLING_INTERVAL_MS = 30_000;

export const useScraperOverviewQuery = () => {
  const { findAll } = useScraperOverviewService();
  return useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_OVERVIEW],
    queryFn: () => findAll({}),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useScraperSourcesQuery = () => {
  const { findAll } = useScraperSourcesService();
  return useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_SOURCES],
    queryFn: () => findAll({}),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useScraperSourceDetailQuery = (name: string | null) => {
  const { findPageBySlug } = useScraperSourceDetailService();
  return useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_SOURCE_DETAIL, name],
    queryFn: () => findPageBySlug(name ?? ""),
    enabled: Boolean(name),
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useScraperAlertsQuery = (
  params: { limit?: number; level?: string; source?: string; status?: string } = {}
) => {
  const { findAll } = useScraperAlertsService();
  return useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_ALERTS, params],
    queryFn: () => findAll(params),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

/** Tek alarmi 'cozuldu' isaretle. POST .../alerts/{id}/resolve */
export const useScraperResolveAlertMutation = () => {
  const { postItem } = useScraperAlertsService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postItem(`${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_ALERTS] });
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_OVERVIEW] });
    },
  });
};

/** Bir kaynagin TUM acik alarmlarini coz. POST .../sources/{name}/resolve-alerts */
export const useScraperResolveSourceAlertsMutation = () => {
  const { postItem } = useScraperSourceDetailService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => postItem(`${name}/resolve-alerts`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_ALERTS] });
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_OVERVIEW] });
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_SOURCE_DETAIL] });
    },
  });
};

/**
 * Manuel scrape tetikleme mutation'i.
 * POST /v1/admin/scrapers/sources/{name}/trigger -> 202 Accepted + run_id
 *
 * Sucess durumda kaynak listesi + detail invalidate edilir.
 */
export const useScraperTriggerMutation = () => {
  const { postItem } = useScraperSourceDetailService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => postItem(`${name}/trigger`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_SOURCES] });
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_OVERVIEW] });
      qc.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_SCRAPER_SOURCE_DETAIL] });
    },
  });
};
