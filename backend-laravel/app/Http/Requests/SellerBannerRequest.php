<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Validator;

class SellerBannerRequest extends FormRequest
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
            'store_id' => 'required|exists:stores,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'background_image' => 'nullable',
            'thumbnail_image' => 'nullable',
            'button_text' => 'nullable|string|max:50',
            'button_color' => 'nullable|string|max:15',
            'redirect_url' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'store_id.exists' => __('validation.exists', ['attribute' => 'Store ID']),
            'title.required' => __('validation.required', ['attribute' => 'Title']),
            'title.string' => __('validation.string', ['attribute' => 'Title']),
            'title.max' => __('validation.max', ['attribute' => 'Title']),
            'description.string' => __('validation.string', ['attribute' => 'Description']),
            'button_text.string' => __('validation.string', ['attribute' => 'Button Text']),
            'button_text.max' => __('validation.max', ['attribute' => 'Button Text']),
            'button_color.string' => __('validation.string', ['attribute' => 'Button Color']),
            'button_color.max' => __('validation.max', ['attribute' => 'Button Color']),
            'redirect_url.string' => __('validation.string', ['attribute' => 'Redirect URL']),
            'redirect_url.max' => __('validation.max', ['attribute' => 'Redirect URL']),
            'type.string' => __('validation.string', ['attribute' => 'Type']),
            'type.max' => __('validation.max', ['attribute' => 'Type']),
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
