"use client";

import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, BarChart3, ChevronLeft, ChevronRight, CircleDollarSign,
  FlaskConical, LayoutDashboard, Megaphone, ShoppingBag, Store, Target,
} from "lucide-react";
import { ReactNode, useState } from "react";

type FunnelData = {
  funnel: Record<"page_view" | "product_view" | "product_click" | "add_to_cart" | "cart_view" | "checkout_start" | "order_created" | "payment_success", number>;
  rates: Record<"view_to_cart" | "cart_to_checkout" | "checkout_to_order" | "end_to_end", number>;
  device_funnel: Array<{ device_type: string; product_view: number; add_to_cart: number; checkout_start: number }>;
  measurement: { database_payments: number; verified_payment_events: number; first_party_event_coverage_pct: number; attributed_paid_orders: number; order_attribution_coverage_pct: number };
};

type OverviewData = {
  summary: Record<"events" | "human_events" | "bot_events" | "visitors" | "sessions" | "page_views" | "product_views" | "product_clicks" | "add_to_carts" | "checkout_starts" | "orders" | "payments", number>;
  top_pages: Array<{ path: string; views: number; sessions: number }>;
  top_products: Array<{ product_id: number; product_name: string | null; views: number; clicks: number; add_to_carts: number }>;
  top_searches: Array<{ query: string; searches: number }>;
  utm_campaigns: Array<{ utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; events: number }>;
  recent_events: Array<{ event: string; ip_address: string | null; path: string | null; is_bot: boolean; device_type: string | null; browser: string | null; os: string | null; created_at: string }>;
};

type CtrRow = { block_type: string; shown: number; clicked: number; added: number; ctr_pct: number; atc_pct: number };
type CommerceData = {
  catalog: { total: number; hero: number; homepage_featured: number; ads_eligible: number; missing_brand: number; missing_category: number; missing_meta_title: number; quality_below_80: number; overpriced: number; stale_market_price: number };
  stores: { active: number; profile_below_80: number; missing_geliver_sender: number; suspended: number };
  sales: { orders: number; payments: number; revenue: number; platform_commission: number; admin_funded_discount: number; net_platform_contribution: number; net_platform_margin_pct: number; cancelled_or_refunded: number; buyers: number; repeat_buyers: number; repeat_buyer_rate_pct: number };
  shipping: { due: number; on_time: number; breached: number };
  channels: Array<{ source: string; payments: number; revenue: number }>;
  quality_queue: Array<{ id: number; name: string; catalog_quality_score: number; ads_ineligibility_reason: string | null; store?: { name: string } | null }>;
  store_queue: Array<{ id: number; name: string; profile_completion_score: number; geliver_sender_address_id: string | null }>;
  cohorts: Array<{ days: number; eligible_buyers: number; repeat_buyers: number; repeat_rate_pct: number }>;
};
type ExperimentRow = { key: string; name: string; status: string; variants: Array<{ variant_key: string; assigned: number; exposed: number; converted: number; conversion_rate: number }> };
type ActionItem = { priority: "Kritik" | "Yüksek" | "Orta"; title: string; evidence: string; recommendation: string };

const fmt = (value: number) => value.toLocaleString("tr-TR");
const money = (value: number) => value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
const unwrap = <T,>(response: unknown) => (response as { data?: { data?: T } } | undefined)?.data?.data;

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const overviewSvc = useBaseService<OverviewData>(API_ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW);
  const funnelSvc = useBaseService<FunnelData>(API_ENDPOINTS.ADMIN_ANALYTICS_FUNNEL);
  const ctrSvc = useBaseService<{ blocks: CtrRow[] }>(API_ENDPOINTS.ADMIN_ANALYTICS_RECOMMENDATION_CTR);
  const expSvc = useBaseService<{ experiments: ExperimentRow[] }>(API_ENDPOINTS.ADMIN_ANALYTICS_EXPERIMENTS);
  const commerceSvc = useBaseService<CommerceData>(API_ENDPOINTS.ADMIN_ANALYTICS_COMMERCE);
  const overviewQuery = useQuery({ queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW, days], queryFn: () => overviewSvc.findAll({ days }), retry: false });
  const funnelQuery = useQuery({ queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_FUNNEL, days], queryFn: () => funnelSvc.findAll({ days }), retry: false });
  const ctrQuery = useQuery({ queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_RECOMMENDATION_CTR, days], queryFn: () => ctrSvc.findAll({ days }), retry: false });
  const expQuery = useQuery({ queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_EXPERIMENTS, days], queryFn: () => expSvc.findAll({ days }), retry: false });
  const commerceQuery = useQuery({ queryKey: [API_ENDPOINTS.ADMIN_ANALYTICS_COMMERCE, days], queryFn: () => commerceSvc.findAll({ days }), retry: false });
  const overview = unwrap<OverviewData>(overviewQuery.data);
  const funnel = unwrap<FunnelData>(funnelQuery.data);
  const blocks = unwrap<{ blocks: CtrRow[] }>(ctrQuery.data)?.blocks ?? [];
  const experiments = unwrap<{ experiments: ExperimentRow[] }>(expQuery.data)?.experiments ?? [];
  const commerce = unwrap<CommerceData>(commerceQuery.data);
  const queries = [overviewQuery, funnelQuery, ctrQuery, expQuery, commerceQuery];
  const loading = queries.some((query) => query.isLoading);
  const failed = queries.some((query) => query.isError);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analitik ve Aksiyon Merkezi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Satış, katalog, funnel, trafik ve deney performansını tek yerden yönetin.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Tarih aralığı</span>
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {[7, 14, 30, 60, 90].map((value) => <option key={value} value={value}>Son {value} gün</option>)}
          </select>
        </label>
      </header>
      {failed ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">Bazı analitik verileri yüklenemedi. Görünen bölümler güncel olabilir; eksik bölümler için sayfayı yenileyin.</div> : null}
      {loading && !overview && !commerce ? <Skeleton /> : null}

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max justify-start gap-1 bg-muted/70 p-1.5">
            <Tab value="overview" icon={<LayoutDashboard className="h-4 w-4" />}>Genel Bakış</Tab>
            <Tab value="commerce" icon={<ShoppingBag className="h-4 w-4" />}>Ticari Hazırlık</Tab>
            <Tab value="funnel" icon={<BarChart3 className="h-4 w-4" />}>Dönüşüm Hunisi</Tab>
            <Tab value="traffic" icon={<Megaphone className="h-4 w-4" />}>Trafik &amp; İçerik</Tab>
            <Tab value="experiments" icon={<FlaskConical className="h-4 w-4" />}>Tavsiye &amp; A/B</Tab>
          </TabsList>
        </div>
        <TabsContent value="overview" className="space-y-6 pt-3">
          {commerce || funnel ? <ActionCenter actions={buildActions(commerce, funnel)} /> : null}
          {overview ? <OverviewSection overview={overview} commerce={commerce} funnel={funnel} /> : <Empty />}
        </TabsContent>
        <TabsContent value="commerce" className="space-y-6 pt-3">{commerce ? <CommerceSection commerce={commerce} /> : <Empty />}</TabsContent>
        <TabsContent value="funnel" className="space-y-6 pt-3">{funnel ? <FunnelSection funnel={funnel} /> : <Empty />}</TabsContent>
        <TabsContent value="traffic" className="space-y-6 pt-3">{overview ? <TrafficSection overview={overview} /> : <Empty />}</TabsContent>
        <TabsContent value="experiments" className="space-y-6 pt-3"><ExperimentsSection blocks={blocks} experiments={experiments} /></TabsContent>
      </Tabs>
    </div>
  );
}

function buildActions(commerce?: CommerceData, funnel?: FunnelData): ActionItem[] {
  const actions: ActionItem[] = [];
  if (commerce?.catalog.ads_eligible === 0) actions.push({ priority: "Kritik", title: "Reklama uygun ürün bulunmuyor", evidence: `${fmt(commerce.catalog.missing_brand)} marka ve ${fmt(commerce.catalog.missing_meta_title)} meta başlığı eksik.`, recommendation: "Önce kahraman ürünlerde marka, meta başlığı, piyasa fiyatı ve kalite skorunu tamamlayın." });
  if (commerce && commerce.stores.missing_geliver_sender > 0) actions.push({ priority: "Yüksek", title: `${fmt(commerce.stores.missing_geliver_sender)} mağazada Geliver adresi eksik`, evidence: "Bu mağazalarda satıcı bazlı gönderici adresi kullanılamıyor.", recommendation: "Satıcı düzeltme kuyruğunu profil skoru düşük mağazalardan başlayarak tamamlayın." });
  if (funnel && funnel.rates.checkout_to_order < 20) actions.push({ priority: "Yüksek", title: `Checkout → başarılı ödeme %${funnel.rates.checkout_to_order}`, evidence: `${fmt(funnel.funnel.checkout_start)} checkout başlangıcından ${fmt(funnel.funnel.payment_success)} başarılı ödeme oluşmuş.`, recommendation: "Ödeme hatalarını, kargo maliyeti sürprizlerini ve mobil checkout terklerini adım bazında inceleyin." });
  if (funnel && funnel.measurement.order_attribution_coverage_pct < 70) actions.push({ priority: "Yüksek", title: `Sipariş atıf kapsaması %${funnel.measurement.order_attribution_coverage_pct}`, evidence: `${fmt(funnel.measurement.database_payments)} ödemenin yalnızca ${fmt(funnel.measurement.attributed_paid_orders)} tanesi kanala bağlanmış.`, recommendation: "UTM/referrer bilgisini checkout ve ödeme dönüşü boyunca koruyun." });
  if (commerce && commerce.sales.net_platform_margin_pct < 10) actions.push({ priority: "Orta", title: `Net katkı oranı %${commerce.sales.net_platform_margin_pct}`, evidence: `${money(commerce.sales.platform_commission)} komisyona karşı ${money(commerce.sales.admin_funded_discount)} admin teşvik maliyeti oluşmuş.`, recommendation: "Kampanya finansmanını ve satıcı komisyonlarını sipariş bazında gözden geçirin." });
  if (commerce && commerce.sales.buyers > 0 && commerce.sales.repeat_buyers === 0) actions.push({ priority: "Orta", title: "Dönem içinde tekrar alıcı yok", evidence: `${fmt(commerce.sales.buyers)} gerçek alıcıdan tekrar satın alma oluşmamış; örneklem henüz küçük.`, recommendation: "Kohort büyüdükçe izleyin ve satın alma sonrası geri kazanım akışını test edin." });
  return actions;
}

function OverviewSection({ overview, commerce, funnel }: { overview: OverviewData; commerce?: CommerceData; funnel?: FunnelData }) {
  const summary = overview.summary;
  return <>
    <section><Heading title="Dönem Özeti" description="İnsan trafiği ve satın alma niyeti oluşturan temel sinyaller." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Ziyaretçi" value={summary.visitors} /><Metric label="Oturum" value={summary.sessions} /><Metric label="Sayfa görüntüleme" value={summary.page_views} /><Metric label="Bot event" value={summary.bot_events} muted />
      <Metric label="Ürün görüntüleme" value={summary.product_views} /><Metric label="Ürün tıklama" value={summary.product_clicks} /><Metric label="Sepete ekleme" value={summary.add_to_carts} /><Metric label="Ödemeye başlayan" value={summary.checkout_starts} />
    </div></section>
    {commerce && funnel ? <section className="grid gap-4 lg:grid-cols-3">
      <Signal icon={<CircleDollarSign className="h-5 w-5" />} label="Net platform katkısı" value={money(commerce.sales.net_platform_contribution)} detail={`Gelirin %${commerce.sales.net_platform_margin_pct} oranı`} />
      <Signal icon={<Target className="h-5 w-5" />} label="Uçtan uca dönüşüm" value={`%${funnel.rates.end_to_end}`} detail={`${fmt(funnel.funnel.payment_success)} başarılı ödeme`} />
      <Signal icon={<Store className="h-5 w-5" />} label="Operasyon hazır mağaza" value={fmt(Math.max(0, commerce.stores.active - commerce.stores.missing_geliver_sender))} detail={`${fmt(commerce.stores.missing_geliver_sender)} mağazada Geliver eksik`} />
    </section> : null}
  </>;
}

function CommerceSection({ commerce: c }: { commerce: CommerceData }) {
  return <>
    <section><Heading title="Ticari Hazırlık" description="Test siparişleri hariç satışlar, katalog, reklam ve satıcı kalite kapıları." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Kahraman ürün" value={c.catalog.hero} /><Metric label="Ana sayfa vitrini" value={c.catalog.homepage_featured} /><Metric label="Reklama uygun" value={c.catalog.ads_eligible} /><Metric label="Başarılı ödeme" value={c.sales.payments} />
      <Metric label="Gelir (TRY)" value={c.sales.revenue} /><Metric label="Platform komisyonu" value={c.sales.platform_commission} /><Metric label="Net platform katkısı" value={c.sales.net_platform_contribution} /><Metric label="Net katkı oranı" value={c.sales.net_platform_margin_pct} suffix="%" />
      <Metric label="Admin teşvik maliyeti" value={c.sales.admin_funded_discount} /><Metric label="Gerçek alıcı" value={c.sales.buyers} /><Metric label="Tekrar alıcı" value={c.sales.repeat_buyers} /><Metric label="Tekrar alıcı oranı" value={c.sales.repeat_buyer_rate_pct} suffix="%" />
    </div></section>
    <section className="grid gap-6 xl:grid-cols-2">
      <Table title="Katalog Kalite Alarmları" empty="Katalog alarmı yok." headers={["Kontrol", "Ürün"]} rows={[["Markası eksik",fmt(c.catalog.missing_brand)],["Kategorisi eksik",fmt(c.catalog.missing_category)],["Meta başlığı eksik",fmt(c.catalog.missing_meta_title)],["Kalite skoru 80 altı",fmt(c.catalog.quality_below_80)],["Piyasanın %15 üzeri",fmt(c.catalog.overpriced)],["Piyasa fiyatı bayat/eksik",fmt(c.catalog.stale_market_price)]]} />
      <Table title="Satıcı ve Sevkiyat Alarmları" empty="Operasyon alarmı yok." headers={["Kontrol", "Adet"]} rows={[["Profil skoru 80 altı",fmt(c.stores.profile_below_80)],["Geliver adresi eksik",fmt(c.stores.missing_geliver_sender)],["Satışı askıya alınmış",fmt(c.stores.suspended)],["Kargo SLA ihlali",fmt(c.shipping.breached)],["İptal/iade ödeme",fmt(c.sales.cancelled_or_refunded)]]} />
      <Table title="Ödeme Üreten Kanallar" empty="Sipariş atıf verisi henüz yok." headers={["Kaynak","Ödeme","Gelir"]} rows={c.channels.map((x) => [x.source,fmt(Number(x.payments)),money(Number(x.revenue))])} />
      <Table title="Tekrar Satın Alma Kohortları" empty="Kohort verisi yok." headers={["Pencere","Uygun alıcı","Tekrar alıcı","Oran"]} rows={c.cohorts.map((x) => [`${x.days} gün`,String(x.eligible_buyers),String(x.repeat_buyers),`%${x.repeat_rate_pct}`])} />
    </section>
    <Table title="Öncelikli Ürün Düzeltme Kuyruğu" description="Reklam ve katalog kalitesini en hızlı yükseltecek ürünler." empty="Düzeltme bekleyen ürün yok." headers={["Ürün","Mağaza","Skor","Reklam engeli"]} rows={c.quality_queue.map((x) => [`#${x.id} ${x.name}`,x.store?.name || "-",String(x.catalog_quality_score),x.ads_ineligibility_reason || "-"])} pageSize={8} />
    <Table title="Öncelikli Satıcı Düzeltme Kuyruğu" description="Profil ve sevkiyat hazırlığı eksik mağazalar." empty="Düzeltme bekleyen satıcı yok." headers={["Mağaza","Profil skoru","Geliver"]} rows={c.store_queue.map((x) => [`#${x.id} ${x.name}`,String(x.profile_completion_score),x.geliver_sender_address_id ? "Bağlı" : "Eksik"])} pageSize={8} />
  </>;
}

function FunnelSection({ funnel: f }: { funnel: FunnelData }) {
  const steps: Array<[string, number, boolean?]> = [["Sayfa görüntüleme",f.funnel.page_view],["Ürün görüntüleme",f.funnel.product_view],["Ürün tıklama",f.funnel.product_click],["Sepete ekleme",f.funnel.add_to_cart],["Sepet görüntüleme",f.funnel.cart_view],["Ödemeye başlama",f.funnel.checkout_start],["Sipariş oluşturuldu",f.funnel.order_created],["Ödeme başarılı",f.funnel.payment_success,true]];
  return <><section><Heading title="Dönüşüm Hunisi" description="Ziyaretçinin ilk görüntülemeden başarılı ödemeye kadar ilerleyişi." /><Card><CardContent className="space-y-3 p-4 sm:p-5">{steps.map(([label,count,accent]) => <FunnelRow key={label} label={label} count={count} max={f.funnel.page_view} accent={accent} />)}<div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-center lg:grid-cols-4"><Rate label="Görüntüle → Sepet" value={f.rates.view_to_cart} /><Rate label="Sepet → Ödeme" value={f.rates.cart_to_checkout} /><Rate label="Checkout → Ödeme" value={f.rates.checkout_to_order} /><Rate label="Uçtan uca" value={f.rates.end_to_end} accent /></div></CardContent></Card></section>
    <section className="grid gap-6 xl:grid-cols-2"><Table title="Cihaza Göre Funnel" empty="Cihaz kırılımı yok." headers={["Cihaz","Ürün","Sepet","Checkout"]} rows={f.device_funnel.map((x) => [x.device_type,fmt(Number(x.product_view)),fmt(Number(x.add_to_cart)),fmt(Number(x.checkout_start))])} /><Table title="Ölçüm Sağlığı" empty="Ölçüm verisi yok." headers={["Kontrol","Değer"]} rows={[["Veritabanı başarılı ödeme",String(f.measurement.database_payments)],["Doğrulanmış first-party payment event",String(f.measurement.verified_payment_events)],["First-party event kapsaması",`%${f.measurement.first_party_event_coverage_pct}`],["Sipariş atıf kapsaması",`%${f.measurement.order_attribution_coverage_pct}`]]} /></section></>;
}

function TrafficSection({ overview: o }: { overview: OverviewData }) {
  return <><section className="grid gap-6 xl:grid-cols-2">
    <Table title="En Çok Ziyaret Edilen Sayfalar" empty="Henüz veri yok." headers={["Sayfa","Görüntüleme","Oturum"]} rows={o.top_pages.map((x) => [x.path,fmt(x.views),fmt(x.sessions)])} pageSize={5} />
    <Table title="En Çok Etkileşim Alan Ürünler" empty="Henüz veri yok." headers={["Ürün","Görüntüleme","Tıklama","Sepet"]} rows={o.top_products.map((x) => [x.product_name || `#${x.product_id}`,fmt(Number(x.views)),fmt(Number(x.clicks)),fmt(Number(x.add_to_carts))])} pageSize={5} />
    <Table title="En Çok Aranan Kelimeler" empty="Henüz veri yok." headers={["Arama","Adet"]} rows={o.top_searches.map((x) => [x.query,fmt(x.searches)])} pageSize={5} />
    <Table title="UTM Kampanyaları" empty="Henüz UTM verisi yok." headers={["Kaynak","Medium","Kampanya","Event"]} rows={o.utm_campaigns.map((x) => [x.utm_source || "-",x.utm_medium || "-",x.utm_campaign || "-",fmt(x.events)])} pageSize={5} />
  </section><Table title="Son Eventler" description="Bot ve insan eventlerini cihaz bilgisiyle birlikte inceleyin." empty="Henüz event yok." headers={["Zaman","Event","IP","Path","Cihaz","Bot"]} rows={o.recent_events.map((x) => [new Date(x.created_at).toLocaleString("tr-TR"),x.event,x.ip_address || "-",x.path || "-",[x.device_type,x.browser,x.os].filter(Boolean).join(" / ") || "-",x.is_bot ? "Evet" : "Hayır"])} pageSize={10} /></>;
}

function ExperimentsSection({ blocks, experiments }: { blocks: CtrRow[]; experiments: ExperimentRow[] }) {
  return <><Table title="Tavsiye Bloğu Performansı" description="Gösterimden tıklama ve sepete eklemeye kadar blok verimliliği." empty="Henüz veri yok." headers={["Blok Tipi","Gösterim","Tıklama","Sepete Eklendi","CTR","Sepet Oranı"]} rows={blocks.map((x) => [x.block_type,fmt(x.shown),fmt(x.clicked),fmt(x.added),`%${x.ctr_pct}`,`%${x.atc_pct}`])} pageSize={8} />
    <section><Heading title="A/B Testleri" description="Aktif ve yakın zamanda tamamlanan deneylerin varyant performansı." />{experiments.length === 0 ? <Empty text="Aktif veya seçili dönemde biten deney bulunmuyor." /> : <div className="space-y-4">{experiments.map((exp) => <Card key={exp.key}><CardContent className="p-0"><div className="flex items-center justify-between gap-4 border-b p-4"><div className="min-w-0"><h3 className="truncate font-semibold">{exp.name}</h3><code className="text-xs text-muted-foreground">{exp.key}</code></div><span className="text-xs font-semibold uppercase text-muted-foreground">{exp.status}</span></div><div className="overflow-x-auto"><table className="min-w-[620px] w-full text-sm"><thead className="border-b bg-muted/40"><tr><th className="px-4 py-3 text-left">Varyant</th><th className="px-4 py-3 text-right">Atanan</th><th className="px-4 py-3 text-right">Maruz Kalan</th><th className="px-4 py-3 text-right">Dönüşen</th><th className="px-4 py-3 text-right">Dönüşüm</th></tr></thead><tbody>{exp.variants.map((v) => <tr key={v.variant_key} className="border-b last:border-0"><td className="px-4 py-3 font-mono text-xs">{v.variant_key}</td><td className="px-4 py-3 text-right">{fmt(v.assigned)}</td><td className="px-4 py-3 text-right">{fmt(v.exposed)}</td><td className="px-4 py-3 text-right">{fmt(v.converted)}</td><td className="px-4 py-3 text-right font-semibold text-blue-600">%{v.conversion_rate}</td></tr>)}</tbody></table></div></CardContent></Card>)}</div>}</section></>;
}

function ActionCenter({ actions }: { actions: ActionItem[] }) {
  return <section><Heading title="Öncelikli Aksiyonlar" description="Mevcut veriye göre en yüksek ticari ve operasyonel etkiye sahip işler." /><div className="overflow-hidden rounded-lg border bg-card shadow-sm">{actions.map((action) => <div key={action.title} className="grid gap-3 border-b p-4 last:border-0 lg:grid-cols-[110px_minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-center"><Priority value={action.priority} /><div><h3 className="font-semibold">{action.title}</h3><p className="mt-1 text-sm text-muted-foreground">{action.evidence}</p></div><div className="rounded-md bg-muted/50 px-3 py-2 text-sm"><span className="font-medium">Önerilen adım:</span> {action.recommendation}</div></div>)}</div></section>;
}

function Table({ title, description, empty, headers, rows, pageSize = 0 }: { title: string; description?: string; empty: string; headers: string[]; rows: string[][]; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const totalPages = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const current = Math.min(page, totalPages);
  const visible = pageSize ? rows.slice((current - 1) * pageSize, current * pageSize) : rows;
  return <section className="min-w-0"><Heading title={title} description={description} /><Card className="overflow-hidden"><CardContent className="p-0"><div className="overflow-x-auto"><table className="min-w-[560px] w-full text-sm"><thead className="border-b bg-muted/40"><tr>{headers.map((header,index) => <th key={header} className={`px-4 py-3 ${index ? "text-right" : "text-left"}`}>{header}</th>)}</tr></thead><tbody>{rows.length ? visible.map((row,rowIndex) => <tr key={`${current}-${rowIndex}-${row[0]}`} className="border-b last:border-0 hover:bg-muted/20">{row.map((cell,index) => <td key={`${index}-${cell}`} title={cell} className={`px-4 py-3 ${index ? "text-right tabular-nums" : "max-w-[360px] truncate"}`}>{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="py-8 text-center text-muted-foreground">{empty}</td></tr>}</tbody></table></div>{pageSize && rows.length > pageSize ? <div className="flex items-center justify-between border-t px-4 py-3 text-sm"><span className="text-xs text-muted-foreground">{fmt(rows.length)} kayıt · Sayfa {current}/{totalPages}</span><div className="flex gap-2"><PageButton label="Önceki sayfa" disabled={current <= 1} onClick={() => setPage(current - 1)}><ChevronLeft className="h-4 w-4" /></PageButton><PageButton label="Sonraki sayfa" disabled={current >= totalPages} onClick={() => setPage(current + 1)}><ChevronRight className="h-4 w-4" /></PageButton></div></div> : null}</CardContent></Card></section>;
}

function Tab({ value, icon, children }: { value: string; icon: ReactNode; children: ReactNode }) { return <TabsTrigger value={value} className="gap-2 px-3 py-2 text-xs sm:text-sm">{icon}{children}</TabsTrigger>; }
function Heading({ title, description }: { title: string; description?: string }) { return <div className="mb-3"><h2 className="text-lg font-semibold">{title}</h2>{description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}</div>; }
function Metric({ label, value, muted, suffix }: { label: string; value: number; muted?: boolean; suffix?: string }) { return <Card><CardContent className="p-4"><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-2 text-2xl font-bold tabular-nums ${muted ? "text-muted-foreground" : ""}`}>{fmt(value)}{suffix}</div></CardContent></Card>; }
function Signal({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) { return <Card><CardContent className="flex items-start gap-4 p-4"><span className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">{icon}</span><div><div className="text-sm text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div></CardContent></Card>; }
function Priority({ value }: { value: ActionItem["priority"] }) { const style = value === "Kritik" ? "border-red-200 bg-red-50 text-red-700" : value === "Yüksek" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"; return <span className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${style}`}><AlertTriangle className="h-3.5 w-3.5" />{value}</span>; }
function FunnelRow({ label, count, max, accent }: { label: string; count: number; max: number; accent?: boolean }) { const pct = max > 0 ? count / max * 100 : 0; return <div><div className="mb-1 flex justify-between gap-4 text-sm"><span className="font-medium">{label}</span><span className="tabular-nums">{fmt(count)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${accent ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} /></div></div>; }
function Rate({ label, value, accent }: { label: string; value: number; accent?: boolean }) { return <div className="rounded-md bg-muted/40 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-xl font-bold ${accent ? "text-green-600" : ""}`}>%{value}</div></div>; }
function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">{children}</button>; }
function Skeleton() { return <div className="grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Analitik verileri yükleniyor">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-24 rounded bg-muted" />)}</div>; }
function Empty({ text = "Bu bölüm için henüz veri bulunmuyor." }: { text?: string }) { return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{text}</CardContent></Card>; }
