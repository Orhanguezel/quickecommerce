<?php

namespace App\Services\Order;

use App\Models\OrderMaster;
use App\Services\IyzicoService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Odenmemis siparislerin tuttugu stok rezervini geri verir.
 *
 * Siparis olusturulur olusturulmaz stok dusuluyor (PlaceOrderController ->
 * updateVariantData). Musteri odemeyi tamamlamazsa bu rezerv 6 saat boyunca
 * orada kaliyor ve musteri KENDI terk ettigi siparisi yuzunden yeniden
 * siparis veremiyor: verify-stock tedarikciye bakip "var" diyor, hemen
 * ardindan PlaceOrderRequest yereldeki 0'i gorup 422 firlatiyor.
 *
 * 2026-08-29'da siparis #210 boyle kaybedildi (5200 TL): musteri 6 kez
 * denedi, 6 kez 422 aldi, vazgecti.
 */
class UnpaidOrderReleaseService
{
    public function __construct(private IyzicoService $iyzicoService) {}

    /**
     * Musterinin terk ettigi odenmemis siparisleri serbest birakir.
     *
     * Silmeden ONCE iyzico'ya sorar: odeme gercekten alinmamis mi? Emin
     * olamadigimiz her durumda (odeme basarili, token yok, API hatasi)
     * DOKUNMAZ — para cekilmis bir siparisi silmektense musteriyi bekletmek
     * yeglenir.
     *
     * @return array{released: int[], kept: array<int, string>}
     */
    public function releaseForCustomer(int $customerId): array
    {
        $released = [];
        $kept = [];

        $lock = Cache::lock("unpaid-order-release:{$customerId}", 15);

        if (! $lock->get()) {
            // Ayni musteri icin baska bir istek zaten calisiyor. Bu istekte
            // dokunma; es zamanli iki release ayni stogu iki kez geri verir.
            return ['released' => [], 'kept' => []];
        }

        try {
            foreach ($this->unpaidMastersForCustomer($customerId) as $master) {
                $reason = $this->blockingReason($master);

                if ($reason !== null) {
                    $kept[$master->id] = $reason;
                    continue;
                }

                $this->release(collect([$master->id]), 'checkout-retry');
                $released[] = $master->id;
            }
        } finally {
            $lock->release();
        }

        if ($released !== [] || $kept !== []) {
            Log::info('[unpaid-order-release] checkout oncesi rezerv kontrolu', [
                'customer_id' => $customerId,
                'released' => $released,
                'kept' => $kept,
            ]);
        }

        return ['released' => $released, 'kept' => $kept];
    }

    /**
     * Serbest birakmaya engel bir durum varsa sebebini, yoksa null doner.
     */
    private function blockingReason(OrderMaster $master): ?string
    {
        $token = trim((string) $master->transaction_ref);

        if ($token === '') {
            // Odeme oturumu hic acilmamis: iyzico tarafinda karsiligi yok,
            // silmek guvenli.
            return null;
        }

        if ($master->iyzico_payment_id) {
            // Odeme kimligi yazilmissa callback calismis demektir.
            return 'iyzico_payment_id dolu';
        }

        try {
            $result = $this->iyzicoService->retrieveCheckoutForm($token, 'order_' . $master->id);
        } catch (\Throwable $e) {
            Log::warning('[unpaid-order-release] iyzico sorgusu basarisiz, siparise dokunulmadi', [
                'order_master_id' => $master->id,
                'error' => $e->getMessage(),
            ]);

            return 'iyzico sorgusu basarisiz: ' . $e->getMessage();
        }

        if (strtoupper((string) $result->getPaymentStatus()) === 'SUCCESS') {
            Log::warning('[unpaid-order-release] odeme aslinda basarili, callback kaybolmus olabilir', [
                'order_master_id' => $master->id,
                'payment_id' => $result->getPaymentId(),
            ]);

            return 'iyzico odemeyi SUCCESS dondu';
        }

        return null;
    }

    /**
     * Odenmemis, online, hicbir satiri ilerlememis siparis master'lari.
     */
    public function unpaidMastersQuery()
    {
        return OrderMaster::query()
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

    private function unpaidMastersForCustomer(int $customerId): Collection
    {
        return $this->unpaidMastersQuery()
            ->where('customer_id', $customerId)
            ->orderBy('id')
            ->get();
    }

    /**
     * Verilen master'lari siler ve rezerve ettikleri stogu geri verir.
     */
    public function release(Collection $masterIds, string $context = 'prune'): void
    {
        if ($masterIds->isEmpty()) {
            return;
        }

        $this->recordBeforeDelete($masterIds, $context);

        $orderIds = DB::table('orders')->whereIn('order_master_id', $masterIds)->pluck('id');

        DB::transaction(function () use ($masterIds, $orderIds): void {
            $this->restoreInventoryForOrders($orderIds);
            $this->deleteRelatedOrderRows($masterIds, $orderIds);
        });
    }

    /**
     * Odenmemis bir siparisi silmek, birinin checkout'a gelip odemedigine dair
     * TEK kaniti da siler. Satirlar gitmeden once ozeti log'a yaz ki odeme
     * terk orani sonradan da sayilabilsin.
     */
    private function recordBeforeDelete(Collection $masterIds, string $context): void
    {
        DB::table('order_masters')
            ->whereIn('id', $masterIds)
            ->orderBy('id')
            ->get(['id', 'customer_id', 'order_amount', 'payment_gateway', 'payment_status', 'utm_source', 'landing_page', 'created_at'])
            ->each(function ($master) use ($context): void {
                Log::info('[unpaid-order-release] silinen odenmemis siparis', [
                    'context' => $context,
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

    /**
     * Checkout sirasinda dusulen stok/sayaclari geri yukler.
     *
     * Varyant SKU uzerinden eslesir: order_details.product_sku ile
     * product_variants.sku. Stok dusumu variant_id ile yapiliyor, geri yukleme
     * sku ile — iki alan tutarsiz olursa stok sessizce kaybolur.
     */
    public function restoreInventoryForOrders($orderIds): void
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

    public function deleteRelatedOrderRows($masterIds, $orderIds): void
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
     * Funnel kayitlari siparisten uzun yasar. Siparisle birlikte silmek
     * analitigin dayandigi checkout gecmisini yok eder, sadece referans
     * temizlenir.
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
