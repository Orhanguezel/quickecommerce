<?php

namespace Modules\Subscription\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Store;
use App\Models\SystemCommission;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Modules\Subscription\app\Http\Requests\RenewSubscriptionRequest;
use Modules\Subscription\app\Models\StoreSubscription;
use Modules\Subscription\app\Models\Subscription;
use Modules\Subscription\app\Models\SubscriptionHistory;
use Modules\Subscription\app\Services\SubscriptionService;

class BuySubscriptionPackageController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function buySubscriptionPackage(Request $request)
    {
        $systemCommission = SystemCommission::first();
        $subscription_enabled = $systemCommission->subscription_enabled;
        if (!$subscription_enabled) {
            return response()->json([
                'message' => __('messages.subscription_option_is_not_available')
            ], 422);
        }
        $result = $this->subscriptionService->buySubscriptionPackage($request->all());
        if ($result['success'] == false) {
            return response()->json($result, 422);
        }
        return response()->json($result);
    }

    public function renewSubscriptionPackage(RenewSubscriptionRequest $request)
    {
        $systemCommission = SystemCommission::first();
        $subscription_enabled = $systemCommission->subscription_enabled;
        if (!$subscription_enabled) {
            return response()->json([
                'message' => __('messages.subscription_option_is_not_available')
            ], 422);
        }
        $store_id = $request->store_id;
        $subscription_id = $request->subscription_id;
        $payment_gateway = $request->payment_gateway;
        $result = $this->subscriptionService->renewSubscriptionPackage($store_id, $subscription_id, $payment_gateway);
        return response()->json($result);
    }

    public function packagePaymentStatusUpdate(Request $request)
    {
        // Check if the user is authenticated
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized'
            ], 401);
        }


        // Validate the required inputs using Validator::make
        $validated = Validator::make($request->all(), [
            'store_id' => 'required|integer|exists:stores,id',
            'subscription_id' => 'required|integer|exists:subscriptions,id',
            'subscription_history_id' => 'required|integer|exists:subscription_histories,id',
            'transaction_ref' => 'nullable|string|max:255',
        ]);

        // Check if validation fails
        if ($validated->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validated->errors(),
            ], 400);
        }

        // Find the subscription history
        $subscription = Subscription::where('id', $request->subscription_id)->first();

        // Check if the subscription history exists
        if (empty($subscription)) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }

        $subscription_history = SubscriptionHistory::where('id', $request->subscription_history_id)
            ->where('store_id', $request->store_id)
            ->where('payment_status', 'pending')
            ->where('status', 0)
            ->first();

        // Check if the subscription history exists
        if (empty($subscription_history)) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription History not found'
            ], 404);
        }


        // update com store subscription data
        $currentSubscription = StoreSubscription::where('store_id', $request->store_id)->first();

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Store subscription not found'
            ], 404);
        }

        // Calculate the new expiration date
        $newExpireDate = $subscription_history->expire_date;

        $currentSubscription->update([
            'subscription_id' => $subscription_history->subscription_id,
            'name' => $subscription_history->name,
            'type' => $subscription_history->type,
            'validity' => $currentSubscription->validity + $subscription_history->validity,
            'price' => $subscription_history->price,
            'pos_system' => $subscription_history->pos_system,
            'self_delivery' => $subscription_history->self_delivery,
            'mobile_app' => $subscription_history->mobile_app,
            'live_chat' => $subscription_history->live_chat,
            'order_limit' => $currentSubscription->order_limit + $subscription_history->order_limit,
            'product_limit' => $currentSubscription->product_limit + $subscription_history->product_limit,
            'product_featured_limit' => $currentSubscription->product_featured_limit + $subscription_history->product_featured_limit,
            'payment_gateway' => $subscription_history->payment_gateway,
            'payment_status' => 'paid',
            'transaction_ref' => $request->transaction_ref,
            'manual_image' => null,
            'expire_date' => $newExpireDate,
            'status' => 1,
        ]);

        // update subscription history status if already using history
        $subscription_history->update([
            'payment_status' => 'paid',
            'transaction_ref' => $request->transaction_ref ?? null,
            'status' => 1
        ]);


        // update store type
        $store = Store::where('id', $request->store_id)
            ->where('store_seller_id', auth()->guard('api')->id())
            ->first();

        if (!$store) {
            return response()->json([
                'message' => 'Store not found or you do not have access to this store.',
            ], 404);
        }

        // Update the subscription type
        $store->update([
            'subscription_type' => 'subscription',
        ]);

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully',
        ]);
    }

}
