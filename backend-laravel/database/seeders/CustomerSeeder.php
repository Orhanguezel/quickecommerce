<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('customers')) {
            $this->command->warn('CustomerSeeder: customers table does not exist. Skipping...');
            return;
        }

        // Test müşteri hesabı
        \App\Models\Customer::updateOrCreate(
            ['email' => 'customer@sportoonline.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Customer',
                'email' => 'customer@sportoonline.com',
                'phone' => '5551234567',
                'password' => 'Admin123!',
                'image' => null,
                'birth_day' => '1995-06-15',
                'gender' => 'male',
                'status' => 1,
                'email_verified' => 1,
                'email_verified_at' => Carbon::now(),
            ]
        );

    }
}
