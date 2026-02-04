<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Order\OrderRefundRequestResource;
use App\Interfaces\OrderRefundInterface;
use App\Models\OrderRefund;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerStoreOrderRefundManageController extends Controller
{
    public function __construct(protected OrderRefundInterface $orderRefundRepo)
    {

    }

    public function orderRefundRequests(Request $request)
    {
        if (!auth('api')->check()) {
            unauthorized_response();
        }
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|integer|exists:stores,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        if (!$seller_stores->contains($request->store_id)) {
            return response()->json([
                'message' => ('messages.store.doesnt.belongs.to.seller')
            ], 422);
        }
        $filters = [
            "status" => $request->status,
            "search" => $request->search,
            "order_refund_reason_id" => $request->order_refund_reason_id,
            "per_page" => $request->per_page,
        ];
        $requests = $this->orderRefundRepo->get_seller_store_order_refund_request($request->store_id, $filters);
        return response()->json([
            'data' => OrderRefundRequestResource::collection($requests),
            'meta' => new PaginationResource($requests)
        ], 200);
    }

    public function handleRefundRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer|exists:order_refunds,id',
            'status' => 'required|in:approved,rejected,refunded',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $store = OrderRefund::where('id', $request->id)->pluck('store_id')->first();
        if (!$seller_stores->contains($store)) {
            return response()->json([
                'message' => __('messages.order_does_not_belong_to_seller')
            ], 422);
        }

        $refund = OrderRefund::find($request->id);
        if ($refund->status == 'approved' && $request->status == 'rejected') {
            return response()->json([
                'message' => __('messages.already_approved', ['name' => 'Order Refund'])
            ]);
        }

        if ($refund->status == 'rejected' && $request->status == 'approved') {
            return response()->json([
                'message' => __('messages.already_rejected', ['name' => 'Order Refund'])
            ]);
        }

        if ($request->status === 'approved') {
            $success = $this->orderRefundRepo->approve_refund_request($request->id, $request->status);
            if ($success) {
                return response()->json([
                    'message' => __('messages.approve.success', ['name' => 'Order Refund Request']),
                ], 200);
            } else {
                return response()->json([
                    'message' => __('messages.approve.failed', ['name' => 'Order Refund Request']),
                ], 500);
            }
        }
        if ($request->status === 'rejected') {
            $validator = Validator::make($request->all(), [
                'reject_reason' => 'required|string|max:500'
            ]);
            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }
            $success = $this->orderRefundRepo->reject_refund_request($request->id, $request->status, $request->reject_reason);
            if ($success) {
                return response()->json([
                    'message' => __('messages.reject.success', ['name' => 'Order Refund Request']),
                ], 200);
            } else {
                return response()->json([
                    'message' => __('messages.reject.failed', ['name' => 'Order Refund Request']),
                ], 500);
            }
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Order Refund Request']),
            ], 500);
        }
    }
}
