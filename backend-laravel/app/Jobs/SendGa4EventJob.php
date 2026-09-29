<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderMaster;
use App\Services\Analytics\Ga4MeasurementProtocol;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * GA4 Measurement Protocol gonderimi (purchase / refund), kuyrukta.
 *
 * Idempotency: gondermeden once *_sent_at kolonu kosullu UPDATE ile "sahiplenilir"
 * (WHERE ... IS NULL). Gonderim basarisiz olursa damga geri alinir ve job
 * yeniden denenir. Boylece callback'in iki kez gelmesi veya job retry'i ayni
 * olayi iki kez yollamaz.
 */
class SendGa4EventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public const TYPE_PURCHASE = 'purchase';
    public const TYPE_REFUND = 'refund';

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public string $type,
        public int $orderMasterId,
        public ?int $orderId = null,
    ) {}

    public function backoff(): array
    {
        return [60, 300];
    }

    public function handle(Ga4MeasurementProtocol $ga4): void
    {
        if (! $ga4->isConfigured()) {
            return;
        }

        $master = OrderMaster::find($this->orderMasterId);
        if (! $master) {
            Log::info('ga4_skipped', ['event' => 'ga4_skipped', 'type' => $this->type, 'reason' => 'order_master_not_found', 'order_master_id' => $this->orderMasterId]);
            return;
        }
        if (! Ga4MeasurementProtocol::validClientId($master->ga_client_id)) {
            Log::info('ga4_skipped', ['event' => 'ga4_skipped', 'type' => $this->type, 'reason' => 'no_client_id', 'order_master_id' => $master->id]);
            return;
        }

        $this->type === self::TYPE_REFUND
            ? $this->sendRefund($ga4, $master)
            : $this->sendPurchase($ga4, $master);
    }

    private function sendPurchase(Ga4MeasurementProtocol $ga4, OrderMaster $master): void
    {
        if ($master->payment_status !== 'paid') {
            Log::info('ga4_skipped', ['event' => 'ga4_skipped', 'type' => 'purchase', 'reason' => 'not_paid', 'order_master_id' => $master->id, 'payment_status' => $master->payment_status]);
            return;
        }

        $claimed = DB::table('order_masters')
            ->where('id', $master->id)
            ->whereNull('ga4_purchase_sent_at')
            ->update(['ga4_purchase_sent_at' => now()]);
        if ($claimed === 0) {
            return; // baska bir job zaten gonderdi
        }

        $event = $ga4->purchaseEvent($master);
        $this->deliver($ga4, $master->ga_client_id, $event, function () use ($master) {
            DB::table('order_masters')->where('id', $master->id)->update(['ga4_purchase_sent_at' => null]);
        }, ['order_master_id' => $master->id, 'value' => $event['params']['value']]);
    }

    private function sendRefund(Ga4MeasurementProtocol $ga4, OrderMaster $master): void
    {
        $order = Order::where('id', $this->orderId)->where('order_master_id', $master->id)->first();
        if (! $order) {
            Log::info('ga4_skipped', ['event' => 'ga4_skipped', 'type' => 'refund', 'reason' => 'order_not_found', 'order_master_id' => $master->id, 'order_id' => $this->orderId]);
            return;
        }

        $claimed = DB::table('orders')
            ->where('id', $order->id)
            ->whereNull('ga4_refund_sent_at')
            ->update(['ga4_refund_sent_at' => now()]);
        if ($claimed === 0) {
            return;
        }

        $event = $ga4->refundEvent($master, $order);
        $this->deliver($ga4, $master->ga_client_id, $event, function () use ($order) {
            DB::table('orders')->where('id', $order->id)->update(['ga4_refund_sent_at' => null]);
        }, ['order_master_id' => $master->id, 'order_id' => $order->id, 'value' => $event['params']['value']]);

        DB::table('order_masters')->where('id', $master->id)->update(['ga4_refund_sent_at' => now()]);
    }

    private function deliver(Ga4MeasurementProtocol $ga4, string $clientId, array $event, callable $release, array $context): void
    {
        $type = $event['name'];

        try {
            $ok = $ga4->send($clientId, [$event]);
        } catch (\Throwable $e) {
            $release();
            Log::warning('ga4_send_failed', ['event' => 'ga4_send_failed', 'type' => $type, 'attempt' => $this->attempts(), 'err' => $e->getMessage()] + $context);
            throw $e; // kuyruk retry
        }

        if (! $ok) {
            $release();
            Log::warning('ga4_send_failed', ['event' => 'ga4_send_failed', 'type' => $type, 'attempt' => $this->attempts(), 'reason' => 'non_2xx'] + $context);
            throw new \RuntimeException("GA4 {$type} gonderimi 2xx donmedi");
        }

        Log::info("ga4_{$type}_sent", ['event' => "ga4_{$type}_sent"] + $context);
    }
}
