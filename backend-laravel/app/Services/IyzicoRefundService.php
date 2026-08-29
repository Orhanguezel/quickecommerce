<?php

namespace App\Services;

use App\Mail\OrderRefundedStockOut;
use App\Models\OrderMaster;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * PostOrderStockCheckJob bir veya birden fazla satirin kesin "out-of-stock"
 * oldugunu tespit ettiginde tetiklenir.
 *
 * URUN-BAZLI KISMI IADE (2026-06-09):
 *  - Cok-saticili tek odemede SADECE stogu tukenmis saticinin sub-order'i iade
 *    edilir (iyzico Refund, paymentTransactionId bazli). Diger (stoktaki)
 *    saticilarin siparisi bozulmaz, devam eder.
 *  - Tum siparis stok-out ise: tum odemeyi tek seferde iptal (Cancel) — basit + tam iade.
 *  - Kismi iade basarisiz/belirsizse: STOKTAKI sub-order ASLA collateral iptal edilmez.
 *    Iade edilemeyen stok-out sub-order'lar manuel iade icin admin'e KRITIK alarm ile
 *    escalate edilir (escalateManualRefund); stoktaki satici siparisi kargolanmaya devam eder.
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
                // STOKTAKI SIPARISI ASLA IPTAL ETME: payment items alinamadigi icin
                // hedefli iade yapilamiyor. Tum odemeyi iptal etmek stoktaki saticinin
                // siparisini de oldururdu (collateral). Bunun yerine manuel iade escalate.
                Log::error('IyzicoRefund: partial icin payment items bos -> manuel iade escalate (stoktaki korunur)', [
                    'order_master_id' => $master->id, 'out_order_ids' => $outOrderIds,
                ]);
                $this->escalateManualRefund($master, $outOrderIds, $outOfStockLines, 'iyzico payment items alinamadi');
                return;
            }

            // Her stok-out sub-order'i BAGIMSIZ iade et. Stoktaki sub-order'lara ASLA
            // dokunma. Iade edilemeyen out-order'lar full-cancel YERINE manuel iade icin
            // escalate edilir — yani stoktaki satici collateral olarak iptal OLMAZ.
            $refundedOutIds = [];
            $failedOutIds = [];
            $failedDetail = [];
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
                        $refundedOutIds[$oid] = true;
                    } else {
                        $failedOutIds[$oid] = true;
                        $failedDetail[] = "order#{$oid} txn{$it['transaction_id']}:{$code}:" . (string) $res->getErrorMessage();
                    }
                } catch (\Throwable $e) {
                    $failedOutIds[$oid] = true;
                    $failedDetail[] = "order#{$oid} txn{$it['transaction_id']}:exception:" . $e->getMessage();
                }
            }

            // Hicbir kalemi patlamayan, basariyla iade edilen out-order'lari isaretle.
            $okOutIds = array_values(array_diff(array_keys($refundedOutIds), array_keys($failedOutIds)));
            if (!empty($okOutIds)) {
                $this->markOrdersRefunded(
                    master: $master,
                    orderIds: $okOutIds,
                    outOrderIds: $okOutIds,
                    setMasterRefunded: false,
                    note: 'urun-bazli kismi iade'
                );
            }

            // Iade edilemeyen out-order'lar: STOKTAKINI IPTAL ETME, manuel iade escalate.
            $failedIds = array_keys($failedOutIds);
            if (!empty($failedIds)) {
                Log::error('IyzicoRefund: bazi out-order iade edilemedi -> manuel escalate (stoktaki korunur)', [
                    'order_master_id' => $master->id, 'failed' => $failedDetail, 'refunded_ok' => $okOutIds,
                ]);
                $this->escalateManualRefund($master, $failedIds, $outOfStockLines, 'kismi iade basarisiz: ' . implode(' | ', $failedDetail));
                return;
            }

            Log::info('IyzicoRefund: partial refund success', [
                'order_master_id' => $master->id,
                'refunded_out_order_ids' => $okOutIds,
                'in_stock_order_ids' => $inStockOrderIds,
            ]);

            $this->alerter->alert(
                title: "Otomatik KISMI iade: Siparis #{$master->id} (tedarikci stogu tukenmis)",
                body: count($okOutIds) . " sub-order (stogu tukenmis satici) iade edildi; " . count($inStockOrderIds) . " sub-order (stokta) devam ediyor.\n\n"
                    . "iade edilen URL'ler:\n"
                    . collect($outOfStockLines)->map(fn ($l) => "- {$l['url']} (signal: {$l['signal']})")->implode("\n"),
                level: 'info',
                context: ['order_master_id' => $master->id, 'out_order_ids' => $okOutIds]
            );
        } catch (\Throwable $e) {
            // STOKTAKI SIPARISI ASLA IPTAL ETME: partial akisi tamamen patladiysa bile
            // full-cancel yapmiyoruz (stoktaki satici collateral iptal olurdu). Manuel
            // iade escalate — admin sadece stogu tukenmis sub-order'i elle iade eder.
            Log::error('IyzicoRefund: partial exception -> manuel iade escalate (stoktaki korunur)', [
                'order_master_id' => $master->id, 'error' => $e->getMessage(),
            ]);
            $this->escalateManualRefund($master, $outOrderIds, $outOfStockLines, 'partial akis exception: ' . $e->getMessage());
        }
    }

    /**
     * Stok-out sub-order(lar) otomatik iade edilemedi. STOKTAKI sub-order'lari
     * KORUMAK icin tum odemeyi iptal ETMEYIZ (collateral iptal yok). Bunun yerine
     * admin'e kritik alarm gonderip manuel iade istenir. Hicbir siparis durumu
     * degistirilmez — yarim-state riski olmaz, stoktaki siparis kargolanmaya devam eder.
     */
    private function escalateManualRefund(OrderMaster $master, array $manualOrderIds, array $outOfStockLines, string $reason): void
    {
        $manualOrderIds = array_values(array_unique(array_map('intval', $manualOrderIds)));
        $lines = collect($outOfStockLines)
            ->filter(fn ($l) => in_array((int) ($l['order_id'] ?? 0), $manualOrderIds, true))
            ->map(fn ($l) => "- order#{$l['order_id']}: {$l['url']} (signal: {$l['signal']})")
            ->implode("\n");

        $this->alerter->alert(
            title: "MANUEL IADE GEREK: Siparis #{$master->id} (otomatik kismi iade basarisiz)",
            body: "Asagidaki stogu tukenmis sub-order(lar) otomatik iade EDILEMEDI. "
                . "Stoktaki diger sub-order(lar) KORUNDU (iptal edilmedi) — kargolanmaya devam eder.\n"
                . "Bu sub-order(lar)i admin panelden MANUEL iade et:\n\n"
                . ($lines !== '' ? $lines : '- (URL bilgisi yok)') . "\n\n"
                . "Sebep: {$reason}",
            level: 'critical',
            context: ['order_master_id' => $master->id, 'manual_refund_order_ids' => $manualOrderIds, 'reason' => $reason]
        );

        Log::error('IyzicoRefund: MANUEL IADE escalate', [
            'order_master_id' => $master->id,
            'manual_refund_order_ids' => $manualOrderIds,
            'reason' => $reason,
        ]);
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
        $newlyRefunded = [];
        DB::transaction(function () use ($master, $orderIds, $outOrderIds, $setMasterRefunded, $note, &$newlyRefunded) {
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
                $newlyRefunded[] = (int) $sub->id;
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

        // Verilmis sadakat puanini geri al. Bu akis orders tablosunu ham query
        // builder ile guncelledigi icin OrderObserver TETIKLENMEZ; revoke burada
        // acikca cagrilmali. Idempotent: benzersiz indeks ikinci revoke'u engeller.
        foreach ($orderIds as $oid) {
            try {
                $order = \App\Models\Order::find($oid);
                if ($order) {
                    app(\App\Services\Loyalty\LoyaltyService::class)->revokeForOrder($order);
                }
            } catch (\Throwable $e) {
                Log::error('[loyalty] otomatik iade sonrasi puan geri alinamadi', [
                    'order_id' => $oid,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Iade DB'ye yazildi -> musteriye bilgilendirme e-postasi. Yalnizca bu calismada
        // YENI iade edilen sub-order'lar icin gonderilir; job retry'inde order_refunds
        // zaten var oldugu icin $newlyRefunded bos kalir ve mukerrer mail gitmez.
        if (!empty($newlyRefunded)) {
            $this->sendCustomerRefundEmail($master, $newlyRefunded, !$setMasterRefunded);
        }
    }

    /**
     * Otomatik stok-out iadesinde musteriye bilgilendirme e-postasi (queue).
     * Mail altyapisi hata verirse iade akisini bozmaz (best-effort).
     */
    private function sendCustomerRefundEmail(OrderMaster $master, array $refundedOrderIds, bool $isPartial): void
    {
        try {
            $email = optional($master->customer)->email;
            if (!$email) {
                Log::info('IyzicoRefund: musteri email yok, iade maili atlandi', ['order_master_id' => $master->id]);
                return;
            }

            Mail::to($email)->queue(new OrderRefundedStockOut($master, $refundedOrderIds, $isPartial));

            Log::info('IyzicoRefund: musteri iade bilgilendirme maili kuyruga alindi', [
                'order_master_id' => $master->id,
                'order_ids' => $refundedOrderIds,
                'email' => $email,
            ]);
        } catch (\Throwable $e) {
            Log::warning('IyzicoRefund: iade maili gonderilemedi', [
                'order_master_id' => $master->id,
                'error' => $e->getMessage(),
            ]);
        }
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
