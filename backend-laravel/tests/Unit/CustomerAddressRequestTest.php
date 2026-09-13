<?php

namespace Tests\Unit;

use App\Http\Requests\CustomerAddressRequest;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CustomerAddressRequestTest extends TestCase
{
    #[Test]
    public function it_accepts_an_extended_postal_code_returned_by_address_providers(): void
    {
        $request = new CustomerAddressRequest();
        $validator = Validator::make([
            'type' => 'home',
            'email' => 'customer@example.com',
            'contact_number' => '5301234567',
            'address' => 'Örnek Mahallesi 1. Sokak No: 2',
            'city_name' => 'Antalya',
            'district_name' => 'Muratpaşa',
            'postal_code' => '07160 Muratpaşa',
            'is_default' => true,
            'status' => 1,
        ], $request->rules());

        $this->assertFalse($validator->fails(), $validator->errors()->toJson());
    }
}
