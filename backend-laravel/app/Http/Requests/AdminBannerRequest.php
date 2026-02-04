<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Validator;

class AdminBannerRequest extends FormRequest
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
            'theme_name' => 'required|in:theme_one,theme_two,default',
            'store_id' => 'nullable|exists:stores,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'background_image' => 'nullable',
            'thumbnail_image' => 'nullable',
            'button_text' => 'nullable|string|max:50',
            'button_color' => 'nullable|string|max:7',
            'redirect_url' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',

            // New fields
            'title_color' => 'nullable|string|max:7',
            'description_color' => 'nullable|string|max:7',
            'background_color' => 'nullable|string|max:7',
            'button_text_color' => 'nullable|string|max:7',
            'button_hover_color' => 'nullable|string|max:7',
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

            'background_image.string' => __('validation.string', ['attribute' => 'Background Image']),

            'thumbnail_image.string' => __('validation.string', ['attribute' => 'Thumbnail Image']),

            'button_text.string' => __('validation.string', ['attribute' => 'Button Text']),
            'button_text.max' => __('validation.max', ['attribute' => 'Button Text']),

            'button_color.string' => __('validation.string', ['attribute' => 'Button Color']),
            'button_color.max' => __('validation.max', ['attribute' => 'Button Color']),

            'redirect_url.string' => __('validation.string', ['attribute' => 'Redirect URL']),
            'redirect_url.max' => __('validation.max', ['attribute' => 'Redirect URL']),

            'location.string' => __('validation.string', ['attribute' => 'Location']),
            'location.max' => __('validation.max', ['attribute' => 'Location']),

            'type.string' => __('validation.string', ['attribute' => 'Type']),
            'type.max' => __('validation.max', ['attribute' => 'Type']),

            // New fields validation messages
            'title_color.string' => __('validation.string', ['attribute' => 'Title Color']),
            'title_color.max' => __('validation.max', ['attribute' => 'Title Color']),

            'description_color.string' => __('validation.string', ['attribute' => 'Description Color']),
            'description_color.max' => __('validation.max', ['attribute' => 'Description Color']),

            'background_color.string' => __('validation.string', ['attribute' => 'Background Color']),
            'background_color.max' => __('validation.max', ['attribute' => 'Background Color']),

            'button_text_color.string' => __('validation.string', ['attribute' => 'Button Text Color']),
            'button_text_color.max' => __('validation.max', ['attribute' => 'Button Text Color']),

            'button_hover_color.string' => __('validation.string', ['attribute' => 'Button Hover Color']),
            'button_hover_color.max' => __('validation.max', ['attribute' => 'Button Hover Color']),
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
