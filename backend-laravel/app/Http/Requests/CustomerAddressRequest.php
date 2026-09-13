<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class CustomerAddressRequest extends FormRequest
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

            'title' => 'nullable|string|max:255',
            'type' => 'required|in:home,office,others',
            'email' => 'required|string|max:255|email',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'area_id' => 'nullable|exists:store_areas,id',
            'city_name' => 'required|string|max:100',
            'district_name' => 'required|string|max:100',
            'road' => 'nullable|string|max:255',
            'house' => 'nullable|string|max:255',
            'floor' => 'nullable|string|max:255',
            // Bazi Google Places sonuclari bosluk/bolge eki iceren uluslararasi
            // posta kodu dondurebiliyor. DB alani 255; makul bir 32 karakter
            // siniri checkout'un gereksiz yere 422 olmasini engeller.
            'postal_code' => 'nullable|string|max:32',
            'is_default' => 'boolean',
            'status' => 'required|integer|in:0,1'
        ];
    }

    public function messages(): array
    {
        return [
            'title.string' => __('validation.string', ['attribute' => 'Title']),
            'title.max' => __('validation.max.string', ['attribute' => 'Title']),
            'type.required' => __('validation.required', ['attribute' => 'Type']),
            'type.in' => __('validation.in', ['attribute' => 'Type']),
            'email.required' => __('validation.required', ['attribute' => 'Email']),
            'contact_number.required' => __('validation.required', ['attribute' => 'Contact Number']),
            'contact_number.string' => __('validation.string', ['attribute' => 'Contact Number']),
            'contact_number.max' => __('validation.max.string', ['attribute' => 'Contact Number']),
            'address.required' => __('validation.required', ['attribute' => 'Address']),
            'address.string' => __('validation.string', ['attribute' => 'Address']),
            'address.max' => __('validation.max.string', ['attribute' => 'Address']),
            'latitude.regex' => __('validation.regex', ['attribute' => 'Latitude']),
            'longitude.regex' => __('validation.regex', ['attribute' => 'Longitude']),
            'area_id.exists' => __('validation.exists', ['attribute' => 'Area']),
            'city_name.required' => __('validation.required', ['attribute' => 'City']),
            'district_name.required' => __('validation.required', ['attribute' => 'District']),
            'road.string' => __('validation.string', ['attribute' => 'Road']),
            'road.max' => __('validation.max.string', ['attribute' => 'Road']),
            'house.string' => __('validation.string', ['attribute' => 'House']),
            'house.max' => __('validation.max.string', ['attribute' => 'House']),
            'floor.string' => __('validation.string', ['attribute' => 'Floor']),
            'floor.max' => __('validation.max.string', ['attribute' => 'Floor']),
            'postal_code.string' => __('validation.string', ['attribute' => 'Postal Code']),
            'postal_code.max' => __('validation.max.string', ['attribute' => 'Postal Code']),
            'is_default.boolean' => __('validation.boolean', ['attribute' => 'Default Status']),
            'status.required' => __('validation.required', ['attribute' => 'Status']),
            'status.integer' => __('validation.integer', ['attribute' => 'Status']),
            'status.in' => __('validation.in', ['attribute' => 'Status']),
        ];
    }


    public function failedValidation(Validator $validator)
    {
        Log::warning('[checkout-address] adres dogrulamasi basarisiz', [
            'customer_id' => auth('api_customer')->id(),
            'route' => optional($this->route())->getName(),
            // Kisisel adres verisini loglama; yalnizca hatali alan adlari.
            'fields' => array_keys($validator->errors()->toArray()),
        ]);

        throw new HttpResponseException(response()->json(['message' => $validator->errors()], 422));
    }
}
