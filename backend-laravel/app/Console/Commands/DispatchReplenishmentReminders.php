<?php

namespace App\Console\Commands;

use App\Mail\ReplenishmentReminderMail;
use App\Models\OrderDetail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DispatchReplenishmentReminders extends Command
{
    protected $signature = 'orders:dispatch-replenishment-reminders {--days=30} {--limit=200} {--dry-run}';
    protected $description = 'Send consent-aware replenishment reminders when the same product has not been repurchased';

    public function handle(): int
    {
        $days = max(20, min(90, (int) $this->option('days')));
        $limit = max(1, min(1000, (int) $this->option('limit')));
        $details = OrderDetail::query()
            ->whereNull('replenishment_reminder_sent_at')
            ->whereHas('product', fn ($query) => $query->publiclySellable())
            ->whereHas('order', fn ($query) => $query->where('status', 'delivered')
                ->whereBetween('delivery_completed_at', [now()->subDays($days + 30), now()->subDays($days)]))
            ->whereHas('order.orderMaster', fn ($query) => $query->where('payment_status', 'paid')->where('is_test', false)
                ->whereHas('customer', fn ($customer) => $customer->where('marketing_email', true)))
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')
                    ->from('order_details as later_detail')
                    ->join('orders as later_order', 'later_order.id', '=', 'later_detail.order_id')
                    ->join('order_masters as later_master', 'later_master.id', '=', 'later_order.order_master_id')
                    ->join('orders as original_order', 'original_order.id', '=', 'order_details.order_id')
                    ->join('order_masters as original_master', 'original_master.id', '=', 'original_order.order_master_id')
                    ->whereColumn('later_detail.product_id', 'order_details.product_id')
                    ->whereColumn('later_master.customer_id', 'original_master.customer_id')
                    ->whereColumn('later_master.created_at', '>', 'original_master.created_at')
                    ->where('later_master.payment_status', 'paid')
                    ->where('later_master.is_test', false);
            })
            ->with(['product', 'order.orderMaster.customer'])
            ->orderBy('id')
            ->limit($limit)
            ->get();

        $groups = $details->groupBy(fn ($detail) => $detail->order->orderMaster->customer_id);
        $sent = 0;
        foreach ($groups as $customerDetails) {
            $customer = $customerDetails->first()->order->orderMaster->customer;
            if ($this->option('dry-run')) {
                $this->line("[DRY] {$customer->email}: {$customerDetails->count()} product(s)");
                continue;
            }
            try {
                Mail::to($customer->email)->send(new ReplenishmentReminderMail($customer, $customerDetails));
                OrderDetail::query()->whereIn('id', $customerDetails->pluck('id'))->update(['replenishment_reminder_sent_at' => now()]);
                $sent++;
            } catch (\Throwable $error) {
                Log::error('Replenishment reminder failed', ['customer_id' => $customer->id, 'error' => $error->getMessage()]);
            }
        }

        $this->info(($this->option('dry-run') ? 'DRY-RUN ' : '') . "customers={$groups->count()} sent={$sent} products={$details->count()}");
        return self::SUCCESS;
    }
}
