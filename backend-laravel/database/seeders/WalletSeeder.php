<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Modules\Wallet\app\Models\Wallet;
use Modules\Wallet\app\Models\WalletTransaction;

class WalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('wallets')) {
            $this->command->warn('WalletSeeder: wallets table does not exist. Skipping...');
            return;
        }

        // Create wallets for stores
        $wallet1 = Wallet::updateOrCreate(
            ["owner_id" => 1, "owner_type" => 'App\Models\Store'],
            [
                "balance" => 100,
                "status" => 1,
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
            ]
        );

        $wallet2 = Wallet::updateOrCreate(
            ["owner_id" => 2, "owner_type" => 'App\Models\Store'],
            [
                "balance" => 100,
                "status" => 1,
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
            ]
        );

        // Create wallet for user
        Wallet::updateOrCreate(
            ["owner_id" => 6, "owner_type" => 'App\Models\User'],
            [
                "balance" => 0.00,
                "status" => 1,
                "created_at" => Carbon::now(),
                "updated_at" => Carbon::now(),
            ]
        );

        // Create wallet transactions if table exists
        if (Schema::hasTable('wallet_transactions')) {
            WalletTransaction::updateOrCreate(
                ["wallet_id" => $wallet1->id, "transaction_ref" => 'INIT-STORE-1'],
                [
                    "transaction_details" => 'Initial balance',
                    "amount" => 100,
                    "type" => 'credit',
                    "purpose" => 'Initial deposit',
                    "status" => 1,
                    "created_at" => Carbon::now(),
                    "updated_at" => Carbon::now(),
                ]
            );

            WalletTransaction::updateOrCreate(
                ["wallet_id" => $wallet2->id, "transaction_ref" => 'INIT-STORE-2'],
                [
                    "transaction_details" => 'Initial balance',
                    "amount" => 100,
                    "type" => 'credit',
                    "purpose" => 'Initial deposit',
                    "status" => 1,
                    "created_at" => Carbon::now(),
                    "updated_at" => Carbon::now(),
                ]
            );
        }

        $this->command->info('WalletSeeder: Wallets and transactions seeded.');
    }
}
