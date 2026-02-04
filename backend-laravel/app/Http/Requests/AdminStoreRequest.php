<?php

namespace App\Http\Requests;

use App\Enums\StoreType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class AdminStoreRequest extends FormRequest
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
            'subscription_type' => 'nullable|string|max:50',
            'subscription_id' => 'nullable|exists:subscriptions,id',
            'payment_gateway' => 'payment_gateway',
            'area_id' => 'nullable|exists:store_areas,id',
            'store_seller_id' => 'nullable|exists:store_sellers,user_id',
            'store_type' => 'required|in:' . $this->getEnumValues(StoreType::class),
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:stores,slug,' . $this->id,
            'phone' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|string|max:255',
            'banner' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'tax' => 'required|numeric|min:0',
            'tax_number' => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'delivery_charge' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|string|max:50',
            'delivery_self_system' => 'nullable|boolean',
            'delivery_take_away' => 'nullable|boolean',
            'order_minimum' => 'nullable|integer|min:0',
            'veg_status' => 'nullable|in:0,1',
            'off_day' => 'nullable|string|max:50',
            'enable_saling' => 'nullable|in:0,1',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_image' => 'nullable|string|max:255',
            'status' => 'nullable|in:0,1,2',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'subscription_id.exists' => 'The selected subscription id does not exist.',
            'area_id.exists' => 'The selected area does not exist.',
            'store_seller_id.exists' => 'The selected seller does not exist.',
            'store_type.required' => 'Store type is required.',
            'store_type.in' => 'The store type must be one of the following: ' . $this->getEnumValues(StoreType::class),
            'name.required' => 'The name field is required.',
            'name.max' => 'The name may not be greater than 255 characters.',
            'slug.required' => 'The slug field is required.',
            'slug.unique' => 'The slug has already been taken.',
            'phone.max' => 'The phone number may not be greater than 15 characters.',
            'email.email' => 'The email must be a valid email address.',
            'latitude.numeric' => 'The latitude must be a number.',
            'latitude.between' => 'The latitude must be between -90 and 90.',
            'longitude.numeric' => 'The longitude must be a number.',
            'longitude.between' => 'The longitude must be between -180 and 180.',
            'opening_time.date_format' => 'The opening time must be in the format HH:mm.',
            'closing_time.date_format' => 'The closing time must be in the format HH:mm.',
            'status.in' => 'The status must be 0 (Pending), 1 (Active), or 2 (Inactive).',
        ];
    }

    private function getEnumValues(string $enumClass): string
    {
        return implode(',', array_map(fn($case) => $case->value, $enumClass::cases()));

    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
