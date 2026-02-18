<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PlaceOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [

            // Guest Checkout Validation
            'guest_info' => 'nullable|array',
            'guest_info.guest_order' => 'required_with:guest_info|boolean',

            // Apply validation only if 'guest_order' is true
            'guest_info.name' => 'required_if:guest_info.guest_order,true|string|max:255',
            'guest_info.email' => 'required_if:guest_info.guest_order,true|email|max:255|unique:customers,email',
            'guest_info.phone' => 'required_if:guest_info.guest_order,true|string|regex:/^(\+?\d{1,3})?\d{7,15}$/|unique:customers,phone',
            'guest_info.password' => 'required_if:guest_info.guest_order,true|string|min:6|max:32',

            'customer_latitude' => 'nullable',
            'customer_longitude' => 'nullable',

            // Shipping Address Validation (required only for logged-in users)
            'shipping_address_id' => 'nullable|exists:customer_addresses,id',

            // takeaway
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'contact_number' => 'nullable|max:255',

            'currency_code' => 'required|string|max:3',   // ISO codes are 3 letters
            'shipping_time_preferred' => 'nullable|string|max:255',
            'payment_gateway' => 'required|string|in:cash_on_delivery,iyzico,wallet',
            'order_notes' => 'nullable|string|max:500',
            'order_amount' => 'nullable|numeric|min:0',
            'coupon_code' => 'nullable|string|max:50',
            'coupon_title' => 'nullable|string|max:255',
            'coupon_discount_amount_admin' => 'nullable|numeric|min:0',
            'product_discount_amount' => 'nullable|numeric|min:0',
            'flash_discount_amount_admin' => 'nullable|numeric|min:0',
            'shipping_charge' => 'nullable|numeric|min:0',
            'additional_charge_name' => 'nullable|string',
            'additional_charge_amount' => 'nullable|numeric|min:0',
            // packages
            'packages' => 'required|array',
            'packages.*.delivery_option' => 'required|in:home_delivery,parcel,takeaway',
            'packages.*.delivery_type' => 'nullable|in:standard,express,freight',
            'packages.*.delivery_time' => 'nullable',
            'packages.*.coupon_discount_amount_admin' => 'nullable|numeric',
            'packages.*.product_discount_amount' => 'nullable|numeric',
            'packages.*.flash_discount_amount_admin' => 'nullable|numeric',
            'packages.*.shipping_charge' => 'nullable|numeric',
            'packages.*.additional_charge' => 'nullable|numeric',

            // items
            'packages.*.items' => 'required|array',
            'packages.*.items.*.product_id' => 'required|exists:products,id',
            'packages.*.items.*.product_campaign_id' => 'nullable|numeric',
            // product variant
            'packages.*.items.*.variant_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    $productId = request()->input(str_replace('.variant_id', '.product_id', $attribute));
                    $variantExists = \App\Models\ProductVariant::where('id', $value)->where('product_id', $productId)->exists();
                    if (!$variantExists) {
                        $fail("The selected variant does not belong to the given product.");
                    }
                }
            ],
            'packages.*.store_id' => [
                'required',
                'integer',
                'exists:stores,id',
                function ($attribute, $value, $fail) {
                    $storeKey = str_replace('.store_id', '.items.*.product_id', $attribute);
                    $productIds = request()->input($storeKey, []);
                    // Check if all products in the package belong to the given store
                    $productExists = \App\Models\Product::whereIn('id', $productIds)
                        ->where('store_id', $value)
                        ->exists();
                    if (!$productExists) {
                        $fail("Invalid product for store.");
                    }
                }
            ],

            // discount store
            'packages.*.items.*.admin_discount_type' => 'nullable',
            'packages.*.items.*.admin_discount_rate' => 'nullable|numeric',
            'packages.*.items.*.admin_discount_amount' => 'nullable|numeric',
            // tax
            'packages.*.items.*.tax_rate' => 'nullable',
            'packages.*.items.*.tax_amount' => 'nullable|numeric',
            // qty and price
            'packages.*.items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    // Extract the variant_id path from this attribute
                    $variantAttribute = str_replace('.quantity', '.variant_id', $attribute);
                    $variantId = data_get(request()->all(), $variantAttribute);

                    if ($variantId) {
                        $variant = \App\Models\ProductVariant::find($variantId);

                        if (!$variant) {
                            return $fail("Invalid variant.");
                        }

                        if ($variant->stock_quantity < $value) {
                            return $fail("Only {$variant->stock_quantity} units available for this variant.");
                        }
                    }
                }
            ],
            'packages.*.items.*.line_total_price' => 'nullable|numeric',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        // the error response
        $errors = $validator->errors()->getMessages();
        // the response structure
        $response = [
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ];
        throw new HttpResponseException(response()->json($response, 422));
    }

    public function messages(): array
    {
        return [
            'payment_gateway.required' => __('messages.order_payment_gateway_required'),
            'payment_gateway.in' => __('messages.order_payment_gateway_not_supported'),
        ];
    }
}
