<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use Illuminate\Support\Facades\DB;

final class WhatsappTemplateService
{
    public function __construct(private WhatsappCloudClient $client) {}

    public function sync(WhatsappConnection $c): void
    {
        $templates = $this->client->pages($c, $c->business_account_id.'/message_templates', ['fields' => 'id,name,status,language,category,components']);
        DB::transaction(function () use ($c, $templates) {
            DB::table('whatsapp_templates')->where('connection_id', $c->id)->update(['status' => 'NOT_FOUND']);
            foreach ($templates as $t) {
                if (! isset($t['name'], $t['language'], $t['status'], $t['category'])) {
                    continue;
                }
                DB::table('whatsapp_templates')->updateOrInsert(['connection_id' => $c->id, 'name' => $t['name'], 'language' => $t['language']], [
                    'provider_id' => $t['id'] ?? null, 'status' => $t['status'], 'category' => $t['category'],
                    'components' => json_encode($t['components'] ?? [], JSON_UNESCAPED_UNICODE),
                    'content_hash' => hash('sha256', json_encode($t['components'] ?? [])), 'checked_at' => now(),
                ]);
            }
        });
    }

    public function approved(int $connectionId, string $name, int $count, ?string $hash = null): ?object
    {
        $t = DB::table('whatsapp_templates')->where(['connection_id' => $connectionId, 'name' => $name, 'language' => 'tr', 'status' => 'APPROVED', 'category' => 'UTILITY'])
            ->where('checked_at', '>=', now()->subMinutes(config('whatsapp.template_ttl_minutes')))->first();
        if (! $t || ($hash && ! hash_equals($hash, $t->content_hash))) {
            return null;
        }
        $components = json_decode($t->components, true) ?: [];
        $body = collect($components)->firstWhere('type', 'BODY');
        preg_match_all('/\{\{(\d+)\}\}/', $body['text'] ?? '', $matches);
        $numbers = array_values(array_unique(array_map('intval', $matches[1])));
        sort($numbers);
        if ($numbers !== ($count ? range(1, $count) : [])) {
            return null;
        }
        foreach ($components as $component) {
            if (($component['type'] ?? '') !== 'BODY' && (str_contains(json_encode($component), '{{') || in_array($component['format'] ?? '', ['IMAGE', 'DOCUMENT', 'VIDEO', 'LOCATION']))) {
                return null;
            }
        }
        if (preg_match('/\{\{[^0-9]/', $body['text'] ?? '')) {
            return null;
        }

        return $t;
    }
}
