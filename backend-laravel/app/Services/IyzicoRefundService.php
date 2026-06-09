<?php

namespace App\Services;

use App\Models\OrderMaster;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PostOrderStockCheckJob bir veya birden fazla satirin kesin "out-of-stock"
 * oldugunu tespit ettiginde tetiklenir.
 *
 * URUN-BAZLI KISMI IADE (2026-06-09):
 *  - Cok-saticili tek odemede SADECE stogu tukenmis saticinin sub-order'i iade
 *    edilir (iyzico Refund, paymentTransactionId bazli). Diger (stoktaki)
 *    saticilarin siparisi bozulmaz, devam eder.
 *  - Tum siparis stok-out ise: tum odemeyi tek seferde iptal (Cancel) — basit + tam iade.
 *  - Kismi iade herhangi bir sebeple basarisiz/belirsizse: GUVENLI FALLBACK olarak
 *    tum odeme iptal edilir (musteri her durumda parasini geri alir).
 */
class IyzicoRefundService
{
    public function __construct(
        private readonly IyzicoService $iyzicoService,
        private readonly ScraperAlerter $alerter,
    ) {}

    public function refundOrderForStockOut(OrderMaster $master, array $outOfStockLines): void
    {
        $paymentId = (string) ($master->iyzico_payment_id ?: $master->transaction_ref);
        if (!$paymentId) {
            Log::warning('IyzicoRefund: iyzico paymentId yok', ['order_master_id' => $master->id]);
            $this->alerter->alert(
                title: "Otomatik iade BASARISIZ: Siparis #{$master->id}",
                body: "Stok yok tespit edildi ama iyzico_payment_id bulunamadi. Manuel iade gerek.",
                level: 'critical',
                context: ['order_master_id' => $master->id]
            );
            return;
        }

        $outOrderIds = array_values(array_unique(array_map('intval', array_column($outOfStockLines, 'order_id'))));
        $allOrderIds = $master->orders->pluck('id')->map(fn ($i) => (int) $i)->all();
        $inStockOrderIds = array_values(array_diff($allOrderIds, $outOrderIds));

        // Tum siparis stok-out -> tum odemeyi iptal (basit, tam iade)
        if (empty($inStockOrderIds)) {
            $this->cancelWholePayment($master, $paymentId, $outOfStockLines, $allOrderIds, $outOrderIds);
            return;
        }

        // KISMI: sadece stok-out order'larin transaction'larini iade et
        try {
            $convId = "partial_refund_{$master->id}_" . time();
            $items = $this->iyzicoService->retrievePaymentItemsDetailed($paymentId, $convId);

            if (empty($items)) {
                Log::warning('IyzicoRefund: partial icin payment items bos, full cancel fallback', [
                    'order_master_id' => $master->id,
                ]);
                $this->cancelWholePayment($master, $paymentId, $outOfStockLines, $allOrderIds, $outOrderIds);
                return;
            }

            $refunded = [];
            $failed = [];
            foreach ($items as $it) {
                $oid = $this->orderIdFromItemId($it['item_id'] ?? null);
                if ($oid === null || !in_array($oid, $outOrderIds, true)) {
                    continue; // sadece stogu tukenmis order kalemleri
                }
                if (empty($it['transaction_id']) || (float) ($it['paid_price'] ?? 0) <= 0) {
                    continue;
                }
                try {
                    $res = $this->iyzicoService->refundTransaction(
                        $it['transaction_id'],
                        (string) $it['paid_price'],
                        "{$convId}_" . substr((string) $it['transaction_id'], -10)
                    );
                    $status = $res->getStatus();
                    $code = (string) ($res->getErrorCode() ?? '-');
                    // 5249/5088 -> zaten iade (idempotent ok)
                    if ($status === 'success' || in_array($code, ['5249', '5088'], true)) {
                        $refunded[] = $it['transaction_id'];
                    } else {
                        $failed[] = "{$it['transaction_id']}:{$code}:" . (string) $res->getErrorMessage();
                    }
                } catch (\Throwable $e) {
                    $failed[] = "{$it['transaction_id']}:exception:" . $e->getMessage();
                }
            }

            if (!empty($failed)) {
                // Kismi iade kismen basarisiz -> guvenli fallback: tum odeme iptal.
                // Zaten basarili refund'lar idempotent; cancel kalanlari da iade eder.
                Log::error('IyzicoRefund: partial refund basarisiz kalemler -> full cancel fallback', [
                    'order_master_id' => $master->id, 'failed' => $failed, 'refunded' => $refunded,
                ]);
                $this->cancelWholePayment($master, $paymentId, $outOfStockLines, $allOrderIds, $outOrderIds);
                return;
            }

            // Basarili: SADECE stok-out order'lari cancelled/refunded; master 'paid' kalir.
            $this->markOrdersRefunded(
                master: $master,
                orderIds: $outOrderIds,
                outOrderIds: $outOrderIds,
                setMasterRefunded: false,
                note: 'urun-bazli kismi iade (' . count($refunded) . ' transaction)'
            );

            Log::info('IyzicoRefund: partial refund success', [
                'order_master_id' => $master->id,
                'refunded_transactions' => count($refunded),
                'out_order_ids' => $outOrderIds,
                'in_stock_order_ids' => $inStockOrderIds,
            ]);

            $this->alerter->alert(
                title: "Otomatik KISMI iade: Siparis #{$master->id} (tedarikci stogu tukenmis)",
                body: count($outOrderIds) . " sub-order (stogu tukenmis satici) iade edildi; " . count($inStockOrderIds) . " sub-order (stokta) devam ediyor.\n\n"
                    . "iade edilen URL'ler:\n"
                    . collect($outOfStockLines)->map(fn ($l) => "- {$l['url']} (signal: {$l['signal']})")->implode("\n"),
                level: 'info',
                context: ['order_master_id' => $master->id, 'out_order_ids' => $outOrderIds]
            );
        } catch (\Throwable $e) {
            Log::error('IyzicoRefund: partial exception -> full cancel fallback', [
                'order_master_id' => $master->id, 'error' => $e->getMessage(),
            ]);
            try {
                $this->cancelWholePayment($master, $paymentId, $outOfStockLines, $allOrderIds, $outOrderIds);
            } catch (\Throwable $e2) {
                $this->alerter->alert(
                    title: "Otomatik iade EXCEPTION: Siparis #{$master->id}",
                    body: "Kismi iade + full cancel fallback ikisi de patladi: {$e2->getMessage()}\nManuel iade gerek.",
                    level: 'critical',
                    context: ['order_master_id' => $master->id, 'exception' => $e2->getMessage()]
                );
            }
        }
    }

    /**
     * Tum odemeyi iptal eder (Cancel). Tum siparis stok-out oldugunda veya kismi
     * iade fallback'inde kullanilir. Cancel tum payment'i geri aldigi icin
     * TUM sub-order'lar cancelled/refunded isaretlenir (stok-out olmayanlar collateral).
     */
    private function cancelWholePayment(OrderMaster $master, string $paymentId, array $outOfStockLines, array $allOrderIds, array $outOrderIds): void
    {
        try {
            $conversationId = "auto_cancel_{$master->id}_" . time();
            $result = $this->iyzicoService->cancelPayment($paymentId, $conversationId);

            $ok = $result->getStatus() === 'success';
            $code = (string) ($result->getErrorCode() ?? '-');

            if (!$ok && !in_array($code, ['5249', '5088'], true)) {
                Log::error('IyzicoRefund: cancel failure', [
                    'order_master_id' => $master->id, 'code' => $code, 'error' => (string) $result->getErrorMessage(),
                ]);
                $this->alerter->alert(
                    title: "Otomatik iade BASARISIZ: Siparis #{$master->id}",
                    body: "iyzico cancel API hata verdi (code {$code}): " . (string) $result->getErrorMessage() . "\nManuel iade gerek.",
                    level: 'critical',
                    context: ['order_master_id' => $master->id, 'error_code' => $code]
                );
                return;
            }

            $note = $ok ? 'iyzico cancel success' : "iyzico zaten iptal (code {$code})";
            $this->markOrdersRefunded(
                master: $master,
                orderIds: $allOrderIds,
                outOrderIds: $outOrderIds,
                setMasterRefunded: true,
                note: $note
            );

            Log::info('IyzicoRefund: whole cancel success', [
                'order_master_id' => $master->id, 'orders' => count($allOrderIds), 'code' => $code,
            ]);

            $this->alerter->alert(
                title: "Otomatik iade: Siparis #{$master->id} (tedarikci stogu tukenmis)",
                body: "Tum odeme iptal edildi (" . count($allOrderIds) . " sub-order). " . count($outOrderIds) . " sub-order stok-out, varsa digerleri ayni odemede oldugu icin birlikte iade edildi.\n\n"
                    . "Etkilenen URL'ler:\n"
                    . collect($outOfStockLines)->map(fn ($l) => "- {$l['url']} (signal: {$l['signal']})")->implode("\n"),
                level: 'info',
                context: ['order_master_id' => $master->id, 'lines' => $outOfStockLines]
            );
        } catch (\Throwable $e) {
            Log::error('IyzicoRefund: cancel exception', [
                'order_master_id' => $master->id, 'error' => $e->getMessage(),
            ]);
            $this->alerter->alert(
                title: "Otomatik iade EXCEPTION: Siparis #{$master->id}",
                body: "iyzico cancel cagrisi exception verdi: {$e->getMessage()}\nManuel iade gerek.",
                level: 'critical',
                context: ['order_master_id' => $master->id, 'exception' => $e->getMessage()]
            );
        }
    }

    /**
     * Verilen order'lari cancelled/refunded isaretler + order_refunds + activity yazar.
     * outOrderIds icindekiler "stok tukenmis" sebebiyle, digerleri (full cancel
     * collateral) "Diger" sebebiyle kaydedilir.
     */
    private function markOrdersRefunded(OrderMaster $master, array $orderIds, array $outOrderIds, bool $setMasterRefunded, string $note): void
    {
        DB::transaction(function () use ($master, $orderIds, $outOrderIds, $setMasterRefunded, $note) {
            if ($setMasterRefunded) {
                $master->payment_status = 'refunded';
                $master->save();
            }

            DB::table('orders')->whereIn('id', $orderIds)->update([
                'status' => 'cancelled',
                'refund_status' => 'refunded',
                'cancelled_at' => now(),
                'updated_at' => now(),
            ]);

            // Stok-out otomatik sebebi (admin "iade edilenler" sayfasinda kategorize gozuksun)
            $stockReasonId = DB::table('order_refund_reasons')
                ->where('reason', 'Tedarikci stogu tukenmis (otomatik)')
                ->value('id')
                ?: DB::table('order_refund_reasons')->insertGetId([
                    'reason' => 'Tedarikci stogu tukenmis (otomatik)',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            $otherReasonId = DB::table('order_refund_reasons')->where('reason', 'Diğer')->value('id') ?? $stockReasonId;

            foreach ($master->orders as $sub) {
                if (!in_array((int) $sub->id, array_map('intval', $orderIds), true)) {
                    continue;
                }
                if (DB::table('order_refunds')->where('order_id', $sub->id)->exists()) {
                    continue;
                }
                $isStockOut = in_array((int) $sub->id, array_map('intval', $outOrderIds), true);
                DB::table('order_refunds')->insert([
                    'order_id' => $sub->id,
                    'customer_id' => $master->customer_id,
                    'store_id' => $sub->store_id,
                    'order_refund_reason_id' => $isStockOut ? $stockReasonId : $otherReasonId,
                    'customer_note' => $isStockOut
                        ? 'Otomatik: post-order canli stok kontrolu "tukendi" sinyali aldi.'
                        : 'Otomatik: ayni odemedeki baska sub-order stogu tukendigi icin tum odeme iptal edildi (collateral).',
                    'status' => 'refunded',
                    'amount' => $sub->order_amount,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach ($orderIds as $oid) {
                DB::table('order_activities')->insert([
                    'order_id' => $oid,
                    'activity_from' => 'system',
                    'activity_type' => 'order_status',
                    'activity_value' => 'cancelled',
                    'reference' => "Otomatik: tedarikci stogu tukenmis. {$note}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    /** "ORD139-DET34" / "ORD139" / "ORD139-ADJ" -> 139 */
    private function orderIdFromItemId(?string $itemId): ?int
    {
        if (!$itemId) {
            return null;
        }
        if (preg_match('/^ORD(\d+)/', $itemId, $m)) {
            return (int) $m[1];
        }
        return null;
    }
}
