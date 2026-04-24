"use client";

import { Card, CardContent } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type Stage =
  | "active"
  | "abandoned"
  | "reminded_1"
  | "reminded_2"
  | "reminded_3"
  | "recovered"
  | "unsubscribed";

interface AbandonedCartRow {
  id: number;
  customer_id: number | null;
  customer_name: string | null;
  email: string | null;
  item_count: number;
  cart_total: number | string;
  currency_code: string;
  stage: Stage;
  abandoned_at: string | null;
  first_reminded_at: string | null;
  second_reminded_at: string | null;
  third_reminded_at: string | null;
  recovered_at: string | null;
  created_at: string;
}

interface Stats {
  window_days: number;
  total_snapshots: number;
  abandoned: number;
  reminded_1: number;
  reminded_2: number;
  reminded_3: number;
  recovered: number;
  unsubscribed: number;
  recovery_rate_pct: number;
  abandoned_value: number;
  recovered_value: number;
}

const STAGE_COLORS: Record<Stage, string> = {
  active:       "bg-slate-100 text-slate-700",
  abandoned:    "bg-amber-100 text-amber-800",
  reminded_1:   "bg-blue-100 text-blue-700",
  reminded_2:   "bg-indigo-100 text-indigo-700",
  reminded_3:   "bg-orange-100 text-orange-700",
  recovered:    "bg-green-100 text-green-700",
  unsubscribed: "bg-red-100 text-red-700",
};

export default function AbandonedCarts() {
  const [stage, setStage] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listService = useBaseService<AbandonedCartRow[]>(API_ENDPOINTS.ADMIN_ABANDONED_CART_LIST);
  const statsService = useBaseService<Stats>(API_ENDPOINTS.ADMIN_ABANDONED_CART_STATS);

  const { data: listRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ABANDONED_CART_LIST, stage, search, page],
    queryFn: () => listService.findAll({ stage, search, page, per_page: 25 }),
    retry: false,
  });

  const { data: statsRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ABANDONED_CART_STATS],
    queryFn: () => statsService.findAll({ days: 30 }),
    retry: false,
  });

  // Axios response envelope → data.data (see base.service.ts)
  const payload = (listRes?.data as { data?: { data?: AbandonedCartRow[]; total?: number } }) ?? {};
  const rows: AbandonedCartRow[] = payload.data?.data ?? [];
  const total = payload.data?.total ?? 0;

  const stats = (statsRes?.data as { data?: Stats } | undefined)?.data;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Sepet Terk Analizi</h1>
        <p className="text-sm text-muted-foreground">
          Son 30 gün içindeki terk edilmiş sepetler ve geri kazanım performansı.
        </p>
      </header>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Toplam Terk" value={stats.abandoned} />
          <StatCard label="Geri Kazanılan" value={stats.recovered} accent="green" />
          <StatCard
            label="Geri Kazanım Oranı"
            value={`%${stats.recovery_rate_pct}`}
            accent={stats.recovery_rate_pct >= 10 ? "green" : "amber"}
          />
          <StatCard
            label="Geri Kazanılan Tutar"
            value={`${stats.recovered_value.toLocaleString("tr-TR")} TL`}
            accent="green"
          />
          <StatCard label="Hatırlatma 1 (1sa)" value={stats.reminded_1} />
          <StatCard label="Hatırlatma 2 (24sa)" value={stats.reminded_2} />
          <StatCard label="Hatırlatma 3 (48sa)" value={stats.reminded_3} />
          <StatCard label="Abonelikten Çıkan" value={stats.unsubscribed} accent="red" />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <select
            value={stage}
            onChange={(e) => { setStage(e.target.value); setPage(1); }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="abandoned">Terk Edildi</option>
            <option value="reminded_1">Hatırlatma 1 Gönderildi</option>
            <option value="reminded_2">Hatırlatma 2 Gönderildi</option>
            <option value="reminded_3">Hatırlatma 3 Gönderildi</option>
            <option value="recovered">Geri Kazanıldı</option>
            <option value="unsubscribed">Abonelikten Çıktı</option>
          </select>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="E-posta veya session ID ara..."
            className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">E-posta</th>
                  <th className="px-4 py-3 text-right">Ürün</th>
                  <th className="px-4 py-3 text-right">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Terk Zamanı</th>
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
                    <td className="px-4 py-3 font-mono">{r.id}</td>
                    <td className="px-4 py-3">{r.customer_name ?? "—"}</td>
                    <td className="px-4 py-3">{r.email ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{r.item_count}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {Number(r.cart_total).toLocaleString("tr-TR")} {r.currency_code}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${STAGE_COLORS[r.stage]}`}>
                        {r.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.abandoned_at ? new Date(r.abandoned_at).toLocaleString("tr-TR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
  value: number | string;
  accent?: "green" | "amber" | "red";
}) {
  const accentCls =
    accent === "green" ? "text-green-600"
    : accent === "amber" ? "text-amber-600"
    : accent === "red"   ? "text-red-600"
    : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-bold ${accentCls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
