<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EnforceProductQuality extends Command
{
    protected $signature = 'commerce:enforce-product-quality {--apply}';
    protected $description = 'Remove unsafe/low-quality products from homepage showcase and paid acquisition eligibility';

    public function handle(): int
    {
        $base = Product::withoutGlobalScopes()->whereNull('deleted_at')->where(function ($query) {
            $query->whereNull('image')->orWhere('image', '')
                ->orWhere('image', 'like', 'http%')
                ->orWhereRaw('CHAR_LENGTH(TRIM(REGEXP_REPLACE(COALESCE(description,""), "<[^>]*>", ""))) < 180')
                ->orWhere('status', '!=', 'approved')
                ->orWhereDoesntHave('variants', fn ($variants) => $variants->publiclySellable());
        });

        $counts = [
            'affected' => (clone $base)->count(),
            'homepage_removed' => (clone $base)->whereNotNull('homepage_featured_rank')->count(),
            'featured_removed' => (clone $base)->where('is_featured', true)->count(),
            'ads_disabled' => (clone $base)->where('ads_eligible', true)->count(),
        ];
        $this->table(['Check', 'Count'], collect($counts)->map(fn ($value, $key) => [$key, $value])->values()->all());
        if (! $this->option('apply')) {
            $this->warn('DRY-RUN: use --apply.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($base) {
            (clone $base)->update([
                'homepage_featured_rank' => null,
                'is_featured' => false,
                'is_hero' => false,
                'ads_eligible' => false,
                'ads_ineligibility_reason' => 'catalog_quality_gate_failed',
            ]);
        });
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info('Catalogue quality gate applied.');
        return self::SUCCESS;
    }
}
