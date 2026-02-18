<?php

namespace App\Services;

use Iyzipay\Model\Address;
use Iyzipay\Model\BasketItem;
use Iyzipay\Model\BasketItemType;
use Iyzipay\Model\Buyer;
use Iyzipay\Model\CheckoutForm;
use Iyzipay\Model\CheckoutFormInitialize;
use Iyzipay\Model\Currency;
use Iyzipay\Model\Locale;
use Iyzipay\Model\PaymentGroup;
use Iyzipay\Options;
use Iyzipay\Request\CreateCheckoutFormInitializeRequest;
use Iyzipay\Request\RetrieveCheckoutFormRequest;
use Modules\PaymentGateways\app\Models\PaymentGateway;

class IyzicoService
{
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

        $apiKey = trim((string)($credentials['api_key'] ?? ''));
        $secretKey = trim((string)($credentials['secret_key'] ?? ''));
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

    public function createCheckoutForm(array $data): CheckoutFormInitialize
    {
        $request = new CreateCheckoutFormInitializeRequest();
        $request->setLocale($data['locale'] ?? Locale::TR);
        $request->setConversationId((string)$data['conversation_id']);
        $request->setPrice((string)$data['price']);
        $request->setPaidPrice((string)$data['paid_price']);
        $request->setCurrency($data['currency'] ?? Currency::TL);
        $request->setBasketId((string)$data['basket_id']);
        $request->setPaymentGroup(PaymentGroup::PRODUCT);
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
            $basketItems[] = $basketItem;
        }

        return $basketItems;
    }
}
