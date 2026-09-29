<?php

namespace Tests\Unit;

use App\Models\FlashSale;
use App\Services\Product\ProductPriceResolver;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

/**
 * Vitrin, feed ve siparisin ayni birim fiyati kullandigini sabitler
 * (derin analiz 2026-09-29, Argivit 765/850 ayrismasi).
 */
class ProductPriceResolverTest extends TestCase
{
    private Carbon $now;

    protected function setUp(): void
    {
        parent::setUp();
        $this->now = Carbon::parse('2026-09-29 12:00:00');
    }

    private function flashSale(array $attrs = []): FlashSale
    {
        $sale = new FlashSale();
        $sale->forceFill(array_merge([
            'status' => 1,
            'discount_type' => 'percentage',
            'discount_amount' => 10,
            'purchase_limit' => 990,
            'start_time' => '2026-09-01 00:00:00',
            'end_time' => '2026-09-30 11:42:34',
        ], $attrs));

        return $sale;
    }

    public function test_normal_price(): void
    {
        $this->assertSame(850.0, ProductPriceResolver::finalPrice(850, 0, null, $this->now));
    }

    public function test_special_price_wins_over_price(): void
    {
        $this->assertSame(799.0, ProductPriceResolver::finalPrice(850, 799, null, $this->now));
    }

    public function test_active_percentage_flash_sale_argivit(): void
    {
        $this->assertSame(765.0, ProductPriceResolver::finalPrice(850, 0, $this->flashSale(), $this->now));
    }

    public function test_flash_sale_applies_on_top_of_special_price(): void
    {
        $this->assertSame(720.0, ProductPriceResolver::finalPrice(850, 800, $this->flashSale(), $this->now));
    }

    public function test_fixed_amount_flash_sale_never_goes_negative(): void
    {
        $sale = $this->flashSale(['discount_type' => 'amount', 'discount_amount' => 1000]);
        $this->assertSame(0.0, ProductPriceResolver::finalPrice(850, 0, $sale, $this->now));
    }

    public function test_expired_flash_sale_is_ignored(): void
    {
        $sale = $this->flashSale(['end_time' => '2026-09-28 23:59:59']);
        $this->assertSame(850.0, ProductPriceResolver::finalPrice(850, 0, $sale, $this->now));
    }

    public function test_not_started_inactive_or_exhausted_flash_sale_is_ignored(): void
    {
        foreach ([
            ['start_time' => '2026-10-01 00:00:00'],
            ['status' => 0],
            ['purchase_limit' => 0],
        ] as $attrs) {
            $this->assertSame(850.0, ProductPriceResolver::finalPrice(850, 0, $this->flashSale($attrs), $this->now));
        }
    }
}
