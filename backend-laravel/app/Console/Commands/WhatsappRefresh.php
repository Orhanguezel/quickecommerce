<?php

namespace App\Console\Commands;

use App\Models\WhatsappConnection;
use App\Services\Whatsapp\WhatsappConnectionService;
use App\Services\Whatsapp\WhatsappTemplateService;
use Illuminate\Console\Command;

class WhatsappRefresh extends Command
{
    protected $signature = 'whatsapp:refresh';

    protected $description = 'Refresh account health and approved template snapshots';

    public function handle(WhatsappConnectionService $connections, WhatsappTemplateService $templates): int
    {
        $c = WhatsappConnection::current();
        if (! $c) {
            return self::SUCCESS;
        }
        $connections->refresh($c);
        try {
            $templates->sync($c);
        } catch (\App\Services\Whatsapp\WhatsappProviderException $e) {
            $this->error('Template sync: '.$e->providerCode);

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
