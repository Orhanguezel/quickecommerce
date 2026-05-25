"use client";
import { Card, CardContent } from "@/components/ui";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useBaseService } from "@/modules/core/base.service";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

interface SearchAnalyticsResponse {
  period: string;
  period_label: string;
  summary: {
    total_searches: number;
    unique_terms: number;
    unique_users: number;
    total_clicks: number;
    overall_conversion_rate: number | null;
    zero_result_count: number;
  };
  top_terms: Array<{
    term: string;
    search_count: number;
    avg_results: number;
    clicks: number;
    conversion_rate: number | null;
  }>;
  zero_results: Array<{ term: string; count: number }>;
}

const SearchAnalytics = () => {
  const t = useTranslations();
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<SearchAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.ADMIN_ANALYTICS_SEARCH
  );

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    getAxiosInstance()
      .get(`${API_ENDPOINTS.ADMIN_ANALYTICS_SEARCH}?period=${period}`)
      .then((res) => {
        if (!canceled) {
          setData(res.data as SearchAnalyticsResponse);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [period, getAxiosInstance]);

  return (
    <>
      <Card>
        <CardContent className="p-2 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Search /> {t("label.search_analytics") ?? "Arama Analytics"}
            </h1>
            <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
              {(["24h", "7d", "30d", "90d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                    period === p
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {p === "24h"
                    ? "24 saat"
                    : p === "7d"
                      ? "7 gün"
                      : p === "30d"
                        ? "30 gün"
                        : "90 gün"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="mt-4">
          <CardContent className="p-8 text-center text-muted-foreground">
            Yükleniyor...
          </CardContent>
        </Card>
      )}

      {!loading && data && (
        <>
          {/* Özet kartlar */}
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Toplam Arama</p>
                <p className="text-2xl font-bold">
                  {data.summary.total_searches}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.period_label}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Tekil Terim</p>
                <p className="text-2xl font-bold">{data.summary.unique_terms}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-primary">
                  {data.summary.overall_conversion_rate != null
                    ? `${data.summary.overall_conversion_rate}%`
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.summary.total_clicks} tıklama
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">0 Sonuç Arama</p>
                <p className="text-2xl font-bold text-amber-600">
                  {data.summary.zero_result_count}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  eksik ürün/kategori sinyali
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top aranan terimler */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h2 className="mb-3 text-lg font-semibold">
                En Çok Aranan Terimler
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2">Terim</th>
                      <th className="py-2 text-right">Arama</th>
                      <th className="py-2 text-right">Ort. Sonuç</th>
                      <th className="py-2 text-right">Tıklama</th>
                      <th className="py-2 text-right">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_terms.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-muted-foreground"
                        >
                          Bu dönemde arama kaydı yok.
                        </td>
                      </tr>
                    )}
                    {data.top_terms.map((row) => (
                      <tr key={row.term} className="border-b">
                        <td className="py-2 font-medium">{row.term}</td>
                        <td className="py-2 text-right">{row.search_count}</td>
                        <td className="py-2 text-right">{row.avg_results}</td>
                        <td className="py-2 text-right">{row.clicks}</td>
                        <td className="py-2 text-right">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              (row.conversion_rate ?? 0) >= 50
                                ? "bg-emerald-100 text-emerald-700"
                                : (row.conversion_rate ?? 0) >= 20
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {row.conversion_rate != null
                              ? `${row.conversion_rate}%`
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 0-sonuç aramalar */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h2 className="mb-3 text-lg font-semibold text-amber-700">
                0 Sonuç Aramalar (eksik ürün/kategori sinyali)
              </h2>
              {data.zero_results.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Bu dönemde 0 sonuç arama yok.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.zero_results.map((row) => (
                    <span
                      key={row.term}
                      className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs"
                    >
                      <strong>{row.term}</strong>
                      <span className="text-muted-foreground">
                        × {row.count}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default SearchAnalytics;
