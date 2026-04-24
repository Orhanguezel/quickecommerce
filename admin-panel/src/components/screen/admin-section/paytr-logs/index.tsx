"use client";

import { Card, CardContent } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, RefreshCw } from "lucide-react";
import { useState } from "react";

type Outcome =
  | "received"
  | "processed"
  | "hash_mismatch"
  | "unknown_oid"
  | "exception";

interface LogRow {
  id: number;
  merchant_oid: string | null;
  status: string | null;
  total_amount: string | number | null;
  source_ip: string | null;
  outcome: Outcome;
  detail: string | null;
  received_at: string;
}

interface Stats {
  counts_24h: Record<Outcome, number>;
  latest_at: string | null;
  latest_merchant_oid: string | null;
  latest_outcome: Outcome | null;
}

const OUTCOME_COLORS: Record<Outcome, string> = {
  received:      "bg-slate-100 text-slate-700",
  processed:     "bg-green-100 text-green-700",
  hash_mismatch: "bg-red-100 text-red-700",
  unknown_oid:   "bg-amber-100 text-amber-700",
  exception:     "bg-red-100 text-red-700",
};

const OUTCOME_LABELS: Record<Outcome, string> = {
  received:      "Alındı",
  processed:     "İşlendi",
  hash_mismatch: "Hash hatalı",
  unknown_oid:   "Bilinmeyen OID",
  exception:     "Hata",
};

export default function PayTRLogs() {
  const [outcome, setOutcome] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listSvc = useBaseService<unknown>(API_ENDPOINTS.ADMIN_PAYTR_CALLBACK_LOGS);
  const statsSvc = useBaseService<Stats>(API_ENDPOINTS.ADMIN_PAYTR_CALLBACK_STATS);

  const { data: listRes, refetch: refetchList } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_PAYTR_CALLBACK_LOGS, outcome, search, page],
    queryFn: () => listSvc.findAll({ outcome, search, page, per_page: 25 }),
    retry: false,
  });

  const { data: statsRes, refetch: refetchStats } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_PAYTR_CALLBACK_STATS],
    queryFn: () => statsSvc.findAll(),
    retry: false,
  });

  const payload = (listRes?.data as { data?: { data?: LogRow[]; total?: number } }) ?? {};
  const rows: LogRow[] = payload.data?.data ?? [];
  const total = payload.data?.total ?? 0;
  const stats = (statsRes?.data as { data?: Stats } | undefined)?.data;

  const refresh = () => {
    refetchList();
    refetchStats();
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">PayTR Callback Log</h1>
            <p className="text-sm text-muted-foreground">
              PayTR tarafından gelen bildirim isteklerinin son kayıtları
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </header>

      {/* 24h stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Son 24sa Alındı" value={stats.counts_24h.received} />
          <StatCard label="İşlendi" value={stats.counts_24h.processed} accent="green" />
          <StatCard label="Hash Hatası" value={stats.counts_24h.hash_mismatch} accent={stats.counts_24h.hash_mismatch > 0 ? "red" : undefined} />
          <StatCard label="Bilinmeyen OID" value={stats.counts_24h.unknown_oid} />
          <StatCard label="Exception" value={stats.counts_24h.exception} accent={stats.counts_24h.exception > 0 ? "red" : undefined} />
        </div>
      )}

      {stats?.latest_at ? (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
            <span className="text-muted-foreground">Son callback:</span>
            <span className="font-mono">{new Date(stats.latest_at).toLocaleString("tr-TR")}</span>
            <span className="text-muted-foreground">OID:</span>
            <code className="rounded bg-muted px-2 py-0.5 text-xs">{stats.latest_merchant_oid ?? "—"}</code>
            <span className="text-muted-foreground">Durum:</span>
            {stats.latest_outcome && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[stats.latest_outcome]}`}>
                {OUTCOME_LABELS[stats.latest_outcome]}
              </span>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Henüz hiç callback kaydedilmedi. PayTR test ödemesi yaptığınızda buraya düşmeli.
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <select
            value={outcome}
            onChange={(e) => { setOutcome(e.target.value); setPage(1); }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="received">Alındı</option>
            <option value="processed">İşlendi</option>
            <option value="hash_mismatch">Hash Hatası</option>
            <option value="unknown_oid">Bilinmeyen OID</option>
            <option value="exception">Exception</option>
          </select>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="merchant_oid ara..."
            className="w-72 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3">Zaman</th>
                  <th className="px-4 py-3">merchant_oid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Tutar</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Sonuç</th>
                  <th className="px-4 py-3">Detay</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.received_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.merchant_oid ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{r.status ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.total_amount ? Number(r.total_amount).toLocaleString("tr-TR") : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.source_ip ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[r.outcome]}`}>
                        {OUTCOME_LABELS[r.outcome]}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[280px] truncate text-xs" title={r.detail ?? ""}>
                      {r.detail ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 25 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span>Toplam {total} kayıt</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  Önceki
                </button>
                <span className="px-3 py-1">Sayfa {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={rows.length < 25}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "red";
}) {
  const color =
    accent === "green" ? "text-green-600"
    : accent === "red" ? "text-red-600"
    : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`mt-0.5 text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
