<?php

namespace App\Services;

use App\Models\OrderMaster;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PostOrderStockCheckJob bir veya birden fazla satirin kesin "out-of-stock"
 * oldugunu tespit ettiginde tetiklenir. Iyzico'da Approval henuz gonderilmemis
 * paid odeme oldugu icin Refund yerine **Cancel** kullanilir — tek API cagrisi
 * tum payment'i iade eder, daha guvenli + idempotent.
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

        try {
            $conversationId = "auto_cancel_{$master->id}_" . time();
            $result = $this->iyzicoService->cancelPayment($paymentId, $conversationId);

            if ($result->getStatus() !== 'success') {
                $err = (string) $result->getErrorMessage();
                $code = (string) ($result->getErrorCode() ?? '-');

                // 5249/5088 → zaten iade edilmis (idempotent ok)
                if (in_array($code, ['5249', '5088'], true)) {
                    $this->markRefunded($master, $outOfStockLines, "iyzico zaten iptal (code {$code})");
                    Log::info('IyzicoRefund: iyzico zaten iptal edilmis, sadece DB markla', [
                        'order_master_id' => $master->id, 'code' => $code,
                    ]);
                    return;
                }

                Log::error('IyzicoRefund: cancel failure', [
                    'order_master_id' => $master->id,
                    'code' => $code, 'error' => $err,
                ]);
                $this->alerter->alert(
                    title: "Otomatik iade BASARISIZ: Siparis #{$master->id}",
                    body: "iyzico cancel API hata verdi (code {$code}): {$err}\nManuel iade gerek.",
                    level: 'critical',
                    context: ['order_master_id' => $master->id, 'error_code' => $code]
                );
                return;
            }

            $this->markRefunded($master, $outOfStockLines, 'iyzico cancel success');
            Log::info('IyzicoRefund: cancel success', [
                'order_master_id' => $master->id,
                'lines_count' => count($outOfStockLines),
            ]);
        } catch (\Throwable $e) {
            Log::error('IyzicoRefund: exception', [
                'order_master_id' => $master->id,
                'error' => $e->getMessage(),
            ]);
            $this->alerter->alert(
                title: "Otomatik iade EXCEPTION: Siparis #{$master->id}",
                body: "iyzico cancel cagrisi exception verdi: {$e->getMessage()}\nManuel iade gerek.",
                level: 'critical',
                context: ['order_master_id' => $master->id, 'exception' => $e->getMessage()]
            );
        }
    }

    private function markRefunded(OrderMaster $master, array $outOfStockLines, string $note): void
    {
        DB::transaction(function () use ($master, $outOfStockLines, $note) {
            $master->payment_status = 'refunded';
            $master->save();

            // Etkilenen sub-order'lari cancelled yap + refund_status set
            $orderIds = array_unique(array_column($outOfStockLines, 'order_id'));
            DB::table('orders')->whereIn('id', $orderIds)->update([
                'status' => 'cancelled',
                'refund_status' => 'refunded',
                'cancelled_at' => now(),
                'updated_at' => now(),
            ]);

            // Otomatik refund reason'i bul/yarat (admin paneli "refund-request"
            // sayfasinda kategorize gozuksun diye)
            $reasonId = DB::table('order_refund_reasons')
                ->where('reason', 'Tedarikci stogu tukenmis (otomatik)')
                ->value('id')
                ?: DB::table('order_refund_reasons')->insertGetId([
                    'reason' => 'Tedarikci stogu tukenmis (otomatik)',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            // order_refunds tablosuna kayit yaz (admin'in "iade edilenler"
            // sayfasinda otomatik iadeler de gozuksun)
            foreach ($master->orders as $sub) {
                if (!in_array($sub->id, $orderIds, true)) continue;
                $existing = DB::table('order_refunds')->where('order_id', $sub->id)->first();
                if ($existing) continue;
                DB::table('order_refunds')->insert([
                    'order_id' => $sub->id,
                    'customer_id' => $master->customer_id,
                    'store_id' => $sub->store_id,
                    'order_refund_reason_id' => $reasonId,
                    'customer_note' => 'Otomatik: post-order canli stok kontrolu "tukendi" sinyali aldi.',
                    'status' => 'refunded',
                    'amount' => $sub->order_amount,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Activity log
            foreach ($orderIds as $oid) {
                DB::table('order_activities')->insert([
                    'order_id' => $oid,
                    'activity_type' => 'order_status',
                    'activity_value' => 'cancelled',
                    'note' => "Otomatik: tedarikci stogu tukenmis. {$note}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        // Customer notification + Telegram
        $this->alerter->alert(
            title: "Otomatik iade: Siparis #{$master->id} (tedarikci stogu tukenmis)",
            body: "Sipariste " . count($outOfStockLines) . " satir icin canli stok kontrolunde 'tukendi' sinyali alindi.\n"
                . "iyzico'da odeme iptal edildi, sportoonline DB'de refunded isaretlendi.\n\n"
                . "Etkilenen URL'ler:\n"
                . collect($outOfStockLines)->map(fn($l) => "- {$l['url']} (signal: {$l['signal']})")->implode("\n"),
            level: 'info',
            context: ['order_master_id' => $master->id, 'lines' => $outOfStockLines]
        );
    }
}
