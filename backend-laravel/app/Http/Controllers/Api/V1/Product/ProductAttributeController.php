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
            ->with(['related_translations', 'attribute_values', 'category'])
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
        $attribute = ProductAttribute::with(['attribute_values', 'related_translations', 'category'])->findOrFail($request->id);
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
        $rawType = $request->type ?? '';
        // Support comma-separated multi-type (e.g. "grocery,pharmacy")
        $validValues = array_column(StoreType::cases(), 'value');
        $types = array_filter(array_map('trim', explode(',', $rawType)));

        foreach ($types as $t) {
            if (!in_array($t, $validValues)) {
                return response()->json([
                    'status' => false,
                    'status_code' => 500,
                    'errors' => 'Invalid request! Type must be one of: ' . implode(',', $validValues),
                ]);
            }
        }

        $categoryId = $request->category_id ?: null;

        // Type is required only when category_id is also not provided
        if (empty($types) && !$categoryId) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'errors' => 'Type or category_id is required.',
            ]);
        }

        try {
            $attributes = ProductAttribute::with(['attribute_values', 'category', 'related_translations'])
                ->where(function ($q) use ($types, $categoryId) {
                    // Category-specific attributes
                    if ($categoryId) {
                        $q->orWhere('category_id', $categoryId);
                    }
                    // Type-specific attributes (no category assigned)
                    if (!empty($types)) {
                        $q->orWhere(function ($q2) use ($types) {
                            $q2->whereIn('product_type', $types)
                               ->whereNull('category_id');
                        });
                    }
                    // General attributes (no type, no category)
                    $q->orWhere(function ($q2) {
                        $q2->whereNull('product_type')
                           ->whereNull('category_id');
                    });
                })
                ->where('status', 1)
                ->get();
            return response()->json(ProductAttributeResource::Collection($attributes));
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
