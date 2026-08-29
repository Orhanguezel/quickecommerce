"use client";

import { Button, Card, CardContent, Input } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

type CustomerRow = {
  customer_id: number;
  name: string;
  email: string;
  balance: number;
  balance_value: number;
  last_activity: string | null;
};

type Transaction = {
  id: number;
  points: number;
  type: string;
  description: string | null;
  reference_type: string | null;
  reference_id: number | null;
  expires_at: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  order: "Sipariş",
  review: "Değerlendirme",
  redeem: "Çeke dönüştürüldü",
  revoke: "İptal/iade",
  expire: "Süresi doldu",
  manual: "Elle düzenleme",
};

const LoyaltyCustomers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const { getAxiosInstance } = useBaseService<any>(API_ENDPOINTS.LOYALTY_CUSTOMERS);

  const { data: summaryData } = useQuery({
    queryKey: [API_ENDPOINTS.LOYALTY_SUMMARY],
    queryFn: async () =>
      (await getAxiosInstance().get(API_ENDPOINTS.LOYALTY_SUMMARY)).data,
  });

  const { data: listData, isPending } = useQuery({
    queryKey: [API_ENDPOINTS.LOYALTY_CUSTOMERS, search],
    queryFn: async () =>
      (
        await getAxiosInstance().get(API_ENDPOINTS.LOYALTY_CUSTOMERS, {
          params: { search: search || undefined, per_page: 20 },
        })
      ).data,
  });

  const { data: historyData } = useQuery({
    queryKey: [API_ENDPOINTS.LOYALTY_CUSTOMER_HISTORY, selected?.customer_id],
    enabled: Boolean(selected),
    queryFn: async () =>
      (
        await getAxiosInstance().get(
          `${API_ENDPOINTS.LOYALTY_CUSTOMER_HISTORY}/${selected?.customer_id}`,
        )
      ).data,
  });

  const adjust = useMutation({
    mutationFn: async (payload: {
      customer_id: number;
      points: number;
      note?: string;
    }) =>
      (await getAxiosInstance().post(API_ENDPOINTS.LOYALTY_ADJUST, payload)).data,
    onSuccess: (res: any) => {
      toast.success(res?.message ?? "Puan güncellendi");
      setAdjustPoints("");
      setAdjustNote("");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.LOYALTY_CUSTOMERS] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.LOYALTY_CUSTOMER_HISTORY],
      });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.LOYALTY_SUMMARY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Puan güncellenemedi");
    },
  });

  const summary = summaryData?.data;
  const rows: CustomerRow[] = listData?.data ?? [];
  const history = historyData?.data;

  const handleAdjust = () => {
    const points = Number(adjustPoints);
    if (!selected || !Number.isFinite(points) || points === 0) {
      toast.error("Sıfırdan farklı bir puan girin (düşürmek için eksi yazın).");
      return;
    }
    adjust.mutate({
      customer_id: selected.customer_id,
      points,
      note: adjustNote || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-2 md:p-4">
          <h1 className="text-lg md:text-2xl font-semibold text-blue-500">
            Sadakat Puanları
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Müşteri bakiyeleri, puan geçmişi ve elle düzeltme.
          </p>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardContent className="p-2 md:p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">Kazanım</p>
                <p className="font-bold">
                  {summary.earning_enabled ? "Açık" : "Kapalı"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">Dağıtılan</p>
                <p className="font-bold">
                  {summary.points_earned?.toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">Harcanan</p>
                <p className="font-bold">
                  {summary.points_spent?.toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">Açık yükümlülük</p>
                <p className="font-bold text-orange-600">
                  {summary.outstanding_liability} TL
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">Çek (üretilen/kullanılan)</p>
                <p className="font-bold">
                  {summary.vouchers_created} / {summary.vouchers_used}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Musteri listesi */}
        <Card>
          <CardContent className="p-2 md:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold">Puanı Olan Müşteriler</h2>
              <Input
                placeholder="Ad veya e-posta ara"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input max-w-[220px]"
              />
            </div>

            {isPending ? (
              <p className="py-6 text-center text-sm text-gray-500">Yükleniyor…</p>
            ) : rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Henüz puanı olan müşteri yok.
              </p>
            ) : (
              <div className="divide-y">
                {rows.map((row) => (
                  <button
                    key={row.customer_id}
                    type="button"
                    onClick={() => setSelected(row)}
                    className={`flex w-full items-center justify-between gap-3 px-1 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selected?.customer_id === row.customer_id
                        ? "bg-blue-50 dark:bg-blue-950/30"
                        : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.name}</p>
                      <p className="truncate text-xs text-gray-500">{row.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold">
                        {row.balance.toLocaleString("tr-TR")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {row.balance_value} TL
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secili musterinin gecmisi + elle duzeltme */}
        <Card>
          <CardContent className="p-2 md:p-4">
            {!selected ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Geçmişi görmek için soldan bir müşteri seçin.
              </p>
            ) : (
              <>
                <div className="mb-3">
                  <h2 className="font-semibold">{selected.name}</h2>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                  <p className="mt-1 text-sm">
                    Bakiye:{" "}
                    <strong>{history?.balance?.toLocaleString("tr-TR")}</strong> puan
                    ({history?.balance_value} TL)
                  </p>
                </div>

                {/* Elle duzeltme */}
                <div className="mb-4 rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">Elle Puan Düzenle</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      type="number"
                      placeholder="Puan (düşürmek için -)"
                      value={adjustPoints}
                      onChange={(e) => setAdjustPoints(e.target.value)}
                      className="app-input sm:max-w-[160px]"
                    />
                    <Input
                      placeholder="Açıklama (opsiyonel)"
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      className="app-input"
                    />
                    <Button
                      onClick={handleAdjust}
                      disabled={adjust.isPending}
                      className="shrink-0"
                    >
                      Uygula
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Bakiye eksiye düşürülemez. İşlem defterde kalıcı iz bırakır.
                  </p>
                </div>

                {/* Gecmis */}
                <div className="max-h-[420px] divide-y overflow-y-auto">
                  {(history?.transactions ?? []).map((tx: Transaction) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {tx.description || TYPE_LABEL[tx.type] || tx.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {TYPE_LABEL[tx.type] ?? tx.type}
                          {tx.reference_type
                            ? ` • ${tx.reference_type} #${tx.reference_id}`
                            : ""}{" "}
                          • {new Date(tx.created_at).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 font-bold ${
                          tx.points > 0 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {tx.points > 0 ? "+" : ""}
                        {tx.points.toLocaleString("tr-TR")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoyaltyCustomers;
