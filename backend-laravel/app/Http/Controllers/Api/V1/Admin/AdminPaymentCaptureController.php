<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\OrderMaster;
use App\Services\IyzicoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Admin tarafindan PreAuth ile yetkilendirilmis (authorized) sipariş
 * ödemelerini iyzico'dan tahsil eder (postauth/capture).
 *
 * Akış:
 *  1. Müşteri ödeme yapar → PreAuth mode → payment_status='authorized'
 *  2. Admin sipariş ekranında "Ödemeyi Tahsil Et" tıklar
 *  3. Bu endpoint → IyzicoService::capturePayment → payment_status='paid'
 */
class AdminPaymentCaptureController extends Controller
{
    public function __construct(private readonly IyzicoService $iyzicoService)
    {
    }

    /** POST /api/v1/admin/orders/{id}/capture-payment */
    public function capture(int $orderMasterId): JsonResponse
    {
        $orderMaster = OrderMaster::find($orderMasterId);
        if (!$orderMaster) {
            return response()->json(['success' => false, 'message' => 'Sipariş bulunamadı'], 404);
        }

        if ($orderMaster->payment_status !== 'authorized') {
            return response()->json([
                'success' => false,
                'message' => "Bu sipariş tahsil edilemez (durum: {$orderMaster->payment_status}). Sadece 'authorized' durumdaki siparişler tahsil edilir.",
            ], 400);
        }

        if (!$orderMaster->iyzico_payment_id) {
            return response()->json([
                'success' => false,
                'message' => 'iyzico ödeme kimliği yok — bu sipariş PreAuth ile başlatılmamış olabilir.',
            ], 400);
        }

        if ($orderMaster->preauth_expires_at && $orderMaster->preauth_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'PreAuth süresi doldu — iyzico tutar iptalini gerçekleştirdi, tahsil edilemez.',
            ], 400);
        }

        try {
            $amount = (float) ($orderMaster->paid_amount ?: $orderMaster->order_amount);
            $conversationId = 'capture_' . $orderMaster->id . '_' . time();
            $result = $this->iyzicoService->capturePayment(
                $orderMaster->iyzico_payment_id,
                $amount,
                $conversationId
            );

            if ($result->getStatus() !== 'success') {
                Log::warning('Iyzico capture failed', [
                    'order_master_id' => $orderMaster->id,
                    'iyzico_payment_id' => $orderMaster->iyzico_payment_id,
                    'error_code' => $result->getErrorCode(),
                    'error_message' => $result->getErrorMessage(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'iyzico tahsilat başarısız: ' . $result->getErrorMessage(),
                ], 422);
            }

            $orderMaster->payment_status = 'paid';
            $orderMaster->save();
            $orderMaster->orders()->update(['payment_status' => 'paid']);

            Log::info('Iyzico payment captured', [
                'order_master_id' => $orderMaster->id,
                'iyzico_payment_id' => $orderMaster->iyzico_payment_id,
                'amount' => $amount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ödeme tahsil edildi',
                'data' => [
                    'order_master_id' => $orderMaster->id,
                    'amount' => $amount,
                    'payment_status' => 'paid',
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Iyzico capture exception', [
                'order_master_id' => $orderMaster->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Beklenmeyen hata: ' . $e->getMessage(),
            ], 500);
        }
    }
}
