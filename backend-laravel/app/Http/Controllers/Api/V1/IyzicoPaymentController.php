<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\OrderMaster;
use App\Services\IyzicoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class IyzicoPaymentController extends Controller
{
    public function __construct(private readonly IyzicoService $iyzicoService)
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
        $orderMaster = OrderMaster::with(['orders.orderDetail.product', 'shippingAddress.area'])->find((int)$request->order_master_id);

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
            $config = $this->iyzicoService->getCredentials();
            $credentials = $config['credentials'];

            $callbackUrl = $credentials['iyzico_callback_url']
                ?? (rtrim(config('app.url'), '/') . '/api/v1/iyzico/callback');

            $callbackUrl = $callbackUrl
                . (str_contains($callbackUrl, '?') ? '&' : '?')
                . 'order_master_id=' . $orderMaster->id;

            $fullName = trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? ''));
            $shippingAddress = $orderMaster->shippingAddress;
            $addressText = (string)($shippingAddress?->address ?? 'Adres belirtilmedi');
            $city = (string)($shippingAddress?->area?->name ?? 'Istanbul');
            $country = 'Turkey';
            $zipCode = (string)($shippingAddress?->postal_code ?? '34000');
            $gsm = (string)($customer->phone ?? $shippingAddress?->contact_number ?? '+905000000000');

            $conversationId = 'order_' . $orderMaster->id . '_' . now()->timestamp;
            $amount = number_format((float)$orderMaster->order_amount, 2, '.', '');
            $currency = strtoupper((string)($orderMaster->currency_code ?? 'TRY'));
            if (!in_array($currency, ['TRY', 'EUR', 'USD', 'GBP', 'IRR', 'NOK', 'RUB', 'CHF'], true)) {
                $currency = 'TRY';
            }

            $marketplaceMode = $this->isMarketplaceEnabled($credentials);
            $basketItems = $this->buildBasketItems($orderMaster, $credentials, $marketplaceMode);

            $session = $this->iyzicoService->createCheckoutForm([
                'locale' => app()->getLocale() === 'tr' ? 'tr' : 'en',
                'conversation_id' => $conversationId,
                'price' => $amount,
                'paid_price' => $amount,
                'currency' => $currency,
                'basket_id' => (string)$orderMaster->id,
                'callback_url' => $callbackUrl,
                'buyer' => [
                    'id' => (string)$customer->id,
                    'name' => (string)($customer->first_name ?: 'Musteri'),
                    'surname' => (string)($customer->last_name ?: 'User'),
                    'gsm_number' => $gsm,
                    'email' => (string)($customer->email ?? 'customer@example.com'),
                    'identity_number' => '11111111111',
                    'last_login_date' => now()->format('Y-m-d H:i:s'),
                    'registration_date' => ($customer->created_at ?? now())->format('Y-m-d H:i:s'),
                    'registration_address' => $addressText,
                    'ip' => (string)$request->ip(),
                    'city' => $city,
                    'country' => $country,
                    'zip_code' => $zipCode,
                ],
                'shipping_address' => [
                    'contact_name' => $fullName !== '' ? $fullName : 'Musteri',
                    'city' => $city,
                    'country' => $country,
                    'address' => $addressText,
                    'zip_code' => $zipCode,
                ],
                'billing_address' => [
                    'contact_name' => $fullName !== '' ? $fullName : 'Musteri',
                    'city' => $city,
                    'country' => $country,
                    'address' => $addressText,
                    'zip_code' => $zipCode,
                ],
                'basket_items' => $basketItems,
            ]);

            if ($session->getStatus() !== 'success' || !$session->getPaymentPageUrl()) {
                Log::error('Iyzico checkout init failed', [
                    'order_master_id' => $orderMaster->id,
                    'customer_id' => $customer->id,
                    'status' => $session->getStatus(),
                    'error_code' => $session->getErrorCode(),
                    'error_message' => $session->getErrorMessage(),
                    'store_ids' => $orderMaster->orders->pluck('store_id')->values()->all(),
                    'marketplace_mode' => $marketplaceMode,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => __('messages.iyzico_session_create_failed'),
                    'error' => $session->getErrorMessage(),
                ], 422);
            }

            $orderMaster->payment_gateway = 'iyzico';
            $orderMaster->payment_status = 'pending';
            $orderMaster->transaction_ref = $session->getToken();
            $orderMaster->save();

            return response()->json([
                'success' => true,
                'message' => __('messages.iyzico_session_created'),
                'data' => [
                    'checkout_url' => $session->getPaymentPageUrl(),
                    'token' => $session->getToken(),
                    'order_master_id' => $orderMaster->id,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Iyzico checkout session exception', [
                'order_master_id' => $orderMaster->id ?? null,
                'customer_id' => $customer->id ?? null,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => __('messages.iyzico_session_create_failed'),
            ], 500);
        }
    }

    public function callback(Request $request)
    {
        $orderMasterId = (int)$request->get('order_master_id');
        $token = (string)$request->get('token', '');
        $conversationId = (string)$request->get('conversationId', 'order_' . $orderMasterId);

        $successTemplate = rtrim(config('app.frontend_url'), '/') . '/siparis-basarili?order={ORDER_MASTER_ID}';
        $cancelTemplate = rtrim(config('app.frontend_url'), '/') . '/odeme?payment=failed&order={ORDER_MASTER_ID}';
        try {
            $credentials = $this->iyzicoService->getCredentials()['credentials'];
            $successTemplate = (string)($credentials['iyzico_success_url'] ?? $successTemplate);
            $cancelTemplate = (string)($credentials['iyzico_cancel_url'] ?? $cancelTemplate);
        } catch (\Throwable $e) {
            Log::warning('Iyzico callback template fallback used', ['message' => $e->getMessage()]);
        }
        $successUrl = str_replace('{ORDER_MASTER_ID}', (string)$orderMasterId, $successTemplate);
        $cancelUrl = str_replace('{ORDER_MASTER_ID}', (string)$orderMasterId, $cancelTemplate);

        if ($token === '' || $orderMasterId <= 0) {
            Log::warning('Iyzico callback missing token/order id', [
                'order_master_id' => $orderMasterId,
                'has_token' => $token !== '',
            ]);

            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => __('messages.iyzico_payment_not_completed')], 422)
                : redirect()->to($cancelUrl);
        }

        $orderMaster = OrderMaster::with('orders')->find($orderMasterId);
        if (!$orderMaster) {
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => __('messages.data_not_found')], 404)
                : redirect()->to($cancelUrl);
        }

        try {
            $result = $this->iyzicoService->retrieveCheckoutForm($token, $conversationId);

            if ($result->getStatus() === 'success' && strtoupper((string)$result->getPaymentStatus()) === 'SUCCESS') {
                $orderMaster->payment_gateway = 'iyzico';
                $orderMaster->payment_status = 'paid';
                $orderMaster->transaction_ref = (string)($result->getPaymentId() ?: $token);
                $orderMaster->paid_amount = (float)($result->getPaidPrice() ?: $orderMaster->order_amount);
                $orderMaster->save();

                $orderMaster->orders()->update(['payment_status' => 'paid']);

                Log::info('Iyzico payment verified', [
                    'order_master_id' => $orderMaster->id,
                    'payment_id' => $result->getPaymentId(),
                    'token' => $token,
                ]);

                return $request->expectsJson()
                    ? response()->json(['success' => true, 'message' => __('messages.iyzico_payment_verified')])
                    : redirect()->to($successUrl);
            }

            $orderMaster->payment_status = 'failed';
            $orderMaster->save();

            Log::warning('Iyzico payment not completed', [
                'order_master_id' => $orderMaster->id,
                'status' => $result->getStatus(),
                'payment_status' => $result->getPaymentStatus(),
                'error_code' => $result->getErrorCode(),
                'error_message' => $result->getErrorMessage(),
            ]);

            return $request->expectsJson()
                ? response()->json([
                    'success' => false,
                    'message' => __('messages.iyzico_payment_not_completed'),
                ], 422)
                : redirect()->to($cancelUrl);
        } catch (\Throwable $e) {
            Log::error('Iyzico callback exception', [
                'order_master_id' => $orderMasterId,
                'message' => $e->getMessage(),
            ]);

            return $request->expectsJson()
                ? response()->json([
                    'success' => false,
                    'message' => __('messages.iyzico_payment_not_completed'),
                ], 500)
                : redirect()->to($cancelUrl);
        }
    }

    private function buildBasketItems(OrderMaster $orderMaster, array $credentials, bool $marketplaceMode): array
    {
        $basketItems = [];

        foreach ($orderMaster->orders as $order) {
            $storeId = (int)($order->store_id ?? 0);
            $subMerchantKey = $marketplaceMode
                ? $this->resolveStoreSubMerchantKey($storeId, $credentials)
                : null;
            $details = $order->orderDetail;
            $detailsTotal = 0.0;

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

                    $detailsTotal += $linePrice;
                    $basketItems[] = [
                        'id' => 'ORD' . $order->id . '-DET' . $detail->id,
                        'name' => (string)($detail->product?->name ?? ('Product #' . ($detail->product_id ?? $detail->id))),
                        'category_1' => 'Ecommerce',
                        'category_2' => 'OrderItem',
                        'item_type' => 'PHYSICAL',
                        'price' => number_format($linePrice, 2, '.', ''),
                    ];
                    if ($marketplaceMode) {
                        $basketItems[array_key_last($basketItems)]['sub_merchant_key'] = $subMerchantKey;
                        $basketItems[array_key_last($basketItems)]['sub_merchant_price'] = number_format($linePrice, 2, '.', '');
                    }
                }
            }

            $orderAmount = round((float)($order->order_amount ?? 0), 2);
            if ($orderAmount <= 0) {
                continue;
            }

            if ($detailsTotal <= 0) {
                $basketItems[] = [
                    'id' => 'ORD' . $order->id,
                    'name' => 'Order #' . $order->id,
                    'category_1' => 'Ecommerce',
                    'category_2' => 'Order',
                    'item_type' => 'PHYSICAL',
                    'price' => number_format($orderAmount, 2, '.', ''),
                ];
                if ($marketplaceMode) {
                    $basketItems[array_key_last($basketItems)]['sub_merchant_key'] = $subMerchantKey;
                    $basketItems[array_key_last($basketItems)]['sub_merchant_price'] = number_format($orderAmount, 2, '.', '');
                }
                continue;
            }

            $remainder = round($orderAmount - $detailsTotal, 2);
            if ($remainder > 0) {
                $basketItems[] = [
                    'id' => 'ORD' . $order->id . '-ADJ',
                    'name' => 'Order #' . $order->id . ' Service',
                    'category_1' => 'Ecommerce',
                    'category_2' => 'Service',
                    'item_type' => 'VIRTUAL',
                    'price' => number_format($remainder, 2, '.', ''),
                ];
                if ($marketplaceMode) {
                    $basketItems[array_key_last($basketItems)]['sub_merchant_key'] = $subMerchantKey;
                    $basketItems[array_key_last($basketItems)]['sub_merchant_price'] = number_format($remainder, 2, '.', '');
                }
            }
        }

        return $basketItems;
    }

    private function isMarketplaceEnabled(array $credentials): bool
    {
        $raw = $credentials['marketplace_mode']
            ?? $credentials['iyzico_marketplace_mode']
            ?? null;

        if ($raw !== null && $raw !== '') {
            if (is_bool($raw)) {
                return $raw;
            }
            $normalized = strtolower(trim((string)$raw));
            return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
        }

        // Auto mode: if any sub-merchant key config exists, treat as marketplace.
        if (!empty($credentials['sub_merchant_key']) || !empty($credentials['default_sub_merchant_key'])) {
            return true;
        }
        if (!empty($credentials['store_sub_merchant_keys']) || !empty($credentials['sub_merchant_keys'])) {
            return true;
        }
        return false;
    }

    private function resolveStoreSubMerchantKey(int $storeId, array $credentials): string
    {
        $storeMap = $credentials['store_sub_merchant_keys'] ?? $credentials['sub_merchant_keys'] ?? [];
        if (is_string($storeMap)) {
            $decoded = json_decode($storeMap, true);
            $storeMap = is_array($decoded) ? $decoded : [];
        }

        if (is_array($storeMap)) {
            $byInt = trim((string)($storeMap[$storeId] ?? ''));
            $byString = trim((string)($storeMap[(string)$storeId] ?? ''));
            if ($byInt !== '') {
                return $byInt;
            }
            if ($byString !== '') {
                return $byString;
            }
        }

        $byDirectStoreKey = trim((string)($credentials['store_' . $storeId . '_sub_merchant_key'] ?? ''));
        if ($byDirectStoreKey !== '') {
            return $byDirectStoreKey;
        }

        $globalFallback = trim((string)(
            $credentials['sub_merchant_key']
            ?? $credentials['default_sub_merchant_key']
            ?? $credentials['marketplace_sub_merchant_key']
            ?? ''
        ));

        if ($globalFallback !== '') {
            return $globalFallback;
        }

        throw new \RuntimeException(__('messages.iyzico_sub_merchant_key_missing') . ' store_id=' . $storeId);
    }
}
