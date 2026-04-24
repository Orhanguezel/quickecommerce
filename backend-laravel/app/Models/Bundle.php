<?php

namespace App\Models;

use App\Actions\ImageModifier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bundle extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'original_price',
        'bundle_price',
        'currency_code',
        'created_by',
        'status',
        'sort_order',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'original_price' => 'decimal:2',
        'bundle_price'   => 'decimal:2',
        'starts_at'      => 'datetime',
        'ends_at'        => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(BundleItem::class);
    }

    public function isActiveNow(): bool
    {
        if ((int) $this->status !== 1) return false;
        $now = now();
        if ($this->starts_at && $now->lt($this->starts_at)) return false;
        if ($this->ends_at && $now->gt($this->ends_at)) return false;
        return true;
    }

    public function getImageUrlAttribute(): ?string
    {
        return ImageModifier::generateImageUrl($this->image);
    }

    /**
     * Percentage saved vs. sum of standalone prices.
     * Returns 0 when original ≤ bundle (shouldn't happen but defensive).
     */
    public function discountPercent(): int
    {
        $o = (float) $this->original_price;
        $b = (float) $this->bundle_price;
        if ($o <= 0 || $b >= $o) return 0;
        return (int) round((($o - $b) / $o) * 100);
    }
}
