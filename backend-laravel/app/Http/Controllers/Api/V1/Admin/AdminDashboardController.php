<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Dashboard\AdminOtherSummaryResource;
use App\Http\Resources\Dashboard\OrderGrowthSummaryResource;
use App\Http\Resources\Dashboard\SalesSummaryResource;
use App\Http\Resources\Dashboard\SummaryResource;
use App\Interfaces\AdminDashboardInterface;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(protected AdminDashboardInterface $adminRepo)
    {

    }

    public function summaryData(Request $request)
    {
        $filters = [
            'store_type' => $request->store_type
        ];
        $data = $this->adminRepo->getSummaryData(null, $filters);
        return response()->json(new SummaryResource((object)$data));
    }

    public function salesSummaryData(Request $request)
    {
        $filters = [
            "store_type" => $request->store_type,
            "this_week" => $request->this_week,
            "this_month" => $request->this_month,
            "this_year" => $request->this_year,
            "start_date" => $request->start_date,
            "end_date" => $request->end_date,
        ];
        $data = $this->adminRepo->getSalesSummaryData($filters);
        return response()->json(new SalesSummaryResource($data));
    }

    public function orderGrowthData(Request $request)
    {
        $filters = [
            'store_type' => $request->store_type
        ];
        $data = $this->adminRepo->getOrderGrowthData($filters);
        return response()->json(new OrderGrowthSummaryResource($data));
    }

    public function otherSummaryData(Request $request)
    {
        $filters = [
            'store_type' => $request->store_type
        ];
        $data = $this->adminRepo->getOtherSummaryData($filters);
        return response()->json(new AdminOtherSummaryResource((object)$data));
    }
}
