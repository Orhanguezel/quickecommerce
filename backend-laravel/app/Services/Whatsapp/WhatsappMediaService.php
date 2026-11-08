<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

final class WhatsappMediaService
{
    public const TYPES = ['image/jpeg' => 'image', 'image/png' => 'image', 'application/pdf' => 'document'];

    public function upload(WhatsappConnection $c, UploadedFile $file): array
    {
        $mime = $file->getMimeType();
        abort_unless(isset(self::TYPES[$mime]) && $file->getSize() <= 5 * 1024 * 1024, 422, 'Yalnız 5 MB altındaki JPEG, PNG veya PDF dosyaları yüklenebilir.');
        try {
            $r = Http::withToken($c->credentials['access_token'])->connectTimeout(5)->timeout(20)
                ->attach('file', fopen($file->getRealPath(), 'rb'), 'attachment.'.($mime === 'application/pdf' ? 'pdf' : ($mime === 'image/png' ? 'png' : 'jpg')), ['Content-Type' => $mime])
                ->post('https://graph.facebook.com/'.$c->graph_version.'/'.$c->phone_number_id.'/media', ['messaging_product' => 'whatsapp', 'type' => $mime]);
        } catch (\Throwable) {
            throw new WhatsappProviderException(null, 'media_upload_failed');
        }
        if (! $r->successful() || ! is_string($r->json('id'))) {
            throw new WhatsappProviderException($r->status(), 'media_upload_failed');
        }

        return ['media_id' => $r->json('id'), 'media_type' => self::TYPES[$mime], 'filename' => 'attachment.'.($mime === 'application/pdf' ? 'pdf' : ($mime === 'image/png' ? 'png' : 'jpg'))];
    }

    public function download(WhatsappConnection $c, string $id): array
    {
        abort_unless(preg_match('/^[0-9]+$/', $id), 422);
        $meta = app(WhatsappCloudClient::class)->request($c, 'GET', $id);
        $mime = $meta['mime_type'] ?? '';
        abort_unless(isset(self::TYPES[$mime]) && ($meta['file_size'] ?? PHP_INT_MAX) <= 5 * 1024 * 1024, 422, 'Dosya türü veya boyutu desteklenmiyor.');
        $url = $meta['url'] ?? '';
        $host = parse_url($url, PHP_URL_HOST) ?: '';
        abort_unless(parse_url($url, PHP_URL_SCHEME) === 'https' && ! parse_url($url, PHP_URL_USER) && (! parse_url($url, PHP_URL_PORT) || parse_url($url, PHP_URL_PORT) === 443)
            && (str_ends_with($host, '.fbsbx.com') || str_ends_with($host, '.facebook.com') || str_ends_with($host, '.fbcdn.net')), 422);
        try {
            $r = Http::withToken($c->credentials['access_token'])->connectTimeout(5)->timeout(20)->withOptions(['allow_redirects' => false, 'stream' => true])->get($url);
            if (! $r->successful()) {
                throw new \RuntimeException;
            }
            $stream = $r->toPsrResponse()->getBody();
            $body = '';
            while (! $stream->eof()) {
                $body .= $stream->read(65536);
                if (strlen($body) > 5 * 1024 * 1024) {
                    $stream->close();
                    throw new \RuntimeException;
                }
            }
            $stream->close();
            if (! hash_equals(strtolower($meta['sha256'] ?? ''), hash('sha256', $body))) {
                throw new \RuntimeException;
            }
        } catch (\Throwable) {
            throw new WhatsappProviderException(null, 'media_download_failed');
        }

        return [$body, $mime];
    }
}
