<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\OrderMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderPaymentController extends Controller
{
    public function orderPaymentStatusUpdate(Request $request)
    {
        // Check if the user is authenticated
        $user = Auth::guard('api_customer')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized'
            ], 401);
        }


        // Validate the required inputs using Validator::make
        $validated = Validator::make($request->all(), [
            'order_id' => 'required|integer',
            'transaction_ref' => 'nullable|string|max:255',
            'transaction_details' => 'nullable|string|max:1000',
        ]);

        // Check if validation fails
        if ($validated->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validated->errors(),
            ], 400);
        }

        // Find the order
        $orderMaster = OrderMaster::where('id', $request->order_id)->first();

        // Check if the subscription history exists
        if (empty($orderMaster)) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Update the subscription history
        $orderMaster->update([
            'payment_status' => 'paid',
            'transaction_ref' => $request->transaction_ref ?? null,
            'transaction_details' => $request->transaction_details ?? null,
            'status' => 1,
        ]);

        // Update each order individually
        DB::transaction(function() use ($orderMaster) {
            foreach ($orderMaster->orders as $order) {
                $order->payment_status = 'paid';
                $order->save();
            }
        });

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully',
        ]);
    }
}
