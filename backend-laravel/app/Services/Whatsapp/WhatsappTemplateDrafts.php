<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

final class WhatsappTemplateDrafts
{
    private const CUSTOMER = ['Müşteri adı', 'Deniz'];
    private const ORDER = ['Sipariş numarası', '12345'];
    private const PACKAGE = ['Paket numarası', '12346'];
    private const AMOUNT = ['Tutar', '1.249,00 TL'];

    private const DEFINITIONS = [
        'payment_confirmed' => [
            'Merhaba {{1}}, {{2}} numaralı siparişiniz için {{3}} tutarındaki ödemeniz alındı. Sipariş durumunu hesabınızdan takip edebilirsiniz.',
            [self::CUSTOMER, self::ORDER, self::AMOUNT],
        ],
        'cod_order_accepted' => [
            'Merhaba {{1}}, {{2}} numaralı kapıda ödemeli siparişiniz alındı. Ödenecek tutar: {{3}}.',
            [self::CUSTOMER, self::ORDER, self::AMOUNT],
        ],
        'shipment_dispatched' => [
            '{{1}} numaralı siparişinizin {{2}} paketi {{3}} kargosuna verildi. Takip numarası: {{4}}.',
            [self::ORDER, self::PACKAGE, ['Kargo firması', 'Yurtiçi Kargo'], ['Takip numarası', '123456789']],
        ],
        'shipment_delivered' => [
            '{{1}} numaralı siparişinizin {{2}} paketi teslim edildi olarak bildirildi. Destek için bize ulaşabilirsiniz.',
            [self::ORDER, self::PACKAGE],
        ],
        'order_cancelled' => [
            '{{1}} numaralı siparişinizin {{2}} bölümü iptal edildi. İade durumu varsa ayrıca bilgilendirileceksiniz.',
            [self::ORDER, self::PACKAGE],
        ],
        'refund_confirmed' => [
            '{{1}} numaralı siparişiniz için {{2}} tutarındaki iade ödeme sağlayıcısı tarafından işlendi. Hesabınıza yansıma süresi bankanıza bağlıdır.',
            [self::ORDER, self::AMOUNT],
        ],
    ];

    public function all(WhatsappConnection $connection): array
    {
        return array_map(fn ($event) => $this->draft($connection, $event), array_keys(self::DEFINITIONS));
    }

    public function save(WhatsappConnection $connection, string $event, string $body, string $revision): array
    {
        abort_unless(isset(self::DEFINITIONS[$event]), 404);
        $body = trim($body);
        $count = config("whatsapp.events.$event.parameters");
        preg_match_all('/\{\{([1-9][0-9]*)\}\}/', $body, $matches);
        $rest = preg_replace('/\{\{[1-9][0-9]*\}\}/', '', $body);
        if ($matches[1] !== array_map('strval', range(1, $count)) || strpbrk($rest, '{}') !== false) {
            throw ValidationException::withMessages(['body' => 'Numaralı alanları birer kez ve gösterilen sırayla kullanın.']);
        }

        $path = $this->path($connection, $event);

        return Cache::lock('whatsapp-draft:'.hash('sha256', $path), 10)->block(3, function () use ($connection, $event, $body, $revision, $path) {
            $existing = $this->draft($connection, $event);
            abort_unless(hash_equals($existing['revision'], $revision), 409, 'Taslak başka bir oturumda değişti. Güncel sürümü yükleyin.');
            if ($existing['body'] === $body) {
                return $existing;
            }

            File::ensureDirectoryExists(dirname($path), 0700, true);
            File::replace($path, json_encode(['body' => $body, 'saved_at' => now()->toISOString()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), 0600);

            return $this->draft($connection, $event);
        });
    }

    private function draft(WhatsappConnection $connection, string $event): array
    {
        [$default, $variables] = self::DEFINITIONS[$event];
        $path = $this->path($connection, $event);
        $stored = File::isFile($path) ? json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR) : [];
        $body = $stored['body'] ?? $default;
        $savedAt = $stored['saved_at'] ?? null;

        return [
            'event' => $event,
            'name' => config("whatsapp.events.$event.template"),
            'body' => $body,
            'variables' => array_map(fn ($variable) => ['label' => $variable[0], 'sample' => $variable[1]], $variables),
            'saved_at' => $savedAt,
            'revision' => hash('sha256', json_encode([$body, $savedAt], JSON_THROW_ON_ERROR)),
        ];
    }

    private function path(WhatsappConnection $connection, string $event): string
    {
        $account = hash('sha256', $connection->environment.':'.$connection->business_account_id);

        return storage_path("app/whatsapp-template-drafts/$account/$event.json");
    }
}
