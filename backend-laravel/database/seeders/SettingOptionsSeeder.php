<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Modules\Wallet\app\Models\Wallet;
use Modules\Wallet\app\Models\WalletTransaction;

class SettingOptionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('wallets')) {
            $this->command->warn('SettingOptionsSeeder: wallets table does not exist. Skipping...');
            return;
        }

        // Create admin wallet
        $wallet = Wallet::updateOrCreate(
            ["owner_id" => 1, "owner_type" => 'App\Models\User'],
            [
                "balance" => 100,
                "status" => 1,
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
            ]
        );

        if (Schema::hasTable('wallet_transactions')) {
            WalletTransaction::updateOrCreate(
                ["wallet_id" => $wallet->id, "transaction_ref" => 'INIT-ADMIN-1'],
                [
                    "transaction_details" => 'Initial admin balance',
                    "amount" => 100,
                    "type" => 'credit',
                    "purpose" => 'Initial deposit',
                    "status" => 1,
                    "created_at" => Carbon::now(),
                    "updated_at" => Carbon::now(),
                ]
            );
        }

        $this->command->info('SettingOptionsSeeder: Admin wallet seeded.');
    }
}
