"use client";

import { Card, CardContent } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface FunnelData {
  window_days: number;
  funnel: {
    page_view: number;
    product_view: number;
    product_click: number;
    add_to_cart: number;
    cart_view: number;
    checkout_start: number;
    order_created: number;
    payment_success: number;
  };
  rates: {
    view_to_cart: number;
    cart_to_checkout: number;
    checkout_to_order: number;
    end_to_end: number;
  };
}

interface OverviewData {
  window_days: number;
  summary: {
    events: number;
    human_events: number;
    bot_events: number;
    visitors: number;
    sessions: number;
    page_views: number;
    product_views: number;
    product_clicks: number;
    add_to_carts: number;
    checkout_starts: number;
    orders: number;
    payments: number;
  };
  top_pages: Array<{ path: string; views: number; sessions: number }>;
  top_products: Array<{
    product_id: number;
    product_name: string | null;
    views: number;
    clicks: number;
    add_to_carts: number;
  }>;
  top_searches: Array<{ query: string; searches: number }>;
  utm_campaigns: Array<{
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    events: number;
  }>;
  devices: Array<{ device_type: string | null; sessions: number }>;
  recent_events: Array<{
    event: string;
    subject: string;
    visitor_id: string | null;
    session_id: string | null;
    ip_address: string | null;
    path: string | null;
    product_id: number | null;
    amount: string | number | null;
    is_bot: boolean;
    device_type: string | null;
    browser: string | null;
    os: string | null;
    created_at: string;
  }>;
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

  const overviewSvc = useBaseService<OverviewData>(API_ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW);
  const funnelSvc = useBaseService<FunnelData>(API_ENDPOINTS.ADMIN_ANALYTICS_FUNNEL);
  const ctrSvc = useBaseService<{ window_days: number; blocks: CtrRow[] }>(
    API_ENDPOINTS.ADMIN_ANALYTICS_RECOMMENDATION_CTR
  );
  const expSvc = useBaseService<{ window_days: number; experiments: ExperimentRow[] }>(
    API_ENDPOINTS.ADMIN_ANALYTICS_EXPERIMENTS
  );

  const { data: overviewRes } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW, days],
    queryFn: () => overviewSvc.findAll({ days }),
    retry: false,
  });
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

  const overview = (overviewRes?.data as { data?: OverviewData } | undefined)?.data;
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

      {overview && (
        <section>
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Ziyaretçi" value={overview.summary.visitors} />
            <MetricCard label="Oturum" value={overview.summary.sessions} />
            <MetricCard label="Sayfa görüntüleme" value={overview.summary.page_views} />
            <MetricCard label="Bot event" value={overview.summary.bot_events} muted />
            <MetricCard label="Ürün görüntüleme" value={overview.summary.product_views} />
            <MetricCard label="Ürün tıklama" value={overview.summary.product_clicks} />
            <MetricCard label="Sepete ekleme" value={overview.summary.add_to_carts} />
            <MetricCard label="Ödeme başlangıcı" value={overview.summary.checkout_starts} />
          </div>
        </section>
      )}

      {/* Funnel visualization */}
      {funnel && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Dönüşüm Hunisi</h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <FunnelRow label="Sayfa görüntüleme" count={funnel.funnel.page_view} max={funnel.funnel.page_view} />
              <FunnelRow label="Ürün görüntüleme" count={funnel.funnel.product_view} max={funnel.funnel.page_view} />
              <FunnelRow label="Ürün tıklama" count={funnel.funnel.product_click} max={funnel.funnel.page_view} />
              <FunnelRow label="Sepete ekleme" count={funnel.funnel.add_to_cart} max={funnel.funnel.page_view} />
              <FunnelRow label="Sepet görüntüleme" count={funnel.funnel.cart_view} max={funnel.funnel.page_view} />
              <FunnelRow label="Ödemeye başlama" count={funnel.funnel.checkout_start} max={funnel.funnel.page_view} />
              <FunnelRow label="Ödeme başarılı" count={funnel.funnel.payment_success} max={funnel.funnel.page_view} accent="green" />

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

      {overview && (
        <section className="grid gap-6 xl:grid-cols-2">
          <ReportTable
            title="En Çok Ziyaret Edilen Sayfalar"
            empty="Henüz sayfa görüntüleme verisi yok."
            headers={["Sayfa", "Görüntüleme", "Oturum"]}
            rows={overview.top_pages.map((row) => [
              row.path,
              row.views.toLocaleString("tr-TR"),
              row.sessions.toLocaleString("tr-TR"),
            ])}
          />
          <ReportTable
            title="En Çok Etkileşim Alan Ürünler"
            empty="Henüz ürün verisi yok."
            headers={["Ürün", "Görüntüleme", "Tıklama", "Sepet"]}
            rows={overview.top_products.map((row) => [
              row.product_name || `#${row.product_id}`,
              Number(row.views).toLocaleString("tr-TR"),
              Number(row.clicks).toLocaleString("tr-TR"),
              Number(row.add_to_carts).toLocaleString("tr-TR"),
            ])}
          />
          <ReportTable
            title="En Çok Aranan Kelimeler"
            empty="Henüz arama verisi yok."
            headers={["Arama", "Adet"]}
            rows={overview.top_searches.map((row) => [
              row.query,
              row.searches.toLocaleString("tr-TR"),
            ])}
          />
          <ReportTable
            title="UTM Kampanyaları"
            empty="Henüz UTM verisi yok."
            headers={["Kaynak", "Medium", "Kampanya", "Event"]}
            rows={overview.utm_campaigns.map((row) => [
              row.utm_source || "-",
              row.utm_medium || "-",
              row.utm_campaign || "-",
              row.events.toLocaleString("tr-TR"),
            ])}
          />
        </section>
      )}

      {overview && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Son Eventler</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr className="text-left">
                    <th className="px-4 py-3">Zaman</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3">Cihaz</th>
                    <th className="px-4 py-3">Bot</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent_events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Henüz event yok.
                      </td>
                    </tr>
                  ) : (
                    overview.recent_events.map((event, index) => (
                      <tr key={`${event.created_at}-${index}`} className="border-b hover:bg-muted/20">
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{event.event}</td>
                        <td className="px-4 py-3 font-mono text-xs">{event.ip_address || "-"}</td>
                        <td className="px-4 py-3 max-w-[280px] truncate">{event.path || "-"}</td>
                        <td className="px-4 py-3">{[event.device_type, event.browser, event.os].filter(Boolean).join(" / ") || "-"}</td>
                        <td className="px-4 py-3">{event.is_bot ? "Evet" : "Hayır"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

function MetricCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
        <div className={`mt-2 text-2xl font-bold ${muted ? "text-muted-foreground" : ""}`}>
          {value.toLocaleString("tr-TR")}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportTable({
  title,
  empty,
  headers,
  rows,
}: {
  title: string;
  empty: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-8 text-center text-muted-foreground">
                    {empty}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/20">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-3 ${cellIndex === 0 ? "max-w-[320px] truncate" : "text-right tabular-nums"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
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
