<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\AdminStoreRequest;
use App\Http\Requests\SellerStoreRequest;
use App\Http\Resources\Admin\AdminStoreRequestResource;
use App\Http\Resources\Admin\SellerWiseStoreForDropdownResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Com\Store\StoreListResource;
use App\Interfaces\StoreManageInterface;
use App\Models\Store;
use App\Services\TrashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Wallet\app\Models\Wallet;

class AdminStoreManageController extends Controller
{
    private $trashService;

    public function __construct(protected StoreManageInterface $storeRepo, TrashService $trashService)
    {
        $this->trashService = $trashService;
    }

    public function listStores(Request $request)
    {
        $stores = $this->storeRepo->getAllStores(
            $request->per_page ?? 10,
            $request->status ?? "",
            $request->page ?? 1,
            $request->language ?? DEFAULT_LANGUAGE,
            $request->search ?? "",
            $request->sortField ?? 'id',
            $request->sort ?? 'asc',
            []
        );
        // Return the stores as a resource collection
        return response()->json([
            'data' => StoreListResource::collection($stores),
            'meta' => new PaginationResource($stores),
        ]);
    }

    public function createStore(AdminStoreRequest $request): JsonResponse
    {
        $request['status'] = 1;
        $store = $this->storeRepo->store($request->all());
        createOrUpdateTranslation($request, $store, 'App\Models\Store', $this->storeRepo->translationKeys());
        if ($store) {
            return $this->success(translate('messages.save_success', ['name' => 'Store']));
        } else {
            return $this->failed(translate('messages.save_failed', ['name' => 'Store']));
        }
    }

    public function updateStore(SellerStoreRequest $request)
    {
        $store = $this->storeRepo->update($request->all());
        createOrUpdateTranslation($request, $store, 'App\Models\Store', $this->storeRepo->translationKeys());
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

    public function listSellerStores(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seller_id' => 'nullable|exists:users,id',
            'search' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $stores = $this->storeRepo->getSellerWiseStores($request->seller_id, $request->search);
        if ($stores) {
            return response()->json(SellerWiseStoreForDropdownResource::collection($stores));
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 404,
            ]);
        }
    }

    public function deletedStoreRecords()
    {
        $records = $this->storeRepo->records(true);
        return response()->json([
            "data" => $records,
            "massage" => "Records were restored successfully!"
        ], 201);
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

    public function listStoreRequests()
    {
        $stores = Store::with(['related_translations', 'seller'])->pendingStores()->paginate(10);
        return response()->json([
            'data' => AdminStoreRequestResource::collection($stores),
            'meta' => new PaginationResource($stores),
        ]);
    }

    public function approveStoreRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:stores,id',
            'status' => 'required|in:1,3'
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }
        if ($request->status == 1) {
            try {
                $success = $this->storeRepo->approveStores($request->ids);
                if ($success) {
                    return $this->success(__('messages.approve.success', ['name' => 'Stores']));
                } else {
                    return $this->failed(__('messages.approve.failed', ['name' => 'Stores']), 500);
                }
            } catch (\Exception $e) {
                throw $e;
            }
        } elseif ($request->status == 3) {
            try {
                $success = $this->storeRepo->rejectStores($request->ids);
                if ($success) {
                    return $this->success(__('messages.reject.success', ['name' => 'Stores']));
                } else {
                    return $this->failed(__('messages.reject.failed', ['name' => 'Stores']), 500);
                }
            } catch (\Exception $e) {
                throw $e;
            }
        } else {
            return $this->failed(__('messages.something_went_wrong'));
        }

    }

    public function changeStoreStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:stores,id',
            'status' => 'required|in:0,1,2',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors());
        }
        $success = $this->storeRepo->changeStatus($request->all());
        if ($success) {
            return $this->success(__('messages.update_success', ['name' => 'Stores status']));
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Stores status']));
        }
    }

    public function getStoreTrashList(Request $request)
    {
        $trash = $this->trashService->listTrashed('store', $request->per_page ?? 10);
        return response()->json([
            'data' => StoreListResource::collection($trash),
            'meta' => new PaginationResource($trash)
        ]);
    }

    public function restoreStoreTrashed(Request $request)
    {
        $ids = $request->ids;
        $restored = $this->trashService->restore('store', $ids);
        return response()->json([
            'message' => __('messages.restore_success', ['name' => 'Stores']),
            'restored' => $restored,
        ]);
    }

    public function deleteStoreTrashed(Request $request)
    {
        $ids = $request->ids;
        $deleted = $this->trashService->forceDelete('store', $ids);
        return response()->json([
            'message' => __('messages.force_delete_success', ['name' => 'Stores']),
            'deleted' => $deleted
        ]);
    }
}
