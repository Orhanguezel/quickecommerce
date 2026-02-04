<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTypeRequest extends FormRequest
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
            'id' => 'required|exists:store_types,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|integer',
            'status' => 'nullable|in:0,1',

            'additional_charge_enable_disable' => 'nullable',
            'additional_charge_name' => 'nullable|string|max:255',
            'additional_charge_amount' => 'nullable|integer|min:0',
            'additional_charge_type' => 'nullable|in:fixed,percentage',
            'additional_charge_commission' => 'nullable',
        ];
    }

    public function messages()
    {
        return [
            'id.required' => __('validation.required', ['attribute' => 'ID']),
            'id.exists' => __('validation.exists', ['attribute' => 'ID']),

            'name.required' => __('validation.required', ['attribute' => 'Name']),
            'name.string' => __('validation.string', ['attribute' => 'Name']),
            'name.max' => __('validation.max.string', ['attribute' => 'Name', 'max' => '255']),

            'description.max' => __('validation.max.string', ['attribute' => 'Description', 'max' => '1000']),
            'description.string' => __('validation.string', ['attribute' => 'Description']),

            'image.integer' => __('validation.integer', ['attribute' => 'Image']),

            'additional_charge_name.string' => __('validation.string', ['attribute' => 'Additional Charge Name']),
            'additional_charge_name.max' => __('validation.max.string', ['attribute' => 'Additional Charge Name', 'max' => '255']),
            'additional_charge_amount.min' =>__('validation.min.integer', ['attribute' => 'Additional Charge Amount', 'min' => 0]),
            'additional_charge_type.in' => __('validation.in', ['attribute' => 'Fixed or Percentage']),

            'status.integer' => __('validation.integer', ['attribute' => 'Status']),
            'status.in' => __('validation.in', ['attribute' => 'Status']),
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
