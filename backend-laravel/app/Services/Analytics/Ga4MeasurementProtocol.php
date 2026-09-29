<?php

namespace App\Services\Analytics;

use App\Jobs\SendGa4EventJob;
use App\Models\Order;
use App\Models\OrderMaster;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GA4 Measurement Protocol istemcisi (sunucu tarafi purchase / refund).
 *
 * Neden: istemci tarafi purchase yalniz basari sayfasindan ve cerez izniyle
 * gidiyor; 2026-09'da 19 odenmis siparisin yalniz 6'si GA4'e dustu, iptal
 * edilen odenmis alt siparisler ise GA4'te hic geri alinmadi.
 *
 * Kurallar:
 *  - GA4_MEASUREMENT_ID ve GA4_API_SECRET config('services.ga4') uzerinden
 *    okunur; biri bossa servis no-op'tur (tek sefer debug log). Fallback yok.
 *  - Purchase YALNIZ siparis checkout'ta izinle bir ga_client_id sakladiysa
 *    gonderilir. transaction_id = order_master.id (istemci purchase ile ayni;
 *    GA4 ayni transaction_id'yi tekillestirir).
 *  - Refund da yalniz ga_client_id varsa gonderilir: izin yoksa GA4 o satisi
 *    hic gormedi, eslesmeyen negatif gelir yazmak raporu bozar.
 *  - Gonderim her zaman kuyruktaki SendGa4EventJob icinden yapilir.
 */
class Ga4MeasurementProtocol
{
    private const ENDPOINT = 'https://www.google-analytics.com/mp/collect';

    private static bool $notConfiguredLogged = false;

    public function isConfigured(): bool
    {
        $configured = $this->measurementId() !== '' && $this->apiSecret() !== '';

        if (! $configured && ! self::$notConfiguredLogged) {
            self::$notConfiguredLogged = true;
            Log::debug('ga4_not_configured', [
                'event' => 'ga4_not_configured',
                'has_measurement_id' => $this->measurementId() !== '',
                'has_api_secret' => $this->apiSecret() !== '',
            ]);
        }

        return $configured;
    }

    /**
     * Odeme dogrulandiginda cagrilir (iyzico/PayTR/Stripe callback). Asla
     * exception firlatmaz: analitik hatasi odeme akisini bozamaz.
     */
    public static function queuePurchase(OrderMaster $master): void
    {
        try {
            $self = app(self::class);
            if (! $self->isConfigured()) {
                return;
            }
            if (! self::validClientId($master->ga_client_id) || $master->ga4_purchase_sent_at) {
                return;
            }

            SendGa4EventJob::dispatch(SendGa4EventJob::TYPE_PURCHASE, (int) $master->id)->afterCommit();
        } catch (\Throwable $e) {
            Log::warning('ga4_queue_failed', [
                'event' => 'ga4_queue_failed',
                'type' => 'purchase',
                'order_master_id' => $master->id,
                'err' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Odenmis bir alt siparis iptal/iade edildiginde cagrilir. Asla exception
     * firlatmaz.
     */
    public static function queueRefund(Order $order): void
    {
        try {
            $self = app(self::class);
            if (! $self->isConfigured()) {
                return;
            }
            if ($order->ga4_refund_sent_at) {
                return;
            }
            $master = $order->orderMaster ?: OrderMaster::find($order->order_master_id);
            if (! $master || ! self::validClientId($master->ga_client_id)) {
                return;
            }

            SendGa4EventJob::dispatch(SendGa4EventJob::TYPE_REFUND, (int) $master->id, (int) $order->id)->afterCommit();
        } catch (\Throwable $e) {
            Log::warning('ga4_queue_failed', [
                'event' => 'ga4_queue_failed',
                'type' => 'refund',
                'order_id' => $order->id,
                'err' => $e->getMessage(),
            ]);
        }
    }

    public static function validClientId(?string $clientId): bool
    {
        return is_string($clientId) && preg_match('/^\d{1,20}\.\d{1,20}$/', $clientId) === 1;
    }

    public function purchaseEvent(OrderMaster $master): array
    {
        $master->loadMissing('orders.orderDetail.product');

        $items = $master->orders
            ->flatMap(fn (Order $order) => $order->orderDetail)
            ->map(fn ($detail) => $this->item($detail))
            ->values()
            ->all();

        $params = [
            'transaction_id' => (string) $master->id,
            'currency' => (string) ($master->currency_code ?: 'TRY'),
            'value' => round((float) ($master->paid_amount ?: $master->order_amount), 2),
            'shipping' => round((float) $master->shipping_charge, 2),
            'items' => $items,
        ];
        if ($master->coupon_code) {
            $params['coupon'] = (string) $master->coupon_code;
        }

        return ['name' => 'purchase', 'params' => $params];
    }

    /**
     * Tek alt siparisin (satici) iadesi: kismi refund, o alt siparisin
     * tutari ve kalemleriyle.
     */
    public function refundEvent(OrderMaster $master, Order $order): array
    {
        $order->loadMissing('orderDetail.product');

        return [
            'name' => 'refund',
            'params' => [
                'transaction_id' => (string) $master->id,
                'currency' => (string) ($master->currency_code ?: 'TRY'),
                'value' => round((float) $order->order_amount, 2),
                'items' => $order->orderDetail->map(fn ($detail) => $this->item($detail))->values()->all(),
            ],
        ];
    }

    /**
     * @return bool GA4 2xx dondurduyse true. (MP gecersiz payload'a da 2xx
     *              doner; semayi dogrulamak icin /debug/mp/collect kullanilir.)
     */
    public function send(string $clientId, array $events): bool
    {
        if (! $this->isConfigured()) {
            return false;
        }

        $response = Http::timeout((int) config('services.ga4.timeout', 5))
            ->connectTimeout(3)
            ->acceptJson()
            ->asJson()
            ->post(self::ENDPOINT . '?' . http_build_query([
                'measurement_id' => $this->measurementId(),
                'api_secret' => $this->apiSecret(),
            ]), [
                'client_id' => $clientId,
                'events' => $events,
            ]);

        return $response->successful();
    }

    private function item($detail): array
    {
        $item = [
            'item_id' => (string) $detail->product_id,
            'item_name' => (string) ($detail->product?->name ?: $detail->product_sku),
            'price' => round((float) $detail->price, 2),
            'quantity' => (int) $detail->quantity,
        ];
        if ($detail->product_sku) {
            $item['item_variant'] = (string) $detail->product_sku;
        }

        return $item;
    }

    private function measurementId(): string
    {
        return trim((string) config('services.ga4.measurement_id'));
    }

    private function apiSecret(): string
    {
        return trim((string) config('services.ga4.api_secret'));
    }
}
