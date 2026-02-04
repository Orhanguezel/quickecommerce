<?php

namespace Modules\Pos\app\Repositories;

use App\Http\Resources\Admin\AdminOrderStatusResource;
use App\Http\Resources\Com\OrderPaymentTrackingResource;
use App\Http\Resources\Com\OrderRefundTrackingResource;
use App\Http\Resources\Com\OrderTrackingResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Order\AdminOrderResource;
use App\Http\Resources\Order\OrderRefundRequestResource;
use App\Http\Resources\Order\OrderSummaryResource;
use App\Http\Resources\Product\ProductDetailsPublicResource;
use App\Http\Resources\Product\ProductPublicResource;
use App\Http\Resources\Seller\SellerStorePosCustomer;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderMaster;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Modules\Pos\app\Interfaces\PosInterface;
use Modules\Pos\app\Models\PosStoreCustomer;

class PosRepository implements PosInterface
{
    public function getStoreCustomers($storeId, $filters)
    {
        $orderCustomerIds = OrderMaster::whereHas('orders', function ($query) use ($storeId) {
            $query->where('store_id', $storeId);
        })->pluck('customer_id');

        $posCustomerIds = PosStoreCustomer::where('store_id', $storeId)
            ->pluck('customer_id');

        $allCustomerIds = $orderCustomerIds
            ->merge($posCustomerIds)
            ->unique()
            ->values();
        $query = Customer::with('wallet')
            ->whereIn('id', $allCustomerIds);
        if ($filters['search']) {
            $searchTerm = $filters['search'];
            $query->where(function ($query) use ($searchTerm) {
                $query->where('first_name', 'like', '%' . $searchTerm . '%')
                    ->orWhere('last_name', 'like', '%' . $searchTerm . '%');
            });
        }
        $customers = $query->limit(50)->get();
        return response()->json([
            'data' => SellerStorePosCustomer::collection($customers),
        ]);
    }

    public function getProducts(Request $request, $storeId)
    {
        $query = Product::where('store_id', $storeId);
        if (!empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('products.name', 'like', '%' . $request->search . '%');
            });
        }
        if (isset($request->category_id)) {
            $query->where(function ($q) use ($request) {
                $q->where('products.category_id', $request->category_id);
            });
        }

        $perPage = $request->per_page ?? 10;
        $products = $query->with(['category', 'unit', 'tags', 'store', 'brand',
            'variants' => function ($query) use ($request) {
                $shouldRound = shouldRound();

                $discountAmountExpr = $shouldRound
                    ? 'ROUND(fs1.discount_amount)'
                    : 'fs1.discount_amount';

                $discountSpecialPricePercentExpr = $shouldRound
                    ? 'ROUND(product_variants.special_price * fs1.discount_amount / 100)'
                    : '(product_variants.special_price * fs1.discount_amount / 100)';

                $discountBasePricePercentExpr = $shouldRound
                    ? 'ROUND(product_variants.price * fs1.discount_amount / 100)'
                    : '(product_variants.price * fs1.discount_amount / 100)';

                $priceExpr = "
        CASE
            WHEN fsp1.id IS NOT NULL THEN
                CASE fs1.discount_type
                    WHEN 'amount' THEN 
                        CASE 
                            WHEN product_variants.special_price IS NOT NULL AND product_variants.special_price > 0 THEN 
                                product_variants.special_price - $discountAmountExpr
                            ELSE 
                                product_variants.price - $discountAmountExpr
                        END
                    WHEN 'percentage' THEN 
                        CASE 
                            WHEN product_variants.special_price IS NOT NULL AND product_variants.special_price > 0 THEN 
                                product_variants.special_price - $discountSpecialPricePercentExpr
                            ELSE 
                                product_variants.price - $discountBasePricePercentExpr
                        END
                    ELSE 
                        CASE 
                            WHEN product_variants.special_price IS NOT NULL AND product_variants.special_price > 0 THEN 
                                product_variants.special_price
                            ELSE 
                                product_variants.price
                        END
                END
            WHEN product_variants.special_price IS NOT NULL AND product_variants.special_price > 0 AND product_variants.special_price < product_variants.price THEN 
                product_variants.special_price
            ELSE 
                product_variants.price
        END
    ";
                $finalExpr = $shouldRound ? "ROUND($priceExpr)" : "FORMAT($priceExpr, 2)";
                $query->leftJoin('flash_sale_products as fsp1', 'fsp1.product_id', '=', 'product_variants.product_id')
                    ->leftJoin('flash_sales as fs1', 'fs1.id', '=', 'fsp1.flash_sale_id')
                    ->select('product_variants.*')
                    ->selectRaw("$finalExpr as effective_price");

                if ($request->sort === 'price_low_high') {
                    $query->orderByRaw("$finalExpr ASC");
                } elseif ($request->sort === 'price_high_low') {
                    $query->orderByRaw("$finalExpr DESC");
                }

            }
            , 'related_translations'])
            ->where('products.status', 'approved')
            ->whereNull('products.deleted_at')
            ->paginate($perPage);

        return response()->json(['messages' => __('pos::messages.data_found'),
            'data' => ProductPublicResource::collection($products),
            'meta' => new PaginationResource($products),
        ]);
    }

    public function getProductBySlug($slug)
    {
        $product = Product::with([
            'store' => function ($query) {
                $query->withCount(['products' => function ($q) {
                    $q->where('status', 'approved')
                        ->whereNull('deleted_at');
                }]);
            },
            'tags',
            'unit',
            'variants',
            'brand',
            'category',
            'related_translations'
        ])
            ->where('status', 'approved')
            ->whereNull('deleted_at')
            ->where('slug', $slug)
            ->first();
        return response()->json([
            'messages' => __('pos::messages.data_found'),
            'data' => new ProductDetailsPublicResource($product),
        ], 200);
    }

    public function createNewCustomer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|string|max:255|unique:customers,email',
            'phone' => 'nullable|string|max:255|unique:customers,phone',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $password = Str::random(8);
        $customer = \DB::transaction(function () use ($request, $password) {
            // create customer
            $customer = Customer::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($password),
            ]);

            // create pos customer data
            PosStoreCustomer::create([
                'customer_id' => $customer->id,
                'store_id' => $request->store_id,
            ]);

            return $customer;
        });

        return response()->json([
            'messages' => __('pos::messages.save_success', ['name' => 'Customer']),
            'customer' => $customer->makeHidden(['created_at', 'updated_at']),
        ]);
    }

    public function getOrders(Request $request)
    {
        $order_id = $request->order_id;

        if ($order_id) {
            $order = Order::with([
                'orderMaster.customer',
                'orderDetail.product',
                'orderMaster',
                'store.area',
                'deliveryman',
                'orderMaster.shippingAddress',
                'refund.store',
                'refund.orderRefundReason',
                'orderActivities',
            ])
                ->where('id', $order_id)
                ->where('order_type', 'pos')
                ->first();
            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }
            $deliveryman_id = $order->confirmed_by;
            $total_delivered = Order::where('confirmed_by', $deliveryman_id)->where('status', 'delivered')->count();
            $last_delivered_location = Order::with('orderMaster.shippingAddress')
                ->where('confirmed_by', $deliveryman_id)
                ->where('status', 'delivered')
                ->orderBy('delivery_completed_at', 'desc')
                ->first();
            if ($order->deliveryman) {
                $order->deliveryman->last_delivered_location = optional($last_delivered_location?->shippingAddress)->address ?? 'No address available';
                $order->deliveryman->total_delivered = $total_delivered ?? 0;
            }
            return response()->json(
                [
                    'order_data' => new AdminOrderResource($order),
                    'order_summary' => new OrderSummaryResource($order),
                ]
            );
        }
        $ordersQuery = Order::with(['orderMaster.customer', 'orderDetail', 'orderMaster', 'store.related_translations', 'deliveryman', 'orderMaster.shippingAddress'])
            ->where('order_type', 'pos');

        $ordersQuery->when($request->status, fn($query) => $query->where('status', $request->status));
        $ordersQuery->when($request->refund_status, fn($query) => $query->where('refund_status', $request->refund_status));
        $ordersQuery->when($request->store_id, fn($query) => $query->where('store_id', $request->store_id));

        $ordersQuery->when($request->start_date && $request->end_date, function ($query) use ($request) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        });

        $ordersQuery->when($request->payment_status, function ($query) use ($request) {
            $query->where('payment_status', $request->payment_status);
        });

        $ordersQuery->when($request->search, fn($query) => $query->where('id', 'LIKE', '%' . $request->search . '%')
            ->orWhere('invoice_number', 'LIKE', '%' . $request->search . '%'));

        $orders = $ordersQuery->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);

        return response()->json([
            'orders' => AdminOrderResource::collection($orders),
            'meta' => new PaginationResource($orders),
            'status' =>[]
        ]);
    }
}