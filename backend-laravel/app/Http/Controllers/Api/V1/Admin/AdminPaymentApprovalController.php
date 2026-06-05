<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\OrderMaster;
use App\Services\IyzicoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * iyzico "Onay bazli tahsilat" akISi — admin'in panelden onay göndermesi.
 *
 * Tipik akış:
 *  1. Müşteri ödemeyi tamamlar -> sportoonline "paid" gösterir
 *  2. iyzico hesabi "Onay bazli tahsilat" mode'undaysa, para iyzico Bekleyen
 *     Bakiyesinde durur; cekilebilir bakiyeye gecmez
 *  3. Admin bu endpoint ile her paymentTransactionId icin Approval gonderir
 *  4. iyzico cekilebilir bakiyeye gecirir -> admin EFT/havale ile cekebilir
 */
class AdminPaymentApprovalController extends Controller
{
    public function __construct(private readonly IyzicoService $iyzicoService)
    {
    }

    /** POST /api/v1/admin/orders/{id}/approve-payment */
    public function approve(int $orderMasterId): JsonResponse
    {
        $orderMaster = OrderMaster::find($orderMasterId);
        if (!$orderMaster) {
            return response()->json(['success' => false, 'message' => 'Sipariş bulunamadı'], 404);
        }

        if (strtolower((string) $orderMaster->payment_gateway) !== 'iyzico') {
            return response()->json([
                'success' => false,
                'message' => "Bu sipariş iyzico ile ödenmemiş (ödeme: {$orderMaster->payment_gateway})",
            ], 400);
        }

        if ($orderMaster->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => "Onay icin sipariş 'paid' durumda olmali (mevcut: {$orderMaster->payment_status})",
            ], 400);
        }

        if ($orderMaster->iyzico_approved_at) {
            return response()->json([
                'success' => false,
                'message' => "Bu sipariş zaten onaylandi ({$orderMaster->iyzico_approved_at->format('d.m.Y H:i')})",
            ], 400);
        }

        // paymentTransactionId listesini al — callback'te saklanan JSON'dan
        // veya yoksa iyzico'ya retrievePayment ile sor (eski sipariş icin)
        $transactionIds = json_decode((string) ($orderMaster->iyzico_payment_items_json ?: '[]'), true);
        if (!is_array($transactionIds) || empty($transactionIds)) {
            $paymentId = (string) ($orderMaster->iyzico_payment_id ?: $orderMaster->transaction_ref);
            if (!$paymentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'iyzico ödeme kimliği bulunamadı (transaction_ref bos).',
                ], 400);
            }
            try {
                $transactionIds = $this->iyzicoService->retrievePaymentTransactionIds(
                    $paymentId,
                    "approve_{$orderMaster->id}_retrieve_" . time()
                );
            } catch (\Throwable $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'iyzico ödeme detayları alınamadı: ' . $e->getMessage(),
                ], 500);
            }
            if (empty($transactionIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'iyzico paymentItems[].paymentTransactionId bos. Onay gönderilemiyor.',
                ], 400);
            }
            // İleride tekrar gerekmesin diye sakla
            $orderMaster->iyzico_payment_items_json = json_encode(array_values($transactionIds));
            $orderMaster->save();
        }

        // Her transactionId icin ayri Approval
        $results = ['approved' => [], 'failed' => []];
        foreach ($transactionIds as $i => $tid) {
            try {
                $convId = "approve_{$orderMaster->id}_{$i}_" . time();
                $approval = $this->iyzicoService->approvePayment((string) $tid, $convId);
                if ($approval->getStatus() === 'success') {
                    $results['approved'][] = $tid;
                } else {
                    $results['failed'][] = [
                        'tid' => $tid,
                        'error' => $approval->getErrorMessage() ?: 'unknown',
                    ];
                    Log::warning('Iyzico approval failed', [
                        'order_master_id' => $orderMaster->id,
                        'tid' => $tid,
                        'error_code' => $approval->getErrorCode(),
                        'error_message' => $approval->getErrorMessage(),
                    ]);
                }
            } catch (\Throwable $e) {
                $results['failed'][] = ['tid' => $tid, 'error' => $e->getMessage()];
            }
        }

        if (!empty($results['failed'])) {
            return response()->json([
                'success' => false,
                'message' => count($results['approved']) . ' onaylandi, ' . count($results['failed']) . ' başarısız',
                'data' => $results,
            ], 207); // Multi-Status
        }

        $orderMaster->iyzico_approved_at = now();
        $orderMaster->save();

        Log::info('Iyzico payment approved', [
            'order_master_id' => $orderMaster->id,
            'approved_count' => count($results['approved']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'iyzico onayı gönderildi. Para çekilebilir bakiyeye geçecek.',
            'data' => [
                'order_master_id' => $orderMaster->id,
                'approved_count' => count($results['approved']),
                'iyzico_approved_at' => $orderMaster->iyzico_approved_at->toIso8601String(),
            ],
        ]);
    }
}
