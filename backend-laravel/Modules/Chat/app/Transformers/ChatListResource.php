<?php

namespace Modules\Chat\app\Transformers;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $resolvedUser = $this->resolveUser();

        return [
            'chat_id'         => $this->id,
            'user_id'    => $this->resolveUserId($resolvedUser),
            'user_type'    => $this->user_type,
            'sender_id'    => $this->getSenderId(),
            'user' => new UserInfoForChatResource($resolvedUser, $this->user_type),
        ];
    }

    protected function resolveUser()
    {
        if (!empty($this->user)) {
            return $this->user;
        }

        if ($this->user_type === 'store') {
            return Store::query()
                ->select(['id', 'name', 'phone', 'email', 'logo', 'online_at'])
                ->where('store_seller_id', $this->user_id)
                ->first();
        }

        return null;
    }

    protected function resolveUserId($resolvedUser): int|string|null
    {
        if ($this->user_type === 'store' && !empty($resolvedUser?->id)) {
            return $resolvedUser->id;
        }

        return $this->user_id;
    }

    protected function getSenderId(): ?int
    {
        if (auth('api')->check()) {
            return auth('api')->id();
        }

        if (auth('api_customer')->check()) {
            return auth('api_customer')->id();
        }

        return null;
    }
}
