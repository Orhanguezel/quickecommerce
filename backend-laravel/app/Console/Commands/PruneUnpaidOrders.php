<?php

namespace App\Console\Commands;

use App\Models\OrderMaster;
use App\Services\Order\UnpaidOrderReleaseService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PruneUnpaidOrders extends Command
{
    protected $signature = 'orders:prune-unpaid
        {--hours=6 : Delete unpaid online orders older than this many hours}
        {--all : Delete every order record, intended only for test cleanup}
        {--force : Apply the deletion}
        {--dry-run : Show matching records without deleting them}';

    protected $description = 'Delete stale unpaid orders and restore inventory counters reserved during checkout.';

    public function __construct(private UnpaidOrderReleaseService $releaseService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $deleteAll = (bool) $this->option('all');
        $force = (bool) $this->option('force');
        $dryRun = (bool) $this->option('dry-run') || !$force;
        $hours = max(1, (int) $this->option('hours'));
        $cutoff = Carbon::now()->subHours($hours);

        if ($deleteAll && !$dryRun && !$force) {
            $this->warn('The --all option requires --force. No records were deleted.');
            return self::FAILURE;
        }

        $query = $this->candidateQuery($deleteAll, $cutoff);
        $masterIds = $query->pluck('id');

        if ($masterIds->isEmpty()) {
            $scope = $deleteAll ? 'orders' : "unpaid online orders older than {$hours} hour(s)";
            $this->info("No {$scope} found.");
            return self::SUCCESS;
        }

        $orderIds = DB::table('orders')->whereIn('order_master_id', $masterIds)->pluck('id');

        $this->info(sprintf(
            '%s %d order master(s) and %d package order(s).',
            $dryRun ? 'Matched' : 'Deleting',
            $masterIds->count(),
            $orderIds->count(),
        ));

        if ($dryRun) {
            $this->line('Run again with --force to delete these records.');
            return self::SUCCESS;
        }

        // Stok geri yukleme + iliskili satirlarin silinmesi serviste:
        // checkout middleware'i (ReleaseStaleCheckoutHold) da ayni kodu
        // kullanir, iki kopya zamanla ayrisip stok kaybina yol acardi.
        $this->releaseService->release($masterIds, 'orders:prune-unpaid');

        $this->info('Order cleanup completed.');
        return self::SUCCESS;
    }

    private function candidateQuery(bool $deleteAll, Carbon $cutoff)
    {
        $query = OrderMaster::query()->orderBy('id');

        if ($deleteAll) {
            return $query;
        }

        return $this->releaseService->unpaidMastersQuery()
            ->orderBy('id')
            ->where('created_at', '<', $cutoff);
    }
}
