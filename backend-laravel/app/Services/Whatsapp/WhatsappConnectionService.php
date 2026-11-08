<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class WhatsappConnectionService
{
    public function __construct(private WhatsappCloudClient $client) {}

    public function connect(array $data): WhatsappConnection
    {
        $candidate = new WhatsappConnection([
            'environment' => app()->environment(), 'business_account_id' => $data['business_account_id'],
            'phone_number_id' => $data['phone_number_id'], 'graph_version' => config('whatsapp.graph_version'),
            'credentials' => ['access_token' => $data['access_token'], 'app_secret' => $data['app_secret'], 'verify_token' => Str::random(64)],
        ]);
        $numbers = $this->client->pages($candidate, $candidate->business_account_id.'/phone_numbers', ['fields' => 'id']);
        if (! collect($numbers)->contains(fn ($n) => (string) ($n['id'] ?? '') === $candidate->phone_number_id)) {
            throw ValidationException::withMessages(['phone_number_id' => 'Numara bu WhatsApp işletme hesabına ait değil.']);
        }
        // Existing OSGB callbacks do not isolate numbers. Do not subscribe a shared WABA here.
        if (count($numbers) !== 1) {
            throw ValidationException::withMessages(['business_account_id' => 'Bu kurulum için yalnız Sportoonline numarasını içeren ayrı bir WABA kullanın. Ortak hesapta abonelik değiştirilmez.']);
        }
        $health = $this->probe($candidate);

        return DB::transaction(function () use ($candidate, $health) {
            $old = WhatsappConnection::where('environment', app()->environment())->lockForUpdate()->first();
            $candidate->version = ($old?->version ?? 0) + 1;
            if ($old) {
                $candidate->credentials = [...$candidate->credentials, 'verify_token' => $old->credentials['verify_token']];
                $old->fill($candidate->getAttributes());
                // fill() must not encrypt an already encrypted value a second time.
                $old->credentials = $candidate->credentials;
                $candidate = $old;
            }
            $candidate->enabled = false;
            $candidate->subscribed = false;
            $candidate->pilot_mode = true;
            $candidate->pilot_numbers = [];
            $candidate->enabled_events = [];
            $candidate->health = $health;
            $candidate->checked_at = now();
            $candidate->save();

            return $candidate;
        });
    }

    public function probe(WhatsappConnection $c): array
    {
        $phone = $this->client->request($c, 'GET', $c->phone_number_id, ['fields' => 'id,display_phone_number,verified_name,status,platform_type,quality_rating']);
        $account = $this->client->request($c, 'GET', $c->business_account_id, ['fields' => 'health_status']);
        $health = $account['health_status'] ?? [];
        $sending = $health['can_send_message'] ?? 'UNKNOWN';
        foreach ($health['entities'] ?? [] as $entity) {
            if (($entity['can_send_message'] ?? '') === 'BLOCKED') {
                $sending = 'BLOCKED';
            }
        }

        return ['connected' => (string) ($phone['id'] ?? '') === $c->phone_number_id && ($phone['status'] ?? '') === 'CONNECTED' && ($phone['platform_type'] ?? '') === 'CLOUD_API',
            'messaging_status' => in_array($sending, ['AVAILABLE', 'LIMITED', 'BLOCKED']) ? $sending : 'UNKNOWN',
            'display_phone_number' => $phone['display_phone_number'] ?? null, 'verified_name' => $phone['verified_name'] ?? null,
            'quality_rating' => $phone['quality_rating'] ?? null];
    }

    public function refresh(WhatsappConnection $c): WhatsappConnection
    {
        try {
            $c->health = $this->probe($c);
        } catch (WhatsappProviderException $e) {
            $c->health = ['connected' => false, 'messaging_status' => 'UNKNOWN', 'error_code' => $e->providerCode];
        }
        $c->checked_at = now();
        $c->save();

        return $c;
    }

    public function subscribe(WhatsappConnection $c): void
    {
        $url = config('whatsapp.callback_url');
        if (! filter_var($url, FILTER_VALIDATE_URL) || parse_url($url, PHP_URL_SCHEME) !== 'https') {
            throw ValidationException::withMessages(['callback_url' => 'HTTPS webhook adresi yapılandırılmalı.']);
        }
        $numbers = $this->client->pages($c, $c->business_account_id.'/phone_numbers', ['fields' => 'id']);
        if (count($numbers) !== 1 || (string) ($numbers[0]['id'] ?? '') !== $c->phone_number_id) {
            throw ValidationException::withMessages(['business_account_id' => 'Ortak veya değişmiş WABA aboneliği değiştirilmedi.']);
        }
        $result = $this->client->request($c, 'POST', $c->business_account_id.'/subscribed_apps', ['override_callback_uri' => $url, 'verify_token' => $c->credentials['verify_token']]);
        if (($result['success'] ?? false) !== true) {
            throw new WhatsappProviderException(null, 'subscription_unconfirmed');
        }
        $c->subscribed = true;
        $c->save();
    }

    public function status(): array
    {
        $c = WhatsappConnection::current();

        return ['configured' => $c !== null, 'channel_available' => (bool) config('whatsapp.enabled'), 'callback_url' => config('whatsapp.callback_url'),
            'events' => config('whatsapp.events'), 'connection' => $c?->toArray()];
    }
}
