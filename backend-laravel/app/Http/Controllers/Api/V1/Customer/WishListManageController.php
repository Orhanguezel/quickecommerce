<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\WishListRequest;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Customer\WishListResource;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WishListManageController extends Controller
{
    public function addToWishlist(WishListRequest $request)
    {
        if (!auth('api_customer')->check()) {
            unauthorized_response();
        }
        $customerId = auth('api_customer')->id();
        $existing = Wishlist::withoutGlobalScopes()->where('customer_id', $customerId)
            ->where('product_id', $request->product_id)->first();
        if ($existing) {
            $existing->delete();
            return $this->success(translate('messages.wishlist_remove', ['name' => 'Product']));
        }
        $product = \App\Models\Product::with('variants')->findOrFail($request->product_id);
        $wishlist = new Wishlist(['customer_id' => $customerId, 'product_id' => $product->id]);
        $wishlist->price_alert_snapshot = app(\App\Services\WishlistPriceAlertService::class)->snapshot($product);
        $wishlist->save();
        return $this->success(translate('messages.wishlist_add', ['name' => 'Product']));
    }

    public function updatePriceAlerts(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer',
            'price_alert_enabled' => 'sometimes|required|boolean',
            'price_alert_email' => 'sometimes|required|boolean',
            'price_alert_push' => 'sometimes|required|boolean',
        ]);
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $wishlist = Wishlist::withoutGlobalScopes()->where('customer_id', auth('api_customer')->id())
                ->where('product_id', $data['product_id'])->lockForUpdate()->firstOrFail();
            unset($data['product_id']);
            if (isset($data['price_alert_enabled']) && (bool) $data['price_alert_enabled'] !== $wishlist->price_alert_enabled) {
                $product = $wishlist->product;
                $wishlist->price_alert_snapshot = $product
                    ? app(\App\Services\WishlistPriceAlertService::class)->snapshot($product) : [];
            }
            $wishlist->forceFill($data)->save();
            return response()->json(['success' => true]);
        });
    }

    public function removeFromWishlist(Request $request)
    {
        if (!auth('api_customer')->check()) {
            unauthorized_response();
        }
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        Wishlist::where('customer_id', auth('api_customer')->user()->id)
            ->where('product_id', $request->product_id)
            ->delete();
        return $this->success(translate('messages.wishlist_remove', ['name' => 'Product']));

    }

    public function wishlists()
    {
        try {
            $wishlist = Wishlist::with(['product.variants', 'product.store'])
                ->where('customer_id', auth('api_customer')->user()->id)
                ->latest()
                ->paginate(10);
            return response()->json([
                'wishlist' => WishlistResource::collection($wishlist),
                'meta' => new PaginationResource($wishlist),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
