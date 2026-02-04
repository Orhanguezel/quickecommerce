<?php

namespace App\Http\Resources\Seller;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "first_name" => $this->first_name,
            "last_name" => $this->last_name,
            "slug" => $this->slug,
            "phone" => $this->phone,
            "email" => $this->email,
            "activity_scope" => $this->activity_scope,
            "email_verify_token" => $this->email_verify_token,
            "email_verified" => (bool)$this->email_verified,
            "email_verified_at" => $this->email_verified_at,
            "password_changed_at" => $this->password_changed_at,
            "image" => ImageModifier::generateImageUrl($this->image),
            "def_lang" => $this->def_lang,
            "firebase_token" => $this->firebase_token,
            "google_id" => $this->google_id,
            "facebook_id" => $this->facebook_id,
            "apple_id" => $this->apple_id,
            "store_owner" => (bool)$this->store_owner,
            "store_seller_id" => $this->store_seller_id,
            "stores" => $this->stores,
            "status" => $this->getStatusText($this->status),
            "deleted_at" => $this->deleted_at,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at
        ];
    }

    private function getStatusText($status)
    {
        switch ($status) {
            case 0:
                return 'Inactive';
            case 1:
                return 'Active';
            case 2:
                return 'Suspended';
            default:
                return 'Unknown'; // Fallback for unexpected status
        }
    }
}
