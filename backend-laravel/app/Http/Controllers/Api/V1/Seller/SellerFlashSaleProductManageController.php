<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\FlashDealProductRequest;
use App\Http\Resources\Admin\AdminFlashSaleResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\FlashSaleProduct\FlashSaleProductResource;
use App\Services\FlashSaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerFlashSaleProductManageController extends Controller
{
    protected $flashSaleService;

    public function __construct(FlashSaleService $flashSaleService)
    {
        $this->flashSaleService = $flashSaleService;
    }

    public function addProductToFlashSale(FlashDealProductRequest $request)
    {
        // check the products exists in store or not
        $productsNotInStore = $this->flashSaleService->checkProductsExistInStore($request->store_id, $request->products);
        if ($productsNotInStore) {
            return response()->json($productsNotInStore, 422);
        }
        // check if the products are already in flash sale
        $existingProducts = $this->flashSaleService->getExistingFlashSaleProducts($request->products);

        if ($existingProducts) {
            return response()->json($existingProducts, $existingProducts['status_code']);
        }
        $data = $this->flashSaleService->associateProductsToFlashSale($request->flash_sale_id, $request->products, $request->store_id);
        if ($data) {
            return response()->json([
                'message' => __('messages.request_success', ['name' => 'Products'])
            ]);
        } else {
            return response()->json([
                'message' => __('messages.request_failed', ['name' => 'Products'])
            ], 400);
        }
    }

    public function updateProductToFlashSale(FlashDealProductRequest $request)
    {
        // check the products exists in store or not
        $productsNotInStore = $this->flashSaleService->checkProductsExistInStore($request->store_id, $request->products);
        if ($productsNotInStore) {
            return response()->json($productsNotInStore);
        }
        $data = $this->flashSaleService->updateFlashSaleProducts($request->flash_sale_id, $request->products, $request->store_id);
        // check already approved products
        $approvedProducts = $this->flashSaleService->checkProductsAreApproved($request->flash_sale_id, $request->products);
        if ($approvedProducts) {
            return response()->json($approvedProducts);
        }
        if ($data) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.update_success', ['name' => 'Products'])
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.update_failed', ['name' => 'Products'])
            ]);
        }
    }

    public function flashSaleProducts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $filters = [
            'search' => $request->search,
            'per_page' => $request->per_page
        ];
        $flashSaleProducts = $this->flashSaleService->getSellerFlashSaleProducts($request->store_id, $filters);
        if (!empty($flashSaleProducts)) {
            return response()->json([
                'data' => FlashSaleProductResource::collection($flashSaleProducts),
                'meta' => new PaginationResource($flashSaleProducts)
            ]);
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }

    }

    public function validFlashSales(Request $request)
    {
        $filters = [
            'search' => $request->search,
            'per_page' => $request->per_page
        ];
        $flashSales = $this->flashSaleService->getValidFlashSales($filters);
        return response()->json([
            'data' => AdminFlashSaleResource::collection($flashSales),
            'meta' => new PaginationResource($flashSales)
        ]);
    }

}
