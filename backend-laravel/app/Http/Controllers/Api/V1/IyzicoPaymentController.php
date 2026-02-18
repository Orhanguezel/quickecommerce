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
        $orderMaster = OrderMaster::with(['orders', 'shippingAddress'])->find((int)$request->order_master_id);

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
                'basket_items' => [[
                    'id' => 'ORDER-' . $orderMaster->id,
                    'name' => 'Order #' . $orderMaster->id,
                    'category_1' => 'Ecommerce',
                    'category_2' => 'Order',
                    'item_type' => 'PHYSICAL',
                    'price' => $amount,
                ]],
            ]);

            if ($session->getStatus() !== 'success' || !$session->getPaymentPageUrl()) {
                Log::error('Iyzico checkout init failed', [
                    'order_master_id' => $orderMaster->id,
                    'customer_id' => $customer->id,
                    'status' => $session->getStatus(),
                    'error_code' => $session->getErrorCode(),
                    'error_message' => $session->getErrorMessage(),
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
}
