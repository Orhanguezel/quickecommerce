<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Product\InventoryResource;
use App\Interfaces\InventoryManageInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminInventoryManageController extends Controller
{
    public function __construct(protected InventoryManageInterface $inventoryRepo)
    {

    }

    public function allInventories(Request $request)
    {
        $filters = [
            'search' => $request->search,
            'category_id' => $request->category_id,
            'brand_id' => $request->brand_id,
            'type' => $request->type,
            'stock_status' => $request->stock_status,
            'store_id' => $request->store_id,
            'per_page' => $request->per_page
        ];
        $inventories = $this->inventoryRepo->getInventories($filters);
        return response()->json([
            'data' => InventoryResource::collection($inventories),
            'meta' => new PaginationResource($inventories),
        ]);
    }

    public function updateInventory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'variant_id' => 'required',
            'stock_quantity' => 'required|integer'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'errors' => $validator->errors()
            ]);
        }
        $success = $this->inventoryRepo->updateVariant($request->all());
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.update_success', ['name' => 'Product']),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.update_failed', ['name' => 'Product']),
            ]);
        }
    }

    public function deleteInventory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_ids' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'errors' => $validator->errors()
            ]);
        }
        $success = $this->inventoryRepo->deleteProductsWithVariants($request->product_ids);
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.delete_success', ['name' => 'Products']),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.delete_failed', ['name' => 'Products']),
            ]);
        }
    }
}
