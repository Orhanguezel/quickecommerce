<?php

namespace App\Console\Commands;

use App\Mail\DynamicEmail;
use App\Models\Order;
use App\Models\UniversalNotification;
use App\Services\AdminNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CheckShippingSla extends Command
{
    protected $signature = 'orders:check-shipping-sla {--dry-run}';
    protected $description = 'Detect orders that missed their promised shipment time and notify site admins';

    public function handle(): int
    {
        $query = Order::query()
            ->with(['store:id,name', 'orderMaster.customer:id,email,first_name'])
            ->where('order_type', '!=', 'pos')
            ->whereNotNull('promised_ship_at')
            ->whereNull('shipped_at')
            ->whereNull('sla_breached_at')
            ->where('promised_ship_at', '<=', now())
            ->whereNotIn('status', ['shipped', 'delivered', 'cancelled']);

        $late = $query->get();
        $this->info("Late orders: {$late->count()}");
        if ($this->option('dry-run') || $late->isEmpty()) {
            return self::SUCCESS;
        }

        Order::query()->whereIn('id', $late->pluck('id'))->update(['sla_breached_at' => now()]);
        foreach ($late as $order) {
            $customer = $order->orderMaster?->customer;
            if (! $customer) continue;

            $message = "#{$order->id} numaralı sipariş paketinizin hazırlığı planlanandan uzun sürüyor. Site ekibimiz süreci takip ediyor; yeni kargo bilgisi oluştuğunda hesabınızda görebileceksiniz.";
            UniversalNotification::create([
                'notifiable_id' => $customer->id,
                'notifiable_type' => 'customer',
                'title' => 'Sipariş hazırlık durumunuz',
                'message' => $message,
                'data' => ['type' => 'shipping_delay', 'order_id' => $order->id],
                'status' => 'unread',
            ]);

            if ($customer->email) {
                try {
                    Mail::to($customer->email)->queue(new DynamicEmail(
                        'Sipariş hazırlık durumunuz',
                        '<p>' . e($message) . '</p>'
                    ));
                } catch (\Throwable $exception) {
                    Log::warning('Shipping delay customer email could not be queued', [
                        'order_id' => $order->id,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }
        }
        $sample = $late->take(10)->map(fn ($order) => "#{$order->id} ({$order->store?->name})")->join(', ');

        AdminNotifier::notifyPrimarySiteAdmin(
            'Gecikmiş sipariş uyarısı',
            "{$late->count()} sipariş kargoya teslim SLA süresini aştı: {$sample}",
            ['type' => 'shipping_sla_breach', 'order_ids' => $late->pluck('id')->all()],
            true,
        );

        return self::SUCCESS;
    }
}
