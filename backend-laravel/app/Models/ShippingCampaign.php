<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'background_color',
        'title_color',
        'description_color',
        'button_text',
        'button_text_color',
        'button_bg_color',
        'button_url',
        'min_order_value',
        'status',
    ];

    protected $casts = [
        'min_order_value' => 'float',
        'status'          => 'boolean',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }
        return asset('storage/' . $this->image);
    }
}
