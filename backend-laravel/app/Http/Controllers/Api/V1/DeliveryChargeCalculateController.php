<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\DeliveryChargeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryChargeCalculateController extends Controller
{
    public function calculateDeliveryCharge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'area_ids' => 'required|array',
            'area_ids.*' => 'integer|distinct',
            'customer_latitude' => 'required|numeric',
            'customer_longitude' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }
        $areaIds = $request->input('area_ids'); // Correct for POST method
        $customerLat = $request->input('customer_latitude');
        $customerLng = $request->input('customer_longitude');

        $results = [];

        foreach ($areaIds as $areaId) {
            try {
                $charge = DeliveryChargeHelper::calculateDeliveryCharge($areaId, $customerLat, $customerLng);

                $results[] = [
                    'area_id' => $areaId,
                    'delivery_charge' => $charge,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'area_id' => $areaId,
                    'error' => $e->getMessage(),
                ];
            }
        }
        return response()->json($results);
    }
}
