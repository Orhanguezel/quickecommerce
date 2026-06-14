<?php

namespace App\Services;

use App\Models\ProductSourceMapping;
use App\Models\ScraperAlert;
use App\Models\ScraperRun;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Bir kaynak veya tum sistem icin anlik saglik gostergelerini hesaplar.
 *
 * - On-the-fly: cache yok, her cagrida fresh hesaplar
 * - 30sn polling icin uygun (yarisaltinda <50ms)
 * - JSON dosya tarihleri + DB mapping istatistikleri + son run/alert birlesiminden
 *   "status" hesaplar (healthy/warning/critical/passive)
 */
class ScraperHealthSnapshot
{
    public const STATUS_HEALTHY = 'healthy';
    public const STATUS_WARNING = 'warning';
    public const STATUS_CRITICAL = 'critical';
    public const STATUS_PASSIVE = 'passive';

    private const STALE_HOURS_WARN = 24;
    private const STALE_HOURS_CRIT = 48;
    private const MISSING_RATE_WARN = 0.20;
    private const STOCK100_RATE_WARN = 0.80;

    /** Tek bir kaynak icin full snapshot. */
    public function forSource(string $name): ?array
    {
        $src = ScraperSourceRegistry::find($name);
        if (!$src) {
            return null;
        }

        $jsonPath = ScraperSourceRegistry::jsonPath($name);
        $jsonExists = is_file($jsonPath);
        $jsonAgeH = null;
        $jsonSize = null;
        $jsonMtime = null;
        if ($jsonExists) {
            $mtime = filemtime($jsonPath);
            $jsonAgeH = round((time() - $mtime) / 3600, 1);
            $jsonSize = filesize($jsonPath);
            $jsonMtime = Carbon::createFromTimestamp($mtime);
        }

        // DB mapping istatistikleri
        $mappings = $this->dbStatsFor($src['db_source_name']);

        // Son cron run
        $lastRun = ScraperRun::where('source_name', $name)
            ->latest('started_at')
            ->first();

        // Son alert
        $lastAlert = ScraperAlert::where('source_name', $name)
            ->latest('created_at')
            ->first();

        // Son 7 gun run trend (success/fail)
        $sevenDayRuns = ScraperRun::where('source_name', $name)
            ->where('started_at', '>=', now()->subDays(7))
            ->orderBy('started_at')
            ->get(['started_at', 'exit_code', 'duration_seconds'])
            ->map(fn ($r) => [
                'date' => $r->started_at->toIso8601String(),
                'success' => $r->exit_code === 0,
                'duration_seconds' => $r->duration_seconds,
            ])
            ->all();

        $status = $this->computeStatus($src, $jsonAgeH, $mappings);

        return [
            'name' => $src['name'],
            'platform' => $src['platform'],
            'site_url' => $src['site_url'],
            'registry_status' => $src['status'],
            'notes' => $src['notes'],
            'status' => $status,
            'json' => [
                'exists' => $jsonExists,
                'age_hours' => $jsonAgeH,
                'size_bytes' => $jsonSize,
                'mtime' => $jsonMtime?->toIso8601String(),
            ],
            'db' => $mappings,
            'last_run' => $lastRun ? [
                'started_at' => $lastRun->started_at?->toIso8601String(),
                'finished_at' => $lastRun->finished_at?->toIso8601String(),
                'exit_code' => $lastRun->exit_code,
                'products_scraped' => $lastRun->products_scraped,
                'duration_seconds' => $lastRun->duration_seconds,
                'triggered_by' => $lastRun->triggered_by,
                'error_log_excerpt' => $lastRun->error_log_excerpt,
            ] : null,
            'last_alert' => $lastAlert ? [
                'level' => $lastAlert->level,
                'title' => $lastAlert->title,
                'created_at' => $lastAlert->created_at?->toIso8601String(),
            ] : null,
            'seven_day_runs' => $sevenDayRuns,
        ];
    }

    /** Tum sistem icin KPI ozeti. */
    public function overview(): array
    {
        $allSources = ScraperSourceRegistry::all();
        $statusCounts = [
            self::STATUS_HEALTHY => 0,
            self::STATUS_WARNING => 0,
            self::STATUS_CRITICAL => 0,
            self::STATUS_PASSIVE => 0,
        ];
        $totalMappings = 0;
        $sumStock0 = 0;
        $sumStock1 = 0;
        $sumStock100 = 0;
        $sumStockOther = 0;

        foreach ($allSources as $src) {
            $snap = $this->forSource($src['name']);
            $statusCounts[$snap['status']]++;
            $totalMappings += $snap['db']['total_mappings'];
            $sumStock0 += $snap['db']['stock_0'];
            $sumStock1 += $snap['db']['stock_1'];
            $sumStock100 += $snap['db']['stock_100'];
            $sumStockOther += $snap['db']['stock_other'];
        }

        // Son 24 saatte alarm sayisi + simdi ACIK (cozulmemis) alarm sayisi
        $alertsLast24h = ScraperAlert::where('created_at', '>=', now()->subDay())->count();
        $openAlerts = ScraperAlert::whereNull('resolved_at')->count();

        return [
            'total_sources' => count($allSources),
            'status_counts' => $statusCounts,
            'total_mappings' => $totalMappings,
            'stock_distribution' => [
                'out_of_stock' => $sumStock0,
                'in_stock_symbolic' => $sumStock1,
                'in_stock_legacy_100' => $sumStock100,
                'in_stock_real_int' => $sumStockOther,
                'total_in_stock' => $sumStock1 + $sumStock100 + $sumStockOther,
            ],
            'alerts_last_24h' => $alertsLast24h,
            'open_alerts' => $openAlerts,
            'computed_at' => now()->toIso8601String(),
        ];
    }

    /** Tum kaynak listesi (tablo icin hafif snapshot). */
    public function listAll(): array
    {
        return array_map(fn ($src) => $this->forSourceLight($src['name']), ScraperSourceRegistry::all());
    }

    /** Tablo icin hafif versiyon (run history + alert detayi dahil degil). */
    private function forSourceLight(string $name): array
    {
        $src = ScraperSourceRegistry::find($name);
        if (!$src) {
            return [];
        }
        $jsonPath = ScraperSourceRegistry::jsonPath($name);
        $jsonAgeH = is_file($jsonPath) ? round((time() - filemtime($jsonPath)) / 3600, 1) : null;
        $mappings = $this->dbStatsFor($src['db_source_name']);
        $lastRun = ScraperRun::where('source_name', $name)->latest('started_at')->first();

        return [
            'name' => $src['name'],
            'platform' => $src['platform'],
            'status' => $this->computeStatus($src, $jsonAgeH, $mappings),
            'registry_status' => $src['status'],
            'json_age_hours' => $jsonAgeH,
            'total_mappings' => $mappings['total_mappings'],
            'stock_0' => $mappings['stock_0'],
            'stock_1' => $mappings['stock_1'],
            'stock_100' => $mappings['stock_100'],
            'stock_other' => $mappings['stock_other'],
            'missing' => $mappings['missing_rate'],
            'last_sync_at' => $mappings['last_sync_at'],
            'last_run_exit_code' => $lastRun?->exit_code,
            'last_run_at' => $lastRun?->started_at?->toIso8601String(),
            'notes' => $src['notes'],
        ];
    }

    private function dbStatsFor(string $dbSourceName): array
    {
        $row = DB::selectOne(
            <<<SQL
            SELECT
                COUNT(*) AS total_mappings,
                SUM(CASE WHEN pv.stock_quantity = 0 THEN 1 ELSE 0 END) AS stock_0,
                SUM(CASE WHEN pv.stock_quantity = 1 THEN 1 ELSE 0 END) AS stock_1,
                SUM(CASE WHEN pv.stock_quantity = 100 THEN 1 ELSE 0 END) AS stock_100,
                SUM(CASE WHEN pv.stock_quantity > 1 AND pv.stock_quantity != 100 THEN 1 ELSE 0 END) AS stock_other,
                SUM(CASE WHEN psm.last_sync_status = 'missing' THEN 1 ELSE 0 END) AS missing,
                SUM(CASE WHEN psm.last_sync_status = 'updated' THEN 1 ELSE 0 END) AS updated,
                SUM(CASE WHEN psm.last_sync_status = 'unchanged' THEN 1 ELSE 0 END) AS unchanged,
                MAX(psm.last_sync_at) AS last_sync_at
            FROM product_source_mappings psm
            JOIN product_variants pv ON pv.id = psm.product_variant_id
            WHERE psm.source_name = ?
            SQL,
            [$dbSourceName]
        );
        $total = (int) ($row->total_mappings ?? 0);
        return [
            'total_mappings' => $total,
            'stock_0' => (int) ($row->stock_0 ?? 0),
            'stock_1' => (int) ($row->stock_1 ?? 0),
            'stock_100' => (int) ($row->stock_100 ?? 0),
            'stock_other' => (int) ($row->stock_other ?? 0),
            'updated' => (int) ($row->updated ?? 0),
            'unchanged' => (int) ($row->unchanged ?? 0),
            'missing' => (int) ($row->missing ?? 0),
            'missing_rate' => $total > 0 ? round(($row->missing ?? 0) / $total, 3) : 0,
            'last_sync_at' => $row->last_sync_at,
        ];
    }

    private function computeStatus(array $src, ?float $jsonAgeH, array $mappings): string
    {
        if ($src['status'] === ScraperSourceRegistry::STATUS_PASSIVE) {
            return self::STATUS_PASSIVE;
        }
        if ($jsonAgeH === null || $jsonAgeH > self::STALE_HOURS_CRIT) {
            return self::STATUS_CRITICAL;
        }
        if ($jsonAgeH > self::STALE_HOURS_WARN) {
            return self::STATUS_WARNING;
        }
        if ($mappings['total_mappings'] > 0
            && $mappings['missing_rate'] >= self::MISSING_RATE_WARN) {
            return self::STATUS_WARNING;
        }
        if ($mappings['total_mappings'] >= 30
            && $mappings['stock_100'] / $mappings['total_mappings'] >= self::STOCK100_RATE_WARN) {
            return self::STATUS_WARNING;
        }
        return self::STATUS_HEALTHY;
    }
}
