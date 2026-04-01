<?php

namespace App\Http\Resources\Seller;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $application = $this->sellerApplication;
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'slug' => $this->slug,
            'phone' => $this->phone,
            'email' => $this->email,
            'activity_scope' => $this->activity_scope,
            'email_verified' => (bool)$this->email_verified,
            'image' => $this->image,
            'image_url' => ImageModifier::generateImageUrl($this->image),
            'def_lang' => $this->def_lang,
            'store_owner' => $this->store_owner,
            'stores' => $this->stores,
            'status' => $this->status,
            'full_name' => trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? '')),
            'role' => $this->activity_scope === 'store_level' ? 'seller' : ($this->activity_scope ?? 'seller'),
            'started_at' => $this->created_at ? $this->created_at->format('Y-m-d') : null,
            // KYC / company info from seller_applications
            'kyc_status' => $application ? $application->status : null,
            'kyc_admin_note' => $application ? $application->admin_note : null,
            'company_name' => $application ? $application->company_name : null,
            'brand_name' => $application ? $application->brand_name : null,
            'sector' => $application ? $application->sector : null,
            'tax_office' => $application ? $application->tax_office : null,
            'tax_number' => $application ? $application->tax_number : null,
            'mersis_number' => $application ? $application->mersis_number : null,
            'website_url' => $application ? $application->website_url : null,
            'address_country' => $application ? $application->address_country : null,
            'address_city' => $application ? $application->address_city : null,
            'address_district' => $application ? $application->address_district : null,
            'address_postal_code' => $application ? $application->address_postal_code : null,
            'address_line1' => $application ? $application->address_line1 : null,
            'address_line2' => $application ? $application->address_line2 : null,
            'bank_name' => $application ? $application->bank_name : null,
            'bank_account_holder' => $application ? $application->bank_account_holder : null,
            'bank_iban' => $application ? $application->bank_iban : null,
            'bank_account_number' => $application ? $application->bank_account_number : null,
            'bank_branch_code' => $application ? $application->bank_branch_code : null,
            'bank_swift_code' => $application ? $application->bank_swift_code : null,
        ];
    }
}
