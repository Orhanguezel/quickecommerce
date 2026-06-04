/**
 * Scraper Dashboard TypeScript tipleri — backend response sema'sina birebir uyar.
 */

export type ScraperStatus = "healthy" | "warning" | "critical" | "passive";
export type ScraperLevel = "info" | "warning" | "critical";

export interface ScraperOverview {
  total_sources: number;
  status_counts: {
    healthy: number;
    warning: number;
    critical: number;
    passive: number;
  };
  total_mappings: number;
  stock_distribution: {
    out_of_stock: number;
    in_stock_symbolic: number;
    in_stock_legacy_100: number;
    in_stock_real_int: number;
    total_in_stock: number;
  };
  alerts_last_24h: number;
  computed_at: string;
}

export interface ScraperSourceRow {
  name: string;
  platform: string;
  status: ScraperStatus;
  registry_status: "active" | "passive";
  json_age_hours: number | null;
  total_mappings: number;
  stock_0: number;
  stock_1: number;
  stock_100: number;
  stock_other: number;
  missing: number;
  last_sync_at: string | null;
  last_run_exit_code: number | null;
  last_run_at: string | null;
  notes: string | null;
}

export interface ScraperSourceDetail extends Omit<ScraperSourceRow, "json_age_hours" | "missing"> {
  site_url: string;
  json: {
    exists: boolean;
    age_hours: number | null;
    size_bytes: number | null;
    mtime: string | null;
  };
  db: {
    total_mappings: number;
    stock_0: number;
    stock_1: number;
    stock_100: number;
    stock_other: number;
    updated: number;
    unchanged: number;
    missing: number;
    missing_rate: number;
    last_sync_at: string | null;
  };
  last_run: {
    started_at: string | null;
    finished_at: string | null;
    exit_code: number | null;
    products_scraped: number | null;
    duration_seconds: number | null;
    triggered_by: string;
    error_log_excerpt: string | null;
  } | null;
  last_alert: {
    level: ScraperLevel;
    title: string;
    created_at: string;
  } | null;
  seven_day_runs: Array<{
    date: string;
    success: boolean;
    duration_seconds: number | null;
  }>;
}

export interface ScraperAlert {
  id: number;
  level: ScraperLevel;
  title: string;
  body: string | null;
  source_name: string | null;
  scraper_run_id: number | null;
  telegram_sent: boolean;
  created_at: string;
}
