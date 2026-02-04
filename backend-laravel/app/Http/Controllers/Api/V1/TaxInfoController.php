<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Order\StoreTaxInfoResource;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaxInfoController extends Controller
{
    public function storeTaxInformation(Request $request){
        $store_ids = array_unique($request->store_ids);
        $validator = Validator::make($request->all(), [
            'store_ids' => 'required|array',
            'store_ids.*' => 'integer|exists:stores,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'messages' => $validator->errors(),
            ], 422);
        }

        $data = Store::whereIn('id', $store_ids)
            ->select('id', 'tax','store_type')
            ->get();

        return response()->json([
           'success' => true,
            'tax_info' => StoreTaxInfoResource::collection($data)
        ]);
    }
}
