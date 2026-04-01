<?php

namespace App\Http\Resources\User;

use App\Actions\ImageModifier;
use App\Models\SellerApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'name' => $this->full_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'image' => $this->image,
            'image_url' => ImageModifier::generateImageUrl($this->image),
            'logo' => ImageModifier::generateImageUrl($this->image),
            'status' => $this->status,
            'is_available' => (bool)$this->is_available,
            'email_verified' => $this->email_verified,
            'account_status' => $this->deactivated_at ? 'deactivated' : 'active',
            'marketing_email' => (bool)$this->marketing_email,
            'started_at' => $this->created_at->format('F d, Y'),
            'role' => $this->getRoleNames()->first(),
            'roles' => $this->getRoleNames(),
            // KYC / company info from seller_applications
            ...self::kycFields($this->id),
        ];
    }

    private static function kycFields(int $userId): array
    {
        $app = SellerApplication::where('user_id', $userId)->latest()->first();
        return [
            'kyc_status'          => $app?->status,
            'kyc_admin_note'      => $app?->admin_note,
            'company_name'        => $app?->company_name,
            'brand_name'          => $app?->brand_name,
            'sector'              => $app?->sector,
            'tax_office'          => $app?->tax_office,
            'tax_number'          => $app?->tax_number,
            'mersis_number'       => $app?->mersis_number,
            'website_url'         => $app?->website_url,
            'address_country'     => $app?->address_country,
            'address_city'        => $app?->address_city,
            'address_district'    => $app?->address_district,
            'address_postal_code' => $app?->address_postal_code,
            'address_line1'       => $app?->address_line1,
            'address_line2'       => $app?->address_line2,
            'bank_name'           => $app?->bank_name,
            'bank_account_holder' => $app?->bank_account_holder,
            'bank_iban'           => $app?->bank_iban,
            'bank_account_number' => $app?->bank_account_number,
            'bank_branch_code'    => $app?->bank_branch_code,
            'bank_swift_code'     => $app?->bank_swift_code,
        ];
    }

}
