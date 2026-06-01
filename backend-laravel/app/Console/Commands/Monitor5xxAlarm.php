<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Monitor5xxAlarm extends Command
{
    protected $signature = 'monitor:5xx-alarm
                            {--threshold=100 : Son 1 saatlik 5xx esigi}
                            {--log-dir=/var/log/nginx : Nginx log dizini}';

    protected $description = 'Son 1 saatlik sportoonline 5xx hatasini sayar; esigi asarsa Telegram/log uyari verir.';

    public function handle(): int
    {
        $threshold = (int) $this->option('threshold');
        $logDir = rtrim($this->option('log-dir'), '/');
        $currentLog = "{$logDir}/sportoonline.access.log";
        $previousLog = "{$logDir}/sportoonline.access.log.1";

        if (!is_readable($currentLog)) {
            $this->error("Log okunamadi: {$currentLog}");
            return self::FAILURE;
        }

        $since = now()->subHour();
        $counts = ['total' => 0, 'by_path' => []];

        foreach ([$currentLog, $previousLog] as $file) {
            if (!is_readable($file)) {
                continue;
            }
            $fh = fopen($file, 'r');
            while (($line = fgets($fh)) !== false) {
                // [01/Jun/2026:12:34:56 +0000]
                if (!preg_match('/\[(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})/', $line, $t)) {
                    continue;
                }
                $months = ['Jan'=>1,'Feb'=>2,'Mar'=>3,'Apr'=>4,'May'=>5,'Jun'=>6,
                           'Jul'=>7,'Aug'=>8,'Sep'=>9,'Oct'=>10,'Nov'=>11,'Dec'=>12];
                $ts = mktime((int)$t[4], (int)$t[5], (int)$t[6],
                             $months[$t[2]] ?? 1, (int)$t[1], (int)$t[3]);
                if ($ts < $since->getTimestamp()) {
                    continue;
                }
                // " HTTP/x.x" sonrasinda status
                if (!preg_match('/" (\d{3}) /', $line, $m)) {
                    continue;
                }
                $status = (int) $m[1];
                if ($status < 500 || $status >= 600) {
                    continue;
                }
                $counts['total']++;
                if (preg_match('/"\w+ ([^ ?"]+)/', $line, $p)) {
                    $path = $p[1];
                    $counts['by_path'][$path] = ($counts['by_path'][$path] ?? 0) + 1;
                }
            }
            fclose($fh);
        }

        $this->info("Son 1 saat 5xx: {$counts['total']} (esik: {$threshold})");
        arsort($counts['by_path']);
        foreach (array_slice($counts['by_path'], 0, 5, true) as $path => $n) {
            $this->line("  {$n}× {$path}");
        }

        if ($counts['total'] < $threshold) {
            return self::SUCCESS;
        }

        // Esik asildi -> uyari
        $top = array_slice($counts['by_path'], 0, 5, true);
        $topText = implode("\n", array_map(
            fn($p, $n) => "  • {$n}× {$p}",
            array_keys($top),
            array_values($top)
        ));
        $message = "🚨 sportoonline 5xx alarmi\n"
            ."Son 1 saat: {$counts['total']} hata (esik: {$threshold})\n\n"
            ."En sik endpoint'ler:\n{$topText}\n\n"
            ."Sunucu: ".gethostname()." | "
            .now('Europe/Istanbul')->format('Y-m-d H:i T');

        // Telegram bildirimi (yapilandirilmis ise)
        $botToken = env('TELEGRAM_ALARM_BOT_TOKEN');
        $chatId = env('TELEGRAM_ALARM_CHAT_ID');
        if ($botToken && $chatId) {
            try {
                Http::timeout(10)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $message,
                ]);
                $this->info('Telegram uyarisi gonderildi.');
            } catch (\Throwable $e) {
                Log::warning('5xx alarm Telegram send failed', ['error' => $e->getMessage()]);
            }
        }

        Log::error('[5xx-alarm] threshold exceeded', [
            'total_last_hour' => $counts['total'],
            'threshold' => $threshold,
            'top_paths' => $top,
        ]);

        return self::SUCCESS;
    }
}
