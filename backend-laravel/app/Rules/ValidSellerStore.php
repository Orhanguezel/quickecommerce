<?php

namespace App\Rules;

use App\Models\Store;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidSellerStore implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Fetch the store IDs associated with the authenticated seller
        $auth_seller_stores_ids = Store::where('store_seller_id', auth()->guard('api')->user()->id)
            ->pluck('id')
            ->toArray();

        // If the value is not in the list of seller's store IDs, fail the validation
        if (!in_array($value, $auth_seller_stores_ids)) {
            $fail('The selected store is not valid for the authenticated seller.');
        }
    }
}
