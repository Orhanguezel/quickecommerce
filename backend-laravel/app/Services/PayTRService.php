<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\PaymentGateways\app\Models\PaymentGateway;

class PayTRService
{
    private function getGateway(): PaymentGateway
    {
        $gateway = PaymentGateway::where('slug', 'paytr')->first();
        if (!$gateway) {
            throw new \Exception(__('messages.paytr_configuration_missing'));
        }

        return $gateway;
    }

    public function getCredentials(): array
    {
        $gateway = $this->getGateway();
        $credentials = json_decode($gateway->auth_credentials ?? '{}', true);

        if (!is_array($credentials)) {
            $credentials = [];
        }

        $merchantId = trim((string)($credentials['merchant_id'] ?? ''));
        $merchantKey = trim((string)($credentials['merchant_key'] ?? ''));
        $merchantSalt = trim((string)($credentials['merchant_salt'] ?? ''));

        if ($merchantId === '' || $merchantKey === '' || $merchantSalt === '') {
            throw new \Exception(__('messages.paytr_configuration_missing'));
        }

        return [
            'gateway' => $gateway,
            'credentials' => $credentials,
            'merchant_id' => $merchantId,
            'merchant_key' => $merchantKey,
            'merchant_salt' => $merchantSalt,
            'is_test_mode' => (bool)$gateway->is_test_mode,
        ];
    }

    /**
     * PayTR iFrame API ile ödeme tokeni oluştur.
     *
     * @param array $data Gerekli alanlar:
     *   - merchant_oid: Benzersiz sipariş numarası (string)
     *   - email: Müşteri email
     *   - payment_amount: Kuruş cinsinden tutar (int) — örn: 1000 = 10.00 TL
     *   - user_ip: Müşteri IP adresi
     *   - user_basket: base64 encode edilmiş JSON sepet dizisi
     *   - currency: Para birimi ('TL', 'EUR', 'USD', 'GBP', 'RUB')
     *   - merchant_ok_url: Başarılı ödeme dönüş URL
     *   - merchant_fail_url: Başarısız ödeme dönüş URL
     *   - user_name: Müşteri adı soyadı
     *   - user_address: Müşteri adresi
     *   - user_phone: Müşteri telefonu
     *   - no_installment: Taksit kapalı mı (0 veya 1)
     *   - max_installment: Maksimum taksit sayısı (0 = sınırsız)
     *
     * @return array ['token' => string, 'iframe_url' => string]
     */
    public function createPaymentToken(array $data): array
    {
        $config = $this->getCredentials();
        $merchantId = $config['merchant_id'];
        $merchantKey = $config['merchant_key'];
        $merchantSalt = $config['merchant_salt'];
        $testMode = $config['is_test_mode'] ? '1' : '0';

        $merchantOid = (string)$data['merchant_oid'];
        $email = (string)$data['email'];
        $paymentAmount = (int)$data['payment_amount'];
        $userIp = (string)$data['user_ip'];
        $userBasket = (string)$data['user_basket'];
        $noInstallment = (string)($data['no_installment'] ?? '0');
        $maxInstallment = (string)($data['max_installment'] ?? '0');
        $currency = (string)($data['currency'] ?? 'TL');
        $merchantOkUrl = (string)$data['merchant_ok_url'];
        $merchantFailUrl = (string)$data['merchant_fail_url'];
        $userName = (string)($data['user_name'] ?? '');
        $userAddress = (string)($data['user_address'] ?? '');
        $userPhone = (string)($data['user_phone'] ?? '');

        // HMAC token hesapla
        $hashStr = $merchantId . $userIp . $merchantOid . $email
            . $paymentAmount . $userBasket . $noInstallment
            . $maxInstallment . $currency . $testMode;

        $paytrToken = base64_encode(
            hash_hmac('sha256', $hashStr . $merchantSalt, $merchantKey, true)
        );

        $postData = [
            'merchant_id' => $merchantId,
            'user_ip' => $userIp,
            'merchant_oid' => $merchantOid,
            'email' => $email,
            'payment_amount' => $paymentAmount,
            'paytr_token' => $paytrToken,
            'user_basket' => $userBasket,
            'debug_on' => $testMode === '1' ? 1 : 0,
            'no_installment' => $noInstallment,
            'max_installment' => $maxInstallment,
            'user_name' => $userName,
            'user_address' => $userAddress,
            'user_phone' => $userPhone,
            'merchant_ok_url' => $merchantOkUrl,
            'merchant_fail_url' => $merchantFailUrl,
            'timeout_limit' => 30,
            'currency' => $currency,
            'test_mode' => $testMode,
            'lang' => app()->getLocale() === 'tr' ? 'tr' : 'en',
        ];

        $response = Http::asForm()->post('https://www.paytr.com/odeme/api/get-token', $postData);

        if (!$response->successful()) {
            Log::error('PayTR token request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'merchant_oid' => $merchantOid,
            ]);
            throw new \Exception(__('messages.paytr_session_create_failed'));
        }

        $result = $response->json();

        if (($result['status'] ?? '') !== 'success') {
            Log::error('PayTR token response error', [
                'reason' => $result['reason'] ?? 'unknown',
                'merchant_oid' => $merchantOid,
            ]);
            throw new \Exception($result['reason'] ?? __('messages.paytr_session_create_failed'));
        }

        $token = $result['token'];

        return [
            'token' => $token,
            'iframe_url' => 'https://www.paytr.com/odeme/guvenli/' . $token,
        ];
    }

    /**
     * PayTR callback HMAC doğrulaması.
     *
     * @return array ['verified' => bool, 'merchant_oid' => string, 'status' => string, 'total_amount' => string]
     */
    public function verifyCallback(array $callbackData): array
    {
        $config = $this->getCredentials();
        $merchantKey = $config['merchant_key'];
        $merchantSalt = $config['merchant_salt'];

        $merchantOid = (string)($callbackData['merchant_oid'] ?? '');
        $status = (string)($callbackData['status'] ?? '');
        $totalAmount = (string)($callbackData['total_amount'] ?? '');
        $hash = (string)($callbackData['hash'] ?? '');

        $expectedHash = base64_encode(
            hash_hmac('sha256', $merchantOid . $merchantSalt . $status . $totalAmount, $merchantKey, true)
        );

        return [
            'verified' => hash_equals($expectedHash, $hash),
            'merchant_oid' => $merchantOid,
            'status' => $status,
            'total_amount' => $totalAmount,
        ];
    }

    /**
     * Sepet verisini PayTR formatında base64 encode et.
     *
     * @param array $items [['name' => string, 'price' => float (kuruş), 'quantity' => int], ...]
     */
    public static function encodeBasket(array $items): string
    {
        $basket = [];
        foreach ($items as $item) {
            $basket[] = [
                (string)$item['name'],
                (string)$item['price'],
                (int)$item['quantity'],
            ];
        }

        return base64_encode(json_encode($basket));
    }

    /**
     * PayTR para birimi kodu dönüştür.
     * PayTR: TL, EUR, USD, GBP, RUB kabul eder.
     */
    public static function convertCurrency(string $currencyCode): string
    {
        $map = [
            'TRY' => 'TL',
            'TL' => 'TL',
            'EUR' => 'EUR',
            'USD' => 'USD',
            'GBP' => 'GBP',
            'RUB' => 'RUB',
        ];

        return $map[strtoupper($currencyCode)] ?? 'TL';
    }
}
