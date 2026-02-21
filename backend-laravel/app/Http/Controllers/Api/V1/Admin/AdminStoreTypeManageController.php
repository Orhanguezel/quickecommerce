<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\StoreTypeRequest;
use App\Http\Requests\StoreTypeCreateRequest;
use App\Http\Resources\Admin\AdminStoreTypeDetailsResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Com\Store\StoreTypeResource;
use App\Interfaces\StoreTypeManageInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminStoreTypeManageController extends Controller
{
    public function __construct(protected StoreTypeManageInterface $storeTypeRepo)
    {

    }

    public function allStoreTypes(Request $request)
    {
        $filters = [
            'per_page' => $request->per_page,
            'type' => $request->type,
            'search' => $request->search,
            'status' => $request->status,
        ];
        $store_types = $this->storeTypeRepo->getAllStoreTypes($filters);
        return response()->json([
            'data' => StoreTypeResource::collection($store_types),
            'meta' => new PaginationResource($store_types)
        ], 200);
    }

    public function createStoreType(StoreTypeCreateRequest $request)
    {
        $additional_charge_type   = $request->get('additional_charge_type');
        $additional_charge_amount = $request->get('additional_charge_amount');
        $shouldRound = shouldRound();
        if ($shouldRound && $additional_charge_type === 'fixed' && is_float($additional_charge_amount)) {
            return response()->json([
                'message' => __('messages.should_round', ['name' => 'Additional charge']),
            ]);
        }
        $success = $this->storeTypeRepo->createStoreType($request->all());
        if ($success) {
            createOrUpdateTranslation($request, $success, 'App\Models\StoreType', $this->storeTypeRepo->translationKeys());
            return response()->json([
                'message' => __('messages.save_success', ['name' => 'Store Type']),
            ], 201);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Store Type'])
            ], 500);
        }
    }

    public function updateStoreType(StoreTypeRequest $request)
    {
        $additional_charge_type = $request->get('additional_charge_type');
        $additional_charge_amount = $request->get('additional_charge_amount');
        $shouldRound = shouldRound();
        if ($shouldRound && $additional_charge_type === 'fixed' && is_float($additional_charge_amount)) {
            return response()->json([
                'message' => __('messages.should_round', ['name' => 'Additional charge']),
            ]);
        }
        $success = $this->storeTypeRepo->updateStoreType($request->all());
        createOrUpdateTranslation($request, $success, 'App\Models\StoreType', $this->storeTypeRepo->translationKeys());
        if ($success) {
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Store Type']),
            ], 201);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Store Type'])
            ], 500);
        }
    }

    public function storeTypeDetails(Request $request)
    {
        $validator = Validator::make(['id' => $request->route('id')], [
            'id' => 'required|exists:store_types,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }
        $storeType = $this->storeTypeRepo->getStoreTypeById($request->id);
        if ($storeType) {
            return response()->json(new AdminStoreTypeDetailsResource($storeType), 200);
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }
    }

    public function changeStatus(Request $request)
    {
        $success = $this->storeTypeRepo->toogleStatus($request->id);
        if ($success) {
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Store Type Settings status']),
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Store Type Settings status'])
            ], 500);
        }

    }
}
