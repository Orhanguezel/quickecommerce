<?php

namespace App\Services;

use App\Models\SellerApplication;
use Iyzipay\Model\Address;
use Iyzipay\Model\BasketItem;
use Iyzipay\Model\BasketItemType;
use Iyzipay\Model\Buyer;
use Iyzipay\Model\CheckoutForm;
use Iyzipay\Model\CheckoutFormInitialize;
use Iyzipay\Model\Currency;
use Iyzipay\Model\Locale;
use Iyzipay\Model\PaymentGroup;
use Iyzipay\Model\SubMerchant;
use Iyzipay\Model\SubMerchantType;
use Iyzipay\Options;
use Iyzipay\Request\CreateCheckoutFormInitializeRequest;
use Iyzipay\Request\CreateSubMerchantRequest;
use Iyzipay\Request\RetrieveCheckoutFormRequest;
use Modules\PaymentGateways\app\Models\PaymentGateway;

class IyzicoService
{
    private function firstNonEmpty(array $credentials, array $keys): string
    {
        foreach ($keys as $key) {
            $value = trim((string)($credentials[$key] ?? ''));
            if ($value !== '') {
                return $value;
            }
        }
        return '';
    }

    private function getGateway(): PaymentGateway
    {
        $gateway = PaymentGateway::where('slug', 'iyzico')->first();
        if (!$gateway) {
            throw new \Exception(__('messages.iyzico_configuration_missing'));
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

        $apiKey = $this->firstNonEmpty($credentials, ['api_key', 'iyzico_api_key', 'apiKey']);
        $secretKey = $this->firstNonEmpty($credentials, ['secret_key', 'iyzico_secret_key', 'secretKey', 'api_secret']);
        if ($apiKey === '' || $secretKey === '') {
            throw new \Exception(__('messages.iyzico_configuration_missing'));
        }

        // Admin panel does not reliably expose base_url, so select URL by mode in code.
        $baseUrl = (bool)$gateway->is_test_mode
            ? 'https://sandbox-api.iyzipay.com'
            : 'https://api.iyzipay.com';

        return [
            'gateway' => $gateway,
            'credentials' => $credentials,
            'api_key' => $apiKey,
            'secret_key' => $secretKey,
            'base_url' => $baseUrl,
        ];
    }

    private function options(): Options
    {
        $config = $this->getCredentials();
        $options = new Options();
        $options->setApiKey($config['api_key']);
        $options->setSecretKey($config['secret_key']);
        $options->setBaseUrl($config['base_url']);
        return $options;
    }

    public function isMarketplaceMode(): bool
    {
        try {
            $config = $this->getCredentials();
            $val = $config['credentials']['marketplace_mode'] ?? null;
            if ($val === null) return false;
            if (is_bool($val)) return $val;
            return in_array(strtolower((string)$val), ['1', 'true', 'on', 'yes'], true);
        } catch (\Exception) {
            return false;
        }
    }

    /**
     * iyzico'da alt üye iş yeri (sub-merchant) oluşturur.
     * Başarıda subMerchantKey string döner.
     * @throws \Exception API hatası veya eksik veri durumunda
     */
    public function createSubMerchant(SellerApplication $application): string
    {
        $user = $application->user;

        // Vergi / TC no'dan rakamları al
        $taxNumber = preg_replace('/\D/', '', $application->tax_number ?? '');

        $businessType = $application->business_type ?? null;

        // business_type yoksa eski kayıtlar için vergi/TC no ve unvan üzerinden tahmin et.
        // 11 hane → TC kimlik numarası, 10 hane → vergi numarası.
        $isPersonalId = strlen($taxNumber) === 11;
        $hasCompany   = !empty(trim($application->company_name ?? ''));

        if ($businessType === 'individual') {
            $type = SubMerchantType::PERSONAL;
        } elseif ($businessType === 'company') {
            $type = $isPersonalId
                ? SubMerchantType::PRIVATE_COMPANY
                : SubMerchantType::LIMITED_OR_JOINT_STOCK_COMPANY;
        } elseif ($isPersonalId && !$hasCompany) {
            $type = SubMerchantType::PERSONAL;
        } elseif ($isPersonalId) {
            $type = SubMerchantType::PRIVATE_COMPANY;
        } else {
            $type = SubMerchantType::LIMITED_OR_JOINT_STOCK_COMPANY;
        }

        // Adres birleştir
        $addressParts = array_filter([
            $application->address_line1,
            $application->address_district,
            $application->address_city,
        ]);
        $address = implode(', ', $addressParts) ?: ($application->address_country ?? 'Türkiye');

        // GSM formatı: iyzico +90XXXXXXXXXX bekliyor
        $rawPhone = preg_replace('/\D/', '', $user->phone ?? '');
        if (strlen($rawPhone) === 10) {
            $gsm = '+90' . $rawPhone;
        } elseif (strlen($rawPhone) === 11 && str_starts_with($rawPhone, '0')) {
            $gsm = '+9' . $rawPhone;
        } elseif (strlen($rawPhone) >= 12 && str_starts_with($rawPhone, '90')) {
            $gsm = '+' . $rawPhone;
        } else {
            $gsm = '+905350000000'; // fallback
        }

        // Ad / soyad
        $firstName = trim($user->first_name ?? '');
        $lastName  = trim($user->last_name ?? '');
        if (empty($firstName)) {
            $parts     = explode(' ', trim($user->full_name ?? 'Ad Soyad'), 2);
            $firstName = $parts[0];
            $lastName  = $parts[1] ?? '';
        }

        $request = new CreateSubMerchantRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId('seller-' . $application->user_id . '-' . time());
        $request->setSubMerchantExternalId('qe-seller-' . $application->user_id);
        $request->setSubMerchantType($type);
        $request->setAddress($address);
        $request->setEmail($user->email);
        $request->setGsmNumber($gsm);
        $request->setName($hasCompany ? $application->company_name : trim("$firstName $lastName"));
        $request->setIban(preg_replace('/\s/', '', $application->bank_iban));
        $request->setCurrency(Currency::TL);

        if ($type === SubMerchantType::PERSONAL) {
            $request->setContactName($firstName);
            $request->setContactSurname($lastName ?: $firstName);
            $request->setIdentityNumber($taxNumber);
        } elseif ($type === SubMerchantType::PRIVATE_COMPANY) {
            $request->setTaxOffice($application->tax_office ?: 'Bilinmiyor');
            $request->setLegalCompanyTitle($application->company_name);
            $request->setIdentityNumber($taxNumber);
        } else {
            // LIMITED_OR_JOINT_STOCK_COMPANY
            $request->setTaxOffice($application->tax_office ?: 'Bilinmiyor');
            $request->setTaxNumber($taxNumber);
            $request->setLegalCompanyTitle($application->company_name);
        }

        $result = SubMerchant::create($request, $this->options());

        if ($result->getStatus() !== 'success') {
            throw new \Exception(
                'iyzico sub-merchant oluşturulamadı: ' . $result->getErrorMessage() .
                ' (code: ' . $result->getErrorCode() . ')'
            );
        }

        return $result->getSubMerchantKey();
    }

    public function createCheckoutForm(array $data): CheckoutFormInitialize
    {
        $request = new CreateCheckoutFormInitializeRequest();
        $request->setLocale($data['locale'] ?? Locale::TR);
        $request->setConversationId((string)$data['conversation_id']);
        $request->setPrice((string)$data['price']);
        $request->setPaidPrice((string)$data['paid_price']);
        $request->setCurrency($data['currency'] ?? Currency::TL);
        $request->setBasketId((string)$data['basket_id']);
        $request->setPaymentGroup($data['payment_group'] ?? PaymentGroup::PRODUCT);
        $request->setCallbackUrl((string)$data['callback_url']);
        $request->setBuyer($this->makeBuyer($data['buyer']));
        $request->setShippingAddress($this->makeAddress($data['shipping_address']));
        $request->setBillingAddress($this->makeAddress($data['billing_address']));
        $request->setBasketItems($this->makeBasketItems($data['basket_items'] ?? []));

        return CheckoutFormInitialize::create($request, $this->options());
    }

    public function retrieveCheckoutForm(string $token, string $conversationId): CheckoutForm
    {
        $request = new RetrieveCheckoutFormRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId($conversationId);
        $request->setToken($token);

        return CheckoutForm::retrieve($request, $this->options());
    }

    /**
     * iyzico'da basarili bir ödemenin "Onay" akISI.
     *
     * 2026-06-05: iyzico merchant hesabi "Onay bazli tahsilat" mode'unda
     * oldugunda, basarili her odeme bekleyen bakiyede kalir. Admin'in her
     * paymentTransactionId icin Approval gondermesi gerekir; ardindan
     * cekilebilir bakiyeye geçer.
     *
     * @param string $paymentTransactionId  iyzico paymentItems[].paymentTransactionId
     * @param string $conversationId  Log eslesmesi icin
     */
    /**
     * Mevcut bir sub-merchant'in iyzico kayitlarini gunceller (IBAN, isim,
     * adres). createSubMerchant'tan farkli olarak iyzico'da kayit zaten varsa
     * banka bilgisini push eder. Error code 5068 sebebi cogu zaman bu update
     * eksikligi.
     */
    public function updateSubMerchant(SellerApplication $application): \Iyzipay\Model\SubMerchant
    {
        if (!$application->iyzico_sub_merchant_key) {
            throw new \Exception('SubMerchant key yok — once createSubMerchant cagrilmali.');
        }

        $user = $application->user ?? \App\Models\User::find($application->user_id);
        $address = new Address();
        $address->setAddress(trim(($application->address_line1 ?? '') . ' ' . ($application->address_line2 ?? '')) ?: 'Bilinmiyor');
        $address->setCity($application->address_city ?: 'Istanbul');
        $address->setCountry($application->address_country ?: 'Turkey');
        $address->setZipCode($application->address_postal_code ?: '34000');
        $address->setContactName($application->bank_account_holder ?: ($user->full_name ?? 'Bilinmiyor'));

        $gsm = preg_replace('/\s+/', '', (string) ($user->phone ?? '+905555555555'));
        $hasCompany = !empty($application->company_name);
        $type = $hasCompany ? SubMerchantType::PRIVATE_COMPANY : SubMerchantType::PERSONAL;
        $taxNumber = (string) ($application->tax_number ?: $application->mersis_number ?: '11111111111');

        $parts = explode(' ', trim($user->full_name ?? 'Ad Soyad'), 2);
        $firstName = $parts[0];
        $lastName  = $parts[1] ?? '';

        $request = new \Iyzipay\Request\UpdateSubMerchantRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId('update-seller-' . $application->user_id . '-' . time());
        $request->setSubMerchantKey($application->iyzico_sub_merchant_key);
        $request->setAddress($address);
        $request->setEmail($user->email);
        $request->setGsmNumber($gsm);
        $request->setName($hasCompany ? $application->company_name : trim("$firstName $lastName"));
        $request->setIban(preg_replace('/\s/', '', $application->bank_iban));
        $request->setCurrency(Currency::TL);

        if ($type === SubMerchantType::PERSONAL) {
            $request->setContactName($firstName);
            $request->setContactSurname($lastName ?: $firstName);
            $request->setIdentityNumber($taxNumber);
        } elseif ($type === SubMerchantType::PRIVATE_COMPANY) {
            $request->setTaxOffice($application->tax_office ?: 'Bilinmiyor');
            $request->setLegalCompanyTitle($application->company_name);
            $request->setIdentityNumber($taxNumber);
        }

        return \Iyzipay\Model\SubMerchant::update($request, $this->options());
    }

    public function approvePayment(string $paymentTransactionId, string $conversationId): \Iyzipay\Model\Approval
    {
        $request = new \Iyzipay\Request\CreateApprovalRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId($conversationId);
        $request->setPaymentTransactionId($paymentTransactionId);

        return \Iyzipay\Model\Approval::create($request, $this->options());
    }

    /**
     * iyzico'dan payment detayini cekip paymentItems[].paymentTransactionId
     * listesini doner. Eski siparişlerde DB'de saklamadigimiz id'leri
     * sonradan elde etmek için.
     *
     * @return array<int,string>
     */
    public function retrievePaymentTransactionIds(string $paymentId, string $conversationId): array
    {
        $request = new \Iyzipay\Request\RetrievePaymentRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId($conversationId);
        $request->setPaymentId($paymentId);

        $payment = \Iyzipay\Model\Payment::retrieve($request, $this->options());
        if ($payment->getStatus() !== 'success') {
            return [];
        }
        $ids = [];
        foreach ((array) $payment->getPaymentItems() as $item) {
            $tid = method_exists($item, 'getPaymentTransactionId') ? $item->getPaymentTransactionId() : null;
            if ($tid) {
                $ids[] = (string) $tid;
            }
        }
        return $ids;
    }

    private function makeBuyer(array $payload): Buyer
    {
        $buyer = new Buyer();
        $buyer->setId((string)$payload['id']);
        $buyer->setName((string)$payload['name']);
        $buyer->setSurname((string)$payload['surname']);
        $buyer->setGsmNumber((string)$payload['gsm_number']);
        $buyer->setEmail((string)$payload['email']);
        $buyer->setIdentityNumber((string)$payload['identity_number']);
        $buyer->setLastLoginDate((string)$payload['last_login_date']);
        $buyer->setRegistrationDate((string)$payload['registration_date']);
        $buyer->setRegistrationAddress((string)$payload['registration_address']);
        $buyer->setIp((string)$payload['ip']);
        $buyer->setCity((string)$payload['city']);
        $buyer->setCountry((string)$payload['country']);
        $buyer->setZipCode((string)$payload['zip_code']);
        return $buyer;
    }

    private function makeAddress(array $payload): Address
    {
        $address = new Address();
        $address->setContactName((string)$payload['contact_name']);
        $address->setCity((string)$payload['city']);
        $address->setCountry((string)$payload['country']);
        $address->setAddress((string)$payload['address']);
        $address->setZipCode((string)$payload['zip_code']);
        return $address;
    }

    private function makeBasketItems(array $items): array
    {
        $basketItems = [];

        foreach ($items as $item) {
            $basketItem = new BasketItem();
            $basketItem->setId((string)$item['id']);
            $basketItem->setName((string)$item['name']);
            $basketItem->setCategory1((string)($item['category_1'] ?? 'Genel'));
            $basketItem->setCategory2((string)($item['category_2'] ?? 'Ürün'));
            $basketItem->setItemType((string)($item['item_type'] ?? BasketItemType::PHYSICAL));
            $basketItem->setPrice((string)$item['price']);
            if (!empty($item['sub_merchant_key'])) {
                $basketItem->setSubMerchantKey((string)$item['sub_merchant_key']);
            }
            if (isset($item['sub_merchant_price']) && $item['sub_merchant_price'] !== null) {
                $basketItem->setSubMerchantPrice((string)$item['sub_merchant_price']);
            }
            $basketItems[] = $basketItem;
        }

        return $basketItems;
    }
}
