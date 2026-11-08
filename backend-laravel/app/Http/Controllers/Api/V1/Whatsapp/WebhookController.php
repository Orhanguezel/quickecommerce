<?php

namespace App\Http\Controllers\Api\V1\Whatsapp;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\WhatsappConnection;
use App\Models\WhatsappWebhookEvent;
use Illuminate\Http\Request;

final class WebhookController extends Controller
{
    public function verify(Request $request)
    {
        $c = WhatsappConnection::current();
        abort_unless($c && $request->query('hub_mode') === 'subscribe' && is_string($request->query('hub_verify_token'))
            && hash_equals($c->credentials['verify_token'] ?? '', $request->query('hub_verify_token')), 403);

        return response((string) $request->query('hub_challenge'), 200)->header('Content-Type', 'text/plain');
    }

    public function receive(Request $request)
    {
        $c = WhatsappConnection::current();
        abort_unless($c && ! empty($c->credentials['app_secret']), 403);
        abort_if(strlen($request->getContent()) > 1048576, 413);
        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $c->credentials['app_secret']);
        abort_unless(hash_equals($expected, (string) $request->header('X-Hub-Signature-256')), 403);
        $payload = json_decode($request->getContent(), true);
        abort_unless(is_array($payload) && ($payload['object'] ?? '') === 'whatsapp_business_account', 422);
        $matched = false;
        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                if ((string) ($entry['id'] ?? '') === $c->business_account_id && (string) ($change['value']['metadata']['phone_number_id'] ?? '') === $c->phone_number_id) {
                    $matched = true;
                }
            }
        }
        $event = WhatsappWebhookEvent::firstOrCreate(['event_hash' => hash('sha256', $c->id.':'.$request->getContent())], [
            'connection_id' => $c->id, 'payload' => $payload, 'status' => $matched ? 'pending' : 'quarantined',
            'reason' => $matched ? null : 'unmatched_account_or_phone',
        ]);

        // Process opt-outs before acknowledging; the durable row also supports crash recovery.
        if ($matched) { app(\App\Services\Whatsapp\WhatsappWebhookProcessor::class)->process($event->id); }
        return response()->json(['received' => true]);
    }
}
