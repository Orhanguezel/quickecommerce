<?php

namespace App\Services\Whatsapp;

use App\Jobs\SendWhatsappMessageJob;
use App\Models\WhatsappConnection;
use App\Models\WhatsappMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class WhatsappMessageRecorder
{
    public function record(string $event, string $key, int $customerId, ?int $masterId, array $parameters, array $references = []): ?WhatsappMessage
    {
        if (! config('whatsapp.enabled') || ! ($c = WhatsappConnection::current())) {
            return null;
        }
        $spec = config('whatsapp.events.'.$event);
        if (! $spec || count($parameters) !== $spec['parameters']) {
            throw new \InvalidArgumentException('Invalid WhatsApp event parameters');
        }
        $consent = app(WhatsappConsentService::class)->resolve($customerId, $masterId);
        $template = app(WhatsappTemplateService::class)->approved($c->id, $spec['template'], count($parameters));
        $reason = ! $c->enabled ? 'channel_disabled' : (! in_array($event, $c->enabled_events ?? []) ? 'event_disabled' : (! $consent ? 'consent_missing' : (! $template ? 'template_unavailable' : null)));
        $message = WhatsappMessage::createOrFirst(['event_key' => hash('sha256', app()->environment().':'.$event.':'.$key)], [
            'id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version, 'event_type' => $event,
            'customer_id' => $customerId, 'order_master_id' => $masterId, ...$references,
            'recipient' => $consent?->phone ?? '', 'template_name' => $spec['template'], 'language' => 'tr',
            'payload' => ['parameters' => array_map('strval', $parameters), 'consent_id' => $consent?->id, 'template_hash' => $template?->content_hash],
            'status' => $reason ? 'suppressed' : 'pending', 'reason' => $reason, 'expires_at' => now()->addHours($spec['ttl_hours']), 'next_attempt_at' => now(),
        ]);
        if ($message->wasRecentlyCreated && $message->status === 'pending') {
            $this->queue($message->id);
        }

        return $message;
    }

    public function queue(string $id): void
    {
        DB::afterCommit(function () use ($id) {
            try {
                SendWhatsappMessageJob::dispatch($id)->onConnection('database')->onQueue(config('whatsapp.queue'));
            } catch (\Throwable) {
                logger()->warning('whatsapp_dispatch_deferred', ['message_id' => $id]);
            }
        });
    }
}
