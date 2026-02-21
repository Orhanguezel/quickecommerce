<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Models\ProductCategory;
use App\Models\Store;
use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SellerProductCategoryController extends Controller
{
    /**
     * Get the authenticated seller's store.
     */
    private function getSellerStore(Request $request): ?Store
    {
        $authUser = auth('api')->user();
        $storeId = $request->store_id;

        if (!$storeId) {
            return Store::where('store_seller_id', $authUser?->id)->first();
        }

        return Store::where('id', $storeId)
            ->where('store_seller_id', $authUser?->id)
            ->first();
    }

    /**
     * List categories: store's own + global admin categories for this store type.
     */
    public function index(Request $request)
    {
        $store = $this->getSellerStore($request);
        if (!$store) {
            return response()->json(['message' => 'Store not found.'], 422);
        }

        $language = $request->language ?? DEFAULT_LANGUAGE;
        $search   = $request->search ?? '';
        $perPage  = $request->per_page ?? 10;

        $query = ProductCategory::with('related_translations')
            ->where(function ($q) use ($store) {
                $q->where('store_id', $store->id)         // store's own categories
                  ->orWhere(function ($q2) use ($store) {
                      $q2->whereNull('store_id')           // admin global categories
                         ->where(function ($q3) use ($store) {
                             $q3->where('type', $store->store_type)
                                ->orWhere('type', 'general')
                                ->orWhereNull('type');
                         });
                  });
            });

        if ($search) {
            $query->where('category_name', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('display_order')->paginate($perPage);

        return response()->json([
            'data' => $categories->items(),
            'meta' => new PaginationResource($categories),
        ]);
    }

    /**
     * Create a store-specific category.
     */
    public function store(Request $request)
    {
        $store = $this->getSellerStore($request);
        if (!$store) {
            return response()->json(['message' => 'Store not found.'], 422);
        }

        $validator = Validator::make($request->all(), [
            'category_name' => 'required|string|max:255',
            'parent_id'     => 'nullable|integer|exists:product_category,id',
            'status'        => 'nullable|in:0,1',
            'image'         => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slug = Str::slug($request->category_name . '-' . $store->id);

        $category = ProductCategory::create([
            'store_id'      => $store->id,
            'category_name' => $request->category_name,
            'category_slug' => $slug,
            'type'          => $store->store_type,
            'parent_id'     => $request->parent_id ?? null,
            'status'        => $request->status ?? 1,
            'category_thumb' => $request->image ?? null,
            'display_order' => $request->display_order ?? 0,
        ]);

        createOrUpdateTranslation($request, $category->id, ProductCategory::class, ['category_name', 'meta_title', 'meta_description']);

        return response()->json([
            'message' => __('messages.save_success', ['name' => 'Category']),
        ], 201);
    }

    /**
     * Get a single category (must belong to seller's store or be global).
     */
    public function show(Request $request, $id)
    {
        $store = $this->getSellerStore($request);
        if (!$store) {
            return response()->json(['message' => 'Store not found.'], 422);
        }

        $category = ProductCategory::with('related_translations')
            ->where('id', $id)
            ->where(function ($q) use ($store) {
                $q->where('store_id', $store->id)->orWhereNull('store_id');
            })
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        return response()->json(['data' => $category]);
    }

    /**
     * Update a store-specific category (seller can only edit their own).
     */
    public function update(Request $request)
    {
        $store = $this->getSellerStore($request);
        if (!$store) {
            return response()->json(['message' => 'Store not found.'], 422);
        }

        $validator = Validator::make($request->all(), [
            'id'            => 'required|integer|exists:product_category,id',
            'category_name' => 'required|string|max:255',
            'parent_id'     => 'nullable|integer|exists:product_category,id',
            'status'        => 'nullable|in:0,1',
            'image'         => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = ProductCategory::where('id', $request->id)
            ->where('store_id', $store->id)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found or not editable.'], 404);
        }

        $category->update([
            'category_name' => $request->category_name,
            'category_slug' => Str::slug($request->category_name . '-' . $store->id),
            'parent_id'     => $request->parent_id ?? $category->parent_id,
            'status'        => $request->status ?? $category->status,
            'category_thumb' => $request->image ?? $category->category_thumb,
        ]);

        createOrUpdateTranslation($request, $category->id, ProductCategory::class, ['category_name', 'meta_title', 'meta_description']);

        return response()->json([
            'message' => __('messages.update_success', ['name' => 'Category']),
        ]);
    }

    /**
     * Toggle status of seller's own category.
     */
    public function statusChange(Request $request)
    {
        $store = $this->getSellerStore($request);
        if (!$store) {
            return response()->json(['message' => 'Store not found.'], 422);
        }

        $category = ProductCategory::where('id', $request->id)
            ->where('store_id', $store->id)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        $category->update(['status' => !$category->status]);

        return response()->json(['message' => __('messages.update_success', ['name' => 'Category status'])]);
    }

    /**
     * Delete seller's own category.
     */
    public function destroy(Request $request, $id)
    {
        $store = $this->getSellerStore($request);
        if (!$store) {
            return response()->json(['message' => 'Store not found.'], 422);
        }

        $category = ProductCategory::where('id', $id)
            ->where('store_id', $store->id)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found or not deletable.'], 404);
        }

        $category->delete();

        return response()->json(['message' => __('messages.delete_success', ['name' => 'Category'])]);
    }
}
