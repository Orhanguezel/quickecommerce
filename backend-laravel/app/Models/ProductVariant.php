<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;


class ProductVariant extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];
    protected $fillable = [
        'product_id',
        'variant_slug',
        'sku',
        'price',
        'price_input_currency_code',
        'price_input_amount',
        'pack_quantity',
        'weight_major',
        'weight_gross',
        'weight_net',
        "attributes",
        'special_price',
        'special_price_input_currency_code',
        'special_price_input_amount',
        'stock_quantity',
        'unit_id',
        'length',
        'width',
        'height',
        'image',
        'order_count',
        'status',
    ];

    protected $casts = [
        'pack_quantity' => 'decimal:2',
        'weight_major' => 'decimal:2',
        'weight_gross' => 'decimal:2',
        'weight_net' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id");
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, "unit_id");
    }

    public function stockStatus($threshold = 10)
    {
        if ($this->stock_quantity > 0 && $this->stock_quantity < $threshold) {
            return 'low_stock';
        } elseif ($this->stock_quantity === 0) {
            return 'out_of_stock';
        } else {
            return 'in_stock';
        }
    }

    public function effectivePrice(): float
    {
        $price = (float) ($this->price ?? 0);
        $specialPrice = (float) ($this->special_price ?? 0);

        if ($specialPrice > 0 && ($price <= 0 || $specialPrice < $price)) {
            return $specialPrice;
        }

        return $price;
    }

    public function isPubliclySellable(): bool
    {
        return (int) ($this->status ?? 1) === 1
            && (int) ($this->stock_quantity ?? 0) > 0
            && $this->effectivePrice() > 0;
    }

    public function scopePubliclySellable(Builder $query): Builder
    {
        $table = $this->getTable();

        return $query
            ->where($table . '.status', 1)
            ->where($table . '.stock_quantity', '>', 0)
            ->where(function (Builder $sellable) use ($table) {
                $sellable
                    ->where($table . '.price', '>', 0)
                    ->orWhere($table . '.special_price', '>', 0);
            });
    }
}
