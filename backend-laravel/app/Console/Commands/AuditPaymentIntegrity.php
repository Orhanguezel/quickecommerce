<?php

namespace App\Console\Commands;

use App\Services\AdminNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AuditPaymentIntegrity extends Command
{
    protected $signature = 'payments:audit-integrity {--days=30} {--notify : Notify site admins when an anomaly exists}';
    protected $description = 'Read-only reconciliation audit for paid online orders, duplicate references and amount inconsistencies';

    public function handle(): int
    {
        $days = max(1, min(365, (int) $this->option('days')));
        $since = now()->subDays($days);
        $paid = DB::table('order_masters as om')
            ->where('om.created_at', '>=', $since)
            ->where('om.is_test', false)
            ->where('om.payment_status', 'paid')
            ->whereExists(fn ($query) => $query->selectRaw('1')->from('orders as online_order')
                ->whereColumn('online_order.order_master_id', 'om.id')
                ->where('online_order.order_type', '!=', 'pos'));

        $duplicateReferences = (clone $paid)
            ->whereNotNull('om.transaction_ref')
            ->where('om.transaction_ref', '!=', '')
            ->select('om.transaction_ref')
            ->selectRaw('COUNT(*) as duplicate_count')
            ->groupBy('om.transaction_ref')
            ->havingRaw('COUNT(*) > 1')
            ->get();
        $packageTotals = DB::table('orders')
            ->select('order_master_id')
            ->selectRaw('SUM(order_amount) as package_total')
            ->where('order_type', '!=', 'pos')
            ->groupBy('order_master_id');
        $amountMismatches = (clone $paid)
            ->joinSub($packageTotals, 'packages', 'packages.order_master_id', '=', 'om.id')
            ->whereRaw('ABS(COALESCE(om.order_amount, 0) - COALESCE(packages.package_total, 0)) > 0.02')
            ->count();

        $results = [
            'paid_orders' => (clone $paid)->count(),
            'missing_transaction_reference' => (clone $paid)
                ->where(fn ($query) => $query->whereNull('om.transaction_ref')->orWhere('om.transaction_ref', ''))->count(),
            'non_positive_paid_amount' => (clone $paid)->where('om.paid_amount', '<=', 0)->count(),
            'duplicate_transaction_references' => $duplicateReferences->count(),
            'master_package_amount_mismatches' => $amountMismatches,
        ];
        $this->table(['Check', 'Count'], collect($results)->map(fn ($value, $key) => [$key, $value])->values());

        $anomalyCount = collect($results)->except('paid_orders')->sum();
        if ($anomalyCount > 0 && $this->option('notify')) {
            AdminNotifier::notifyPrimarySiteAdmin(
                'Ödeme mutabakat uyarısı',
                "Son {$days} günlük ödeme denetiminde {$anomalyCount} anomali bulundu.",
                ['type' => 'payment_integrity_audit', 'days' => $days, 'results' => $results],
                true,
            );
        }

        return $anomalyCount > 0 ? self::FAILURE : self::SUCCESS;
    }
}
