<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\SystemCommission;
use Illuminate\Http\Request;

class AdminCommissionManageController extends Controller
{
    public function commissionSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            // Validate input
            $validatedData = $request->validate([
                'subscription_enabled' => 'nullable|boolean',
                'commission_enabled' => 'nullable|boolean',
                'commission_type' => 'nullable|in:fixed,percentage',
                'commission_amount' => 'nullable|numeric|min:0',
                'default_order_commission_rate' => 'nullable|numeric|min:0',
                'default_delivery_commission_charge' => 'nullable|numeric|min:0',
                'order_shipping_charge' => 'nullable|numeric|min:0',
                'free_shipping_min_order_value' => 'nullable|numeric|min:0',
                'order_confirmation_by' => 'nullable|string|max:255',
                'order_include_tax_amount' => 'nullable|boolean',
                'order_additional_charge_enable_disable' => 'nullable|boolean',
                'order_additional_charge_name' => 'nullable',
                'order_additional_charge_amount' => 'nullable|numeric|min:0',
                'order_additional_charge_commission' => 'nullable|numeric|min:0',
            ]);

            // Check if both subscription and commission are disabled
            if (
                isset($validatedData['subscription_enabled']) && $validatedData['subscription_enabled'] === false &&
                isset($validatedData['commission_enabled']) && $validatedData['commission_enabled'] === false
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'At least one option must be enabled.',
                ], 400);
            }

            $commission_type = $request->get('commission_type');
            $commission_amount = $request->get('commission_amount');
            $shouldRound = shouldRound();
            if ($shouldRound && $commission_type === 'fixed' && is_float($commission_amount)) {
                return response()->json([
                    'message' => __('messages.should_round', ['name' => 'Commission']),
                ]);
            }

            // Update or create settings
            $systemCommission = SystemCommission::first();
            if (!$systemCommission) {
                $systemCommission = new SystemCommission();
            }

            $systemCommission->fill($validatedData);
            $systemCommission->save();

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Commission settings Updated Successfully',
            ]);
        }

        // Handle GET request: Retrieve existing settings
        $response = SystemCommission::first();
        if (!$response) {
            return response()->json([
                'success' => false,
                'message' => 'Commission settings not found',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $response,
        ]);
    }


}
