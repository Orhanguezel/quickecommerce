<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
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

    /**
     * Manuel scrape tetikle (admin'in "Simdi Calistir" butonu).
     *
     * Korumalar:
     *  - Rate limit: ayni kaynak son 10 dakikada zaten tetiklendiyse 429
     *  - Concurrent guard: ayni kaynak icin acik (finished_at NULL) run varsa 409
     *  - Pasif kaynaklar engellenir (CF 1010 vb.)
     *
     * Davranis: ScraperRun olusturulur, arkaplanda nohup ile scrapers:run-one
     * baslatilir, 202 Accepted + run_id doner. Admin polling ile takip eder.
     */
    public function trigger(string $name): JsonResponse
    {
        $reg = \App\Services\ScraperSourceRegistry::find($name);
        if (!$reg) {
            return response()->json(['status' => false, 'message' => "Source not found: {$name}"], 404);
        }
        if ($reg['status'] === \App\Services\ScraperSourceRegistry::STATUS_PASSIVE) {
            return response()->json([
                'status' => false,
                'message' => "Bu kaynak pasif: {$reg['notes']}",
            ], 400);
        }

        // Concurrent guard: acik run varsa engelle
        $openRun = \App\Models\ScraperRun::where('source_name', $name)
            ->whereNull('finished_at')
            ->where('started_at', '>=', now()->subHours(2))
            ->first();
        if ($openRun) {
            return response()->json([
                'status' => false,
                'message' => "Bu kaynak icin zaten calisan bir scrape var (run #{$openRun->id})",
                'run_id' => $openRun->id,
            ], 409);
        }

        // Rate limit: son 10 dakikada manuel tetiklendi mi
        $recent = \App\Models\ScraperRun::where('source_name', $name)
            ->where('triggered_by', 'manual')
            ->where('started_at', '>=', now()->subMinutes(10))
            ->exists();
        if ($recent) {
            return response()->json([
                'status' => false,
                'message' => 'Bu kaynak son 10 dakikada manuel calisitirildi, biraz bekleyin.',
            ], 429);
        }

        $run = \App\Models\ScraperRun::create([
            'source_name' => $name,
            'triggered_by' => 'manual',
            'started_at' => now(),
        ]);

        // Fire-and-forget: nohup ile arka planda baslat, hemen don
        $artisan = base_path('artisan');
        $logFile = "/tmp/scraper_run_{$run->id}.log";
        $cmd = "nohup php {$artisan} scrapers:run-one --source=" . escapeshellarg($name)
            . " --run-id={$run->id} > {$logFile} 2>&1 &";
        // shell_exec async (background) — PHP 8.x'de sorunsuz
        shell_exec($cmd);

        return response()->json([
            'status' => true,
            'message' => "Scrape baslatildi: {$name}",
            'data' => [
                'run_id' => $run->id,
                'started_at' => $run->started_at?->toIso8601String(),
            ],
        ], 202);
    }

    /**
     * Alarm feed. Varsayilan SADECE ACIK alarmlar (status=open) -> bayat
     * gurultu yok. status=resolved | all ile degistirilebilir. level/source filtre.
     */
    public function alerts(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 50), 200);
        $level = $request->query('level');
        $source = $request->query('source');
        $status = $request->query('status', 'open'); // open | resolved | all

        $query = ScraperAlert::query()
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($status === 'open') {
            $query->whereNull('resolved_at');
        } elseif ($status === 'resolved') {
            $query->whereNotNull('resolved_at');
        }
        if ($level) {
            $query->where('level', $level);
        }
        if ($source) {
            $query->where('source_name', $source);
        }

        $openCount = ScraperAlert::query()->whereNull('resolved_at')->count();

        return response()->json([
            'status' => true,
            'open_count' => $openCount,
            'data' => $query->get()->map(fn ($a) => [
                'id' => $a->id,
                'level' => $a->level,
                'title' => $a->title,
                'body' => $a->body,
                'source_name' => $a->source_name,
                'scraper_run_id' => $a->scraper_run_id,
                'telegram_sent' => $a->telegram_sent,
                'resolved_at' => $a->resolved_at?->toIso8601String(),
                'resolved_by' => $a->resolved_by,
                'created_at' => $a->created_at?->toIso8601String(),
            ]),
        ]);
    }

    /** Tek bir alarmi 'cozuldu' isaretle. POST alerts/{id}/resolve */
    public function resolveAlert(Request $request, int $id): JsonResponse
    {
        $alert = ScraperAlert::find($id);
        if (!$alert) {
            return response()->json(['status' => false, 'message' => 'Alarm bulunamadi'], 404);
        }
        $by = $this->actorName($request);
        $changed = $alert->markResolved($by);

        return response()->json([
            'status' => true,
            'message' => $changed ? 'Alarm cozuldu olarak isaretlendi' : 'Alarm zaten cozulmustu',
            'open_count' => ScraperAlert::query()->whereNull('resolved_at')->count(),
        ]);
    }

    /** Bir kaynagin TUM acik alarmlarini coz. POST sources/{name}/resolve-alerts */
    public function resolveSourceAlerts(Request $request, string $name): JsonResponse
    {
        $by = $this->actorName($request);
        $count = ScraperAlert::resolveOpenForSource($name, $by);

        return response()->json([
            'status' => true,
            'message' => "{$count} alarm cozuldu ({$name})",
            'resolved' => $count,
            'open_count' => ScraperAlert::query()->whereNull('resolved_at')->count(),
        ]);
    }

    /** Cozen kisi: admin kullanici adi/email, yoksa 'admin'. */
    private function actorName(Request $request): string
    {
        $user = $request->user();
        return (string) ($user?->name ?? $user?->email ?? 'admin');
    }
}
