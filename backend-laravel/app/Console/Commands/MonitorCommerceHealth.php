<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ScraperRun;
use App\Models\Store;
use App\Services\AdminNotifier;
use App\Services\ScraperSourceRegistry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class MonitorCommerceHealth extends Command
{
    protected $signature = 'monitor:commerce-health {--notify}';
    protected $description = 'Smoke-test critical commerce pages and audit cache, queue, images and scraper freshness';

    public function handle(): int
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        $productSlug = Product::query()->publiclySellable()->value('slug');
        $storeSlug = Store::query()->where('status', 1)->validForCustomerView()->value('slug');
        $paths = [
            'home' => '/tr',
            'categories' => '/tr/kategoriler',
            'products' => '/tr/urunler',
            'stores' => '/tr/magazalar',
            'cart' => '/tr/sepet',
            'checkout' => '/tr/odeme',
        ];
        if ($productSlug) $paths['product_detail'] = '/tr/urun/' . $productSlug;
        if ($storeSlug) $paths['store_detail'] = '/tr/magaza/' . $storeSlug;

        $pages = [];
        foreach ($paths as $name => $path) {
            $started = microtime(true);
            try {
                $response = Http::timeout(20)->retry(2, 400)->withHeaders([
                    'User-Agent' => 'Sportoonline-Commerce-Health/1.0',
                ])->get($baseUrl . $path);
                $pages[$name] = [
                    'path' => $path,
                    'status' => $response->status(),
                    'milliseconds' => (int) round((microtime(true) - $started) * 1000),
                    'ok' => $response->successful() && strlen($response->body()) > 1000,
                ];
            } catch (\Throwable $exception) {
                $pages[$name] = [
                    'path' => $path,
                    'status' => 0,
                    'milliseconds' => (int) round((microtime(true) - $started) * 1000),
                    'ok' => false,
                    'error' => $exception->getMessage(),
                ];
            }
        }

        $cacheKey = 'commerce-health:probe';
        $cacheValue = bin2hex(random_bytes(8));
        Cache::put($cacheKey, $cacheValue, 60);
        $cacheOk = Cache::get($cacheKey) === $cacheValue;
        Cache::forget($cacheKey);

        $dbOk = false;
        try {
            $dbOk = (int) (DB::selectOne('SELECT 1 value')->value ?? 0) === 1;
        } catch (\Throwable) {
            $dbOk = false;
        }

        $products = Product::query()->withoutGlobalScopes()->whereNull('deleted_at');
        $totalProducts = (clone $products)->count();
        $imageRisk = (clone $products)->where(fn ($query) => $query
            ->whereNull('image')->orWhere('image', '')->orWhere('image', 'like', 'http%'))->count();

        $staleSources = collect(ScraperSourceRegistry::all())
            ->filter(fn ($source) => ($source['status'] ?? null) === ScraperSourceRegistry::STATUS_ACTIVE)
            ->filter(function ($source) {
                $names = array_unique([$source['name'], $source['db_source_name'] ?? $source['name']]);
                $last = ScraperRun::query()->whereIn('source_name', $names)
                    ->where('exit_code', 0)->where('json_size_bytes', '>', 50)
                    ->latest('finished_at')->first();
                return ! $last || $last->finished_at->lt(now()->subHours(36));
            })->pluck('name')->values();

        $failedJobs = DB::table('failed_jobs')->where('failed_at', '>=', now()->subDay())->count();
        $failedPages = collect($pages)->filter(fn ($page) => ! $page['ok']);
        $critical = ! $dbOk || ! $cacheOk || $failedPages->isNotEmpty();
        $report = [
            'checked_at' => now()->toIso8601String(),
            'base_url' => $baseUrl,
            'status' => $critical ? 'critical' : ($staleSources->isNotEmpty() || $failedJobs > 0 ? 'warning' : 'healthy'),
            'pages' => $pages,
            'database_ok' => $dbOk,
            'cache_ok' => $cacheOk,
            'failed_jobs_24h' => $failedJobs,
            'catalog' => [
                'products' => $totalProducts,
                'missing_or_remote_images' => $imageRisk,
                'image_risk_pct' => $totalProducts > 0 ? round(($imageRisk / $totalProducts) * 100, 2) : 0,
            ],
            'stale_active_sources' => $staleSources->all(),
        ];
        Storage::disk('local')->put('reports/live-health-latest.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->table(['Page', 'HTTP', 'ms', 'OK'], collect($pages)->map(fn ($page, $name) => [
            $name, $page['status'], $page['milliseconds'], $page['ok'] ? 'yes' : 'NO',
        ])->values()->all());
        $this->line('DB: ' . ($dbOk ? 'ok' : 'FAIL') . '; cache: ' . ($cacheOk ? 'ok' : 'FAIL')
            . "; failed jobs: {$failedJobs}; image risk: {$report['catalog']['image_risk_pct']}%"
            . '; stale sources: ' . ($staleSources->join(', ') ?: 'none'));

        if ($this->option('notify') && $report['status'] !== 'healthy') {
            AdminNotifier::notifyPrimarySiteAdmin(
                'Canlı ticaret sağlık kontrolü: ' . strtoupper($report['status']),
                'Bozuk sayfalar: ' . ($failedPages->keys()->join(', ') ?: 'yok')
                    . '; eski kaynaklar: ' . ($staleSources->join(', ') ?: 'yok')
                    . "; son 24s başarısız queue işi: {$failedJobs}",
                ['type' => 'commerce_health', 'report' => $report],
                $critical,
            );
        }

        return $critical ? self::FAILURE : self::SUCCESS;
    }
}
