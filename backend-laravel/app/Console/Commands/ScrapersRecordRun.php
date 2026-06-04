<?php

namespace App\Console\Commands;

use App\Models\ScraperRun;
use App\Services\ScraperAlerter;
use App\Services\ScraperSourceRegistry;
use Illuminate\Console\Command;

/**
 * Her scraper kosmasinda bash'ten cagirilan helper komut.
 *
 * Ornek (run-all.sh icinde):
 *   php artisan scrapers:record-run \
 *     --source=eprotein \
 *     --exit-code=0 \
 *     --duration=320 \
 *     --json-size=15499486 \
 *     --triggered-by=cron
 *
 * Exit code != 0 ise otomatik kritik alarm uretilir + Telegram'a gonderilir.
 */
class ScrapersRecordRun extends Command
{
    protected $signature = 'scrapers:record-run
                            {--source= : Scraper adi (eprotein, everlast vb.)}
                            {--exit-code=0 : Bash exit kodu (0=basari)}
                            {--duration=0 : Saniye cinsinden sure}
                            {--json-size= : JSON cikti boyutu (byte)}
                            {--products= : Toplanan urun sayisi}
                            {--triggered-by=cron : cron|manual|health-check}
                            {--error-log= : Hata log alintisi (fail durumunda)}
                            {--no-alert : Fail olsa bile alarm gonderme}';

    protected $description = 'Bir scraper kosmasini DB\'ye logla, fail olursa otomatik alarm uret.';

    public function handle(): int
    {
        $source = (string) $this->option('source');
        if (!$source) {
            $this->error('--source zorunlu');
            return self::FAILURE;
        }

        $exit = (int) $this->option('exit-code');
        $duration = (int) $this->option('duration');
        $jsonSize = $this->option('json-size');
        $products = $this->option('products');
        $triggeredBy = (string) $this->option('triggered-by');
        $errorLog = $this->option('error-log');

        $startedAt = $duration > 0 ? now()->subSeconds($duration) : now();

        $run = ScraperRun::create([
            'source_name' => $source,
            'triggered_by' => $triggeredBy,
            'started_at' => $startedAt,
            'finished_at' => now(),
            'exit_code' => $exit,
            'products_scraped' => $products !== null ? (int) $products : null,
            'json_size_bytes' => $jsonSize !== null ? (int) $jsonSize : null,
            'duration_seconds' => $duration,
            'error_log_excerpt' => $errorLog ?: null,
        ]);

        $this->info("Recorded run #{$run->id} for {$source} (exit={$exit})");

        if ($exit !== 0 && !$this->option('no-alert')) {
            $registry = ScraperSourceRegistry::find($source);
            $platform = $registry['platform'] ?? '?';
            ScraperAlerter::alert(
                "Scraper FAIL: {$source}",
                "Platform: {$platform}\nExit code: {$exit}\nSure: {$duration}s\n\n"
                    . ($errorLog ? "Log:\n{$errorLog}" : '(Log eklenmedi)'),
                ScraperAlerter::LEVEL_CRIT,
                ['source_name' => $source, 'scraper_run_id' => $run->id]
            );
            $this->warn("Alert sent for fail");
        }

        return self::SUCCESS;
    }
}
