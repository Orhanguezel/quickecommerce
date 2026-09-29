<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\OrderActivity;
use App\Models\OrderRefund;
use App\Services\Analytics\Ga4MeasurementProtocol;
use App\Services\ScraperAlerter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Odenmis bir alt siparis manuel iptal edildiginde (admin / satici / musteri)
 * siparis durumunu tutarli hale getirir. ODEME SAGLAYICISINA HIC GITMEZ —
 * para iadesini admin elle yapar.
 *
 * Neden: 2026-09'da 5 odenmis alt siparis "cancelled" oldu ama
 * payment_status=paid, refund_status=null kaldi ve order_refunds satiri
 * olusmadi; admin "iade" ekranlarinda gorunmedikleri icin iade bekleyen
 * oldugu anlasilmiyordu.
 *
 * Yapilan, musterinin iade talebi akisinin (OrderRefundRepository::
 * create_order_refund_request) aynisidir:
 *   - order_refunds: status='pending', amount=order_amount
 *   - orders.refund_status='requested' (Eloquent save -> OrderObserver
 *     order_activities'e refund_status kaydi yazar)
 * Admin sonra mevcut "iade talepleri" ekranindan onaylar / iade edildi yapar.
 */
class PaidOrderCancellationService
{
    public const REASON = 'Sipariş iptal edildi (ödeme iadesi bekliyor)';

    /**
     * @param string $actor admin|seller|customer
     * @return bool iade kaydi acildiysa true
     */
    public function flagForRefund(Order $order, string $actor): bool
    {
        try {
            $order->loadMissing('orderMaster');
            $master = $order->orderMaster;

            if ($order->status !== 'cancelled' || ! $this->wasPaid($order)) {
                return false;
            }

            if (in_array($order->refund_status, ['requested', 'processing', 'refunded'], true)) {
                return false;
            }

            $customerId = $master?->customer_id;
            if (! $customerId) {
                Log::warning('paid_order_cancel_refund_skipped', [
                    'event' => 'paid_order_cancel_refund_skipped',
                    'reason' => 'customer_id_missing',
                    'order_id' => $order->id,
                    'order_master_id' => $order->order_master_id,
                ]);
                return false;
            }

            $created = DB::transaction(function () use ($order, $customerId, $actor) {
                $alreadyOpen = OrderRefund::where('order_id', $order->id)
                    ->whereIn('status', ['pending', 'approved', 'refunded'])
                    ->lockForUpdate()
                    ->exists();
                if ($alreadyOpen) {
                    return false;
                }

                $reasonId = DB::table('order_refund_reasons')->where('reason', self::REASON)->value('id')
                    ?: DB::table('order_refund_reasons')->insertGetId([
                        'reason' => self::REASON,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                OrderRefund::create([
                    'order_id' => $order->id,
                    'customer_id' => $customerId,
                    'store_id' => $order->store_id,
                    'order_refund_reason_id' => $reasonId,
                    'customer_note' => "Otomatik: odenmis siparis {$this->actorLabel($actor)} tarafindan iptal edildi. Odeme iadesi admin tarafindan MANUEL yapilmalidir.",
                    'status' => 'pending',
                    'amount' => $order->order_amount,
                ]);

                // saveQuietly: Order::boot()'taki updated hook'u status=cancelled
                // iken HER guncellemede magaza order_limit'ini dusuruyor; ikinci
                // bir save iptali cift sayardi. Observer'in yazacagi refund_status
                // aktivitesini burada ayni bicimde yaziyoruz.
                $order->refund_status = 'requested';
                $order->saveQuietly();

                OrderActivity::create([
                    'order_id' => $order->id,
                    'store_id' => $order->store_id,
                    'ref_id' => $actor === 'customer' ? auth('api_customer')->id() : auth('api')->id(),
                    'activity_from' => $actor === 'seller' ? 'store' : $actor,
                    'activity_type' => 'refund_status',
                    'activity_value' => 'requested',
                ]);

                return true;
            });

            if (! $created) {
                return false;
            }

            Log::info('paid_order_cancel_refund_requested', [
                'event' => 'paid_order_cancel_refund_requested',
                'order_id' => $order->id,
                'order_master_id' => $order->order_master_id,
                'actor' => $actor,
                'amount' => (float) $order->order_amount,
            ]);

            try {
                ScraperAlerter::alert(
                    title: "MANUEL IADE GEREK: Siparis #{$order->order_master_id} / alt #{$order->id}",
                    body: "Odenmis alt siparis {$this->actorLabel($actor)} tarafindan iptal edildi. "
                        . 'Tutar: ' . number_format((float) $order->order_amount, 2, ',', '.') . " TL.\n"
                        . "Admin > Iade talepleri ekraninda 'pending' olarak acildi; odeme saglayicisindan elle iade edip durumu 'refunded' yapin.",
                    level: 'critical',
                );
            } catch (\Throwable $e) {
                Log::warning('paid_order_cancel_alert_failed', [
                    'event' => 'paid_order_cancel_alert_failed',
                    'order_id' => $order->id,
                    'err' => $e->getMessage(),
                ]);
            }

            // Iptal edilen odenmis alt siparisin geliri GA4'ten geri alinir.
            Ga4MeasurementProtocol::queueRefund($order);

            return true;
        } catch (\Throwable $e) {
            // Iptal zaten kaydedildi; iade isaretleme hatasi iptal cevabini bozmasin.
            Log::error('paid_order_cancel_refund_failed', [
                'event' => 'paid_order_cancel_refund_failed',
                'order_id' => $order->id,
                'err' => $e->getMessage(),
            ]);
            return false;
        }
    }

    private function wasPaid(Order $order): bool
    {
        $master = $order->orderMaster;

        return $order->payment_status === 'paid'
            || ($master && $master->payment_status === 'paid' && $master->payment_gateway !== 'cash_on_delivery');
    }

    private function actorLabel(string $actor): string
    {
        return match ($actor) {
            'admin' => 'admin',
            'seller' => 'satici',
            'customer' => 'musteri',
            default => $actor,
        };
    }
}
