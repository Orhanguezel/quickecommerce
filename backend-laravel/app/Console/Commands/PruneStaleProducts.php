<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PruneStaleProducts extends Command
{
    protected $signature = 'products:prune-stale
        {--months=6 : Delete products not updated for this many months}
        {--force : Apply the deletion}
        {--dry-run : Show matching records without deleting them}';

    protected $description = 'Soft-delete stale products that have no order history.';

    public function handle(): int
    {
        $months = max(1, (int) $this->option('months'));
        $dryRun = (bool) $this->option('dry-run') || ! (bool) $this->option('force');
        $cutoff = Carbon::now()->subMonths($months);

        $query = Product::withoutGlobalScope('storeOrderLimit')
            ->where('updated_at', '<', $cutoff)
            ->whereDoesntHave('orderDetails')
            ->orderBy('id');

        $count = (clone $query)->count();

        if ($count === 0) {
            $this->info("No stale products older than {$months} month(s) found.");
            return self::SUCCESS;
        }

        $this->info(sprintf(
            '%s %d stale product(s) older than %s.',
            $dryRun ? 'Matched' : 'Soft-deleting',
            $count,
            $cutoff->toDateTimeString(),
        ));

        if ($dryRun) {
            $this->line('Run again with --force to soft-delete these products.');
            return self::SUCCESS;
        }

        $query->chunkById(500, function ($products): void {
            foreach ($products as $product) {
                $product->delete();
            }
        });

        $this->info('Stale product cleanup completed.');
        return self::SUCCESS;
    }
}
