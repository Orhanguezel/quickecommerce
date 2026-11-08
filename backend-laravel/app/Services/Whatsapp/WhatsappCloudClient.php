<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use Illuminate\Support\Facades\Http;

final class WhatsappCloudClient
{
    public function request(WhatsappConnection $connection, string $method, string $path, array $data = []): array
    {
        if (! preg_match('/^v\d+\.\d+$/', $connection->graph_version) || str_contains($path, '..') || preg_match('#^https?://#', $path)) {
            throw new WhatsappProviderException(null, 'invalid_api_path');
        }
        try {
            $request = Http::withToken($connection->credentials['access_token'])->acceptJson()->connectTimeout(5)->timeout(config('whatsapp.http_timeout', 15));
            $url = 'https://graph.facebook.com/'.$connection->graph_version.'/'.ltrim($path, '/');
            $response = $method === 'GET' ? $request->get($url, $data) : $request->post($url, $data);
        } catch (\Throwable) {
            throw new WhatsappProviderException(null, 'transport_unknown');
        }
        $body = $response->json();
        if (! $response->successful() || ! is_array($body) || isset($body['error'])) {
            $code = (string) ($body['error']['code'] ?? 'invalid_response');
            throw new WhatsappProviderException($response->status(), preg_replace('/[^0-9a-z_]/i', '', $code), $response->status() >= 400 && $response->status() < 500 && isset($body['error']['code']));
        }

        return $body;
    }

    public function pages(WhatsappConnection $connection, string $path, array $query = []): array
    {
        $items = [];
        $seen = [];
        for ($page = 0; $page < 100; $page++) {
            $result = $this->request($connection, 'GET', $path, $query + ['limit' => 100]);
            $items = array_merge($items, $result['data'] ?? []);
            $after = $result['paging']['cursors']['after'] ?? null;
            if (empty($result['paging']['next'])) {
                return $items;
            }
            if (! $after || isset($seen[$after])) {
                throw new WhatsappProviderException(null, 'pagination_invalid');
            }
            $seen[$after] = true;
            $query['after'] = $after;
        }
        throw new WhatsappProviderException(null, 'pagination_limit');
    }
}
