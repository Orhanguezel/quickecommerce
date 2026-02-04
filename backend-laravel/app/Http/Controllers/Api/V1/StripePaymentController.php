<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\OrderMaster;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\PaymentGateways\app\Models\PaymentGateway;
use Modules\Wallet\app\Models\Wallet;
use Modules\Wallet\app\Models\WalletTransaction;

class StripePaymentController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Create a Stripe Checkout Session for an order_master
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $order_master = $request->order_master_id;

        // ensure authenticated customer owns the order_master (security)
        $customer = auth()->guard('api_customer')->user();
        $orderMaster = OrderMaster::with('orders')->find($order_master);

        if (!$orderMaster) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }
        if ($orderMaster->customer_id !== $customer->id) {
            return response()->json(['success' => false, 'message' => 'Not allowed.'], 403);
        }

        if ($orderMaster->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Order already paid.'], 400);
        }

        // Build line_items for Stripe from orderMaster (convert amounts to cents for USD style currencies)
        $currency = strtolower($orderMaster->currency_code ?? 'usd');
        $lineItems = [];

        // best practice: send single line item for total (simpler) OR send per-order items
        $amountInMinorUnit = (int)round($orderMaster->order_amount * 100); // example: 10.50 -> 1050 cents

        $lineItems[] = [
            'price_data' => [
                'currency' => $currency,
                'product_data' => [
                    'name' => "Order #{$orderMaster->id} - {$orderMaster->orders->count()} item(s)",
                ],
                'unit_amount' => $amountInMinorUnit,
            ],
            'quantity' => 1,
        ];

        // Fetch payment gateway credentials
        $stripe = PaymentGateway::where('slug', 'stripe')->first();
        // Fallback in case the row doesn't exist
        if (!$stripe) {
            throw new \Exception('Stripe gateway configuration not found.');
        }
        // Decode stored JSON credentials
        $stripeCredentials = json_decode($stripe->auth_credentials ?? '{}', true);
        // Use configured frontend redirect URLs (not API keys!)
        $success_url = $stripeCredentials['stripe_success_url'] ?? '';
        $cancel_url = $stripeCredentials['stripe_cancel_url'] ?? '';

        // Prepare success / cancel URLs with order id placeholder replaced
        $successUrl = str_replace('{ORDER_MASTER_ID}', $orderMaster->id, $success_url);
        $cancelUrl = str_replace('{ORDER_MASTER_ID}', $orderMaster->id, $cancel_url);

        // extra metadata: helps match webhook to your order
        $metadata = [
            'order_master_id' => (string)$orderMaster->id,
            'customer_id' => (string)$customer->id,
        ];

        try {
            $session = $this->stripeService->createCheckoutSession($lineItems, $successUrl, $cancelUrl, $metadata);

            // Save session id for webhook verification
            // You can store $session->id in your order master for webhook matching
            $orderMaster->payment_gateway = 'stripe';
            $orderMaster->payment_status = 'pending';
            $orderMaster->save();

            return response()->json([
                'success' => true,
                'message' => 'Stripe checkout session created successfully.',
                'data' => [
                    'checkout_url' => $session->url,
                    'session_id' => $session->id,
                    'order_master_id' => $orderMaster->id,
                    'stripe_debug' => [
                        'currency' => $session->currency,
                        'amount_total' => $session->amount_total,
                        'payment_status' => $session->payment_status,
                        'created' => date('Y-m-d H:i:s', $session->created),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Stripe session.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function createCheckoutSessionForWallet(Request $request): JsonResponse
    {

        $rules  = [
            'wallet_id' => 'required|integer',
            'wallet_history_id' => 'required|integer',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 400);
        }

        $wallet_id = $request->wallet_id;
        $wallet_history_id = $request->wallet_history_id;

        $customer = auth()->guard('api_customer')->user();
        $wallet = Wallet::find($wallet_id);
        $wallet_history = WalletTransaction::find($wallet_history_id);

        if (!$wallet_history || !$wallet) {
            return response()->json(['success' => false, 'message' => 'Wallet Transaction not found.'], 404);
        }
        if ($wallet->owner_id !== $customer->id) {
            return response()->json(['success' => false, 'message' => 'Not allowed.'], 403);
        }

        if ($wallet_history->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Wallet Transaction already paid.'], 400);
        }

        // Build line_items for Stripe from orderMaster (convert amounts to cents for USD style currencies)
        $currency = strtolower($wallet_history->currency_code ?? 'usd');
        $lineItems = [];

        // best practice: send single line item for total (simpler) OR send per-order items
        $amountInMinorUnit = (int)round($wallet_history->amount * 100); // example: 10.50 -> 1050 cents

        $lineItems[] = [
            'price_data' => [
                'currency' => $currency,
                'product_data' => [
                    'name' => "Wallet Recharge #{$wallet_history->id}",
                ],
                'unit_amount' => $amountInMinorUnit,
            ],
            'quantity' => 1,
        ];

        // Fetch payment gateway credentials
        $stripe = PaymentGateway::where('slug', 'stripe')->first();
        // Fallback in case the row doesn't exist
        if (!$stripe) {
            throw new \Exception('Stripe gateway configuration not found.');
        }
        // Decode stored JSON credentials
        $stripeCredentials = json_decode($stripe->auth_credentials ?? '{}', true);

        if (empty($stripeCredentials['stripe_success_url']) || empty($stripeCredentials['stripe_cancel_url'])) {
            throw new \Exception('Stripe success/cancel URLs are not configured.');
        }

        // Use configured frontend redirect URLs (not API keys!)
        $success_url = $stripeCredentials['stripe_success_url'] ?? '';
        $cancel_url = $stripeCredentials['stripe_cancel_url'] ?? '';

        // Prepare success / cancel URLs with order id placeholder replaced
        $successUrl = str_replace('{WALLET_HISTORY_ID}', $wallet_history->id, $success_url);
        $cancelUrl = str_replace('{WALLET_HISTORY_ID}', $wallet_history->id, $cancel_url);

        // extra metadata: helps match webhook to your order
        $metadata = [
            'wallet_id' => (string)$wallet->id,
            'wallet_history_id' => (string)$wallet_history->id,
            'customer_id' => (string)$customer->id,
        ];

        try {
            $session = $this->stripeService->createCheckoutSession($lineItems, $successUrl, $cancelUrl, $metadata);

            // Save session id for webhook verification
            // You can store $session->id in your order master for webhook matching
            $wallet_history->payment_gateway = 'stripe';
            $wallet_history->payment_status = 'pending';
            $wallet_history->save();

            return response()->json([
                'success' => true,
                'message' => 'Stripe checkout session created successfully.',
                'data' => [
                    'checkout_url' => $session->url,
                    'session_id' => $session->id,
                    'wallet_id' => $wallet->id,
                    'wallet_history_id' => $wallet_history->id,
                    'stripe_debug' => [
                        'currency' => $session->currency,
                        'amount_total' => $session->amount_total,
                        'payment_status' => $session->payment_status,
                        'created' => date('Y-m-d H:i:s', $session->created),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Stripe session.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
