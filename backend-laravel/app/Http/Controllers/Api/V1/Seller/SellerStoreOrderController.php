<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Admin\AdminOrderStatusResource;
use App\Http\Resources\Com\OrderPaymentTrackingResource;
use App\Http\Resources\Com\OrderRefundTrackingResource;
use App\Http\Resources\Com\OrderTrackingResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Order\InvoiceResource;
use App\Http\Resources\Order\OrderRefundRequestResource;
use App\Http\Resources\Order\OrderSummaryResource;
use App\Http\Resources\Order\StoreOrderResource;
use App\Mail\DynamicEmail;
use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\Store;
use App\Services\Order\OrderManageNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class SellerStoreOrderController extends Controller
{

    protected OrderManageNotificationService $orderManageNotificationService;
    protected bool $canChangeOrderStatus;

    public function __construct(OrderManageNotificationService $orderManageNotificationService)
    {
        $this->orderManageNotificationService = $orderManageNotificationService;
        $this->canChangeOrderStatus = true;
    }

    public function allOrders(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'nullable|exists:stores,id',
            'order_id' => 'nullable|exists:orders,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if ($request->order_id) {

            $order = Order::with(['orderMaster.customer', 'orderDetail.product', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress'])
                ->where('id', $request->order_id)
                ->first();

            if (!$order) {
                return response()->json([
                    'message' => __('message.data_not_found'),
                ], 404);
            }

            $seller_id = auth('api')->user()->id;
            $seller_stores = Store::where('store_seller_id', $seller_id)->pluck('id');

            if (!$seller_stores->contains($order->store_id)) {
                return response()->json(['message' => __('messages.order_does_not_belong_to_seller')], 422);
            }

            return response()->json([
                'order_data' => new StoreOrderResource($order),
                'order_summary' => new OrderSummaryResource($order),
                'refund' => $order->refund ? new OrderRefundRequestResource($order->refund) : null,
                'order_tracking' => OrderTrackingResource::collection(
                    $order->orderActivities
                        ->where('activity_type', 'order_status')
                        ->sortByDesc('created_at') // Sort latest first
                        ->unique('activity_value') // Keep only latest per status
                        ->values() // Reset collection keys
                ),
                'order_payment_tracking' => OrderPaymentTrackingResource::collection(
                    $order->orderActivities
                        ->where('activity_type', 'payment_status')
                        ->sortByDesc('created_at') // Sort latest first
                        ->unique('activity_value') // Keep only latest per status
                        ->values() // Reset collection keys
                ),
                'order_refund_tracking' => OrderRefundTrackingResource::collection(
                    $order->orderActivities
                        ->where('activity_type', 'refund_status')
                        ->sortByDesc('created_at') // Sort latest first
                        ->unique('activity_value') // Keep only latest per status
                        ->values() // Reset collection keys
                ),
            ]);
        }

        if (isset($request->store_id)) {
            $store = Store::where('id', $request->store_id)
                ->where('store_seller_id', auth('api')->user()->id)
                ->first();

            // auth seller store check
            if (empty($store) || !$store) {
                return response()->json([
                    'message' => __('messages.data_not_found'),
                ], 404);
            }

            // Get store-wise order info
            $orders = Order::with(['orderMaster.customer', 'orderDetail.product', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress'])
                ->where('store_id', $request->store_id)
                ->whereNot('order_type', 'pos');

            // Apply status filter
            if (isset($request->status)) {
                if ($request->status === 'refunded') {
                    $orders->where('refund_status', 'refunded');
                }else{
                    $orders->where('status', $request->status);
                }
            }
            if (isset($request->start_date) && isset($request->end_date)) {
                $orders->whereBetween('created_at', [$request->start_date, $request->end_date]);
            }

            // Apply payment_status filter
            if (isset($request->payment_status)) {
                $orders->whereHas('orderMaster', function ($query) use ($request) {
                    $query->where('payment_status', $request->payment_status);
                });
            }
            $orders->when($request->search, fn($query) => $query->where('id', 'LIKE', '%' . $request->search . '%')
                ->orWhere('invoice_number', 'LIKE', '%' . $request->search . '%'));

            $orders = $orders->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);
            // === Order Status Buttons (From Full Order Table, Unfiltered) ===
            $orderStatusCounts = new AdminOrderStatusResource(Order::where('store_id', $request->store_id)->whereNot('order_type', 'pos')->get());

            return response()->json([
                'order_masters' => StoreOrderResource::collection($orders),
                'meta' => new PaginationResource($orders),
                'status' => $orderStatusCounts,
            ]);
        } else {
            $stores = Store::where('store_seller_id', auth('api')->user()->id)
                ->pluck('id');
            // auth seller store check
            if (empty($stores) || !$stores) {
                return response()->json([
                    'message' => __('messages.data_not_found'),
                ], 404);
            }

            // Get store-wise order info
            $orders = Order::with(['orderMaster.customer', 'orderDetail.product', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress'])
                ->whereIn('store_id', $stores)
                ->whereNot('order_type', 'pos');

            // Apply status filter
            if (isset($request->status)) {
                if ($request->status === 'refunded') {
                    $orders->where('refund_status', 'refunded');
                } else {
                    $orders->where('status', $request->status);
                }
            }
            if (isset($request->start_date) && isset($request->end_date)) {
                $orders->whereBetween('created_at', [$request->start_date, $request->end_date]);
            }

            // Apply payment_status filter
            if (isset($request->payment_status)) {
                $orders->whereHas('orderMaster', function ($query) use ($request) {
                    $query->where('payment_status', $request->payment_status);
                });
            }
            $orders->when($request->search, fn($query) => $query->where('id', 'LIKE', '%' . $request->search . '%')
                ->orWhere('invoice_number', 'LIKE', '%' . $request->search . '%'));

            $orders = $orders->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);
            // === Order Status Buttons (From Full Order Table, Unfiltered) ===
            $orderStatusCounts = new AdminOrderStatusResource(Order::whereIn('store_id', $stores)->whereNot('order_type', 'pos')->get());

            return response()->json([
                'order_masters' => StoreOrderResource::collection($orders),
                'meta' => new PaginationResource($orders),
                'status' => $orderStatusCounts,
            ]);
        }
    }

    public function orderInvoice(Request $request)
    {
        $order = Order::with(['orderMaster.customer', 'orderDetail.product', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress'])
            ->where('id', $request->order_id)
            ->first();

        if (!$order) {
            return response()->json(['message' => __('messages.data_not_found')], 404);
        }
        $seller_id = auth('api')->user()->id;
        $seller_stores = Store::where('store_seller_id', $seller_id)->pluck('id');

        if (!$seller_stores->contains($order->store_id)) {
            return response()->json(['message' => __('messages.order_does_not_belong_to_seller')], 422);
        }

        // InvoiceResource expects customer/shipping_address directly
        $order->setRelation('customer', $order->orderMaster?->customer);
        $order->setRelation('shipping_address', $order->orderMaster?->shippingAddress);

        if (!$order) {
            return response()->json(['message' => __('messages.data_not_found')], 404);
        }
        return response()->json(new InvoiceResource($order));
    }

    public function changeOrderStatus(Request $request)
    {
        if (!$this->canChangeOrderStatus) {
            return response()->json(['message' => __('messages.order_status_not_changeable')], 422);
        }
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|in:pending,confirmed,processing,pickup,shipped'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $seller_id = auth('api')->user()->id;
        $seller_stores = Store::where('store_seller_id', $seller_id)->pluck('id');
        $order = Order::with('orderMaster')->find($request->order_id);

        if (!$order) {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }

        if (!$seller_stores->contains($order->store_id)) {
            return response()->json(['message' => __('messages.order_does_not_belong_to_seller')], 422);
        }

        $statusFlow = [
            'pending',
            'confirmed',
            'processing',
            'pickup',
            'shipped',
        ];

        $currentIndex = array_search($order->status, $statusFlow);
        $newIndex = array_search($request->status, $statusFlow);

        if ($newIndex === false || $newIndex < $currentIndex || $order->status === $request->status) {
            return response()->json(['message' => __('messages.order_status_not_changeable')], 422);
        }

        $order->status = $request->status;
        $success = $order->save();

        // Notify seller and customer
        $this->orderManageNotificationService->createOrderNotification([$order->id], 'seller_order_status_pcpps');

        // Musteriye YENI duruma ait e-posta. Eskiden burada DispatchOrderEmails
        // (order-created sablonlari) cagriliyordu, ustelik $order bir array'e
        // ezildigi icin $order->orderMaster her zaman null donuyordu -> hicbir
        // mail gitmiyordu.
        $this->sendCustomerStatusEmail($order);

        if ($success) {
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Order status'])
            ]);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Order status'])
            ], 500);
        }


    }

    /**
     * Siparisin GERCEK durumuna ait sablonu musteriye yollar
     * (order-status-pending / -confirmed / -processing / -shipped ...).
     */
    private function sendCustomerStatusEmail(Order $order): void
    {
        $template = EmailTemplate::where('type', 'order-status-' . $order->status)
            ->where('status', 1)
            ->first();

        $email = $order->orderAddress?->email ?? $order->orderMaster?->customer?->email;

        if (!$template || !$email) {
            Log::info('[order-status-email] seller status maili atlandi', [
                'order_id' => $order->id,
                'status'   => $order->status,
                'template' => (bool) $template,
                'email'    => (bool) $email,
            ]);
            return;
        }

        $body = str_replace(
            ['@customer_name', '@order_id', '@order_amount'],
            [$order->orderMaster?->customer?->full_name, $order->id, amount_with_symbol_format($order->order_amount)],
            $template->body ?? ''
        );

        try {
            Mail::to($email)->send(new DynamicEmail($template->subject ?: 'Sipariş Durumu', $body));
        } catch (\Throwable $e) {
            Log::error('[order-status-email] seller status maili gonderilemedi', [
                'order_id' => $order->id,
                'error'    => $e->getMessage(),
            ]);
        }
    }

    public function cancelOrder(Request $request)
    {
        if (!$this->canChangeOrderStatus) {
            return response()->json(['message' => __('messages.order_status_not_changeable')], 422);
        }

        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $seller_id = auth('api')->user()->id;
        $seller_stores = Store::where('store_seller_id', $seller_id)->pluck('id');
        $order = Order::find($request->order_id);
        if (!$order) {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }

        if (!$seller_stores->contains($order->store_id)) {
            return response()->json(['message' => __('messages.order_does_not_belong_to_seller')], 422);
        }

        // If the order is once shipped or cancelled or on_hold or delivered the order status can not be cancelled
        if ($order->status === 'shipped' || $order->status === 'cancelled' || $order->status === 'on_hold' || $order->status === 'delivered') {
            return response()->json(['message' => __('messages.order_status_not_changeable')], 422);
        }

        $order->cancelled_by = auth('api')->user()->id;
        $order->cancelled_at = Carbon::now();
        $order->status = 'cancelled';
        $success = $order->save();

        // Notify seller and customer
        $order = [$order->id];
        $this->orderManageNotificationService->createOrderNotification($order, 'seller_order_cancelled');

        if ($success) {
            return response()->json([
                'message' => __('messages.order_cancel_successful')
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.order_cancel_failed')
            ], 500);
        }
    }
}
