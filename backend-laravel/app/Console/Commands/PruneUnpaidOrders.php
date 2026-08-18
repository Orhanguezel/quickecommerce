<?php

namespace App\Console\Commands;

use App\Models\OrderMaster;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class PruneUnpaidOrders extends Command
{
    protected $signature = 'orders:prune-unpaid
        {--hours=6 : Delete unpaid online orders older than this many hours}
        {--all : Delete every order record, intended only for test cleanup}
        {--force : Apply the deletion}
        {--dry-run : Show matching records without deleting them}';

    protected $description = 'Delete stale unpaid orders and restore inventory counters reserved during checkout.';

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

        $this->recordPrunedOrders($masterIds);

        DB::transaction(function () use ($masterIds, $orderIds): void {
            $this->restoreInventoryForOrders($orderIds);
            $this->deleteRelatedOrderRows($masterIds, $orderIds);
        });

        $this->info('Order cleanup completed.');
        return self::SUCCESS;
    }

    private function candidateQuery(bool $deleteAll, Carbon $cutoff)
    {
        $query = OrderMaster::query()->orderBy('id');

        if ($deleteAll) {
            return $query;
        }

        return $query
            ->where('created_at', '<', $cutoff)
            ->where(function ($statusQuery): void {
                $statusQuery
                    ->whereNull('payment_status')
                    ->orWhereIn('payment_status', ['pending', 'failed', 'cancelled']);
            })
            ->where(function ($gatewayQuery): void {
                $gatewayQuery
                    ->whereNull('payment_gateway')
                    ->orWhereNotIn('payment_gateway', ['cash_on_delivery']);
            })
            ->whereDoesntHave('orders', function ($orderQuery): void {
                $orderQuery
                    ->where('payment_status', 'paid')
                    ->orWhere('order_type', 'pos')
                    ->orWhereNotIn('status', ['pending', 'cancelled', 'on_hold']);
            });
    }

    /**
     * Deleting an unpaid order erases the only evidence that someone reached
     * checkout and did not pay. Write a summary to the log first, so the
     * payment drop-off can still be counted after the rows are gone.
     */
    private function recordPrunedOrders($masterIds): void
    {
        DB::table('order_masters')
            ->whereIn('id', $masterIds)
            ->orderBy('id')
            ->get(['id', 'customer_id', 'order_amount', 'payment_gateway', 'payment_status', 'utm_source', 'landing_page', 'created_at'])
            ->each(function ($master): void {
                Log::info('[orders:prune-unpaid] silinen odenmemis siparis', [
                    'order_master_id' => $master->id,
                    'customer_id' => $master->customer_id,
                    'order_amount' => $master->order_amount,
                    'payment_gateway' => $master->payment_gateway,
                    'payment_status' => $master->payment_status,
                    'utm_source' => $master->utm_source,
                    'landing_page' => $master->landing_page,
                    'created_at' => (string) $master->created_at,
                ]);
            });
    }

    private function restoreInventoryForOrders($orderIds): void
    {
        if ($orderIds->isEmpty()) {
            return;
        }

        DB::table('order_details')
            ->whereIn('order_id', $orderIds)
            ->orderBy('id')
            ->chunkById(500, function ($details): void {
                foreach ($details as $detail) {
                    $quantity = max(0, (int) $detail->quantity);

                    if ($quantity <= 0) {
                        continue;
                    }

                    if ($detail->product_id) {
                        DB::table('products')
                            ->where('id', $detail->product_id)
                            ->update([
                                'order_count' => DB::raw('GREATEST(COALESCE(order_count, 0) - 1, 0)'),
                            ]);
                    }

                    if ($detail->product_sku) {
                        DB::table('product_variants')
                            ->where('sku', $detail->product_sku)
                            ->update([
                                'stock_quantity' => DB::raw('stock_quantity + ' . $quantity),
                                'order_count' => DB::raw('GREATEST(COALESCE(order_count, 0) - 1, 0)'),
                            ]);
                    }

                    if ($detail->product_campaign_id) {
                        DB::table('flash_sales')
                            ->where('id', $detail->product_campaign_id)
                            ->update([
                                'purchase_limit' => DB::raw('purchase_limit + ' . $quantity),
                            ]);
                    }
                }
            });
    }

    private function deleteRelatedOrderRows($masterIds, $orderIds): void
    {
        $this->deleteWhereIn('return_shipments', 'order_id', $orderIds);
        $this->deleteWhereIn('cargo_shipments', 'order_id', $orderIds);
        $this->deleteWhereIn('live_locations', 'order_id', $orderIds);
        $this->deleteWhereIn('reviews', 'order_id', $orderIds);
        $this->deleteWhereIn('order_refunds', 'order_id', $orderIds);
        $this->deleteWhereIn('order_delivery_histories', 'order_id', $orderIds);
        $this->deleteWhereIn('order_activities', 'order_id', $orderIds);
        $this->detachFunnelEvents($orderIds);
        $this->deleteWhereIn('order_details', 'order_id', $orderIds);
        $this->deleteWhereIn('orders', 'id', $orderIds);
        $this->deleteWhereIn('order_addresses', 'order_master_id', $masterIds);
        $this->deleteWhereIn('order_masters', 'id', $masterIds);
    }

    /**
     * Funnel events outlive the order they point at. Dropping them with the
     * order would delete the checkout history the analytics reports are built
     * from, so only the reference is cleared.
     */
    private function detachFunnelEvents($orderIds): void
    {
        if ($orderIds->isEmpty() || !Schema::hasTable('funnel_events') || !Schema::hasColumn('funnel_events', 'order_id')) {
            return;
        }

        DB::table('funnel_events')->whereIn('order_id', $orderIds)->update(['order_id' => null]);
    }

    private function deleteWhereIn(string $table, string $column, $ids): void
    {
        if ($ids->isEmpty() || !Schema::hasTable($table) || !Schema::hasColumn($table, $column)) {
            return;
        }

        DB::table($table)->whereIn($column, $ids)->delete();
    }
}
