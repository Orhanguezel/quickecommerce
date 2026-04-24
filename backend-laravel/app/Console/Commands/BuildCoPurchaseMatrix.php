<?php

namespace App\Console\Commands;

use App\Models\OrderDetail;
use App\Services\Recommendation\Repositories\CoPurchaseRepository;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Nightly job that rebuilds the "customers who bought X also bought Y" matrix
 * and writes top related product IDs to cache, one entry per product.
 *
 * Runs daily (see routes/console.php). Safe to re-run — just overwrites cache.
 */
class BuildCoPurchaseMatrix extends Command
{
    protected $signature = 'recommendations:build-co-purchase
                            {--limit=20 : Max related products to cache per product}
                            {--min=2 : Minimum co-occurrence frequency to include}';

    protected $description = 'Build and cache the co-purchase matrix used by cart recommendations';

    public function handle(CoPurchaseRepository $repo): int
    {
        $limit = (int) $this->option('limit');
        $min = (int) $this->option('min');

        $this->info("Building co-purchase matrix (limit={$limit}, min={$min})...");

        // One big GROUP BY to collect all pairs at once — fast on any decently-indexed DB
        $pairs = OrderDetail::query()
            ->from('order_details as oi1')
            ->join('order_details as oi2', function ($join) {
                $join->on('oi1.order_id', '=', 'oi2.order_id')
                    ->whereColumn('oi1.product_id', '!=', 'oi2.product_id');
            })
            ->select(
                'oi1.product_id as a',
                'oi2.product_id as b',
                DB::raw('COUNT(*) as freq')
            )
            ->groupBy('oi1.product_id', 'oi2.product_id')
            ->having('freq', '>=', $min)
            ->orderBy('oi1.product_id')
            ->orderByDesc('freq')
            ->get();

        if ($pairs->isEmpty()) {
            $this->warn('No co-purchase pairs found. Either no orders, or min threshold too high.');
            return self::SUCCESS;
        }

        // Group by source product and keep top-N per source
        $grouped = $pairs->groupBy('a');
        $writtenCount = 0;

        $bar = $this->output->createProgressBar($grouped->count());
        $bar->start();

        foreach ($grouped as $productId => $rows) {
            $relatedIds = $rows
                ->sortByDesc('freq')
                ->take($limit)
                ->pluck('b')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $repo->putCache((int) $productId, $relatedIds);
            $writtenCount++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Wrote co-purchase cache for {$writtenCount} products.");
        return self::SUCCESS;
    }
}
