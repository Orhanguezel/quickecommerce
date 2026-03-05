<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\OrderMaster;
use App\Services\PayTRService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PayTRPaymentController extends Controller
{
    public function __construct(private readonly PayTRService $payTRService)
    {
    }

    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_master_id' => 'required|integer|exists:order_masters,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth()->guard('api_customer')->user();
        $orderMaster = OrderMaster::with(['orders.orderDetail.product', 'shippingAddress.area'])
            ->find((int)$request->order_master_id);

        if (!$orderMaster) {
            return response()->json(['success' => false, 'message' => __('messages.data_not_found')], 404);
        }

        if ($orderMaster->customer_id !== $customer->id) {
            return response()->json(['success' => false, 'message' => __('messages.access_denied')], 403);
        }

        if ($orderMaster->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => __('messages.order_already_paid')], 400);
        }

        try {
            $config = $this->payTRService->getCredentials();
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => __('messages.paytr_configuration_missing'),
            ], 422);
        }

        try {
            $credentials = $config['credentials'];
            $appUrl = rtrim(config('app.url'), '/');
            $frontendUrl = rtrim(config('app.frontend_url', $appUrl), '/');
            $defaultLocale = config('app.locale', 'tr');

            $merchantOid = 'SP' . $orderMaster->id . 'T' . now()->timestamp;

            $shippingAddress = $orderMaster->shippingAddress;
            $fullName = trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? ''));
            if ($fullName === '') {
                $fullName = 'Musteri';
            }

            // Tutar: kuruş cinsinden (PayTR kuruş bekler)
            $amount = (float)$orderMaster->order_amount;
            $paymentAmountKurus = (int)round($amount * 100);

            // Para birimi
            $currency = PayTRService::convertCurrency((string)($orderMaster->currency_code ?? 'TRY'));

            // Sepet oluştur
            $basketItems = $this->buildBasketItems($orderMaster);
            $userBasket = PayTRService::encodeBasket($basketItems);

            $merchantOkUrl = str_replace(
                '{ORDER_MASTER_ID}',
                (string)$orderMaster->id,
                $credentials['paytr_success_url']
                    ?? ($frontendUrl . '/' . $defaultLocale . '/siparis-basarili?order={ORDER_MASTER_ID}')
            );
            $merchantFailUrl = str_replace(
                '{ORDER_MASTER_ID}',
                (string)$orderMaster->id,
                $credentials['paytr_fail_url']
                    ?? ($frontendUrl . '/' . $defaultLocale . '/odeme?payment=failed&order={ORDER_MASTER_ID}')
            );

            $callbackUrl = $credentials['paytr_callback_url']
                ?? ($appUrl . '/api/v1/paytr/callback');

            $result = $this->payTRService->createPaymentToken([
                'merchant_oid' => $merchantOid,
                'email' => (string)($customer->email ?? 'customer@example.com'),
                'payment_amount' => $paymentAmountKurus,
                'user_ip' => (string)$request->ip(),
                'user_basket' => $userBasket,
                'currency' => $currency,
                'merchant_ok_url' => $merchantOkUrl,
                'merchant_fail_url' => $merchantFailUrl,
                'user_name' => $fullName,
                'user_address' => (string)($shippingAddress?->address ?? 'Adres belirtilmedi'),
                'user_phone' => $this->sanitizePhone($customer->phone ?? $shippingAddress?->contact_number ?? '05000000000'),
                'no_installment' => $credentials['no_installment'] ?? '0',
                'max_installment' => $credentials['max_installment'] ?? '0',
            ]);

            $orderMaster->payment_gateway = 'paytr';
            $orderMaster->payment_status = 'pending';
            $orderMaster->transaction_ref = $merchantOid;
            $orderMaster->save();

            return response()->json([
                'success' => true,
                'message' => __('messages.paytr_session_created'),
                'data' => [
                    'token' => $result['token'],
                    'iframe_url' => $result['iframe_url'],
                    'order_master_id' => $orderMaster->id,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('PayTR checkout session exception', [
                'order_master_id' => $orderMaster->id ?? null,
                'customer_id' => $customer->id ?? null,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => __('messages.paytr_session_create_failed'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function createCheckoutSessionForWallet(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'wallet_id' => 'required|integer',
            'wallet_history_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $customer = auth()->guard('api_customer')->user();

        $walletHistory = \Modules\Wallet\app\Models\WalletTransaction::with('wallet')
            ->find((int)$request->wallet_history_id);

        if (!$walletHistory) {
            return response()->json(['success' => false, 'message' => __('messages.data_not_found')], 404);
        }

        $wallet = $walletHistory->wallet;
        if (!$wallet || (int)$wallet->owner_id !== (int)$customer->id) {
            return response()->json(['success' => false, 'message' => __('messages.access_denied')], 403);
        }

        if ($walletHistory->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => __('messages.order_already_paid')], 400);
        }

        try {
            $config = $this->payTRService->getCredentials();
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => __('messages.paytr_configuration_missing'),
            ], 422);
        }

        try {
            $credentials = $config['credentials'];
            $appUrl = rtrim(config('app.url'), '/');
            $frontendUrl = rtrim(config('app.frontend_url', $appUrl), '/');

            $merchantOid = 'WL' . $walletHistory->id . 'T' . now()->timestamp;

            $fullName = trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? ''));
            if ($fullName === '') {
                $fullName = 'Musteri';
            }

            // Reconstruct original user-facing amount
            $exchangeRate = max((float)($walletHistory->exchange_rate ?? 1), 0.000001);
            $originalUserAmount = round((float)$walletHistory->amount * $exchangeRate, 2);
            if ($originalUserAmount <= 0) {
                $originalUserAmount = (float)$walletHistory->amount;
            }
            $paymentAmountKurus = (int)round($originalUserAmount * 100);

            $currency = PayTRService::convertCurrency((string)($walletHistory->currency_code ?? 'TRY'));

            $userBasket = PayTRService::encodeBasket([
                [
                    'name' => 'Cüzdan Yükleme #' . $walletHistory->id,
                    'price' => $paymentAmountKurus,
                    'quantity' => 1,
                ],
            ]);

            $merchantOkUrl = $frontendUrl . '/tr/hesabim?tab=wallet&wallet_success=1';
            $merchantFailUrl = $frontendUrl . '/tr/hesabim?tab=wallet&payment=failed';

            $result = $this->payTRService->createPaymentToken([
                'merchant_oid' => $merchantOid,
                'email' => (string)($customer->email ?? 'customer@example.com'),
                'payment_amount' => $paymentAmountKurus,
                'user_ip' => (string)$request->ip(),
                'user_basket' => $userBasket,
                'currency' => $currency,
                'merchant_ok_url' => $merchantOkUrl,
                'merchant_fail_url' => $merchantFailUrl,
                'user_name' => $fullName,
                'user_address' => 'Adres belirtilmedi',
                'user_phone' => $this->sanitizePhone($customer->phone ?? '05000000000'),
                'no_installment' => '0',
                'max_installment' => '0',
            ]);

            $walletHistory->payment_gateway = 'paytr';
            $walletHistory->transaction_ref = $merchantOid;
            $walletHistory->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $result['token'],
                    'iframe_url' => $result['iframe_url'],
                    'wallet_history_id' => $walletHistory->id,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('PayTR wallet session exception', [
                'wallet_history_id' => $walletHistory->id ?? null,
                'customer_id' => $customer->id ?? null,
                'message' => $e->getMessage(),
            ]);

            return response()->json(['success' => false, 'message' => __('messages.paytr_session_create_failed')], 500);
        }
    }

    /**
     * PayTR server-to-server callback.
     * PayTR bu endpoint'e POST atar. "OK" yanıtı bekler.
     */
    public function callback(Request $request): \Illuminate\Http\Response
    {
        $callbackData = $request->only(['merchant_oid', 'status', 'total_amount', 'hash']);

        try {
            $result = $this->payTRService->verifyCallback($callbackData);
        } catch (\Throwable $e) {
            Log::error('PayTR callback verification exception', [
                'message' => $e->getMessage(),
                'merchant_oid' => $callbackData['merchant_oid'] ?? null,
            ]);
            return response('OK', 200);
        }

        if (!$result['verified']) {
            Log::warning('PayTR callback hash mismatch', [
                'merchant_oid' => $result['merchant_oid'],
            ]);
            return response('OK', 200);
        }

        $merchantOid = $result['merchant_oid'];
        $status = $result['status'];

        // merchant_oid pattern: SP{id}T{timestamp} or WL{id}T{timestamp}
        if (str_starts_with($merchantOid, 'SP')) {
            $this->handleOrderCallback($merchantOid, $status, $result['total_amount']);
        } elseif (str_starts_with($merchantOid, 'WL')) {
            $this->handleWalletCallback($merchantOid, $status, $result['total_amount']);
        } else {
            Log::warning('PayTR callback unknown merchant_oid pattern', [
                'merchant_oid' => $merchantOid,
            ]);
        }

        // PayTR her zaman "OK" yanıtı bekler
        return response('OK', 200);
    }

    /**
     * Wallet-specific callback (ayrı endpoint olarak da kullanılabilir).
     */
    public function walletCallback(Request $request): \Illuminate\Http\Response
    {
        $callbackData = $request->only(['merchant_oid', 'status', 'total_amount', 'hash']);

        try {
            $result = $this->payTRService->verifyCallback($callbackData);
        } catch (\Throwable $e) {
            Log::error('PayTR wallet callback verification exception', [
                'message' => $e->getMessage(),
            ]);
            return response('OK', 200);
        }

        if (!$result['verified']) {
            Log::warning('PayTR wallet callback hash mismatch', [
                'merchant_oid' => $result['merchant_oid'],
            ]);
            return response('OK', 200);
        }

        $this->handleWalletCallback($result['merchant_oid'], $result['status'], $result['total_amount']);

        return response('OK', 200);
    }

    private function handleOrderCallback(string $merchantOid, string $status, string $totalAmount): void
    {
        // merchant_oid: SP{id}T{timestamp}
        preg_match('/^SP(\d+)T/', $merchantOid, $matches);
        $orderMasterId = (int)($matches[1] ?? 0);

        $orderMaster = OrderMaster::with('orders')->find($orderMasterId);
        if (!$orderMaster) {
            Log::warning('PayTR callback: OrderMaster not found', [
                'merchant_oid' => $merchantOid,
                'order_master_id' => $orderMasterId,
            ]);
            return;
        }

        if ($status === 'success') {
            $orderMaster->payment_gateway = 'paytr';
            $orderMaster->payment_status = 'paid';
            $orderMaster->transaction_ref = $merchantOid;
            $orderMaster->paid_amount = (float)$totalAmount / 100; // kuruştan TL'ye çevir
            $orderMaster->save();

            $orderMaster->orders()->update(['payment_status' => 'paid']);

            Log::info('PayTR payment verified', [
                'order_master_id' => $orderMaster->id,
                'merchant_oid' => $merchantOid,
                'total_amount' => $totalAmount,
            ]);
        } else {
            $orderMaster->payment_status = 'failed';
            $orderMaster->save();

            Log::warning('PayTR payment failed', [
                'order_master_id' => $orderMaster->id,
                'merchant_oid' => $merchantOid,
                'status' => $status,
            ]);
        }
    }

    private function handleWalletCallback(string $merchantOid, string $status, string $totalAmount): void
    {
        // merchant_oid: WL{id}T{timestamp}
        preg_match('/^WL(\d+)T/', $merchantOid, $matches);
        $walletHistoryId = (int)($matches[1] ?? 0);

        $walletHistory = \Modules\Wallet\app\Models\WalletTransaction::with('wallet')
            ->find($walletHistoryId);

        if (!$walletHistory) {
            Log::warning('PayTR wallet callback: WalletTransaction not found', [
                'merchant_oid' => $merchantOid,
                'wallet_history_id' => $walletHistoryId,
            ]);
            return;
        }

        if ($status === 'success') {
            $walletHistory->payment_status = 'paid';
            $walletHistory->status = 1;
            $walletHistory->transaction_ref = $merchantOid;
            $walletHistory->save();

            $wallet = $walletHistory->wallet;
            if ($wallet) {
                $wallet->balance = (float)$wallet->balance + (float)$walletHistory->amount;
                $wallet->earnings = (float)$wallet->earnings + (float)$walletHistory->amount;
                $wallet->save();
            }

            Log::info('PayTR wallet payment verified', [
                'wallet_history_id' => $walletHistory->id,
                'merchant_oid' => $merchantOid,
            ]);
        } else {
            $walletHistory->payment_status = 'failed';
            $walletHistory->save();

            Log::warning('PayTR wallet payment failed', [
                'wallet_history_id' => $walletHistory->id,
                'merchant_oid' => $merchantOid,
                'status' => $status,
            ]);
        }
    }

    private function buildBasketItems(OrderMaster $orderMaster): array
    {
        $basketItems = [];

        foreach ($orderMaster->orders as $order) {
            $details = $order->orderDetail;

            if (!empty($details) && $details->count() > 0) {
                foreach ($details as $detail) {
                    $linePrice = (float)($detail->line_total_price ?? 0);
                    if ($linePrice <= 0) {
                        $linePrice = (float)(($detail->price ?? 0) * ($detail->quantity ?? 1));
                    }
                    $linePrice = round(max(0, $linePrice), 2);
                    if ($linePrice <= 0) {
                        continue;
                    }

                    // PayTR kuruş bekler
                    $basketItems[] = [
                        'name' => (string)($detail->product?->name ?? ('Ürün #' . ($detail->product_id ?? $detail->id))),
                        'price' => (int)round($linePrice * 100),
                        'quantity' => (int)($detail->quantity ?? 1),
                    ];
                }
            }

            if (empty($basketItems)) {
                $orderAmount = round((float)($order->order_amount ?? 0), 2);
                if ($orderAmount > 0) {
                    $basketItems[] = [
                        'name' => 'Sipariş #' . $order->id,
                        'price' => (int)round($orderAmount * 100),
                        'quantity' => 1,
                    ];
                }
            }
        }

        // Eğer hiç item yoksa fallback
        if (empty($basketItems)) {
            $basketItems[] = [
                'name' => 'Sipariş #' . $orderMaster->id,
                'price' => (int)round((float)$orderMaster->order_amount * 100),
                'quantity' => 1,
            ];
        }

        return $basketItems;
    }

    /**
     * PayTR telefon formatı: sadece rakam, 10-11 hane, başında 0 ile.
     * +90xxx, 0090xxx, 90xxx gibi formatları 0xxx'e çevirir.
     */
    private function sanitizePhone(?string $phone): string
    {
        if (!$phone) {
            return '05000000000';
        }

        // Sadece rakamları al
        $digits = preg_replace('/\D/', '', $phone);

        // Email veya geçersiz veri geldiyse fallback
        if (strlen($digits) < 7) {
            return '05000000000';
        }

        // +90 veya 0090 prefix'ini kaldır
        if (str_starts_with($digits, '0090')) {
            $digits = '0' . substr($digits, 4);
        } elseif (str_starts_with($digits, '90') && strlen($digits) >= 12) {
            $digits = '0' . substr($digits, 2);
        }

        // Başında 0 yoksa ekle
        if (!str_starts_with($digits, '0') && strlen($digits) === 10) {
            $digits = '0' . $digits;
        }

        return $digits;
    }
}
