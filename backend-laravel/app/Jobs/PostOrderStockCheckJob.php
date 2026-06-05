<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderMaster;
use App\Services\IyzicoRefundService;
use App\Services\ScraperAlerter;
use App\Services\SourceStockProbe;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Sipariş alındıktan ~30 dk sonra calisan otomatik stok teyit jobu.
 *
 * Neden: Provitanya/proteinmax gibi boolean-only stok kaynaklari sabah cron
 * sonrasi gun icinde stok degistirebilir (DB'de stok=1 ama site "outofstock"
 * dondurebilir). Manuel iptal yerine job: bir kez daha canli sorgu yap, kesin
 * out-of-stock ise iyzico iade + siparis iptal otomatik tetiklenir.
 *
 * Logic:
 *   1. OrderMaster paid + henuz iyzico_approved_at NULL + payment_status='paid'
 *   2. Her order satirinin source URL'i icin SourceStockProbe
 *   3. EN AZ BIR satir kesin out-of-stock -> IyzicoRefundService + cancel
 *   4. Belirsiz (no_signal / exception) -> ScraperAlerter ile admin'e telegram
 *   5. Hepsi stokta -> no-op (log)
 */
class PostOrderStockCheckJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 120;

    public function __construct(public int $orderMasterId) {}

    public function handle(
        SourceStockProbe $probe,
        IyzicoRefundService $refund,
        ScraperAlerter $alerter,
    ): void {
        $master = OrderMaster::with(['orders.orderDetail'])->find($this->orderMasterId);
        if (!$master) {
            Log::info('PostOrderStockCheck: OrderMaster yok, skip', ['id' => $this->orderMasterId]);
            return;
        }
        if ($master->payment_status !== 'paid') {
            Log::info('PostOrderStockCheck: paid degil, skip', ['id' => $this->orderMasterId, 'status' => $master->payment_status]);
            return;
        }
        if ($master->iyzico_approved_at) {
            Log::info('PostOrderStockCheck: zaten Approval gonderildi, skip', ['id' => $this->orderMasterId]);
            return;
        }

        $outOfStockLines = [];
        $uncertainLines = [];

        foreach ($master->orders as $sub) {
            foreach ($sub->orderDetail as $line) {
                $variantId = $line->variant_id ?? null;
                $productId = $line->product_id ?? null;
                $sourceUrl = $this->resolveSourceUrl($variantId, $productId);

                if (!$sourceUrl) {
                    // Mapping yoksa skip — manuel mağaza ürünü olabilir
                    continue;
                }

                $result = $probe->probe($sourceUrl);
                Log::info('PostOrderStockCheck probe', [
                    'order_master_id' => $master->id,
                    'order_id' => $sub->id,
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'url' => $sourceUrl,
                    'result' => $result->toArray(),
                ]);

                if ($result->isDefinitelyOutOfStock()) {
                    $outOfStockLines[] = [
                        'order_id' => $sub->id,
                        'product_id' => $productId,
                        'variant_id' => $variantId,
                        'url' => $sourceUrl,
                        'signal' => $result->signal,
                    ];
                } elseif ($result->isUncertain()) {
                    $uncertainLines[] = [
                        'order_id' => $sub->id,
                        'product_id' => $productId,
                        'url' => $sourceUrl,
                        'signal' => $result->signal,
                        'error' => $result->error,
                    ];
                }
            }
        }

        if (!empty($outOfStockLines)) {
            $refund->refundOrderForStockOut($master, $outOfStockLines);
            return;
        }

        if (!empty($uncertainLines)) {
            $alerter->alert(
                title: "Stok teyidi belirsiz — Siparis #{$master->id}",
                body: "Siparişin {N} satırı icin canli stok sinyali alinmadi. Manuel kontrol gerek.\n\n"
                    . collect($uncertainLines)->map(fn($l) => "- {$l['url']} ({$l['signal']}{$l['error']})")->implode("\n"),
                level: 'warning',
                context: ['order_master_id' => $master->id, 'uncertain_count' => count($uncertainLines)]
            );
        }

        Log::info('PostOrderStockCheck: tum satirlar stokta veya belirsiz', [
            'order_master_id' => $master->id,
            'uncertain_count' => count($uncertainLines),
        ]);
    }

    private function resolveSourceUrl(?int $variantId, ?int $productId): ?string
    {
        $query = \DB::table('product_source_mappings');
        if ($variantId) {
            $row = $query->where('product_variant_id', $variantId)->first(['source_product_url']);
        } elseif ($productId) {
            $row = $query->where('product_id', $productId)->first(['source_product_url']);
        } else {
            return null;
        }
        $url = $row->source_product_url ?? null;
        return $url ? (string) $url : null;
    }
}
