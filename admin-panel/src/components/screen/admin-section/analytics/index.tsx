"use client";

import { Card, CardContent } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface FunnelData {
  window_days: number;
  funnel: {
    product_viewed: number;
    add_to_cart: number;
    cart_viewed: number;
    checkout_started: number;
    order_placed: number;
  };
  rates: {
    view_to_cart: number;
    cart_to_checkout: number;
    checkout_to_order: number;
    end_to_end: number;
  };
}

interface CtrRow {
  block_type: string;
  shown: number;
  clicked: number;
  added: number;
  ctr_pct: number;
  atc_pct: number;
}

interface ExperimentRow {
  key: string;
  name: string;
  status: string;
  variants: Array<{
    variant_key: string;
    assigned: number;
    exposed: number;
    converted: number;
    conversion_rate: number;
  }>;
}

export default function Analytics() {
  const [days, setDays] = useState(30);

  const funnelSvc = useBaseService<FunnelData>(API_ENDPOINTS.ADMIN_ANALYTICS_FUNNEL);
  const ctrSvc = useBaseService<{ window_days: number; blocks: CtrRow[] }>(
    API_ENDPOINTS.ADMIN_ANALYTICS_RECOMMENDATION_CTR
  );
  const expSvc = useBaseService<{ window_days: number; experiments: ExperimentRow[] }>(
    API_ENDPOINTS.ADMIN_ANALYTICS_EXPERIMENTS
  );

  const { data: funnelRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_FUNNEL, days],
    queryFn: () => funnelSvc.findAll({ days }),
    retry: false,
  });
  const { data: ctrRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_RECOMMENDATION_CTR, days],
    queryFn: () => ctrSvc.findAll({ days }),
    retry: false,
  });
  const { data: expRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_EXPERIMENTS, days],
    queryFn: () => expSvc.findAll({ days }),
    retry: false,
  });

  const funnel = (funnelRes?.data as { data?: FunnelData } | undefined)?.data;
  const ctrData = (ctrRes?.data as { data?: { blocks: CtrRow[] } } | undefined)?.data;
  const experiments = (expRes?.data as { data?: { experiments: ExperimentRow[] } } | undefined)?.data?.experiments ?? [];

  return (
    <div className="space-y-8 p-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funnel & Tavsiye Analitiği</h1>
          <p className="text-sm text-muted-foreground">
            Dönüşüm hunisi, blok CTR&apos;leri ve aktif A/B test performansı.
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value={7}>Son 7 gün</option>
          <option value={14}>Son 14 gün</option>
          <option value={30}>Son 30 gün</option>
          <option value={60}>Son 60 gün</option>
          <option value={90}>Son 90 gün</option>
        </select>
      </header>

      {/* Funnel visualization */}
      {funnel && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Dönüşüm Hunisi</h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <FunnelRow label="Ürün görüntüleme" count={funnel.funnel.product_viewed} max={funnel.funnel.product_viewed} />
              <FunnelRow label="Sepete ekleme" count={funnel.funnel.add_to_cart} max={funnel.funnel.product_viewed} />
              <FunnelRow label="Sepet görüntüleme" count={funnel.funnel.cart_viewed} max={funnel.funnel.product_viewed} />
              <FunnelRow label="Ödemeye başlama" count={funnel.funnel.checkout_started} max={funnel.funnel.product_viewed} />
              <FunnelRow label="Sipariş" count={funnel.funnel.order_placed} max={funnel.funnel.product_viewed} accent="green" />

              <div className="mt-4 grid grid-cols-4 gap-3 border-t pt-4 text-center text-sm">
                <RateTile label="Görüntüle → Sepet" value={funnel.rates.view_to_cart} />
                <RateTile label="Sepet → Ödeme" value={funnel.rates.cart_to_checkout} />
                <RateTile label="Ödeme → Sipariş" value={funnel.rates.checkout_to_order} />
                <RateTile label="Uçtan uca" value={funnel.rates.end_to_end} accent="green" />
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recommendation CTR */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Tavsiye Bloğu Performansı</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3">Blok Tipi</th>
                  <th className="px-4 py-3 text-right">Gösterim</th>
                  <th className="px-4 py-3 text-right">Tıklama</th>
                  <th className="px-4 py-3 text-right">Sepete Eklendi</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">Sepet Oranı</th>
                </tr>
              </thead>
              <tbody>
                {(ctrData?.blocks ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Henüz veri yok.
                    </td>
                  </tr>
                ) : (
                  (ctrData?.blocks ?? []).map((r) => (
                    <tr key={r.block_type} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs">{r.block_type}</td>
                      <td className="px-4 py-3 text-right">{r.shown.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-right">{r.clicked.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-right">{r.added.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">%{r.ctr_pct}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">%{r.atc_pct}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* Experiments */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">A/B Testleri</h2>
        {experiments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Aktif veya son 30 gün içinde biten deney bulunmuyor.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {experiments.map((exp) => (
              <Card key={exp.key}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{exp.name}</div>
                      <code className="text-xs text-muted-foreground">{exp.key}</code>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      exp.status === "running" ? "bg-green-100 text-green-700"
                      : exp.status === "ended" ? "bg-slate-100 text-slate-600"
                      : "bg-amber-100 text-amber-700"
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left">
                        <th className="px-3 py-2">Variant</th>
                        <th className="px-3 py-2 text-right">Atanan</th>
                        <th className="px-3 py-2 text-right">Maruz Kalan</th>
                        <th className="px-3 py-2 text-right">Dönüşen</th>
                        <th className="px-3 py-2 text-right">Dönüşüm %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exp.variants.map((v) => (
                        <tr key={v.variant_key} className="border-b">
                          <td className="px-3 py-2 font-mono text-xs">{v.variant_key}</td>
                          <td className="px-3 py-2 text-right">{v.assigned.toLocaleString("tr-TR")}</td>
                          <td className="px-3 py-2 text-right">{v.exposed.toLocaleString("tr-TR")}</td>
                          <td className="px-3 py-2 text-right">{v.converted.toLocaleString("tr-TR")}</td>
                          <td className="px-3 py-2 text-right font-semibold text-blue-600">%{v.conversion_rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FunnelRow({
  label,
  count,
  max,
  accent,
}: {
  label: string;
  count: number;
  max: number;
  accent?: "green";
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const barColor = accent === "green" ? "bg-green-500" : "bg-blue-500";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">{count.toLocaleString("tr-TR")}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RateTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green";
}) {
  const color = accent === "green" ? "text-green-600" : "text-foreground";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-xl font-bold ${color}`}>%{value}</div>
    </div>
  );
}
