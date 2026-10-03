<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class ProductAuthorRequest extends FormRequest
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
            "name" => "required",
            "profile_image" => "nullable|integer|exists:media,id",
            "born_date" => "nullable|date_format:Y-m-d",
            "email" => "nullable|email|max:255",
            "title" => "nullable|string|max:255",
            "linkedin_url" => "nullable|url:http,https|max:255",
            "twitter_url" => "nullable|url:http,https|max:255",
            "facebook_url" => "nullable|url:http,https|max:255",
            "instagram_url" => "nullable|url:http,https|max:255",
            "website_url" => "nullable|url:http,https|max:255",
            "death_date"=> "nullable|date_format:Y-m-d",
        ];
    }
    public function messages()
    {
        return [
            "name.required" => "Name field is required!",
            "born_date.required" => "Born date field is required!",
            "born_date.date_format"=> "Incorrect date format!",
            "death_date.date_format"=> "Incorrect date format!",
        ];
    }
    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
