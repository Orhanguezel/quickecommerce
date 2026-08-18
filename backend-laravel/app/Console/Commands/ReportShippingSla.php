<?php

namespace App\Console\Commands;

use App\Services\AdminNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReportShippingSla extends Command
{
    protected $signature = 'orders:report-shipping-sla {--days=7} {--notify}';
    protected $description = 'Report store-level on-time shipping and breach root-cause signals';

    public function handle(): int
    {
        $days = max(1, min(90, (int) $this->option('days')));
        $rows = DB::table('orders as o')
            ->leftJoin('stores as s', 's.id', '=', 'o.store_id')
            ->where('o.created_at', '>=', now()->subDays($days))
            ->where('o.order_type', '!=', 'pos')
            ->whereNotNull('o.promised_ship_at')
            ->selectRaw("COALESCE(s.name, CONCAT('Store #', o.store_id)) store_name")
            ->selectRaw('COUNT(*) due_orders')
            ->selectRaw('SUM(o.shipped_at IS NOT NULL AND o.shipped_at <= o.promised_ship_at) on_time')
            ->selectRaw('SUM(o.sla_breached_at IS NOT NULL) breached')
            ->selectRaw('SUM(o.shipped_at IS NULL AND o.promised_ship_at < NOW()) currently_late')
            ->groupBy('o.store_id', 's.name')
            ->orderByDesc('breached')
            ->get()
            ->map(function ($row) {
                $row->on_time_pct = $row->due_orders > 0
                    ? round(((int) $row->on_time / (int) $row->due_orders) * 100, 2)
                    : 0;
                return $row;
            });

        $this->table(
            ['Store', 'Due', 'On time', 'On-time %', 'Breached', 'Currently late'],
            $rows->map(fn ($row) => [
                $row->store_name, $row->due_orders, $row->on_time,
                $row->on_time_pct, $row->breached, $row->currently_late,
            ])->all()
        );

        $breaches = (int) $rows->sum('breached');
        if ($this->option('notify') && $breaches > 0) {
            $summary = $rows->where('breached', '>', 0)->take(10)
                ->map(fn ($row) => "{$row->store_name}: {$row->breached} ihlal, zamanında %{$row->on_time_pct}")
                ->implode("\n");
            AdminNotifier::notifyPrimarySiteAdmin(
                'Haftalık kargo SLA raporu',
                "Son {$days} günde {$breaches} SLA ihlali.\n{$summary}",
                ['type' => 'weekly_shipping_sla', 'days' => $days, 'rows' => $rows->toArray()],
                true,
            );
        }

        return self::SUCCESS;
    }
}
