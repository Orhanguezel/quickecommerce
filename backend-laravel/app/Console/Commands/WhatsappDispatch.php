<?php

namespace App\Console\Commands;

use App\Models\WhatsappMessage;
use App\Models\WhatsappWebhookEvent;
use App\Services\Whatsapp\WhatsappMessageRecorder;
use App\Services\Whatsapp\WhatsappWebhookProcessor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class WhatsappDispatch extends Command
{
    protected $signature = 'whatsapp:dispatch';

    protected $description = 'Recover durable WhatsApp events and queue eligible messages without replaying uncertain sends';

    public function handle(WhatsappWebhookProcessor $processor, WhatsappMessageRecorder $recorder): int
    {
        DB::transaction(function () {
            $ids = WhatsappMessage::where('status', 'sending')->where('lease_until', '<', now())->lockForUpdate()->pluck('id');
            WhatsappMessage::whereIn('id', $ids)->update(['status' => 'unknown', 'reason' => 'worker_lease_expired', 'lease_until' => null]);
            DB::table('whatsapp_message_attempts')->whereIn('message_id', $ids)->where('status', 'sending')->update(['status' => 'unknown', 'finished_at' => now()]);
        });
        WhatsappWebhookEvent::whereIn('status', ['pending', 'unmatched'])->where('created_at', '>', now()->subDays(7))->chunkById(100, function ($events) use ($processor) {
            foreach ($events as $event) {
                $processor->process($event->id);
            }
        });
        WhatsappMessage::whereIn('status', ['pending', 'retry_wait'])->where('next_attempt_at', '<=', now())->orderBy('id')->chunkById(100, function ($messages) use ($recorder) {
            foreach ($messages as $message) {
                $recorder->queue($message->id);
            }
        });

        return self::SUCCESS;
    }
}
