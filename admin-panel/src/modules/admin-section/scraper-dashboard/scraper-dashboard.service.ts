import { useBaseService } from "@/modules/core/base.service";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import {
  ScraperOverview,
  ScraperSourceRow,
  ScraperSourceDetail,
  ScraperAlert,
} from "./scraper-dashboard.type";

export const useScraperOverviewService = () =>
  useBaseService<ScraperOverview>(API_ENDPOINTS.ADMIN_SCRAPER_OVERVIEW);

export const useScraperSourcesService = () =>
  useBaseService<ScraperSourceRow[]>(API_ENDPOINTS.ADMIN_SCRAPER_SOURCES);

export const useScraperSourceDetailService = () =>
  useBaseService<ScraperSourceDetail>(API_ENDPOINTS.ADMIN_SCRAPER_SOURCE_DETAIL);

export const useScraperAlertsService = () =>
  useBaseService<ScraperAlert[]>(API_ENDPOINTS.ADMIN_SCRAPER_ALERTS);

// Trigger endpoint icin useBaseService'in `create` benzeri pattern'i yok —
// dogrudan axios instance kullanmak yerine action.ts icinde inline fetch.
