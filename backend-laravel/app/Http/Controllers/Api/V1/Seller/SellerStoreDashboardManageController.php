<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Dashboard\OrderGrowthSummaryResource;
use App\Http\Resources\Dashboard\SalesSummaryResource;
use App\Http\Resources\Dashboard\SellerStoreOtherSummaryResource;
use App\Http\Resources\Dashboard\SellerStoreSummaryResource;
use App\Http\Resources\Seller\Store\StoreDetailsResource;
use App\Interfaces\StoreManageInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerStoreDashboardManageController extends Controller
{
    public function __construct(protected StoreManageInterface $storeRepo)
    {

    }

    public function summaryData(Request $request)
    {
        $validator = Validator::make(['slug' => $request->slug], [
            'slug' => 'nullable|exists:stores,slug',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $this->storeRepo->getSummaryData($request->slug);

        return response()->json(new SellerStoreSummaryResource((object)$data));
    }

    public function salesSummaryData(Request $request)
    {
        $validator = Validator::make(['slug' => $request->slug], [
            'slug' => 'nullable|exists:stores,slug',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $filters = [
            "time_period" => $request->time_period,
            "start_date" => $request->start_date,
            "end_date" => $request->end_date,
        ];
        $data = $this->storeRepo->getSalesSummaryData($filters, $request->slug);
        return response()->json(new SalesSummaryResource($data));
    }

    public function orderGrowthData(Request $request)
    {
        $validator = Validator::make(['slug' => $request->slug], [
            'slug' => 'nullable|exists:stores,slug',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $data = $this->storeRepo->getOrderGrowthData($request->slug);
        return response()->json(new OrderGrowthSummaryResource($data));
    }

    public function otherSummaryData(Request $request)
    {
        $validator = Validator::make(['slug' => $request->slug], [
            'slug' => 'nullable|exists:stores,slug',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $data = $this->storeRepo->getOtherSummaryData($request->slug);
        return response()->json(new SellerStoreOtherSummaryResource((object)$data));
    }

    public function dashboard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'slug' => 'required|string|exists:stores,slug',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $storeDashboard = $this->storeRepo->storeDashboard($request->slug);
        return response()->json(new StoreDetailsResource($storeDashboard));
    }
}
