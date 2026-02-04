<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Translation\NoticeTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNoticeDetailsResource extends JsonResource
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
            "title" => $this->title,
            "message" => $this->message,
            "type" => $this->type,
            "priority" => $this->priority,
            "active_date" => $this->active_date,
            "expire_date" => $this->expire_date,
            "status" => $this->status,
            "created_at" => $this->created_at,
            "seller_id"=>$this->recipients?->seller_id,
            "store_id"=>$this->recipients?->store_id,
            "translations" => NoticeTranslationResource::collection($this->related_translations->groupBy('language')),
        ];
    }
}
