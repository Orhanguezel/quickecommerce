<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class NoticeRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'message' => 'nullable|string',
            'type' => 'nullable|in:general,specific_store,specific_seller', // Fix enum rule
            'priority' => 'nullable|in:low,medium,high', // Fix enum rule
            'active_date' => 'nullable|date|date_format:Y-m-d',
            'expire_date' => 'nullable|date|date_format:Y-m-d|after_or_equal:active_date', // Ensure after_or_equal rule works
            'store_id' => 'nullable|exists:stores,id',
            'seller_id' => 'nullable|exists:users,id',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => __('validation.required', ['attribute' => 'Title']),
            'title.string' => __('validation.string', ['attribute' => 'Title']),
            'title.max' => __('validation.max.string', ['attribute' => 'Title']),
            'message.string' => __('validation.string', ['attribute' => 'Message']),
            'type.in' => __('validation.in', ['attribute' => 'Type', 'enum' => 'general,specific_store,specific_seller']), // Fix enum message
            'priority.in' => __('validation.in', ['attribute' => 'Priority', 'enum' => 'low,medium,high']), // Fix enum message
            'active_date.date' => __('validation.date', ['attribute' => 'Active Date']),
            'active_date.date_format' => __('validation.date_format', ['attribute' => 'Active Date', 'format' => 'Y-m-d']),
            'expire_date.date' => __('validation.date', ['attribute' => 'Expire Date']),
            'expire_date.date_format' => __('validation.date_format', ['attribute' => 'Expire Date', 'format' => 'Y-m-d']),
            'expire_date.after_or_equal' => __('validation.after_or_equal', ['attribute' => 'Expire Date']), // Fixed message for after_or_equal
            'store_id.exists' => __('validation.exists', ['attribute' => 'Store ID']),
            'seller_id.exists' => __('validation.exists', ['attribute' => 'Seller ID']),
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
