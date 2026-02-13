<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Modules\PaymentGateways\app\Models\PaymentGateway;

class PaymentGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('payment_gateways')) {
            $this->command->warn('PaymentGatewaySeeder: payment_gateways table does not exist. Skipping...');
            return;
        }

        // Eski gateway'leri sil
        PaymentGateway::whereIn('slug', ['paypal', 'stripe', 'razorpay', 'paytm'])->delete();

        PaymentGateway::updateOrCreate(['slug' => 'cash_on_delivery'], [
            'name' => 'Kapıda Ödeme',
            'description' => 'Siparişiniz kapınıza teslim edildiğinde nakit veya kart ile ödeme yapın.',
            'auth_credentials' => null,
            'image' => 'payment-logos/cash_on_delivery.svg',
            'status' => true,
            'is_test_mode' => false,
        ]);

        PaymentGateway::updateOrCreate(['slug' => 'paytr'], [
            'name' => 'PayTR',
            'description' => 'PayTR ile kredi kartı, banka kartı veya havale/EFT ile güvenli ödeme yapın.',
            'auth_credentials' => json_encode([
                'merchant_id' => '',
                'merchant_key' => '',
                'merchant_salt' => '',
            ]),
            'image' => 'payment-logos/paytr.svg',
            'status' => true,
            'is_test_mode' => true,
        ]);

        PaymentGateway::updateOrCreate(['slug' => 'iyzico'], [
            'name' => 'iyzico',
            'description' => 'iyzico ile kredi kartı, banka kartı veya BKM Express ile güvenli ödeme yapın.',
            'auth_credentials' => json_encode([
                'api_key' => '',
                'secret_key' => '',
            ]),
            'image' => 'payment-logos/iyzico.svg',
            'status' => true,
            'is_test_mode' => true,
        ]);

        PaymentGateway::updateOrCreate(['slug' => 'moka'], [
            'name' => 'Moka Pos',
            'description' => 'Moka Pos ile kredi kartı ve banka kartı ile güvenli ödeme yapın.',
            'auth_credentials' => json_encode([
                'dealer_code' => '',
                'username' => '',
                'password' => '',
            ]),
            'image' => 'payment-logos/moka.svg',
            'status' => true,
            'is_test_mode' => true,
        ]);

        PaymentGateway::updateOrCreate(['slug' => 'ziraatpay'], [
            'name' => 'ZiraatPay',
            'description' => 'Ziraat Bankası sanal pos ile güvenli ödeme yapın.',
            'auth_credentials' => json_encode([
                'merchant_id' => '',
                'terminal_id' => '',
                'secret_key' => '',
            ]),
            'image' => 'payment-logos/ziraatpay.svg',
            'status' => true,
            'is_test_mode' => true,
        ]);

        $this->command->info('PaymentGatewaySeeder: 5 Turkish payment gateways seeded.');
    }
}
