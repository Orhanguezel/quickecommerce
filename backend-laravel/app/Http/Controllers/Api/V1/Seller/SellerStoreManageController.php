<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\SellerStoreRequest;
use App\Http\Resources\Com\Store\OwnerWiseStoreListResource;
use App\Http\Resources\Com\Store\StoreListResource;
use App\Interfaces\StoreManageInterface;
use App\Models\SystemCommission;
use App\Services\StoreManageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerStoreManageController extends Controller
{
    protected $storeManageService;

    public function __construct(protected StoreManageInterface $storeRepo, StoreManageService $storeManageService)
    {
        $this->storeManageService = $storeManageService;
    }


    public function listStores(Request $request)
    {
        $stores = $this->storeRepo->getAuthSellerStores(
            $request->limit ?? 10,
            $request->page ?? 1,
            $request->language ?? DEFAULT_LANGUAGE ?? 'en',
            $request->search ?? "",
            $request->sortField ?? 'created_at',
            $request->sort ?? 'desc',
            []
        );

        // Return the stores as a resource collection
        return StoreListResource::collection($stores);
    }

    public function createStore(SellerStoreRequest $request): JsonResponse
    {
        $systemCommission = SystemCommission::first();
        $commission_enabled = $systemCommission->commission_enabled;
        $subscription_enabled = $systemCommission->subscription_enabled;

        if (!$commission_enabled && isset($request->subscription_type) && $request->subscription_type === 'commission') {
            return response()->json([
                'message' => __('messages.commission_option_is_not_available')
            ], 422);
        }
        if (!$subscription_enabled && isset($request->subscription_type) && $request->subscription_type === 'subscription') {
            return response()->json([
                'message' => __('messages.subscription_option_is_not_available')
            ], 422);
        }

        $store = $this->storeManageService->storeForAuthSeller($request->all());

        if ($store) {
            createOrUpdateTranslation($request, $store->id, 'App\Models\Store', $this->storeRepo->translationKeys());
            return $this->success(
                translate('messages.save_success', ['name' => 'Store']),
                200,
                [
                    'store_id' => $store->id,
                    'slug' => $store->slug,
                    'store_type' => $store->store_type,
                    'subscription_id' => $store->subscription_id ?? null,
                    'subscription_history_id' => $store->subscription_history_id ?? null,
                ]
            );
        } else {
            return $this->failed(translate('messages.save_failed', ['name' => 'Store'], 500));
        }
    }

    public function updateStore(SellerStoreRequest $request)
    {
        $store = $this->storeManageService->storeUpdateForAuthSeller($request->all());
        createOrUpdateTranslation($request, $store['store_id'], 'App\Models\Store', $this->storeRepo->translationKeys());
        if ($store) {
            return $this->success(translate('messages.update_success', ['name' => 'Store']));
        } else {
            return $this->failed(translate('messages.update_failed', ['name' => 'Store']));
        }
    }

    public function getStoreById(Request $request)
    {
        return $this->storeRepo->getStoreById($request->id);
    }

    public function deleteStore($id)
    {
        if (runningOrderExists($id)) {
            return response()->json([
                'message' => __('messages.has_running_orders', ['name' => 'Store'])
            ]);
        }
        $this->storeRepo->delete($id);
        return $this->success(translate('messages.delete_success'));
    }


    public function sellerWiseStore()
    {
        try {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.data_found'),
                'stores' => OwnerWiseStoreListResource::collection($this->storeRepo->getOwnerStores())
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function commissionSettings()
    {
        $systemCommission = SystemCommission::first();
        return response()->json([
            'commission_enabled' => $systemCommission->commission_enabled,
            'subscription_enabled' => $systemCommission->subscription_enabled,
        ]);
    }
}
