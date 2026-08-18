<?php

namespace App\Console\Commands;

use App\Models\FunnelEvent;
use App\Models\Product;
use App\Services\AdminNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportHomepageFeaturedPerformance extends Command
{
    protected $signature = 'commerce:report-homepage-featured
        {--days=7 : Reporting window in days}
        {--notify : Notify the primary site administrator}';

    protected $description = 'Report homepage showcase clicks, carts and paid sales and recommend weak products for rotation';

    public function handle(): int
    {
        $days = max(1, min(90, (int) $this->option('days')));
        $since = now()->subDays($days);
        $products = Product::query()
            ->withoutGlobalScopes()
            ->whereNotNull('homepage_featured_rank')
            ->orderBy('homepage_featured_rank')
            ->get(['id', 'name', 'homepage_featured_rank']);

        if ($products->isEmpty()) {
            $this->warn('No homepage featured products are configured.');
            return self::SUCCESS;
        }

        $ids = $products->pluck('id');
        $events = FunnelEvent::query()
            ->whereIn('product_id', $ids)
            ->where('is_bot', false)
            ->where('created_at', '>=', $since)
            ->where('block_type', 'homepage_featured')
            ->whereIn('event', ['recommendation_view', 'recommendation_click', 'recommendation_add'])
            ->select('product_id')
            ->selectRaw("SUM(event = 'recommendation_view') AS views")
            ->selectRaw("SUM(event = 'recommendation_click') AS clicks")
            ->selectRaw("SUM(event = 'recommendation_add') AS carts")
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $sales = DB::table('order_details as od')
            ->join('orders as o', 'o.id', '=', 'od.order_id')
            ->join('order_masters as om', 'om.id', '=', 'o.order_master_id')
            ->whereIn('od.product_id', $ids)
            ->where('om.payment_status', 'paid')
            ->where('om.is_test', false)
            ->whereNull('o.cancelled_at')
            ->where('om.created_at', '>=', $since)
            ->select('od.product_id')
            ->selectRaw('SUM(od.quantity) AS units')
            ->selectRaw('SUM(od.line_total_price_with_qty) AS revenue')
            ->groupBy('od.product_id')
            ->get()
            ->keyBy('product_id');

        $rows = $products->map(function (Product $product) use ($events, $sales) {
            $event = $events->get($product->id);
            $sale = $sales->get($product->id);
            $views = (int) ($event->views ?? 0);
            $clicks = (int) ($event->clicks ?? 0);
            $carts = (int) ($event->carts ?? 0);
            $units = (int) ($sale->units ?? 0);
            $score = ($units * 100) + ($carts * 10) + ($clicks * 2);

            return [
                'rank' => (int) $product->homepage_featured_rank,
                'product_id' => $product->id,
                'product' => $product->name,
                'views' => $views,
                'clicks' => $clicks,
                'ctr' => $views > 0 ? round(($clicks / $views) * 100, 2) : 0,
                'carts' => $carts,
                'units' => $units,
                'revenue' => round((float) ($sale->revenue ?? 0), 2),
                'score' => $score,
                'rotation_candidate' => $views >= 20 && $clicks === 0 && $carts === 0 && $units === 0,
            ];
        });

        $report = [
            'generated_at' => now()->toIso8601String(),
            'window_days' => $days,
            'products' => $rows->values()->all(),
        ];
        Storage::disk('local')->put(
            'reports/homepage-featured-latest.json',
            json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        $this->table(
            ['Rank', 'ID', 'Product', 'Views', 'Clicks', 'CTR %', 'Carts', 'Units', 'Revenue', 'Rotate?'],
            $rows->map(fn (array $row) => [
                $row['rank'], $row['product_id'], $row['product'], $row['views'], $row['clicks'],
                $row['ctr'], $row['carts'], $row['units'], $row['revenue'],
                $row['rotation_candidate'] ? 'YES' : 'no',
            ])->all()
        );

        $rotationCount = $rows->where('rotation_candidate', true)->count();
        if ($this->option('notify')) {
            AdminNotifier::notifyPrimarySiteAdmin(
                'Haftalık ana sayfa vitrini raporu',
                "Son {$days} günde {$products->count()} vitrin ürünü ölçüldü; {$rotationCount} ürün rotasyon adayı.",
                [
                    'type' => 'homepage_featured_weekly',
                    'days' => $days,
                    'rotation_candidate_count' => $rotationCount,
                    'report_path' => 'reports/homepage-featured-latest.json',
                ]
            );
        }

        $this->info('Report saved to storage/app/reports/homepage-featured-latest.json.');
        return self::SUCCESS;
    }
}
