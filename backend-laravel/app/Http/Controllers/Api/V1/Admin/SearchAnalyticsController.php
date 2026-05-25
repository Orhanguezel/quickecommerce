<?php

namespace App\Http\Controllers\Api\V1\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchAnalyticsController
{
    /**
     * GET /api/v1/admin/search-analytics?period=7d|30d
     *
     * Response 3 bölüm:
     *  - top_terms: en cok aranan term'ler (term, count, avg_results, conversion_rate)
     *  - zero_results: 0 sonuç döndüren aramalar (term, count) — eksik ürün sinyali
     *  - summary: toplam arama, unique term, conversion rate
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->input('period', '7d');
        $days = match ($period) {
            '24h' => 1,
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };

        $since = now()->subDays($days);

        // Top 50 aranan term (count + avg_results + conversion_rate)
        $topTerms = DB::table('search_logs')
            ->select(
                'term',
                DB::raw('COUNT(*) as search_count'),
                DB::raw('ROUND(AVG(results_count), 1) as avg_results'),
                DB::raw('SUM(CASE WHEN clicked_product_id IS NOT NULL THEN 1 ELSE 0 END) as clicks'),
                DB::raw('ROUND(100 * SUM(CASE WHEN clicked_product_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1) as conversion_rate')
            )
            ->where('created_at', '>=', $since)
            ->groupBy('term')
            ->orderByDesc('search_count')
            ->limit(50)
            ->get();

        // 0-sonuç aramalar (en sık)
        $zeroResults = DB::table('search_logs')
            ->select('term', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $since)
            ->where('results_count', 0)
            ->groupBy('term')
            ->orderByDesc('count')
            ->limit(30)
            ->get();

        // Özet
        $summary = DB::table('search_logs')
            ->where('created_at', '>=', $since)
            ->selectRaw('
                COUNT(*) as total_searches,
                COUNT(DISTINCT term) as unique_terms,
                COUNT(DISTINCT ip_hash) as unique_users,
                SUM(CASE WHEN clicked_product_id IS NOT NULL THEN 1 ELSE 0 END) as total_clicks,
                ROUND(100 * SUM(CASE WHEN clicked_product_id IS NOT NULL THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) as overall_conversion_rate,
                SUM(CASE WHEN results_count = 0 THEN 1 ELSE 0 END) as zero_result_count
            ')
            ->first();

        return response()->json([
            'period' => $period,
            'period_label' => match ($period) {
                '24h' => 'Son 24 saat',
                '30d' => 'Son 30 gün',
                '90d' => 'Son 90 gün',
                default => 'Son 7 gün',
            },
            'summary' => $summary,
            'top_terms' => $topTerms,
            'zero_results' => $zeroResults,
        ]);
    }
}
