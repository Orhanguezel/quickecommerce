<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Store\SellerStoreCommissionResource;
use App\Models\Store;
use App\Models\SystemCommission;
use Illuminate\Http\Request;

class SellerBusinessSettingsController extends Controller
{
    public function businessPlanInfo(Request $request){

        $seller_id = auth()->guard('api')->id();

        $store = Store::where('id', $request->store_id)
            ->where('store_seller_id', $seller_id)
            ->first();

        if (!$store) {
            return response()->json([
                'message' => 'Store not found or you do not have access to this store.',
            ], 404);
        }

        // Subscription package logic
        if (moduleExists('Subscription')) {
            if ($store->subscription_type === 'subscription'){
                // Instantiate the service and get the subscription
                $subscriptionService = new \Modules\Subscription\app\Services\StoreSubscriptionManageService();
                $store_subscription = $subscriptionService->storeSubscriptionInfo($store->id);

                return response()->json([
                    'store' => new SellerStoreCommissionResource($store),
                    'store_subscription' => $store_subscription
                ]);
            }
        }

        // If no subscription type is found, return store commission info
        return response()->json([
            'store' => new SellerStoreCommissionResource($store)
        ]);

    }

    public function businessPlanChange(Request $request){
        $seller_id = auth()->guard('api')->id();

        $store = Store::where('id', $request->store_id)
            ->where('store_seller_id', $seller_id)
            ->first();

        if (!$store) {
            return response()->json([
                'message' => 'Store not found or you do not have access to this store.',
            ], 404);
        }
        $systemCommission = SystemCommission::first();
        $commission_enabled = $systemCommission->commission_enabled;
        $subscription_enabled = $systemCommission->subscription_enabled;

        // set type
        $subscription_type = 'commission';

        // Subscription package logic
        if (moduleExists('Subscription')) {
            if ($store->subscription_type === 'commission'){
                $subscription_type = 'subscription';
            }
        }
        if (!$commission_enabled && $subscription_type == 'commission'){
            return response()->json([
                'message' => __('messages.commission_option_is_not_available')
            ],422);
        }
        if (!$subscription_enabled && $subscription_type == 'subscription'){
            return response()->json([
                'message' => __('messages.subscription_option_is_not_available')
            ],422);
        }
        // change business plan
        $store->update([
            'subscription_type' => $subscription_type,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Business plan changed successfully.'
        ]);
    }
}
