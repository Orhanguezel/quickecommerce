<?php

namespace App\Http\Resources;

use App\Actions\ImageModifier;
use App\Helpers\ComHelper;
use App\Models\Store;
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

        $stores=[];
        if($this->stores!='') {
            $stores = Store::whereIn('id', $this->stores)
                ->select(['id', 'name','store_type'])
                ->get()
                ->toArray();
        }

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'image' => $this->image,
            'image_url' => ImageModifier::generateImageUrl($this->image),
            'activity_scope' => $this->activity_scope,
            'email_verified_at' => $this->email_verified_at,
            "store_owner" => $this->store_owner,
            "store_seller_id" => $this->store_seller_id,
            "stores" => $stores,
            'roles' => $this->roles->pluck('name'),
        ];
    }
}
