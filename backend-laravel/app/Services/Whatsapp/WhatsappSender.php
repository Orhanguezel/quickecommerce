<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use App\Models\WhatsappMessage;
use Illuminate\Support\Facades\DB;

final class WhatsappSender
{
    public function __construct(private WhatsappCloudClient $client, private WhatsappConsentService $consents, private WhatsappTemplateService $templates) {}

    public function gate(WhatsappMessage $m, WhatsappConnection $c): ?string
    {
        if (! config('whatsapp.enabled') || ! $c->enabled) {
            return 'channel_disabled';
        }
        if ($m->connection_version !== $c->version) {
            return 'connection_changed';
        }
        if ($m->expires_at?->isPast()) {
            return 'event_expired';
        }
        if ($this->consents->blocked($m->recipient)) {
            return 'opted_out';
        }
        if (($c->pilot_mode || $m->event_type === 'pilot_test') && ! in_array($m->recipient, $c->pilot_numbers ?? [], true)) {
            return 'outside_pilot';
        }
        if (! $c->subscribed || ! ($c->health['connected'] ?? false) || ($c->health['messaging_status'] ?? '') !== 'AVAILABLE'
            || ! $c->checked_at || $c->checked_at->lt(now()->subMinutes(config('whatsapp.health_ttl_minutes')))) {
            return 'connection_not_ready';
        }
        if (in_array($m->event_type, ['reply', 'media', 'auto_reply'])) {
            $last = WhatsappMessage::where(['connection_id' => $c->id, 'recipient' => $m->recipient, 'direction' => 'inbound'])->max('provider_at');
            if (! $last || \Carbon\Carbon::parse($last)->lt(now()->subHours(24))) {
                return 'conversation_window_closed';
            }

            return null;
        }
        if ($m->event_type !== 'pilot_test') {
            if (! in_array($m->event_type, $c->enabled_events ?? [])) {
                return 'event_disabled';
            }
            $consent = $this->consents->resolve($m->customer_id, $m->order_master_id);
            if (! $consent || $consent->phone !== $m->recipient || (int) $consent->id !== (int) ($m->payload['consent_id'] ?? 0)) {
                return 'consent_changed';
            }
        }
        if (! $this->templates->approved($c->id, $m->template_name, count($m->payload['parameters'] ?? []), $m->payload['template_hash'] ?? null)) {
            return 'template_unavailable';
        }
        if ($m->order_master_id) {
            $master = DB::table('order_masters')->where('id', $m->order_master_id)->first();
            if (! $master) {
                return 'order_missing';
            }
            if ($c->activated_at && \Carbon\Carbon::parse($master->created_at)->lt($c->activated_at)) {
                return 'historical_order';
            }
            if ($m->event_type === 'payment_confirmed' && $master->payment_status !== 'paid') {
                return 'payment_changed';
            }
            if (in_array($m->event_type, ['payment_confirmed', 'cod_order_accepted']) && ! DB::table('orders')->where('order_master_id', $master->id)->whereNotIn('status', ['cancelled', 'delivered'])->exists()) {
                return 'order_closed';
            }
        }
        if ($m->shipment_id) {
            $shipment = DB::table('cargo_shipments')->where('id', $m->shipment_id)->first();
            $wanted = $m->event_type === 'shipment_dispatched' ? 'in_transit' : 'delivered';
            if (! $shipment || $shipment->status !== $wanted) {
                return 'shipment_changed';
            }
        }

        return null;
    }

    public function send(string $id): void
    {
        $claim = DB::transaction(function () use ($id) {
            $m = WhatsappMessage::whereKey($id)->lockForUpdate()->first();
            if (! $m || ! in_array($m->status, ['pending', 'retry_wait']) || $m->next_attempt_at?->isFuture()) {
                return null;
            }
            $c = WhatsappConnection::whereKey($m->connection_id)->lockForUpdate()->first();
            $reason = $c ? $this->gate($m, $c) : 'connection_missing';
            if ($reason) {
                $temporary = $reason === 'connection_not_ready' && ! $m->expires_at?->isPast();
                $m->update(['status' => $temporary ? 'retry_wait' : 'suppressed', 'reason' => $reason, 'next_attempt_at' => now()->addMinute()]);

                return null;
            }
            $recentForRecipient = WhatsappMessage::where('connection_id', $c->id)->where('recipient', $m->recipient)->where('direction', 'outbound')
                ->where('attempts', '>', 0)->where('updated_at', '>', now()->subSeconds(6))->where('id', '!=', $m->id)->exists();
            $recentForAccount = DB::table('whatsapp_message_attempts')->join('whatsapp_messages', 'whatsapp_messages.id', '=', 'whatsapp_message_attempts.message_id')
                ->where('whatsapp_messages.connection_id', $c->id)->where('started_at', '>', now()->subMinute())->count();
            if ($recentForRecipient || $recentForAccount >= 60) {
                $m->update(['status' => 'retry_wait', 'reason' => 'rate_limited_locally', 'next_attempt_at' => now()->addSeconds(10)]);

                return null;
            }
            $m->status = 'sending';
            $m->attempts++;
            $m->lease_until = now()->addSeconds(60);
            $m->reason = null;
            $m->save();
            $payload = $this->payload($m);
            $attempt = DB::table('whatsapp_message_attempts')->insertGetId(['message_id' => $m->id, 'number' => $m->attempts, 'status' => 'sending',
                'request_hash' => hash('sha256', json_encode($payload)), 'started_at' => now()]);

            return [$m, $c, $attempt, $payload];
        });
        if (! $claim) {
            return;
        }
        [$m, $c, $attempt, $payload] = $claim;
        try {
            $response = $this->client->request($c, 'POST', $c->phone_number_id.'/messages', $payload);
            $providerId = $response['messages'][0]['id'] ?? null;
            if (! is_string($providerId) || $providerId === '') {
                throw new WhatsappProviderException(null, 'message_id_missing');
            }
            DB::transaction(function () use ($m, $attempt, $providerId) {
                DB::table('whatsapp_message_attempts')->where('id', $attempt)->update(['status' => 'accepted', 'provider_message_id' => $providerId, 'finished_at' => now()]);
                $current = WhatsappMessage::whereKey($m->id)->lockForUpdate()->firstOrFail();
                $current->update(['status' => in_array($current->status, ['sent', 'delivered', 'read', 'failed']) ? $current->status : 'accepted', 'provider_message_id' => $providerId, 'lease_until' => null]);
            });
            app(WhatsappWebhookProcessor::class)->reconcile($c->id, $providerId);
        } catch (WhatsappProviderException $e) {
            $retry = $e->definiteRejection && in_array($e->providerCode, ['4', '17', '32', '613', '130429', '131056']) && $m->attempts < 4;
            $status = $retry ? 'retry_wait' : ($e->definiteRejection ? 'failed' : 'unknown');
            DB::transaction(function () use ($m, $attempt, $e, $retry, $status) {
                DB::table('whatsapp_message_attempts')->where('id', $attempt)->update(['status' => $e->definiteRejection ? 'rejected' : 'unknown', 'http_status' => $e->httpStatus, 'error_code' => $e->providerCode, 'finished_at' => now()]);
                WhatsappMessage::whereKey($m->id)->where('status', 'sending')->update(['status' => $status, 'reason' => $e->providerCode, 'lease_until' => null,
                    'next_attempt_at' => $retry ? now()->addMinutes([1, 5, 30][$m->attempts - 1]) : null, 'updated_at' => now()]);
            });
        } catch (\Throwable) {
            // Provider may have accepted. Never rethrow into an automatic sending retry.
            WhatsappMessage::whereKey($m->id)->where('status', 'sending')->update(['status' => 'unknown', 'reason' => 'local_result_unknown', 'lease_until' => null]);
            logger()->error('whatsapp_result_unknown', ['message_id' => $m->id]);
        }
    }

    private function payload(WhatsappMessage $m): array
    {
        $p = ['messaging_product' => 'whatsapp', 'recipient_type' => 'individual', 'biz_opaque_callback_data' => $m->id, 'to' => ltrim($m->recipient, '+')];
        if (! empty($m->payload['reply_to'])) { $p['context'] = ['message_id' => $m->payload['reply_to']]; }
        if (in_array($m->event_type, ['reply', 'auto_reply'])) {
            return $p + ['type' => 'text', 'text' => ['body' => $m->payload['body'], 'preview_url' => false]];
        }
        if ($m->event_type === 'media') {
            return $p + ['type' => $m->payload['media_type'], $m->payload['media_type'] => ['id' => $m->payload['media_id']] + ($m->payload['media_type'] === 'document' ? ['filename' => $m->payload['filename']] : [])];
        }

        return $p + ['type' => 'template', 'template' => ['name' => $m->template_name, 'language' => ['code' => 'tr'],
            'components' => [['type' => 'body', 'parameters' => array_map(fn ($text) => ['type' => 'text', 'text' => $text], $m->payload['parameters'])]]]];
    }
}
