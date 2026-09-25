<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ScraperRun;
use App\Services\ScraperAlerter;
use App\Services\ScraperSourceRegistry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EnforceScraperFreshness extends Command
{
    protected $signature = 'scrapers:enforce-freshness
        {--hours=36 : Maximum age of the latest successful non-empty run}
        {--apply : Set affected source variants to stock zero}';

    protected $description = 'Fail closed: quarantine stale/failed scraper sources from the public catalogue';

    public function handle(): int
    {
        $hours = max(12, (int) $this->option('hours'));
        $apply = (bool) $this->option('apply');
        $rows = [];
        $quarantinedSources = [];

        foreach (ScraperSourceRegistry::all() as $source) {
            $name = $source['db_source_name'] ?? $source['name'];
            $isActive = ($source['status'] ?? null) === ScraperSourceRegistry::STATUS_ACTIVE;
            // Passive sources are deliberately disabled and can include archived
            // products whose variant rows still retain historical stock. Hourly
            // freshness enforcement must only govern scheduled active sources.
            if (! $isActive) continue;

            $lastGood = ScraperRun::query()->whereIn('source_name', array_unique([$source['name'], $name]))
                ->where('exit_code', 0)->where('json_size_bytes', '>', 50)
                ->latest('finished_at')->first();
            $stale = ! $lastGood || $lastGood->finished_at->lt(now()->subHours($hours));
            if (! $stale) continue;

            $mappingQuery = DB::table('product_source_mappings')->where('source_name', $name);
            $variantIds = (clone $mappingQuery)->pluck('product_variant_id');
            $productIds = (clone $mappingQuery)->pluck('product_id')->unique()->values();
            $positive = ProductVariant::withoutGlobalScopes()->whereIn('id', $variantIds)->where('stock_quantity', '>', 0)->count();

            $reason = 'stale_or_failed_source';
            $rows[] = [$source['name'], $reason, $lastGood?->finished_at?->toDateTimeString() ?? '-', $positive];
            if (! $apply || $positive === 0) continue;

            DB::transaction(function () use ($variantIds, $productIds, $reason, $name) {
                ProductVariant::withoutGlobalScopes()->whereIn('id', $variantIds)->update(['stock_quantity' => 0]);
                Product::withoutGlobalScopes()->whereIn('id', $productIds)->whereNotNull('homepage_featured_rank')->update([
                    'homepage_featured_rank' => null,
                ]);
                DB::table('product_source_mappings')->where('source_name', $name)->update([
                    'last_sync_status' => 'quarantined',
                    'last_sync_note' => $reason,
                ]);
            });
            $quarantinedSources[] = "{$source['name']} ({$positive} variants)";
        }

        $this->table(['Source', 'Reason', 'Last successful run', 'Positive stock'], $rows);
        if ($apply && $quarantinedSources !== []) {
            Cache::forever('public-catalog:version', (string) hrtime(true));
            ScraperAlerter::digest('Kaynaklar otomatik karantinaya alindi', $quarantinedSources, ScraperAlerter::LEVEL_CRIT);
        }
        $this->info($apply ? 'Freshness policy applied.' : 'DRY-RUN: use --apply.');
        return self::SUCCESS;
    }
}
