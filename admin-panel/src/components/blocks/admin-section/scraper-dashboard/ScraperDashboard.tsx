"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui";
import {
  useScraperOverviewQuery,
  useScraperSourcesQuery,
  useScraperAlertsQuery,
  useScraperSourceDetailQuery,
  useScraperTriggerMutation,
} from "@/modules/admin-section/scraper-dashboard/scraper-dashboard.action";
import { toast } from "react-toastify";
import {
  ScraperStatus,
  ScraperLevel,
  ScraperSourceRow,
} from "@/modules/admin-section/scraper-dashboard/scraper-dashboard.type";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Database,
  Pause,
  Play,
  RefreshCcw,
  Search,
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

type SortKey = "name" | "platform" | "total_mappings" | "stock_0" | "json_age_hours" | "status";
type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<ScraperStatus, number> = {
  critical: 0,
  warning: 1,
  healthy: 2,
  passive: 3,
};

const ScraperDashboard = () => {
  const { data: overviewResp, isFetching: isOvFetching, isLoading: isOvLoading } = useScraperOverviewQuery();
  const { data: sourcesResp, isFetching: isSrcFetching, isLoading: isSrcLoading } = useScraperSourcesQuery();
  const { data: alertsResp, isLoading: isAlLoading } = useScraperAlertsQuery({ limit: 10 });
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { data: detailResp } = useScraperSourceDetailQuery(selectedSource);

  // Filter + sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScraperStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const overview = (overviewResp as any)?.data?.data;
  const allSources: ScraperSourceRow[] = (sourcesResp as any)?.data?.data ?? [];
  const alerts = (alertsResp as any)?.data?.data ?? [];
  const detail = (detailResp as any)?.data?.data;

  const triggerMut = useScraperTriggerMutation();
  const handleTrigger = (name: string) => {
    if (!confirm(`${name} kaynağını şimdi çalıştır?\n\nScrape + sync chain arka planda başlatılır. Sayfayı kapatabilirsin, sonuç otomatik yansır.`)) return;
    triggerMut.mutate(name, {
      onSuccess: (resp: any) => {
        const runId = resp?.data?.data?.run_id;
        toast.success(`Scrape başlatıldı (run #${runId ?? "?"})`);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "Tetikleme başarısız";
        toast.error(msg);
      },
    });
  };

  // Filter + sort
  const sources = (() => {
    let list = allSources;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.platform.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...list].sort((a, b) => {
      let av: any;
      let bv: any;
      if (sortKey === "status") {
        av = STATUS_ORDER[a.status];
        bv = STATUS_ORDER[b.status];
      } else if (sortKey === "json_age_hours") {
        av = a.json_age_hours ?? 99999;
        bv = b.json_age_hours ?? 99999;
      } else {
        av = (a as any)[sortKey];
        bv = (b as any)[sortKey];
      }
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return ((av ?? 0) - (bv ?? 0)) * dir;
    });
    return sorted;
  })();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ keyName, label, align = "left" }: { keyName: SortKey; label: string; align?: "left" | "right" }) => (
    <th
      className={`px-3 py-2 cursor-pointer select-none hover:bg-muted ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => toggleSort(keyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === keyName ? (
          sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </span>
    </th>
  );

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
      {isOvLoading && !overview && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
            <div className="border-b px-4 py-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">
                  Kaynak Listesi
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {sources.length} / {allSources.length}
                  </span>
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Kaynak veya platform ara..."
                    className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option value="all">Tüm durumlar</option>
                  <option value="critical">Kritik</option>
                  <option value="warning">Uyarı</option>
                  <option value="healthy">Sağlıklı</option>
                  <option value="passive">Pasif</option>
                </select>
                {(search || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <SortHeader keyName="name" label="Kaynak" />
                    <SortHeader keyName="platform" label="Platform" />
                    <SortHeader keyName="total_mappings" label="Mapping" align="right" />
                    <th className="px-3 py-2 text-right">Stokta</th>
                    <SortHeader keyName="stock_0" label="Tükendi" align="right" />
                    <SortHeader keyName="json_age_hours" label="JSON Yaşı" />
                    <SortHeader keyName="status" label="Durum" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isSrcLoading && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                        <RefreshCcw className="mx-auto h-5 w-5 animate-spin opacity-50" />
                        <div className="mt-2">Yükleniyor...</div>
                      </td>
                    </tr>
                  )}
                  {!isSrcLoading && sources.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                        {allSources.length === 0
                          ? "Henüz kaynak verisi yok"
                          : "Filtreyle eşleşen kaynak yok"}
                      </td>
                    </tr>
                  )}
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
              {isAlLoading && (
                <div className="px-4 py-6 text-center">
                  <RefreshCcw className="mx-auto h-4 w-4 animate-spin text-muted-foreground opacity-50" />
                </div>
              )}
              {!isAlLoading && alerts.length === 0 && (
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
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
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
              <div className="flex shrink-0 items-center gap-2">
                {detail.registry_status === "active" && (
                  <button
                    onClick={() => handleTrigger(detail.name)}
                    disabled={triggerMut.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    title="Şimdi çalıştır — scrape + sync chain başlatır"
                  >
                    {triggerMut.isPending ? (
                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    Şimdi Çalıştır
                  </button>
                )}
                <button
                  onClick={() => setSelectedSource(null)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  ×
                </button>
              </div>
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
