<?php

namespace App\Jobs;

use App\Services\Whatsapp\WhatsappSender;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendWhatsappMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 45;

    public function __construct(public string $messageId)
    {
        $this->onQueue('whatsapp');
    }

    public function handle(WhatsappSender $sender): void
    {
        $sender->send($this->messageId);
    }
}
