<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * WithdrawGatewaySeeder
 *
 * ✅ SAFE: Uses updateOrInsert - idempotent, safe to run multiple times.
 *
 * Seeds common withdrawal methods for Turkish e-commerce:
 * - Banka Havalesi (Bank Transfer)
 * - Papara
 * - PayPal
 * - USDT (TRC20) Kripto
 * - Stripe
 */
class WithdrawGatewaySeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name'   => 'Banka Havalesi',
                'fields' => json_encode(['IBAN', 'Ad Soyad', 'Banka Adı', 'Şube Adı']),
                'status' => 1,
            ],
            [
                'name'   => 'Papara',
                'fields' => json_encode(['Papara Hesap No', 'Ad Soyad']),
                'status' => 1,
            ],
            [
                'name'   => 'PayPal',
                'fields' => json_encode(['PayPal E-posta', 'Ad Soyad']),
                'status' => 1,
            ],
            [
                'name'   => 'USDT (TRC20)',
                'fields' => json_encode(['Cüzdan Adresi (TRC20)', 'Ad Soyad']),
                'status' => 1,
            ],
            [
                'name'   => 'Stripe',
                'fields' => json_encode(['Stripe Hesap E-posta', 'Ad Soyad']),
                'status' => 1,
            ],
        ];

        foreach ($methods as $method) {
            DB::table('withdraw_gateways')->updateOrInsert(
                ['name' => $method['name']],
                [
                    'name'       => $method['name'],
                    'fields'     => $method['fields'],
                    'status'     => $method['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
