<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Product\InventoryResource;
use App\Interfaces\InventoryManageInterface;
use Illuminate\Http\Request;

class SellerInventoryManageController extends Controller
{
    public function __construct(protected InventoryManageInterface $inventoryRepo)
    {

    }
    public function listInventories(Request $request)
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
        $inventories = $this->inventoryRepo->getInventoriesForSeller($filters);
        return response()->json([
            'data' => InventoryResource::collection($inventories),
            'meta' => new PaginationResource($inventories),
        ]);
    }
}
