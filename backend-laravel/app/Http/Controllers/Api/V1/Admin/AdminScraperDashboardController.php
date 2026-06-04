<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScraperAlert;
use App\Models\ScraperRun;
use App\Services\ScraperHealthSnapshot;
use App\Services\ScraperSourceRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin paneldeki Scraper Health Dashboard endpoint'leri.
 *
 * 4 endpoint:
 *  GET overview      — KPI ozeti (toplam kaynak, durum dagilimi, stok ozeti)
 *  GET sources       — Tablolu liste (her kaynak icin 1 satir)
 *  GET sources/{name}— Tek kaynak full detay (run history, alerts, mapping)
 *  GET alerts        — Son alarmlar (filter destekli)
 *
 * Authorization: routes/api.php icindeki 'auth:sanctum' + ApiAuthMiddleware
 * (system_level admin scope kontrolu mevcut middleware'de).
 */
class AdminScraperDashboardController extends Controller
{
    public function __construct(private readonly ScraperHealthSnapshot $snapshot)
    {
    }

    /** KPI cards icin ozet. */
    public function overview(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'data' => $this->snapshot->overview(),
        ]);
    }

    /** Tablolu kaynak listesi. */
    public function sources(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'data' => $this->snapshot->listAll(),
        ]);
    }

    /** Tek kaynak detay (drawer/modal icin). */
    public function source(string $name): JsonResponse
    {
        $data = $this->snapshot->forSource($name);
        if (!$data) {
            return response()->json([
                'status' => false,
                'message' => "Source not found: {$name}",
            ], 404);
        }
        return response()->json([
            'status' => true,
            'data' => $data,
        ]);
    }

    /** Son alarmlar (alert feed). */
    public function alerts(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 50), 200);
        $level = $request->query('level');
        $source = $request->query('source');

        $query = ScraperAlert::query()
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($level) {
            $query->where('level', $level);
        }
        if ($source) {
            $query->where('source_name', $source);
        }

        return response()->json([
            'status' => true,
            'data' => $query->get()->map(fn ($a) => [
                'id' => $a->id,
                'level' => $a->level,
                'title' => $a->title,
                'body' => $a->body,
                'source_name' => $a->source_name,
                'scraper_run_id' => $a->scraper_run_id,
                'telegram_sent' => $a->telegram_sent,
                'created_at' => $a->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
