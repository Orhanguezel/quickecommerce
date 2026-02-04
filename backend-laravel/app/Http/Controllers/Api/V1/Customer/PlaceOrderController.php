<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Order\PlaceOrderRequest;
use App\Http\Resources\Order\PlaceOrderDetailsResource;
use App\Http\Resources\Order\PlaceOrderMasterResource;
use App\Models\Order;
use App\Models\OrderMaster;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Modules\Wallet\app\Models\Wallet;

class PlaceOrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    // place order
    public function placeOrder(PlaceOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = auth()->guard('api_customer')->user();

        // login check
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login to proceed with the order.',
            ], 400);
        }

        $orders = $this->orderService->createOrder($data);

        foreach ($data['packages'] as $package) {
            foreach ($package['items'] as $item) {
                $this->updateProductData($item['product_id']);
                $this->updateVariantData($item['variant_id'], $item['quantity']);
            }
        }

        // if return false
        if ($orders === false || empty($orders)) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order. Please try again.',
            ], 400);
        } else {
            $all_orders = $orders[0];
            $order_master = $orders[1];
        }

        try {
            if ($orders) {
                if ($order_master['payment_gateway'] === 'wallet') {
                    $success = $this->updateWallet($order_master['order_amount']);
                    if ($success) {
                        OrderMaster::where('id', $order_master['id'])->update([
                            'payment_gateway' => 'wallet',
                            'payment_status' => 'paid',
                        ]);
                        Order::where('order_master_id', $order_master['id'])->update([
                            'payment_status' => 'paid',
                        ]);
                    } else {
                        OrderMaster::where('id', $order_master['id'])->update([
                            'payment_gateway' => 'wallet',
                            'payment_status' => 'pending',
                        ]);
                    }
                }
                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully.',
                    'orders' => PlaceOrderDetailsResource::collection($all_orders),
                    'order_master' => new PlaceOrderMasterResource($order_master),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while placing the order.',
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while placing the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    private function updateProductData(int $productId): bool
    {
        return Product::where('id', $productId)->increment('order_count') > 0;
    }

    private function updateVariantData(int $variantId, int $quantity): bool
    {
        $variant = ProductVariant::find($variantId);

        if (!$variant) {
            return false;
        }

        $variant->increment('order_count');
        if ($variant->stock_quantity >= $quantity) {
            $variant->decrement('stock_quantity', $quantity);
        } else {
            // Optional: handle out-of-stock or insufficient quantity case
            return false;
        }

        return true;
    }

    private function updateWallet($order_amount)
    {
        $customer = auth()->guard('api_customer')->user();

        if (!$customer) {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }

        $wallet = Wallet::where('owner_id', $customer->id)
            ->where('owner_type', \App\Models\Customer::class) // if polymorphic
            ->first();

        if (!$wallet || $wallet->balance <= 0 || $wallet->balance < $order_amount) {
            return response()->json([
                'message' => __('messages.insufficient_balance')
            ], 422);
        }

        $wallet->balance -= $order_amount;
        $wallet->save();

        return $wallet;
    }
}
