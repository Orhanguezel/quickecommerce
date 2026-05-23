<?php

namespace App\Services\Geliver;

use App\Models\Store;
use Geliver\Client;

class GeliverSenderAddressService
{
    private ?Client $client = null;

    public function __construct()
    {
        $apiToken = com_option_get('geliver_api_token') ?: config('services.geliver.api_token');
        if ($apiToken) {
            $this->client = new Client($apiToken);
        }
    }

    public function status(Store $store): array
    {
        return [
            'store_id' => $store->id,
            'geliver_sender_address_id' => $store->geliver_sender_address_id,
            'has_sender_address' => filled($store->geliver_sender_address_id),
            'suggested' => [
                'first_name' => $store->seller?->first_name ?? '',
                'last_name' => $store->seller?->last_name ?? '',
                'phone' => $store->phone ?: ($store->seller?->phone ?? ''),
                'email' => $store->email ?: ($store->seller?->email ?? ''),
                'address' => $store->address ?? '',
            ],
        ];
    }

    public function createAndAttach(Store $store, array $data): array
    {
        $name = trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
        $payload = [
            'name' => $name,
            'email' => $data['email'],
            'phone' => $this->normalizePhone($data['phone']),
            'address1' => $data['address'],
            'countryCode' => 'TR',
            'cityName' => $data['city'],
            'districtName' => $data['district'],
            'zip' => $data['zip'] ?? '00000',
        ];

        $cityCode = $this->cityCode($data['city']);
        if ($cityCode) {
            $payload['cityCode'] = $cityCode;
        }

        $response = $this->client()->addresses()->createSender($payload);
        $address = $response['data'] ?? $response;
        $senderAddressId = $address['id'] ?? $address['addressID'] ?? $address['addressId'] ?? null;

        if (! $senderAddressId) {
            throw new \RuntimeException('Geliver gönderici adresi oluşturuldu fakat ID yanıtı alınamadı.');
        }

        $store->forceFill(['geliver_sender_address_id' => (string) $senderAddressId])->save();

        return [
            'store_id' => $store->id,
            'geliver_sender_address_id' => (string) $senderAddressId,
            'address' => $address,
        ];
    }

    private function client(): Client
    {
        if (! $this->client) {
            throw new \RuntimeException('Geliver API token tanımlı değil.');
        }

        return $this->client;
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
        if (preg_match('/^0(\d{10})$/', $phone, $match)) {
            return '+90' . $match[1];
        }
        if (preg_match('/^(\d{10})$/', $phone, $match)) {
            return '+90' . $match[1];
        }

        return $phone;
    }

    private function cityCode(string $city): ?string
    {
        $map = [
            'Adana' => '01', 'Adıyaman' => '02', 'Afyonkarahisar' => '03', 'Ağrı' => '04',
            'Amasya' => '05', 'Ankara' => '06', 'Antalya' => '07', 'Artvin' => '08',
            'Aydın' => '09', 'Balıkesir' => '10', 'Bilecik' => '11', 'Bingöl' => '12',
            'Bitlis' => '13', 'Bolu' => '14', 'Burdur' => '15', 'Bursa' => '16',
            'Çanakkale' => '17', 'Çankırı' => '18', 'Çorum' => '19', 'Denizli' => '20',
            'Diyarbakır' => '21', 'Edirne' => '22', 'Elazığ' => '23', 'Erzincan' => '24',
            'Erzurum' => '25', 'Eskişehir' => '26', 'Gaziantep' => '27', 'Giresun' => '28',
            'Gümüşhane' => '29', 'Hakkari' => '30', 'Hatay' => '31', 'Isparta' => '32',
            'Mersin' => '33', 'İstanbul' => '34', 'Izmir' => '35', 'İzmir' => '35',
            'Kars' => '36', 'Kastamonu' => '37', 'Kayseri' => '38', 'Kırklareli' => '39',
            'Kırşehir' => '40', 'Kocaeli' => '41', 'Konya' => '42', 'Kütahya' => '43',
            'Malatya' => '44', 'Manisa' => '45', 'Kahramanmaraş' => '46', 'Mardin' => '47',
            'Muğla' => '48', 'Muş' => '49', 'Nevşehir' => '50', 'Niğde' => '51',
            'Ordu' => '52', 'Rize' => '53', 'Sakarya' => '54', 'Samsun' => '55',
            'Siirt' => '56', 'Sinop' => '57', 'Sivas' => '58', 'Tekirdağ' => '59',
            'Tokat' => '60', 'Trabzon' => '61', 'Tunceli' => '62', 'Şanlıurfa' => '63',
            'Uşak' => '64', 'Van' => '65', 'Yozgat' => '66', 'Zonguldak' => '67',
            'Aksaray' => '68', 'Bayburt' => '69', 'Karaman' => '70', 'Kırıkkale' => '71',
            'Batman' => '72', 'Şırnak' => '73', 'Bartın' => '74', 'Ardahan' => '75',
            'Iğdır' => '76', 'Yalova' => '77', 'Karabük' => '78', 'Kilis' => '79',
            'Osmaniye' => '80', 'Düzce' => '81',
        ];

        return $map[trim($city)] ?? null;
    }
}
