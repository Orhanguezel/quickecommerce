<?php

namespace Tests\Feature;

use App\Services\Order\CouponCombinationPolicy;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CouponCombinationPolicyTest extends TestCase
{
    public function test_active_flash_sale_blocks_coupon_for_entire_cart(): void
    {
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');

        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->integer('status');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->integer('purchase_limit');
        });
        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('flash_sale_id');
        });
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->decimal('price', 12, 2);
            $table->decimal('special_price', 12, 2)->nullable();
            $table->integer('stock_quantity');
            $table->integer('status');
            $table->softDeletes();
        });

        DB::table('flash_sales')->insert([
            ['id' => 1, 'status' => 1, 'start_time' => now()->subHour(), 'end_time' => now()->addHour(), 'purchase_limit' => 3],
            ['id' => 2, 'status' => 1, 'start_time' => now()->subDays(2), 'end_time' => now()->subDay(), 'purchase_limit' => 3],
            ['id' => 3, 'status' => 1, 'start_time' => now()->subHour(), 'end_time' => now()->addHour(), 'purchase_limit' => 0],
        ]);
        DB::table('flash_sale_products')->insert([
            ['product_id' => 10, 'flash_sale_id' => 1],
            ['product_id' => 20, 'flash_sale_id' => 2],
            ['product_id' => 30, 'flash_sale_id' => 3],
        ]);
        DB::table('product_variants')->insert([
            'id' => 100,
            'product_id' => 40,
            'price' => 100,
            'special_price' => 90,
            'stock_quantity' => 2,
            'status' => 1,
        ]);

        $policy = new CouponCombinationPolicy();
        $cart = fn (array $ids) => [['items' => array_map(fn ($id) => ['product_id' => $id], $ids)]];

        $this->assertTrue($policy->hasExistingDiscount($cart([10])));
        $this->assertTrue($policy->hasExistingDiscount($cart([40, 10])));
        $this->assertFalse($policy->hasExistingDiscount($cart([20, 30, 40])));
        $this->assertTrue($policy->hasExistingDiscount([['items' => [
            ['product_id' => 40, 'variant_id' => 100],
        ]]]));
        $this->assertSame(180.0, $policy->cartSubtotal([['items' => [
            ['product_id' => 40, 'variant_id' => 100, 'quantity' => 2],
        ]]]));
    }
}
