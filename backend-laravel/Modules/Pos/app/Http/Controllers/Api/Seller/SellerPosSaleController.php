<?php

namespace Modules\Pos\app\Http\Controllers\Api\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Pos\app\Http\Requests\PosOrderRequest;
use Modules\Pos\app\Interfaces\PosInterface;
use Modules\Pos\app\Services\PosOrderService;

class SellerPosSaleController extends Controller
{
    protected object $seller;
    protected object $store;
    protected PosInterface $pos;
    protected PosOrderService $posOrderService;

    public function __construct(PosInterface $pos, PosOrderService $posOrderService)
    {
        $this->pos = $pos;
        $this->posOrderService = $posOrderService;

        // Check If the seller store have the subscription of pos
        $this->middleware(function ($request, $next) {

            $authUser = auth('api')->user();

            if ($authUser->activity_scope !== 'store_level') {
                return response()->json([
                    'message' => __('pos::messages.permission_denied')
                ], 403);
            }

            $this->seller = $authUser;

            $storeId = $request->input('store_id');
            $store = Store::where('id', $storeId)
                ->where('store_seller_id', $this->seller->id)
                ->first();

            if (!$store) {
                return response()->json([
                    'message' => __('pos::messages.store.doesnt.belongs.to.seller')
                ], 403);
            }

            $this->store = $store;

            if (!checkSubscription($this->store->id, 'pos')) {
                return response()->json([
                    'message' => __('pos::messages.feature_not_available', ['name' => 'Pos']),
                ], 422);
            }
            return $next($request);
        });
    }

    public function createOrder(PosOrderRequest $request)
    {
        return $this->posOrderService->placeOrder($request);
    }

    public function listProducts(Request $request)
    {
        return $this->pos->getProducts($request, $this->store->id);
    }

    public function getProductBySlug(Request $request, $slug)
    {
        return $this->pos->getProductBySlug($slug);
    }

    public function addCustomer(Request $request)
    {
        return $this->pos->createNewCustomer($request);
    }

    public function listCustomers(Request $request)
    {
        $storeId = $this->store->id;
        $filters = [
            'search' => $request->search,
        ];
        return $this->pos->getStoreCustomers($storeId, $filters);
    }

    public function invoice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:orders,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        return $this->posOrderService->getInvoice($request->order_id);
    }

    public function orders(Request $request)
    {
        return $this->pos->getOrders($request);
    }
}
