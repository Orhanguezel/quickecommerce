<?php

namespace App\Http\Resources\Seller;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'full_name' => $this->user->full_name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ],
            'company_name' => $this->company_name,
            'brand_name' => $this->brand_name,
            'sector' => $this->sector,
            'tax_office' => $this->tax_office,
            'tax_number' => $this->tax_number,
            'mersis_number' => $this->mersis_number,
            'website_url' => $this->website_url,
            'address' => [
                'country' => $this->address_country,
                'city' => $this->address_city,
                'district' => $this->address_district,
                'postal_code' => $this->address_postal_code,
                'address_line1' => $this->address_line1,
                'address_line2' => $this->address_line2,
            ],
            'bank' => [
                'bank_name' => $this->bank_name,
                'account_holder' => $this->bank_account_holder,
                'iban' => $this->bank_iban,
                'account_number' => $this->bank_account_number,
                'branch_code' => $this->bank_branch_code,
                'swift_code' => $this->bank_swift_code,
            ],
            'note' => $this->note,
            'status' => $this->status,
            'admin_note' => $this->admin_note,
            'reviewed_by' => $this->reviewed_by,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
