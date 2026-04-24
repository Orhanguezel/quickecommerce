<?php

namespace App\Console\Commands;

use App\Models\OrderDetail;
use App\Models\ProductVariant;
use App\Models\ProductVelocityStat;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Calculates rolling sales velocity per product and writes
 * product_velocity_stats rows. Used by the frontend "X gün içinde tükenebilir"
 * badge and by admin for inventory planning.
 *
 * Runs daily — a one-shot SQL aggregation keeps it cheap on any dataset size.
 */
class ComputeProductVelocity extends Command
{
    protected $signature = 'products:compute-velocity
                            {--days=30 : Lookback window for the moving average}';

    protected $description = 'Refresh product sales velocity stats';

    public function handle(): int
    {
        $windowDays = max(7, (int) $this->option('days'));
        $since = Carbon::now()->subDays($windowDays);

        $this->info("Computing product velocity over last {$windowDays} days...");

        // Units sold per product in the window
        $salesByProduct = OrderDetail::query()
            ->where('created_at', '>=', $since)
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_id')
            ->pluck('total_qty', 'product_id');

        // Current stock = sum of variant stock_quantity per product
        $stockByProduct = ProductVariant::query()
            ->select('product_id', DB::raw('SUM(stock_quantity) as total_stock'))
            ->groupBy('product_id')
            ->pluck('total_stock', 'product_id');

        $now = now();
        $productIds = $salesByProduct->keys()->merge($stockByProduct->keys())->unique();

        $bar = $this->output->createProgressBar($productIds->count());
        $bar->start();

        foreach ($productIds as $productId) {
            $sales = (int) ($salesByProduct[$productId] ?? 0);
            $stock = (int) ($stockByProduct[$productId] ?? 0);
            $avgPerDay = $sales / $windowDays;
            $daysOfSupply = $avgPerDay > 0 ? round($stock / $avgPerDay, 1) : null;

            ProductVelocityStat::updateOrCreate(
                ['product_id' => (int) $productId],
                [
                    'daily_sales_avg' => round($avgPerDay, 2),
                    'window_sales'    => $sales,
                    'current_stock'   => $stock,
                    'days_of_supply'  => $daysOfSupply,
                    'window_days'     => $windowDays,
                    'computed_at'     => $now,
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Updated velocity stats for {$productIds->count()} products.");

        return self::SUCCESS;
    }
}
