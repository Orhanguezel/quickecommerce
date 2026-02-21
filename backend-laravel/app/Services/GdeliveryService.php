<?php

namespace App\Services;

use App\Models\CargoShipment;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\Store;
use Geliver\Client;

class GdeliveryService
{
    private Client $client;
    private bool $testMode;

    public function __construct()
    {
        $apiToken = config('services.geliver.api_token');
        $this->testMode = (bool) config('services.geliver.test_mode', false);
        $this->client = new Client($apiToken);
    }

    /**
     * Kargo oluştur: sipariş için Geliver'da shipment yarat, en ucuz teklifi al, kabul et.
     *
     * @param Order  $order
     * @param string $createdByType  'admin' | 'seller'
     * @param int    $createdById
     * @return CargoShipment
     * @throws \Exception
     */
    public function createShipment(Order $order, string $createdByType = 'admin', int $createdById = 0): CargoShipment
    {
        // Mevcut kargo varsa döndür
        $existing = CargoShipment::where('order_id', $order->id)
            ->whereNotIn('status', ['cancelled'])
            ->first();

        if ($existing) {
            return $existing;
        }

        // Sipariş adresi
        $orderAddress = OrderAddress::where('order_master_id', $order->order_master_id)
            ->where('type', 'delivery')
            ->first();

        if (! $orderAddress) {
            throw new \Exception('Sipariş teslimat adresi bulunamadı.');
        }

        // Gönderici adresi (mağazanın geliver_sender_address_id'si)
        $store = Store::find($order->store_id);
        $senderAddressId = $store?->geliver_sender_address_id
            ?? config('services.geliver.default_sender_address_id');

        if (! $senderAddressId) {
            throw new \Exception('Gönderici adresi tanımlı değil. Lütfen mağaza ayarlarından Geliver gönderici adresini kaydedin.');
        }

        // Kargo bilgileri (ürün ağırlığı/boyutu için default değerler)
        $shipmentData = [
            'senderAddressID' => $senderAddressId,
            'recipientAddress' => [
                'name'     => $orderAddress->name,
                'phone'    => $orderAddress->contact_number,
                'address1' => $orderAddress->address,
                'cityCode'  => $this->getCityCode($orderAddress->address),
            ],
            'length'       => '20.0',
            'width'        => '15.0',
            'height'       => '10.0',
            'weight'       => '1.0',
            'massUnit'     => 'kg',
            'distanceUnit' => 'cm',
        ];

        // Test ya da production
        if ($this->testMode) {
            $shipment = $this->client->shipments()->createTest($shipmentData);
        } else {
            $shipment = $this->client->shipments()->create($shipmentData);
        }

        // En ucuz teklifi seç
        $offers = $shipment['offers'] ?? null;
        if (empty($offers) || empty($offers['cheapest'])) {
            throw new \Exception('Geliver\'dan teklif alınamadı. Lütfen tekrar deneyin.');
        }

        $cheapestOfferId = $offers['cheapest']['id'];
        $carrierName = $offers['cheapest']['carrier']['name'] ?? null;

        // Teklifi kabul et
        $transaction = $this->client->transactions()->acceptOffer($cheapestOfferId);

        $barcode        = $transaction['shipment']['barcode'] ?? null;
        $trackingNumber = $transaction['shipment']['trackingNumber'] ?? null;
        $labelUrl       = $transaction['shipment']['labelURL'] ?? null;
        $transactionId  = $transaction['id'] ?? null;

        // Kaydet
        $cargoShipment = CargoShipment::create([
            'order_id'               => $order->id,
            'store_id'               => $order->store_id,
            'geliver_shipment_id'    => $shipment['id'] ?? null,
            'geliver_transaction_id' => $transactionId,
            'carrier_name'           => $carrierName,
            'barcode'                => $barcode,
            'tracking_number'        => $trackingNumber,
            'label_url'              => $labelUrl,
            'status'                 => 'shipped',
            'created_by_type'        => $createdByType,
            'created_by_id'          => $createdById,
            'raw_response'           => ['shipment' => $shipment, 'transaction' => $transaction],
        ]);

        // Sipariş durumunu güncelle
        $order->update(['status' => 'on_the_way']);

        return $cargoShipment;
    }

    /**
     * Kargo iptal et.
     */
    public function cancelShipment(CargoShipment $cargoShipment): bool
    {
        if ($cargoShipment->geliver_shipment_id) {
            $this->client->shipments()->cancel($cargoShipment->geliver_shipment_id);
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

        $shipment = $this->client->shipments()->get($cargoShipment->geliver_shipment_id);
        return $shipment;
    }

    /**
     * Mağaza için Geliver'da gönderici adresi oluştur.
     */
    public function createSenderAddress(array $data): array
    {
        return $this->client->addresses()->createSender([
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
        return $this->client->geo()->listCities();
    }

    /**
     * Adres metninden şehir kodu tahmin et (basit fallback).
     * Gerçekte kullanıcıdan city_code alınmalı ya da geocoding kullanılmalı.
     */
    private function getCityCode(string $address): string
    {
        $cityMap = [
            'istanbul'  => '34',
            'ankara'    => '06',
            'izmir'     => '35',
            'bursa'     => '16',
            'antalya'   => '07',
            'adana'     => '01',
            'konya'     => '42',
            'gaziantep' => '27',
            'mersin'    => '33',
            'kayseri'   => '38',
        ];

        $lower = mb_strtolower($address, 'UTF-8');
        foreach ($cityMap as $city => $code) {
            if (str_contains($lower, $city)) {
                return $code;
            }
        }

        return '34'; // Default Istanbul
    }
}
