<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\OrderMaster;
use App\Services\CheckoutStockVerifier;
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
    public function __construct(
        private readonly IyzicoService $iyzicoService,
        private readonly CheckoutStockVerifier $stockVerifier,
    ) {
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
            $approvedAt = $orderMaster->iyzico_approved_at instanceof \Carbon\Carbon
                ? $orderMaster->iyzico_approved_at
                : \Carbon\Carbon::parse((string) $orderMaster->iyzico_approved_at);
            return response()->json([
                'success' => false,
                'message' => "Bu sipariş icin iyzico para onayi zaten gonderilmis ({$approvedAt->format('d.m.Y H:i')}). Para iyzico'nun haftalik gonderim doneminde hesabiniza yatar.",
            ], 400);
        }

        // ESCROW GUARD: Approval = para serbest birakma (geri donulmez — sonrasinda
        // sadece yavas Refund kalir, hizli Cancel/void DEGIL). Bu yuzden serbest
        // birakmadan ONCE canli stok teyidi yap. Kesin tukenmis varsa BLOKLA —
        // admin once iade etsin. Erken approve, post-order otomatik iade netini
        // devre disi birakiyordu (job 'zaten Approval gonderildi' deyip skip).
        // ?force=1 ile bilincli gecilebilir. Belirsiz probe engellemez (fail-open).
        if (!request()->boolean('force')) {
            $lines = [];
            $orderMaster->loadMissing(['orders.orderDetail.product']);
            foreach ($orderMaster->orders as $order) {
                foreach ($order->orderDetail as $detail) {
                    $lines[] = [
                        'product_id' => (int) $detail->product_id,
                        'variant_id' => null,
                        'name' => optional($detail->product)->name,
                    ];
                }
            }
            if (!empty($lines)) {
                try {
                    $stock = $this->stockVerifier->verify($lines);
                    if (!($stock['ok'] ?? true)) {
                        return response()->json([
                            'success' => false,
                            'code' => 'stock_out',
                            'message' => 'Stok teyidi: bu siparişte tükenmiş ürün(ler) var. Para serbest bırakmadan (onay) önce iade edin veya kontrol edin. Yine de onaylamak için force=1 kullanın.',
                            'out_of_stock' => $stock['out_of_stock'],
                        ], 409);
                    }
                } catch (\Throwable $e) {
                    Log::warning('Approval stock guard failed-open', [
                        'order_master_id' => $orderMaster->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
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
        // 5249 = "Tamami iade edilmis kirilim" / 5088 = "Odeme iptal edilmis"
        // donerse: iyzico tarafindan zaten iade/iptal — DB'yi refunded isaretle.
        $results = ['approved' => [], 'failed' => []];
        $refundedCodes = ['5249', '5088'];
        $isRefundedOnIyzico = false;
        foreach ($transactionIds as $i => $tid) {
            try {
                $convId = "approve_{$orderMaster->id}_{$i}_" . time();
                $approval = $this->iyzicoService->approvePayment((string) $tid, $convId);
                if ($approval->getStatus() === 'success') {
                    $results['approved'][] = $tid;
                } else {
                    $errCode = (string) ($approval->getErrorCode() ?? '');
                    if (in_array($errCode, $refundedCodes, true)) {
                        $isRefundedOnIyzico = true;
                    }
                    $results['failed'][] = [
                        'tid' => $tid,
                        'error' => $approval->getErrorMessage() ?: 'unknown',
                        'code' => $errCode,
                    ];
                    Log::warning('Iyzico approval failed', [
                        'order_master_id' => $orderMaster->id,
                        'tid' => $tid,
                        'error_code' => $errCode,
                        'error_message' => $approval->getErrorMessage(),
                    ]);
                }
            } catch (\Throwable $e) {
                $results['failed'][] = ['tid' => $tid, 'error' => $e->getMessage()];
            }
        }

        if ($isRefundedOnIyzico && empty($results['approved'])) {
            $orderMaster->payment_status = 'refunded';
            $orderMaster->save();
            return response()->json([
                'success' => false,
                'message' => 'Bu sipariş iyzico tarafında iade/iptal edilmiş. Sipariş durumu refunded olarak isaretlendi.',
                'data' => $results,
            ], 409);
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
