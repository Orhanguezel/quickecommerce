<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\AdPilotSelectionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SelectAdPilotProducts extends Command
{
    protected $signature = 'commerce:select-ad-pilot
        {--limit=20 : Maximum number of pilot candidates}
        {--days=30 : Demand and paid-order lookback window}
        {--max-store-share=40 : Maximum percentage of candidates from one store}';

    protected $description = 'Build a read-only, diversified paid-ad pilot candidate list';

    public function handle(AdPilotSelectionService $selectionService): int
    {
        $limit = max(5, min(100, (int) $this->option('limit')));
        $days = max(7, min(90, (int) $this->option('days')));
        $maxStoreShare = max(10, min(100, (int) $this->option('max-store-share')));
        $since = now()->subDays($days);

        $demand = DB::table('funnel_events')
            ->where('occurred_at', '>=', $since)
            ->where('is_bot', false)
            ->whereNotNull('product_id')
            ->groupBy('product_id')
            ->select('product_id')
            ->selectRaw("COUNT(DISTINCT CASE WHEN event = 'product_view' THEN subject END) AS viewers")
            ->selectRaw("COUNT(DISTINCT CASE WHEN event = 'product_click' THEN subject END) AS clickers")
            ->selectRaw("COUNT(DISTINCT CASE WHEN event = 'add_to_cart' THEN subject END) AS cart_adders");

        $paidSales = DB::table('order_details as paid_od')
            ->join('orders as paid_o', 'paid_o.id', '=', 'paid_od.order_id')
            ->join('order_masters as paid_om', 'paid_om.id', '=', 'paid_o.order_master_id')
            ->where('paid_om.payment_status', 'paid')
            ->where('paid_om.is_test', false)
            ->whereNull('paid_o.cancelled_at')
            ->where('paid_om.created_at', '>=', $since)
            ->groupBy('paid_od.product_id')
            ->select('paid_od.product_id')
            ->selectRaw('SUM(paid_od.quantity) AS paid_units');

        $excludedSources = collect(config('commerce.ad_pilot_excluded_sources', []))
            ->map(fn ($source) => mb_strtolower(trim((string) $source)))
            ->filter()
            ->values()
            ->all();

        $ranked = Product::query()
            ->withoutGlobalScopes()
            ->join('stores as pilot_store', 'pilot_store.id', '=', 'products.store_id')
            ->leftJoinSub($demand, 'pilot_demand', 'pilot_demand.product_id', '=', 'products.id')
            ->leftJoinSub($paidSales, 'pilot_sales', 'pilot_sales.product_id', '=', 'products.id')
            ->whereNull('products.deleted_at')
            ->where('products.status', 'approved')
            ->where('products.catalog_quality_score', '>=', 80)
            ->where('pilot_store.status', 1)
            ->whereNull('pilot_store.sales_suspended_at')
            ->where('pilot_store.profile_completion_score', '>=', 80)
            ->whereHas('variants', fn ($query) => $query->publiclySellable())
            ->when($excludedSources !== [], fn ($query) => $query->whereDoesntHave(
                'sourceMappings',
                fn ($sourceQuery) => $sourceQuery->whereIn(DB::raw('LOWER(source_name)'), $excludedSources)
            ))
            ->select([
                'products.id',
                'products.name',
                'products.store_id',
                'products.is_hero',
                'products.catalog_quality_score',
                'products.market_min_price',
                'products.market_price_source_count',
                'products.market_price_checked_at',
                'pilot_store.name as store_name',
            ])
            ->selectRaw('COALESCE(pilot_sales.paid_units, 0) AS paid_units')
            ->selectRaw('COALESCE(pilot_demand.cart_adders, 0) AS cart_adders')
            ->selectRaw('COALESCE(pilot_demand.clickers, 0) AS clickers')
            ->selectRaw('COALESCE(pilot_demand.viewers, 0) AS viewers')
            ->orderByDesc('paid_units')
            ->orderByDesc('cart_adders')
            ->orderByDesc('viewers')
            ->orderByDesc('products.catalog_quality_score')
            ->limit(500)
            ->get();

        $selected = $selectionService->diversify($ranked, $limit, $maxStoreShare);
        $rows = $selected->map(fn ($product, int $index) => [
            'rank' => $index + 1,
            'product_id' => (int) $product->id,
            'product' => $product->name,
            'store_id' => (int) $product->store_id,
            'store' => $product->store_name,
            'hero' => (bool) $product->is_hero,
            'quality_score' => (int) $product->catalog_quality_score,
            'paid_units' => (int) $product->paid_units,
            'cart_adders' => (int) $product->cart_adders,
            'clickers' => (int) $product->clickers,
            'viewers' => (int) $product->viewers,
            'market_sources' => (int) $product->market_price_source_count,
            'market_price_fresh' => $product->market_price_checked_at?->gte(
                now()->subHours((int) config('commerce.market_price_max_age_hours', 48))
            ) ?? false,
        ])->values();

        $report = [
            'generated_at' => now()->toIso8601String(),
            'window_days' => $days,
            'requested_limit' => $limit,
            'max_store_share_percent' => $maxStoreShare,
            'candidate_count' => $rows->count(),
            'store_count' => $rows->pluck('store_id')->unique()->count(),
            'excluded_sources' => $excludedSources,
            'products' => $rows->all(),
        ];

        Storage::disk('local')->put(
            'reports/ad-pilot-candidates-latest.json',
            json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        $this->table(
            ['Rank', 'ID', 'Product', 'Store', 'Quality', 'Paid', 'Cart', 'Visitors', 'Market'],
            $rows->map(fn (array $row) => [
                $row['rank'],
                $row['product_id'],
                $row['product'],
                $row['store'],
                $row['quality_score'],
                $row['paid_units'],
                $row['cart_adders'],
                $row['viewers'],
                $row['market_price_fresh'] ? $row['market_sources'].' fresh' : 'missing/stale',
            ])->all()
        );

        if ($report['store_count'] < 3 || $rows->count() < $limit) {
            $this->warn("Guardrails produced {$rows->count()} candidates across {$report['store_count']} stores; do not relax them without commercial review.");
        }

        $this->info('Read-only report saved to storage/app/reports/ad-pilot-candidates-latest.json.');

        return self::SUCCESS;
    }
}
