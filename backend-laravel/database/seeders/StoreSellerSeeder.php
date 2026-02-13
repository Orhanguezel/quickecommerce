<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class StoreSellerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('store_sellers')) {
            $this->command->warn('StoreSellerSeeder: store_sellers table does not exist. Skipping...');
            return;
        }

        // Seller user (from UserSeeder: seller@sportoonline.com)
        $sellerUser = DB::table('users')->where('email', 'seller@sportoonline.com')->first();

        if ($sellerUser) {
            DB::table('store_sellers')->insertOrIgnore([
                [
                    'user_id' => $sellerUser->id,
                    'status' => 1,
                ],
            ]);

            // Link store_seller_id back to user (mirrors registerSeller flow)
            $storeSeller = DB::table('store_sellers')->where('user_id', $sellerUser->id)->first();
            if ($storeSeller) {
                DB::table('users')
                    ->where('id', $sellerUser->id)
                    ->update(['store_seller_id' => $storeSeller->id]);
            }

            $this->command->info("StoreSellerSeeder: Seller record created for user #{$sellerUser->id}");
        } else {
            $this->command->warn('StoreSellerSeeder: seller@sportoonline.com not found. Run UserSeeder first.');
        }

    }
}
