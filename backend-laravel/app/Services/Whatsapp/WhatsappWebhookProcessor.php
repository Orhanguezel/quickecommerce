<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsappConnection;
use App\Models\WhatsappMessage;
use App\Models\WhatsappWebhookEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class WhatsappWebhookProcessor
{
    public function process(int $id): void
    {
        DB::transaction(function () use ($id) {
            $event = WhatsappWebhookEvent::whereKey($id)->lockForUpdate()->first();
            if (! $event || $event->status === 'processed' || $event->status === 'quarantined') {
                return;
            }
            $c = WhatsappConnection::find($event->connection_id);
            if (! $c) {
                return;
            }
            $pending = false;
            $unsupported = false;
            foreach ($event->payload['entry'] ?? [] as $entry) {
                foreach ($entry['changes'] ?? [] as $change) {
                    $v = $change['value'] ?? [];
                    if ((string) ($entry['id'] ?? '') !== $c->business_account_id || (string) ($v['metadata']['phone_number_id'] ?? '') !== $c->phone_number_id) {
                        continue;
                    }
                    if (empty($v['statuses']) && empty($v['messages'])) {
                        $unsupported = true;
                    }
                    foreach ($v['statuses'] ?? [] as $s) {
                        $m = WhatsappMessage::where('connection_id', $c->id)->where('provider_message_id', $s['id'] ?? '')->lockForUpdate()->first();
                        if (! $m && ! empty($s['biz_opaque_callback_data'])) {
                            $m = WhatsappMessage::where('connection_id', $c->id)->whereKey($s['biz_opaque_callback_data'])->whereIn('status', ['sending', 'unknown'])->lockForUpdate()->first();
                            if ($m && $m->attempts === 1) {
                                $m->provider_message_id = $s['id'];
                            } else {
                                $m = null;
                            }
                        }
                        if (! $m) {
                            $pending = true;

                            continue;
                        }
                        $rank = ['accepted' => 1, 'sent' => 2, 'delivered' => 3, 'read' => 4];
                        $status = $s['status'] ?? '';
                        if (($rank[$status] ?? 0) > ($rank[$m->status] ?? 0)) {
                            $m->status = $status;
                        } elseif ($status === 'failed' && ! in_array($m->status, ['delivered', 'read'])) {
                            $m->status = 'failed';
                            $m->reason = 'provider_delivery_failed';
                        }
                        $timestamp = $this->timestamp($s['timestamp'] ?? null);
                        if ($status === 'delivered' && ! $m->delivered_at) {
                            $m->delivered_at = $timestamp;
                        }
                        if ($status === 'read') {
                            $m->read_at ??= $timestamp;
                            $m->delivered_at ??= $timestamp;
                        }
                        $m->save();
                    }
                    foreach ($v['messages'] ?? [] as $incoming) {
                        if (empty($incoming['id']) || empty($incoming['from'])) {
                            $unsupported = true;
                            continue;
                        }
                        try {
                            $phone = WhatsappPhone::normalize($incoming['from']);
                        } catch (\Throwable) {
                            $unsupported = true;

                            continue;
                        } // Original payload remains quarantined.
                        $owners = DB::table('whatsapp_consents')->where('phone', $phone)->where('enabled', true)->distinct()->pluck('customer_id');
                        $customerId = $owners->count() === 1 ? $owners->first() : null;
                        $m = WhatsappMessage::firstOrCreate(['provider_message_id' => $incoming['id']], [
                            'id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version,
                            'event_key' => 'inbound:'.hash('sha256', $incoming['id']), 'event_type' => 'inbound', 'direction' => 'inbound',
                            'recipient' => $phone, 'customer_id' => $customerId, 'payload' => $incoming, 'status' => 'received', 'provider_at' => $this->timestamp($incoming['timestamp'] ?? null),
                        ]);
                        if (! $m->wasRecentlyCreated) {
                            continue;
                        }
                        $body = mb_strtoupper(trim($incoming['text']['body'] ?? ''), 'UTF-8');
                        if (in_array($body, ['STOP', 'DUR', 'İPTAL', 'IPTAL', 'ABONELİKTEN ÇIK', 'ABONELIKTEN CIK'], true)) {
                            app(WhatsappConsentService::class)->optOut($phone, 'inbound');
                        } else {
                            $this->autoReply($c, $m);
                        }
                    }
                }
            }
            $event->update(['status' => $pending ? 'unmatched' : ($unsupported ? 'quarantined' : 'processed'), 'reason' => $unsupported ? 'unsupported_identity_or_event' : null, 'processed_at' => $pending ? null : now()]);
        });
    }

    public function reconcile(int $connectionId, string $providerId): void
    {
        // Durable early callbacks are replayed after the send result is committed.
        WhatsappWebhookEvent::where('connection_id', $connectionId)->whereIn('status', ['pending', 'unmatched'])
            ->orderBy('id')->chunkById(100, function ($events) {
                foreach ($events as $e) {
                    $this->process($e->id);
                }
            });
    }

    private function autoReply(WhatsappConnection $c, WhatsappMessage $inbound): void
    {
        $hour = now('Europe/Istanbul')->hour;
        if (! $c->out_of_hours_enabled || ! $c->out_of_hours_text || ($hour >= $c->office_start && $hour < $c->office_end)) {
            return;
        }
        $message = WhatsappMessage::createOrFirst(['event_key' => 'auto:'.hash('sha256', $c->id.':'.$inbound->recipient.':'.now('Europe/Istanbul')->toDateString())], [
            'id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version, 'event_type' => 'auto_reply', 'recipient' => $inbound->recipient,
            'payload' => ['body' => $c->out_of_hours_text], 'status' => 'pending', 'expires_at' => $inbound->provider_at->copy()->addHours(24), 'next_attempt_at' => now(),
        ]);
        if ($message->wasRecentlyCreated) {
            app(WhatsappMessageRecorder::class)->queue($message->id);
        }
    }

    private function timestamp(mixed $value): \Carbon\Carbon
    {
        return is_numeric($value) ? \Carbon\Carbon::createFromTimestampUTC((int) $value)->min(now()) : now();
    }
}
