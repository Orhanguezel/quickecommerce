"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui";
import {
  useScraperOverviewQuery,
  useScraperSourcesQuery,
  useScraperAlertsQuery,
  useScraperSourceDetailQuery,
} from "@/modules/admin-section/scraper-dashboard/scraper-dashboard.action";
import {
  ScraperStatus,
  ScraperLevel,
  ScraperSourceRow,
} from "@/modules/admin-section/scraper-dashboard/scraper-dashboard.type";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Pause,
  RefreshCcw,
  XCircle,
  ExternalLink,
} from "lucide-react";

const statusColors: Record<ScraperStatus, { bg: string; text: string; border: string; label: string }> = {
  healthy: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-900",
    label: "Sağlıklı",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-900",
    label: "Uyarı",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-900",
    label: "Kritik",
  },
  passive: {
    bg: "bg-gray-50 dark:bg-gray-900",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    label: "Pasif",
  },
};

const levelColors: Record<ScraperLevel, string> = {
  info: "text-blue-600",
  warning: "text-amber-600",
  critical: "text-red-600",
};

const formatAge = (h: number | null) => {
  if (h === null) return "—";
  if (h < 1) return `${Math.round(h * 60)} dk`;
  if (h < 24) return `${h.toFixed(1)} sa`;
  return `${Math.floor(h / 24)} g ${Math.floor(h % 24)} sa`;
};

const ageBadgeClass = (h: number | null) => {
  if (h === null) return "bg-gray-100 text-gray-700";
  if (h < 12) return "bg-green-100 text-green-700";
  if (h < 24) return "bg-lime-100 text-lime-700";
  if (h < 48) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

const ScraperDashboard = () => {
  const { data: overviewResp, isFetching: isOvFetching } = useScraperOverviewQuery();
  const { data: sourcesResp, isFetching: isSrcFetching } = useScraperSourcesQuery();
  const { data: alertsResp } = useScraperAlertsQuery({ limit: 10 });
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { data: detailResp } = useScraperSourceDetailQuery(selectedSource);

  const overview = (overviewResp as any)?.data?.data;
  const sources: ScraperSourceRow[] = (sourcesResp as any)?.data?.data ?? [];
  const alerts = (alertsResp as any)?.data?.data ?? [];
  const detail = (detailResp as any)?.data?.data;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scraper Sağlık Paneli</h1>
          <p className="text-sm text-muted-foreground">
            Tedarikçi kaynakların anlık durumu — her 30 saniyede yenilenir
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {(isOvFetching || isSrcFetching) && (
            <span className="flex items-center gap-1">
              <RefreshCcw className="h-3 w-3 animate-spin" />
              Yenileniyor...
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KPICard
            icon={<Database className="h-5 w-5" />}
            label="Toplam Kaynak"
            value={overview.total_sources}
            sub={`${overview.status_counts.passive} pasif`}
          />
          <KPICard
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            label="Sağlıklı"
            value={overview.status_counts.healthy}
            sub={`${overview.status_counts.warning} uyarı / ${overview.status_counts.critical} kritik`}
          />
          <KPICard
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            label="Tükendi"
            value={overview.stock_distribution.out_of_stock.toLocaleString()}
            sub={`${overview.stock_distribution.total_in_stock.toLocaleString()} stokta`}
          />
          <KPICard
            icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
            label="Son 24 saat alarm"
            value={overview.alerts_last_24h}
            sub={overview.total_mappings.toLocaleString() + " mapping"}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Sources Table */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Kaynak Listesi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Kaynak</th>
                    <th className="px-3 py-2 text-left">Platform</th>
                    <th className="px-3 py-2 text-right">Mapping</th>
                    <th className="px-3 py-2 text-right">Stokta</th>
                    <th className="px-3 py-2 text-right">Tükendi</th>
                    <th className="px-3 py-2 text-left">JSON Yaşı</th>
                    <th className="px-3 py-2 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sources.map((s) => {
                    const sc = statusColors[s.status];
                    const inStock = s.stock_1 + s.stock_other + s.stock_100;
                    return (
                      <tr
                        key={s.name}
                        onClick={() => setSelectedSource(s.name)}
                        className="cursor-pointer hover:bg-muted/40"
                      >
                        <td className="px-3 py-2 font-medium">{s.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {s.platform}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {s.total_mappings.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {inStock.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {s.stock_0.toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ageBadgeClass(s.json_age_hours)}`}
                          >
                            {formatAge(s.json_age_hours)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.text} ${sc.border}`}
                          >
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Feed */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Son Alarmlar</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {alerts.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Henüz alarm yok
                </div>
              )}
              {alerts.map((a: any) => (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${levelColors[a.level as ScraperLevel]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{a.title}</p>
                      {a.body && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {a.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(a.created_at).toLocaleString("tr-TR")}
                        {a.source_name && ` · ${a.source_name}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Detail Drawer */}
      {selectedSource && detail && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setSelectedSource(null)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{detail.name}</h2>
                <a
                  href={detail.site_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {detail.site_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="rounded-md p-1 hover:bg-muted"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="font-medium">{detail.platform}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Durum</p>
                  <p className="font-medium">{statusColors[detail.status as ScraperStatus].label}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">JSON yaşı</p>
                  <p className="font-medium">{formatAge(detail.json.age_hours)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">JSON boyutu</p>
                  <p className="font-medium">
                    {detail.json.size_bytes
                      ? `${(detail.json.size_bytes / 1024 / 1024).toFixed(2)} MB`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Stok Dağılımı ({detail.db.total_mappings.toLocaleString()} mapping)
                </p>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="rounded bg-red-50 p-2 dark:bg-red-950">
                    <p className="text-xs text-muted-foreground">Tükendi</p>
                    <p className="font-bold">{detail.db.stock_0.toLocaleString()}</p>
                  </div>
                  <div className="rounded bg-green-50 p-2 dark:bg-green-950">
                    <p className="text-xs text-muted-foreground">Sembolik (1)</p>
                    <p className="font-bold">{detail.db.stock_1.toLocaleString()}</p>
                  </div>
                  <div className="rounded bg-amber-50 p-2 dark:bg-amber-950">
                    <p className="text-xs text-muted-foreground">Eski (100)</p>
                    <p className="font-bold">{detail.db.stock_100.toLocaleString()}</p>
                  </div>
                  <div className="rounded bg-blue-50 p-2 dark:bg-blue-950">
                    <p className="text-xs text-muted-foreground">Gerçek INT</p>
                    <p className="font-bold">{detail.db.stock_other.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {detail.notes && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950">
                  <p className="font-semibold">Not</p>
                  <p>{detail.notes}</p>
                </div>
              )}

              {detail.last_run && (
                <div className="rounded-md border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Son Çalıştırma
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Başlangıç:</span>{" "}
                      {detail.last_run.started_at
                        ? new Date(detail.last_run.started_at).toLocaleString("tr-TR")
                        : "—"}
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Süre:</span>{" "}
                      {detail.last_run.duration_seconds ?? "—"} sn
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Exit:</span>{" "}
                      <span
                        className={
                          detail.last_run.exit_code === 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {detail.last_run.exit_code ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Tetik:</span>{" "}
                      {detail.last_run.triggered_by}
                    </div>
                  </div>
                  {detail.last_run.error_log_excerpt && (
                    <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                      {detail.last_run.error_log_excerpt}
                    </pre>
                  )}
                </div>
              )}

              {detail.last_alert && (
                <div className="rounded-md border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Son Alarm
                  </p>
                  <p className={`font-medium ${levelColors[detail.last_alert.level as ScraperLevel]}`}>
                    {detail.last_alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(detail.last_alert.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              )}

              {detail.seven_day_runs && detail.seven_day_runs.length > 0 && (
                <div className="rounded-md border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Son 7 Gün
                  </p>
                  <div className="flex items-end gap-1">
                    {detail.seven_day_runs.map((r: any, i: number) => (
                      <div
                        key={i}
                        title={`${new Date(r.date).toLocaleString("tr-TR")} ${r.success ? "✓" : "✗"} ${r.duration_seconds ?? "?"}s`}
                        className={`h-8 w-3 rounded-t ${r.success ? "bg-green-500" : "bg-red-500"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KPICard = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
);

export default ScraperDashboard;
