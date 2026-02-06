<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('coupons') || !Schema::hasTable('coupon_lines')) {
            $this->command->warn('CouponSeeder: coupons or coupon_lines table does not exist. Skipping...');
            return;
        }

        DB::table('coupon_lines')->delete();
        DB::table('coupons')->delete();

        $coupons = [];
        for ($i = 1; $i <= 20; $i++) {
            $coupons[] = [
                'title' => 'Coupon ' . $i,
                'description' => 'Description for Coupon ' . $i,
                'status' => 1,
                'created_by' => 8, // Assuming 5 admins exist
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('coupons')->insert($coupons);
        $couponRecords = DB::table('coupons')->get();

        $couponLines = [];
        foreach ($couponRecords as $coupon) {
            $couponLines[] = [
                'coupon_id' => $coupon->id,
                'customer_id' => null, // Assuming 10 customers exist
                'coupon_code' => strtoupper(Str::random(8)),
                'discount_type' => rand(0, 1) ? 'percentage' : 'amount',
                'discount' => rand(5, 50),
                'min_order_value' => rand(50, 200),
                'max_discount' => rand(100, 500),
                'usage_limit' => rand(10, 100),
                'usage_count' => rand(0, 10),
                'start_date' => Carbon::now()->subDays(rand(1, 30)),
                'end_date' => Carbon::now()->addDays(rand(10, 60)),
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('coupon_lines')->insert($couponLines);
    }

}
