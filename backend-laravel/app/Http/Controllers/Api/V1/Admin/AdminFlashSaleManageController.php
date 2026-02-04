<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\FlashDealProductRequest;
use App\Http\Requests\FlashSaleRequest;
use App\Http\Resources\Admin\AdminFlashSaleDetailsResource;
use App\Http\Resources\Admin\AdminFlashSaleDropdownResource;
use App\Http\Resources\Admin\AdminFlashSaleProductResource;
use App\Http\Resources\Admin\AdminFlashSaleResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Product\StoreWiseProductDropdownResource;
use App\Http\Resources\Seller\FlashSaleProduct\FlashSaleProductResource;
use App\Models\Product;
use App\Services\FlashSaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminFlashSaleManageController extends Controller
{
    protected $flashSaleService;

    public function __construct(FlashSaleService $flashSaleService)
    {
        $this->flashSaleService = $flashSaleService;
    }

    public function createFlashSale(FlashSaleRequest $request): JsonResponse
    {
        $discount_type = $request->get('discount_type');
        $discount_amount = $request->get('discount_amount');
        $shouldRound = shouldRound();
        if ($shouldRound && $discount_type === 'amount' && is_float($discount_amount)) {
            return response()->json([
                'message' => __('messages.should_round', ['name' => 'Discount amount']),
            ]);
        }

        $flashSale = $this->flashSaleService->createFlashSale($request->validated());
        createOrUpdateTranslation($request, $flashSale, 'App\Models\FlashSale', $this->flashSaleService->translationKeys());
        if ($flashSale) {
            return response()->json([
                'status' => true,
                'status_code' => 201,
                'message' => __('messages.save_success', ['name' => 'Flash Sale']),
            ], 201);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
            ]);
        }
    }

    public function updateFlashSale(FlashSaleRequest $request): JsonResponse
    {
        $discount_type = $request->get('discount_type');
        $discount_amount = $request->get('discount_amount');
        $shouldRound = shouldRound();
        if ($shouldRound && $discount_type === 'amount' && is_float($discount_amount)) {
            return response()->json([
                'message' => __('messages.should_round', ['name' => 'Discount amount']),
            ]);
        }
        $flashSale = $this->flashSaleService->updateFlashSale($request->all());
        createOrUpdateTranslation($request, $flashSale, 'App\Models\FlashSale', $this->flashSaleService->translationKeys());
        if ($flashSale) {
            return response()->json([
                'success' => true,
                'message' => __('messages.update_success', ['name' => 'Flash Sale']),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
            ]);
        }
    }

    public function listFlashSales(Request $request)
    {
        $filters = [
            "title" => $request->title,
            "start_date" => $request->start_date,
            "end_date" => $request->end_date,
            "per_page" => $request->per_page,
        ];
        $flashSales = $this->flashSaleService->getAdminFlashSales($filters);
        return response()->json([
                'data' => AdminFlashSaleResource::collection($flashSales),
                'meta' => new PaginationResource($flashSales)
            ]
        );
    }

    public function listAllFlashSaleProducts(Request $request)
    {
        $filters = [
            'store_id' => $request->store_id,
            'flash_sale_id' => $request->flash_sale_id,
            'status' => $request->status,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'per_page' => $request->per_page,
        ];
        $flashSaleProducts = $this->flashSaleService->getAllFlashSaleProducts($filters);
        if ($flashSaleProducts) {
            return response()->json([
                'data' => AdminFlashSaleProductResource::collection($flashSaleProducts),
                'meta' => new PaginationResource($flashSaleProducts)
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }
    }

    public function adminAddProductToFlashSale(FlashDealProductRequest $request)
    {
        // check the products exists in store or not
        $productsNotInStore = $this->flashSaleService->checkProductsExistInStore($request->store_id, $request->products);
        if ($productsNotInStore) {
            return response()->json($productsNotInStore);
        }
        // check if the products are already in flash sale
        $existingProducts = $this->flashSaleService->getExistingFlashSaleProducts($request->products);

        if ($existingProducts) {
            return response()->json($existingProducts);
        }
        $data = $this->flashSaleService->associateProductsToFlashSale($request->flash_sale_id, $request->products, $request->store_id);
        if ($data) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.request_success', ['name' => 'Products'])
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.request_failed', ['name' => 'Products'])
            ]);
        }
    }

    public function adminUpdateProductToFlashSale(FlashDealProductRequest $request)
    {
        // check the products exists in store or not
        $productsNotInStore = $this->flashSaleService->checkProductsExistInStore($request->store_id, $request->products);
        if ($productsNotInStore) {
            return response()->json($productsNotInStore);
        }
        $data = $this->flashSaleService->updateFlashSaleProducts($request->flash_sale_id, $request->products, $request->store_id);
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

    public function getFlashSaleById(Request $request)
    {
        $flashSales = $this->flashSaleService->getFlashSaleById($request->id);
        if ($flashSales) {
            return response()->json(new AdminFlashSaleDetailsResource($flashSales));
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }

    }

    public function getFlashSaleDropdown()
    {
        $flashSale = $this->flashSaleService->getAdminFlashSalesDropdown();
        if ($flashSale) {
            return response()->json(AdminFlashSaleDropdownResource::collection($flashSale));
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }
    }

    public function changeFlashSaleStatus(Request $request)
    {
        $flashSale = $this->flashSaleService->toggleStatus($request->id);
        if ($flashSale) {
            return response()->json([
                'status' => true,
                'status_code' => 201,
                'message' => __('messages.update_success', ['name' => 'Flash sale status']),

            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
            ]);
        }
    }

    public function deleteFlashSale($id)
    {
        $flashSale = $this->flashSaleService->deleteFlashSale($id);
        $flashSaleProducts = $this->flashSaleService->deleteFlashSaleProducts($id);
        if ($flashSale && $flashSaleProducts) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.delete_success', ['name' => 'Flash sale']),
            ]);
        } else {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.delete_failed', ['name' => 'Flash sale']),
            ]);
        }

    }

    public function deactivateFlashSale()
    {
        $success = $this->flashSaleService->deactivateExpiredFlashSales();
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.update_success', ['name' => 'Flash sale status']),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.update_failed', ['name' => 'Flash sale status'])
            ]);
        }
    }

    public function listFlashSaleProductRequests()
    {
        $requests = $this->flashSaleService->getFlashSaleProductRequest();
        if (!empty($requests)) {
            return response()->json([
                'data' => FlashSaleProductResource::collection($requests),
                'meta' => new PaginationResource($requests),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 404,
                'message' => __('messages.data_not_found')
            ]);
        }
    }

    public function approveFlashSaleProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:flash_sale_products,id',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'errors' => $validator->errors()
            ]);
        }
        $success = $this->flashSaleService->approveFlashSaleProductRequest($request->ids);
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.update_success', ['name' => 'Flash sale product request']),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.update_failed', ['name' => 'Flash sale product request'])
            ]);
        }
    }

    public function rejectFlashSaleProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'rejection_reason' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'errors' => $validator->errors()
            ]);
        }
        $success = $this->flashSaleService->rejectFlashSaleProductRequest($request->ids, $request->rejection_reason);
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.update_success', ['name' => 'Flash sale product request']),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.update_failed', ['name' => 'Flash sale product request'])
            ]);
        }
    }

    public function getProductsNotInFlashSale(Request $request)
    {
        $query = Product::with('store')->where('status', 'approved')
            ->whereNull('deleted_at'); // Only fetch non-deleted products

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }
        if ($request->has('store_id') && !empty($request->store_id)) {
            $query->where('store_id', $request->store_id);
        }

        // Ensure the product is not part of any flash sale
        $query->whereDoesntHave('flashSaleProduct');

        // Paginate results dynamically
        $products = $query->paginate(20);
        return response()->json([
            'status' => true,
            'data' => StoreWiseProductDropdownResource::collection($products),
            'meta' => new PaginationResource($products),
        ]);
    }
}
