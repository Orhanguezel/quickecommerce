<?php

namespace App\Services;

use App\Models\CargoShipment;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\Store;
use Geliver\Client;
use Illuminate\Support\Facades\Cache;

class GdeliveryService
{
    private ?Client $client = null;
    private bool $testMode;

    public function __construct()
    {
        // Önce DB ayarlarından, yoksa .env'den oku
        $apiToken = com_option_get('geliver_api_token') ?: config('services.geliver.api_token');
        $this->testMode = com_option_get('geliver_test_mode') === 'on';

        if ($apiToken) {
            $this->client = new Client($apiToken);
        }
    }

    private function getClient(): Client
    {
        if (! $this->client) {
            throw new \Exception('Geliver API token tanımlı değil. Lütfen Kurye Ayarları sayfasından API token girin.');
        }
        return $this->client;
    }

    /**
     * Sipariş için teklifler oluştur ve normalize ederek döndür.
     *
     * @throws \Exception
     */
    public function getShipmentOffers(Order $order): array
    {
        $shipment = $this->createGeliverShipment($this->buildShipmentData($order));
        $offers = $this->normalizeOffers($shipment['offers'] ?? null);

        if (empty($offers)) {
            throw new \Exception('Geliver\'dan teklif alınamadı. Lütfen tekrar deneyin.');
        }

        foreach ($offers as $offer) {
            if (!empty($offer['id'])) {
                Cache::put(
                    $this->offerCacheKey($order->id, (string) $offer['id']),
                    [
                        'carrier_name' => $offer['carrier_name'] ?? null,
                    ],
                    now()->addMinutes(15)
                );
            }
        }

        return [
            'shipment_id' => $shipment['id'] ?? null,
            'offers' => $offers,
            'default_offer_id' => $this->resolveDefaultOfferId($shipment, $offers),
        ];
    }

    /**
     * Kargo oluştur: sipariş için Geliver'da shipment yarat, teklif kabul et ve kaydet.
     *
     * @param Order $order
     * @param string|null $offerId Seçilen teklif ID (yoksa en ucuz)
     * @param string $createdByType 'admin' | 'seller'
     * @param int $createdById
     * @return CargoShipment
     * @throws \Exception
     */
    public function createShipment(
        Order $order,
        ?string $offerId = null,
        string $createdByType = 'admin',
        int $createdById = 0
    ): CargoShipment
    {
        // Mevcut kargo varsa döndür
        $existing = CargoShipment::where('order_id', $order->id)
            ->whereNotIn('status', ['cancelled'])
            ->first();

        if ($existing) {
            return $existing;
        }

        $shipment = null;
        $selectedOfferId = null;
        $carrierName = null;

        if (!empty($offerId)) {
            $selectedOfferId = (string) $offerId;
            $offerMeta = Cache::get($this->offerCacheKey($order->id, $selectedOfferId), []);
            $carrierName = $offerMeta['carrier_name'] ?? null;
            $txResponse = $this->getClient()->transactions()->acceptOffer($selectedOfferId);
            $transaction = $txResponse['data'] ?? $txResponse;
        } else {
            $shipment = $this->createGeliverShipment($this->buildShipmentData($order));

            $offers = $this->normalizeOffers($shipment['offers'] ?? null);
            if (empty($offers)) {
                throw new \Exception('Geliver\'dan teklif alınamadı. Lütfen tekrar deneyin.');
            }

            $selectedOfferId = $this->resolveDefaultOfferId($shipment, $offers);
            if (! $selectedOfferId) {
                throw new \Exception('Uygun kargo teklifi bulunamadı.');
            }

            $selectedOffer = collect($offers)->firstWhere('id', $selectedOfferId);
            $carrierName = $selectedOffer['carrier_name'] ?? null;

            // Teklifi kabul et
            $txResponse  = $this->getClient()->transactions()->acceptOffer($selectedOfferId);
            $transaction = $txResponse['data'] ?? $txResponse;
        }

        $transactionShipment = $transaction['shipment'] ?? [];
        $barcode        = $transactionShipment['barcode'] ?? null;
        $trackingNumber = $transactionShipment['trackingNumber'] ?? null;
        $labelUrl       = $transactionShipment['labelURL'] ?? null;
        $transactionId  = $transaction['id'] ?? null;
        $geliverShipmentId = $transactionShipment['id'] ?? ($shipment['id'] ?? null);
        $carrierName = $carrierName
            ?? ($transactionShipment['carrier']['name'] ?? null)
            ?? ($transaction['carrier']['name'] ?? null);

        // Kaydet
        $cargoShipment = CargoShipment::create([
            'order_id'               => $order->id,
            'store_id'               => $order->store_id,
            'geliver_shipment_id'    => $geliverShipmentId,
            'geliver_transaction_id' => $transactionId,
            'carrier_name'           => $carrierName,
            'barcode'                => $barcode,
            'tracking_number'        => $trackingNumber,
            'label_url'              => $labelUrl,
            'status'                 => 'shipped',
            'created_by_type'        => $createdByType,
            'created_by_id'          => $createdById,
            'raw_response'           => [
                'shipment' => $shipment,
                'transaction' => $transaction,
                'selected_offer_id' => $selectedOfferId,
            ],
        ]);

        // Sipariş durumunu güncelle
        $order->update(['status' => 'shipped']);

        return $cargoShipment;
    }

    /**
     * Siparişe göre Geliver shipment payload üretir.
     */
    private function buildShipmentData(Order $order): array
    {
        // Sipariş adresi: önce 'delivery', yoksa herhangi bir adres
        $orderAddress = OrderAddress::where('order_master_id', $order->order_master_id)
            ->where('type', 'delivery')
            ->first()
            ?? OrderAddress::where('order_master_id', $order->order_master_id)
            ->first();

        if (! $orderAddress) {
            throw new \Exception('Sipariş teslimat adresi bulunamadı. Lütfen müşterinin adres bilgilerini kontrol edin.');
        }

        // Gönderici adresi: mağaza → DB ayarları → config sırasıyla
        $store = Store::find($order->store_id);
        $senderAddressId = $store?->geliver_sender_address_id
            ?? com_option_get('geliver_sender_address_id')
            ?: config('services.geliver.default_sender_address_id');

        if (! $senderAddressId) {
            throw new \Exception('Gönderici adresi tanımlı değil. Lütfen Kurye Ayarları sayfasından Gönderici Adres ID\'yi girin.');
        }

        // UUID formatını kontrol et (Geliver UUID bekliyor)
        $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
        if (! preg_match($uuidPattern, (string) $senderAddressId)) {
            throw new \Exception(
                'Gönderici Adres ID geçersiz UUID formatında: "' . $senderAddressId . '". '
                . 'Lütfen Kurye Ayarları\'ndan Geliver panelinizde bulunan gönderici adres UUID\'sini girin.'
            );
        }

        // Alıcı adı null ise fallback: email → contact_number → "Müşteri"
        $recipientName = $orderAddress->name
            ?: ($orderAddress->email ?: ($orderAddress->contact_number ?: 'Müşteri'));

        // Telefon numarası yoksa hata ver
        if (! $orderAddress->contact_number) {
            throw new \Exception('Alıcı telefon numarası bulunamadı. Lütfen sipariş adresini kontrol edin.');
        }

        return [
            'senderAddressID' => (string) $senderAddressId,
            'recipientAddress' => [
                'name'        => $recipientName,
                'phone'       => $this->normalizePhone($orderAddress->contact_number),
                'address1'    => $orderAddress->address,
                'cityName'    => $this->getCityName($orderAddress->address),
                'countryCode' => 'TR',
            ],
            'length'       => '20.0',
            'width'        => '15.0',
            'height'       => '10.0',
            'weight'       => '1.0',
            'massUnit'     => 'kg',
            'distanceUnit' => 'cm',
        ];
    }

    /**
     * Geliver shipment yaratır.
     */
    private function createGeliverShipment(array $shipmentData): array
    {
        if ($this->testMode) {
            $response = $this->getClient()->shipments()->createTest($shipmentData);
        } else {
            $response = $this->getClient()->shipments()->create($shipmentData);
        }

        // SDK envelope dönebilir: { result, data: {...} } veya doğrudan obje
        return $response['data'] ?? $response;
    }

    /**
     * Geliver offers yapısını tek bir listeye normalize et.
     */
    private function normalizeOffers(mixed $offers): array
    {
        if (!is_array($offers)) {
            return [];
        }

        $result = [];
        $pushOffer = function (mixed $offer) use (&$result): void {
            if (!is_array($offer) || empty($offer['id'])) {
                return;
            }
            $priceRaw = $offer['price'] ?? $offer['totalPrice'] ?? null;
            $currency = $offer['currency'] ?? 'TRY';
            $result[] = [
                'id' => (string) $offer['id'],
                'carrier_name' => $offer['carrier']['name'] ?? null,
                'price' => is_numeric($priceRaw) ? (float) $priceRaw : null,
                'currency' => (string) $currency,
                'price_text' => is_numeric($priceRaw) ? number_format((float) $priceRaw, 2, ',', '.') . ' ' . $currency : null,
            ];
        };

        if (isset($offers['cheapest']) && is_array($offers['cheapest'])) {
            $pushOffer($offers['cheapest']);
        }

        foreach (['all', 'list', 'offers', 'items'] as $key) {
            if (!empty($offers[$key]) && is_array($offers[$key])) {
                foreach ($offers[$key] as $offer) {
                    $pushOffer($offer);
                }
            }
        }

        // Bazı cevaplarda offers direkt dizi olabilir.
        if (array_is_list($offers)) {
            foreach ($offers as $offer) {
                $pushOffer($offer);
            }
        }

        // ID bazlı unique
        $unique = [];
        foreach ($result as $offer) {
            $unique[$offer['id']] = $offer;
        }

        return array_values($unique);
    }

    /**
     * Varsayılan teklif ID'sini çözer (önce cheapest, yoksa en düşük fiyat).
     */
    private function resolveDefaultOfferId(array $shipment, array $offers): ?string
    {
        $cheapestId = $shipment['offers']['cheapest']['id'] ?? null;
        if (!empty($cheapestId)) {
            return (string) $cheapestId;
        }

        $sorted = collect($offers)
            ->filter(fn ($item) => isset($item['price']) && is_numeric($item['price']))
            ->sortBy('price')
            ->values();

        return !empty($sorted[0]['id']) ? (string) $sorted[0]['id'] : ($offers[0]['id'] ?? null);
    }

    private function offerCacheKey(int $orderId, string $offerId): string
    {
        return "geliver_offer_meta:order:{$orderId}:offer:{$offerId}";
    }

    /**
     * Kargo iptal et.
     */
    public function cancelShipment(CargoShipment $cargoShipment): bool
    {
        if ($cargoShipment->geliver_shipment_id) {
            $this->getClient()->shipments()->cancel($cargoShipment->geliver_shipment_id);
        }

        $cargoShipment->update(['status' => 'cancelled']);
        return true;
    }

    /**
     * Mevcut tracking durumunu Geliver'dan çek (webhook yoksa polling).
     */
    public function getTrackingStatus(CargoShipment $cargoShipment): array
    {
        if (! $cargoShipment->geliver_shipment_id) {
            return ['status' => $cargoShipment->status];
        }

        $shipment = $this->getClient()->shipments()->get($cargoShipment->geliver_shipment_id);
        return $shipment;
    }

    /**
     * Mağaza için Geliver'da gönderici adresi oluştur.
     */
    public function createSenderAddress(array $data): array
    {
        return $this->getClient()->addresses()->createSender([
            'name'         => $data['name'],
            'email'        => $data['email'],
            'phone'        => $data['phone'],
            'address1'     => $data['address'],
            'cityCode'     => $data['city_code'],
            'districtName' => $data['district'] ?? '',
            'zip'          => $data['zip'] ?? '',
        ]);
    }

    /**
     * Şehir listesi (Geliver'dan).
     */
    public function listCities(): array
    {
        return $this->getClient()->geo()->listCities('TR');
    }

    /**
     * Telefon numarasını Geliver'ın beklediği +90XXXXXXXXXX formatına normalize et.
     */
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);

        // 05XXXXXXXXX → +905XXXXXXXXX
        if (preg_match('/^0(\d{10})$/', $phone, $m)) {
            return '+90' . $m[1];
        }
        // 5XXXXXXXXX → +905XXXXXXXXX
        if (preg_match('/^(\d{10})$/', $phone, $m)) {
            return '+90' . $m[1];
        }

        return $phone;
    }

    /**
     * Adres metninden şehir adı tahmin et.
     * Geliver cityCode değil cityName kabul etmektedir.
     */
    private function getCityName(string $address): string
    {
        $cityMap = [
            'istanbul'  => 'Istanbul',
            'ankara'    => 'Ankara',
            'izmir'     => 'Izmir',
            'bursa'     => 'Bursa',
            'antalya'   => 'Antalya',
            'adana'     => 'Adana',
            'konya'     => 'Konya',
            'gaziantep' => 'Gaziantep',
            'mersin'    => 'Mersin',
            'kayseri'   => 'Kayseri',
            'eskişehir' => 'Eskisehir',
            'diyarbakır'=> 'Diyarbakir',
            'samsun'    => 'Samsun',
            'denizli'   => 'Denizli',
            'şanlıurfa' => 'Sanliurfa',
            'trabzon'   => 'Trabzon',
            'malatya'   => 'Malatya',
        ];

        $lower = mb_strtolower($address, 'UTF-8');
        foreach ($cityMap as $keyword => $name) {
            if (str_contains($lower, $keyword)) {
                return $name;
            }
        }

        return 'Istanbul'; // Default
    }
}
