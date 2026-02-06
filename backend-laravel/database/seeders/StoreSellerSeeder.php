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

        DB::table('store_sellers')->insertOrIgnore([
            [
                'user_id' => 1,
                'status' => 1,
            ],
        ]);

    }
}
