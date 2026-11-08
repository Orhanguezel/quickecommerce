<?php

namespace App\Console\Commands;

use App\Models\WhatsappMessage;
use App\Models\WhatsappWebhookEvent;
use Illuminate\Console\Command;

class WhatsappPrune extends Command
{
    protected $signature = 'whatsapp:prune {--apply}';

    protected $description = 'Erase expired message bodies and webhook payloads while retaining deduplication keys and delivery audit';

    public function handle(): int
    {
        $before = now()->subDays(max(7, (int) config('whatsapp.retention_days', 90)));
        // NULL reasons must also be eligible.
        $messages = WhatsappMessage::where('created_at', '<', $before)->whereNotIn('status', ['pending', 'retry_wait', 'sending'])
            ->where(fn ($q) => $q->whereNull('reason')->orWhere('reason', '!=', 'content_expired'));
        $this->info('Message bodies eligible: '.$messages->count());
        if (! $this->option('apply')) {
            return self::SUCCESS;
        }
        $messages->chunkById(100, function ($rows) {
            foreach ($rows as $m) {
                $m->payload = [];
                $m->reason = 'content_expired';
                $m->save();
            }
        });
        WhatsappWebhookEvent::where('created_at', '<', $before)->where('status', '!=', 'expired')->chunkById(100, function ($rows) {
            foreach ($rows as $e) {
                $e->payload = [];
                $e->status = 'expired';
                $e->save();
            }
        });

        return self::SUCCESS;
    }
}
