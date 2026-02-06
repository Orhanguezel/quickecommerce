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

        \App\Models\Customer::updateOrCreate(
            ['email' => 'john_doe@example.com'],
            [
            "first_name" => "John",
            "last_name" => "Doe",
            "email" => "john_doe@example.com",
            "phone" => "123456748900",
            "password" => "12345678",
            "image" => null,
            "birth_day" => "1990-01-01",
            "gender" => "male",
            "status" => 1,
            "email_verified" => 1,
            "email_verified_at" => Carbon::now(),
        ]);

    }
}
