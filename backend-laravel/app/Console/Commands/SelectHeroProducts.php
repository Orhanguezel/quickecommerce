<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SelectHeroProducts extends Command
{
    protected $signature = 'commerce:select-hero {--limit=300} {--apply}';
    protected $description = 'Select a focused hero catalogue using quality, demand, stock and price signals';

    public function handle(): int
    {
        $limit = max(50, min(500, (int) $this->option('limit')));
        $ids = Product::query()
            ->withoutGlobalScopes()
            ->where('status', 'approved')
            ->whereNull('deleted_at')
            ->whereHas('variants', fn ($q) => $q->publiclySellable())
            ->whereHas('store', fn ($q) => $q->whereNull('sales_suspended_at')->where('profile_completion_score', '>=', 80))
            ->orderByDesc('catalog_quality_score')
            ->orderByRaw('CASE WHEN price_index BETWEEN 0.95 AND 1.15 THEN 1 ELSE 0 END DESC')
            ->orderByDesc(DB::raw('COALESCE(order_count, 0)'))
            ->orderByDesc(DB::raw('COALESCE(views, 0)'))
            ->limit($limit)
            ->pluck('id');

        $this->info("Selected {$ids->count()} hero product candidates (target {$limit}).");
        if (! $this->option('apply')) {
            $this->warn('DRY-RUN: use --apply to persist the selection.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($ids) {
            Product::query()->withoutGlobalScopes()->where('is_hero', true)->update(['is_hero' => false, 'ads_eligible' => false]);
            Product::query()->withoutGlobalScopes()->whereIn('id', $ids)->update(['is_hero' => true]);
        });

        $this->call('commerce:refresh-readiness', ['--apply' => true]);
        Cache::forever('public-catalog:version', (string) hrtime(true));
        return self::SUCCESS;
    }
}
