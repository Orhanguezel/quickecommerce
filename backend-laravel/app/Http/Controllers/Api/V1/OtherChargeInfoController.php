<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\DeliveryChargeHelper;
use App\Http\Resources\Admin\OtherChargeInfoResource;
use App\Http\Resources\Order\StoreTaxInfoResource;
use App\Models\Store;
use App\Models\SystemCommission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OtherChargeInfoController extends Controller
{
    public function otherChargeInformation(){
        $data = SystemCommission::first();
        if (is_null($data) || $data->order_additional_charge_enable_disable === false) {
            return response()->json([
                'success' => false,
                'tax_info' => 'no additional charge'
            ]);
        }

        return response()->json([
            'success' => true,
            'tax_info' => new OtherChargeInfoResource($data)
        ]);
    }

    public function checkoutInfo(Request $request)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'area_id' => 'required|integer',
            'customer_latitude' => 'required|numeric',
            'customer_longitude' => 'required|numeric',
            'store_ids' => 'required|array',
            'store_ids.*' => 'integer|exists:stores,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Handle delivery charge calculation
        $areaId = $request->input('area_id');
        $customerLat = $request->input('customer_latitude');
        $customerLng = $request->input('customer_longitude');
        $deliveryCharge = DeliveryChargeHelper::calculateDeliveryCharge($areaId, $customerLat, $customerLng);

        // Handle tax info
        $storeIds = array_unique($request->input('store_ids'));
        $taxInfo = Store::whereIn('id', $storeIds)->select('id', 'tax')->get();

        // Handle other charges
        $otherCharges = SystemCommission::first();
        $otherChargeInfo = ($otherCharges && $otherCharges->order_additional_charge_enable_disable)
            ? new OtherChargeInfoResource($otherCharges)
            : 'no additional charge';

        return response()->json([
            'success' => true,
            'delivery_charge' => $deliveryCharge,
            'tax_info' => StoreTaxInfoResource::collection($taxInfo),
            'other_charge_info' => $otherChargeInfo
        ]);
    }


}
