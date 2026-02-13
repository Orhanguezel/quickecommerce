<?php

namespace App\Console\Commands;

use App\Services\ExchangeRateService;
use Illuminate\Console\Command;

class UpdateExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currency:update-rates {--base=USD : Base currency code}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update exchange rates for all currencies from external API';

    /**
     * Execute the console command.
     */
    public function handle(ExchangeRateService $service): int
    {
        $this->info('Updating exchange rates...');

        $baseCurrency = $this->option('base');

        $result = $service->updateExchangeRates($baseCurrency);

        if ($result['success']) {
            $this->info("✅ Successfully updated {$result['updated_count']} / {$result['total_count']} currencies");
            $this->info("Base currency: {$result['base_currency']}");
            $this->info("Timestamp: {$result['timestamp']}");

            if (!empty($result['errors'])) {
                $this->warn("\n⚠️  Errors:");
                foreach ($result['errors'] as $error) {
                    $this->warn("  - {$error}");
                }
            }

            return Command::SUCCESS;
        } else {
            $this->error("❌ Failed to update exchange rates");
            $this->error("Error: {$result['error']}");

            return Command::FAILURE;
        }
    }
}
