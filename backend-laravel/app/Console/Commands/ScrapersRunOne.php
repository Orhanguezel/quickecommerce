<?php

namespace App\Console\Commands;

use App\Models\ScraperRun;
use App\Services\ScraperAlerter;
use App\Services\ScraperSourceRegistry;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

/**
 * Tek bir scraper kaynagini scrape + sync chain ile calistirir.
 *
 * Manuel admin tetikleme icin: AdminScraperDashboardController::trigger
 * fire-and-forget olarak nohup ile bunu cagirir (async).
 *
 * Cikti: ScraperRun satirini gunceller, fail olursa alarm gonderir.
 */
class ScrapersRunOne extends Command
{
    protected $signature = 'scrapers:run-one
                            {--source= : Kaynak adi}
                            {--run-id= : ScraperRun ID (zaten olusturulmus)}';

    protected $description = 'Tek bir scraper\'i scrape + sync chain ile calistirir (manuel tetikleme).';

    private const VPS_BASE = '/var/www/quikecommerce';
    private const VENV_PYTHON = '/var/www/quikecommerce/venv/bin/python3';

    public function handle(): int
    {
        $source = (string) $this->option('source');
        $runId = (int) $this->option('run-id');
        if (!$source || !$runId) {
            $this->error('--source ve --run-id zorunlu');
            return self::FAILURE;
        }
        $run = ScraperRun::find($runId);
        if (!$run) {
            $this->error("ScraperRun #{$runId} bulunamadi");
            return self::FAILURE;
        }
        $reg = ScraperSourceRegistry::find($source);
        if (!$reg) {
            $run->update([
                'finished_at' => now(),
                'exit_code' => 99,
                'error_log_excerpt' => "Kaynak registry'de yok: {$source}",
            ]);
            return self::FAILURE;
        }

        $scriptPath = self::VPS_BASE . "/scrapers/{$source}_scraper.py";
        $jsonPath = ScraperSourceRegistry::jsonPath($source);

        if (!is_file($scriptPath)) {
            $this->markFailed($run, 99, "Script bulunamadi: {$scriptPath}");
            return self::FAILURE;
        }

        $startTs = microtime(true);

        // 1) Scraper
        $proc = new Process([self::VENV_PYTHON, $scriptPath]);
        $proc->setWorkingDirectory(self::VPS_BASE);
        $proc->setTimeout(3600); // 1 saat max
        // 2026-06-06: Source bazli SCRAPER_URL override. compexturkiye, eprotein,
        // proteinavm, musclepump dis scraper.guezelwebdesign.com'da 301 veya TCP
        // timeout aliyordu — lokal scraper service (127.0.0.1:8200) bunlari
        // sorunsuz cekti. Diger 22 scraper'i riske atmamak icin sadece bu 4'unu
        // lokal'e yonlendir.
        // NOT: Anahtar registry 'name' alani (cron --source ile gelen deger);
        // 'musclepump' name'i 'musclepump_import' db_source_name'e map'leniyor
        // registry'de — burada cron source name'i ('musclepump') kullanilir.
        $sourceUrlMap = [
            'compexturkiye' => env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200'),
            'eprotein'      => env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200'),
            'proteinavm'    => env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200'),
            'musclepump'    => env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200'),
        ];
        $sourceKeyMap = [
            'compexturkiye' => env('LOCAL_SCRAPER_API_KEY', ''),
            'eprotein'      => env('LOCAL_SCRAPER_API_KEY', ''),
            'proteinavm'    => env('LOCAL_SCRAPER_API_KEY', ''),
            'musclepump'    => env('LOCAL_SCRAPER_API_KEY', ''),
        ];
        $scraperUrl = $sourceUrlMap[$source] ?? env('SCRAPER_URL', 'https://scraper.guezelwebdesign.com');
        $scraperKey = $sourceKeyMap[$source] ?? env('SCRAPER_API_KEY', '');

        // CF-agir yerel kaynaklarda cold Cloudflare-solve ~116s surer; urlopen
        // timeout'u (SCRAPER_TIMEOUT+30) bunu rahat kapsamali. Yerel stealth'e
        // yonlenen kaynaklara 150s (urlopen 180s), digerlerine 90s ver.
        $cfHeavySources = ['compexturkiye', 'eprotein', 'proteinavm', 'musclepump'];
        $scraperTimeout = in_array($source, $cfHeavySources, true) ? '150' : '90';

        $proc->setEnv([
            'SCRAPER_URL' => $scraperUrl,
            'SCRAPER_API_KEY' => $scraperKey,
            'SCRAPER_TIMEOUT' => $scraperTimeout,
        ]);
        $proc->run();
        $scraperExit = $proc->getExitCode() ?? 99;
        $scraperOutput = $proc->getOutput() . "\n" . $proc->getErrorOutput();

        $duration = (int) (microtime(true) - $startTs);
        $jsonSize = is_file($jsonPath) ? filesize($jsonPath) : 0;

        if ($scraperExit !== 0) {
            $excerpt = mb_substr($scraperOutput, -500);
            $this->markFailed($run, $scraperExit, $excerpt, $duration, $jsonSize);
            return self::FAILURE;
        }

        // 2) Sync (sadece scrape basarili + JSON var ise)
        $syncOutput = '';
        $syncExit = 0;
        if ($jsonSize > 50) {
            $dbSourceName = $reg['db_source_name'];
            $syncProc = new Process([
                'php', 'artisan', 'sync:source-prices',
                $dbSourceName, $jsonPath,
                '--apply', '--max-change-percent=100000',
            ]);
            $syncProc->setWorkingDirectory(self::VPS_BASE . '/backend-laravel');
            $syncProc->setTimeout(1800);
            $syncProc->run();
            $syncExit = $syncProc->getExitCode() ?? 0;
            $syncOutput = $syncProc->getOutput();
        }

        $run->update([
            'finished_at' => now(),
            'exit_code' => $scraperExit,
            'duration_seconds' => $duration,
            'json_size_bytes' => $jsonSize,
            'error_log_excerpt' => $syncExit !== 0
                ? "Sync FAIL exit={$syncExit}:\n" . mb_substr($syncOutput, -300)
                : null,
        ]);

        $this->info("OK source={$source} run=#{$runId} duration={$duration}s json=" . number_format($jsonSize) . "b");
        return self::SUCCESS;
    }

    private function markFailed(ScraperRun $run, int $exit, string $excerpt, int $duration = 0, int $jsonSize = 0): void
    {
        $run->update([
            'finished_at' => now(),
            'exit_code' => $exit,
            'duration_seconds' => $duration,
            'json_size_bytes' => $jsonSize,
            'error_log_excerpt' => $excerpt,
        ]);
        ScraperAlerter::alert(
            "Manuel scrape FAIL: {$run->source_name}",
            "Run #{$run->id}\nExit: {$exit}\n\n{$excerpt}",
            ScraperAlerter::LEVEL_CRIT,
            ['source_name' => $run->source_name, 'scraper_run_id' => $run->id]
        );
    }
}
