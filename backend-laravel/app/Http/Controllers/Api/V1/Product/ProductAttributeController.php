<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Enums\StoreType;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\ProductAttributeRequest;
use App\Http\Resources\Admin\AdminAttributeDetailsResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Product\ProductAttributeResource;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\Store;
use App\Repositories\ProductAttributeRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductAttributeController extends Controller
{
    public function __construct(
        public ProductAttributeRepository $repository
    )
    {
    }

    public function listAttributes(Request $request)
    {
        $language = $request->language ?? DEFAULT_LANGUAGE;
        $search = $request->search;
        $limit = $request->per_page ?? 10;
        $attributes = ProductAttribute::leftJoin('translations', function ($join) use ($language) {
            $join->on('product_attributes.id', '=', 'translations.translatable_id')
                ->where('translations.translatable_type', '=', ProductAttribute::class)
                ->where('translations.language', '=', $language)
                ->where('translations.key', '=', 'name');
        })
            ->select('product_attributes.*',
                DB::raw('COALESCE(translations.value, product_attributes.name) as name'));
        // Apply search filter if search parameter exists
        if ($search) {
            $attributes->where(function ($query) use ($search) {
                $query->where('translations.value', 'like', "%{$search}%")
                    ->orWhere('product_attributes.name', 'like', "%{$search}%");
            });
        }
        // Apply sorting and pagination
        $seller = auth('api')->user();

        if ($seller->activity_scope == 'store_level') {
            $store = Store::where('id', $request->store_id)->first();
            if (!$store && !$request->store_id) {
                return response()->json([
                    'message' => __('messages.data_not_found')
                ]);
            }
            // Add specific store level filtering
            $attributes->where('created_by', $seller->id)
                ->where('product_type', $store->store_type)
                ->where('status', 1);
        }
        $attributes = $attributes
            ->with(['related_translations', 'attribute_values'])
            ->orderBy($request->sortField ?? 'id', $request->sort ?? 'asc')
            ->paginate($limit);
        // Return a collection of ProductBrandResource (including the image)
        return response()->json([
            'data' => ProductAttributeResource::collection($attributes),
            'meta' => new PaginationResource($attributes)
        ]);

    }

    public function createAttribute(ProductAttributeRequest $request)
    {
        $attribute = $this->repository->storeProductAttribute($request);
        $success = $this->repository->storeAttributeValues($request->all(), $attribute);
        if ($success) {
            return $this->success(__('messages.save_success', ['name' => 'Product Attribute']));
        } else {
            return $this->failed(__('messages.save_failed', ['name' => 'Product Attribute']));
        }
    }

    public function getAttributeById(Request $request)
    {
        $attribute = ProductAttribute::with(['attribute_values', 'related_translations'])->findOrFail($request->id);
        return response()->json(new AdminAttributeDetailsResource($attribute));
    }

    public function updateAttribute(ProductAttributeRequest $request)
    {
        $attribute = $this->repository->storeProductAttribute($request);
        $success = $this->repository->updateAttributeValues($request->all(), $attribute);
        if ($success) {
            return $this->success(translate('messages.update_success', ['name' => 'Product Attribute']));
        } else {
            return $this->failed(translate('messages.update_failed', ['name' => 'Product Attribute']));
        }

    }

    public function changeAttributeStatus(Request $request)
    {
        try {
            $attribute = ProductAttribute::findOrFail($request->id);
            $attribute->status = !$attribute->status;
            $attribute->save();
            return $this->success(__('messages.update_success', ['name' => 'Product Attribute']));
        } catch (\Exception $exception) {
            return $this->failed(__('messages.update_failed', ['name' => 'Product Attribute']));
        }
    }

    public function deleteAttribute(int $id)
    {
        try {
            // Find the ProductAttribute by ID or fail
            $attribute = ProductAttribute::findOrFail($id);

            // Use a database transaction for atomicity
            DB::transaction(function () use ($attribute) {
                // Delete related translations
                $attribute->translations()->delete();

                // Delete related attribute values directly
                ProductAttributeValue::where('attribute_id', $attribute->id)->delete();

                // Delete the main attribute
                $attribute->delete();
            });

            // Return success response
            return $this->success(translate('messages.delete_success', ['name' => 'Product Attribute']));
        } catch (\Exception $e) {
            // Return failure response
            return $this->failed(translate('messages.delete_failed', ['name' => 'Product Attribute']));
        }
    }

    public function typeWiseAttributes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:' . implode(',', array_column(StoreType::cases(), 'value')),
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'errors' => 'Invalid request! Type must be one of: ' . implode(',', array_column(StoreType::cases(), 'value')),
            ]);
        }
        try {
            $attributes = ProductAttribute::with('attribute_values')
                ->where(function ($q) use ($request) {
                    $q->where('product_type', $request->type)
                      ->orWhereNull('product_type');
                })
                ->where('status', 1)
                ->get();
            return response()->json(ProductAttributeResource::Collection($attributes));
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
