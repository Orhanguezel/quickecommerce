<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Magaza-marka yetkili satici kaydi. brand_id NULL = magazanin tamami yetkili.
 * Kayitlari yalniz admin olusturur; approved_at olmayan kayit rozet vermez.
 */
class StoreBrandAuthorization extends Model
{
    protected $fillable = [
        'store_id',
        'brand_id',
        'evidence',
        'valid_from',
        'valid_to',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
        'approved_at' => 'datetime',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(ProductBrand::class, 'brand_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        $today = now()->toDateString();

        return $query
            ->whereNotNull('approved_at')
            ->where(fn (Builder $q) => $q->whereNull('valid_from')->orWhereDate('valid_from', '<=', $today))
            ->where(fn (Builder $q) => $q->whereNull('valid_to')->orWhereDate('valid_to', '>=', $today));
    }

    /**
     * Urun icin gecerli yetki: once markaya ozel, yoksa magaza geneli kayit.
     */
    public static function activeForProduct(?int $storeId, ?int $brandId): ?self
    {
        if (! $storeId) {
            return null;
        }

        return static::query()
            ->active()
            ->with('brand:id,brand_name')
            ->where('store_id', $storeId)
            ->where(fn (Builder $q) => $q->whereNull('brand_id')
                ->when($brandId, fn (Builder $q2) => $q2->orWhere('brand_id', $brandId)))
            ->orderByRaw('brand_id IS NULL')
            ->first();
    }

    public function isActive(): bool
    {
        $today = now()->startOfDay();

        return $this->approved_at !== null
            && ($this->valid_from === null || $this->valid_from->lte($today))
            && ($this->valid_to === null || $this->valid_to->gte($today));
    }

    public function toBadge(): array
    {
        return [
            'scope' => $this->brand_id ? 'brand' : 'store',
            'brand_name' => $this->brand?->brand_name,
            'valid_to' => $this->valid_to?->toDateString(),
        ];
    }
}
