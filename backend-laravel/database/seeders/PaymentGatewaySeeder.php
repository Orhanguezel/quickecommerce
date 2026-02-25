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
        PaymentGateway::whereIn('slug', ['paypal', 'stripe', 'paytm'])->delete();

        // wallet has no credentials → safe to updateOrCreate
        PaymentGateway::updateOrCreate(['slug' => 'wallet'], [
            'name' => 'Cüzdan',
            'description' => 'Hesabınızdaki cüzdan bakiyesini kullanarak ödeme yapın.',
            'auth_credentials' => null,
            'image' => 'payment-logos/wallet.svg',
            'status' => true,
            'is_test_mode' => false,
        ]);

        // cash_on_delivery has no credentials → safe to updateOrCreate
        PaymentGateway::updateOrCreate(['slug' => 'cash_on_delivery'], [
            'name' => 'Kapıda Ödeme',
            'description' => 'Siparişiniz kapınıza teslim edildiğinde nakit veya kart ile ödeme yapın.',
            'auth_credentials' => null,
            'image' => 'payment-logos/cash_on_delivery.svg',
            'status' => true,
            'is_test_mode' => false,
        ]);

        // Credential gateways use firstOrCreate to avoid wiping user-entered
        // api_key / secret_key on every deployment. Admin panel is used to
        // manage credentials after the initial install.

        PaymentGateway::firstOrCreate(['slug' => 'paytr'], [
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

        // iyzico: updateOrCreate so credentials stay in sync with .env
        $frontendUrl    = rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost')), '/');
        $appUrl         = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
        $defaultLocale  = env('DEFAULT_LOCALE', 'tr');
        PaymentGateway::updateOrCreate(['slug' => 'iyzico'], [
            'name' => 'iyzico',
            'description' => 'iyzico ile kredi kartı, banka kartı veya BKM Express ile güvenli ödeme yapın.',
            'auth_credentials' => json_encode([
                'api_key'              => env('IYZICO_API_KEY', ''),
                'secret_key'           => env('IYZICO_SECRET_KEY', ''),
                'marketplace_mode'     => filter_var(env('IYZICO_MARKETPLACE_MODE', false), FILTER_VALIDATE_BOOLEAN),
                'sub_merchant_key'     => env('IYZICO_SUB_MERCHANT_KEY', ''),
                'store_sub_merchant_keys' => env('IYZICO_STORE_SUB_MERCHANT_KEYS', '{}'),
                'iyzico_callback_url'  => $appUrl . '/api/v1/iyzico/callback',
                'iyzico_success_url'   => $frontendUrl . '/' . $defaultLocale . '/siparis-basarili?order={ORDER_MASTER_ID}',
                'iyzico_cancel_url'    => $frontendUrl . '/' . $defaultLocale . '/odeme?payment=failed&order={ORDER_MASTER_ID}',
            ]),
            'image' => 'payment-logos/iyzico.svg',
            'status' => true,
            'is_test_mode' => filter_var(env('IYZICO_TEST_MODE', true), FILTER_VALIDATE_BOOLEAN),
        ]);

        PaymentGateway::firstOrCreate(['slug' => 'moka'], [
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

        PaymentGateway::firstOrCreate(['slug' => 'ziraatpay'], [
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

        $this->command->info('PaymentGatewaySeeder: 6 Turkish payment gateways seeded.');
    }
}
