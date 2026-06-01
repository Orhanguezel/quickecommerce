<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class WeeklyTrafficReport extends Command
{
    protected $signature = 'reports:weekly-traffic
                            {--log-dir=/var/log/nginx : Nginx log dizini}
                            {--out= : Cikti yolu (varsayilan storage/app/reports/)}';

    protected $description = 'Sportoonline son 7 gun trafik + 5xx hata raporunu HTML olarak uretir.';

    private const MONTHS = ['Jan'=>1,'Feb'=>2,'Mar'=>3,'Apr'=>4,'May'=>5,'Jun'=>6,
                            'Jul'=>7,'Aug'=>8,'Sep'=>9,'Oct'=>10,'Nov'=>11,'Dec'=>12];
    private const BOT_RE = '/bot|crawl|spider|slurp|adsbot|mediapartners|externalagent|petalbot|uptime|headless|axios|node-fetch|python|curl|go-http|wget|scrapy|facebookexternalhit|semrush|ahrefs|dataforseo|bytespider|gptbot|claudebot|bingpreview|yandex|applebot|amazonbot|whatsapp|telegram/i';
    private const ASSET_RE = '/\.(js|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|mp4|json|xml|txt|map)($|\?)/i';

    public function handle(): int
    {
        $logDir = rtrim($this->option('log-dir'), '/');
        $outDir = $this->option('out')
            ?: storage_path('app/reports');
        if (!is_dir($outDir)) {
            mkdir($outDir, 0775, true);
        }

        // Son 7 gun + bugun: current + .1 + .2..7.gz
        $files = [
            "{$logDir}/sportoonline.access.log",
            "{$logDir}/sportoonline.access.log.1",
        ];
        for ($i = 2; $i <= 8; $i++) {
            $files[] = "{$logDir}/sportoonline.access.log.{$i}.gz";
        }

        $days = [];
        $pages = [];
        $errPaths = [];
        $earliest = now()->subDays(8)->startOfDay()->getTimestamp();

        foreach ($files as $file) {
            if (!is_readable($file)) {
                continue;
            }
            $isGz = str_ends_with($file, '.gz');
            $fh = $isGz ? gzopen($file, 'r') : fopen($file, 'r');
            if (!$fh) {
                continue;
            }
            $readLine = $isGz ? 'gzgets' : 'fgets';
            while (($line = $readLine($fh)) !== false) {
                if (!preg_match('/^(\S+) - \S+ \[(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})[^\]]*\] "([^"]*)" (\d+) \d+ "[^"]*" "([^"]*)"/', $line, $m)) {
                    continue;
                }
                [$_, $ip, $d, $mon, $y, $H, $M, $S, $request, $status, $ua] = $m;
                $monNum = self::MONTHS[$mon] ?? 1;
                $ts = mktime((int)$H, (int)$M, (int)$S, $monNum, (int)$d, (int)$y);
                if ($ts < $earliest) {
                    continue;
                }
                $date = sprintf('%04d-%02d-%02d', $y, $monNum, $d);
                $st = (int) $status;
                $isBot = preg_match(self::BOT_RE, $ua) || !str_contains($ua, 'Mozilla');

                $days[$date] ??= [
                    'human_req' => 0, 'bot_req' => 0, 'pageviews' => 0,
                    's5xx' => 0, 'ips' => [],
                ];
                if ($st >= 500) {
                    $days[$date]['s5xx']++;
                    $path = explode(' ', $request)[1] ?? '';
                    $path = explode('?', $path)[0];
                    $key = $path . ' [' . $st . ']';
                    $errPaths[$key] = ($errPaths[$key] ?? 0) + 1;
                }
                if ($isBot) {
                    $days[$date]['bot_req']++;
                    continue;
                }
                $days[$date]['human_req']++;
                $days[$date]['ips'][$ip] = true;
                $parts = explode(' ', $request);
                $method = $parts[0] ?? '';
                $path = $parts[1] ?? '';
                if ($method === 'GET' && $st >= 200 && $st < 400
                    && !preg_match(self::ASSET_RE, $path)
                    && !str_starts_with($path, '/api')
                    && !str_starts_with($path, '/_next/')) {
                    $days[$date]['pageviews']++;
                    $clean = explode('?', $path)[0];
                    $pages[$clean] = ($pages[$clean] ?? 0) + 1;
                }
            }
            $isGz ? gzclose($fh) : fclose($fh);
        }

        ksort($days);
        arsort($pages);
        arsort($errPaths);
        $topPages = array_slice($pages, 0, 10, true);
        $topErr = array_slice($errPaths, 0, 8, true);

        $html = $this->renderHtml($days, $topPages, $topErr);
        $stamp = now()->format('Y-m-d');
        $path = "{$outDir}/sportoonline-trafik-{$stamp}.html";
        file_put_contents($path, $html);

        $this->info("Rapor yazildi: {$path}");
        $this->line('PDF icin: weasyprint ' . basename($path) . ' ' . str_replace('.html', '.pdf', basename($path)));
        return self::SUCCESS;
    }

    /**
     * @param  array<string, array{human_req:int,bot_req:int,pageviews:int,s5xx:int,ips:array<string,bool>}>  $days
     * @param  array<string, int>  $topPages
     * @param  array<string, int>  $topErr
     */
    private function renderHtml(array $days, array $topPages, array $topErr): string
    {
        $first = array_key_first($days) ?? '';
        $last = array_key_last($days) ?? '';
        $totalErr = array_sum(array_column($days, 's5xx'));
        $avgIp = $days
            ? round(array_sum(array_map(fn($d) => count($d['ips']), $days)) / count($days))
            : 0;

        $rowsTraffic = '';
        foreach ($days as $date => $d) {
            $isPeak = $d['human_req'] === max(array_column($days, 'human_req'));
            $cls = $isPeak ? ' class="peak"' : '';
            $tr = (int) substr($date, 8, 2);
            $monNum = (int) substr($date, 5, 2);
            $monNames = ['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
            $label = $tr.' '.($monNames[$monNum] ?? '?');
            $rowsTraffic .= "<tr{$cls}><td class='l'>{$label}</td>"
                ."<td>".number_format($d['human_req'], 0, ',', '.')."</td>"
                ."<td>".count($d['ips'])."</td>"
                ."<td>".number_format($d['pageviews'], 0, ',', '.')."</td>"
                ."<td>".number_format($d['s5xx'], 0, ',', '.')."</td>"
                ."<td>".number_format($d['bot_req'], 0, ',', '.')."</td></tr>\n";
        }

        $rowsPages = '';
        $i = 0;
        foreach ($topPages as $p => $n) {
            $i++;
            $rowsPages .= "<tr><td>{$i}</td><td class='l'>".htmlspecialchars($p)."</td>"
                ."<td>".number_format($n, 0, ',', '.')."</td></tr>\n";
        }

        $rowsErr = '';
        $i = 0;
        foreach ($topErr as $key => $n) {
            $i++;
            $rowsErr .= "<tr><td>{$i}</td><td class='l'><code>".htmlspecialchars($key)."</code></td>"
                ."<td>".number_format($n, 0, ',', '.')."</td></tr>\n";
        }

        $generated = now('Europe/Istanbul')->format('Y-m-d H:i T');
        $totalErrFmt = number_format($totalErr, 0, ',', '.');

        return <<<HTML
<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8">
<title>Sportoonline Haftalik Trafik Raporu</title>
<style>
@page { size: A4; margin: 18mm 16mm; }
body { font-family: "DejaVu Sans", Arial, sans-serif; color: #1a1a1a; font-size: 12px; line-height: 1.5; }
h1 { font-size: 22px; margin: 0 0 4px; color: #0b3d91; }
h2 { font-size: 15px; margin: 22px 0 8px; color: #0b3d91; border-bottom: 2px solid #0b3d91; padding-bottom: 3px; }
.sub { color: #666; font-size: 11px; margin-bottom: 18px; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; }
th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: center; }
th { background: #0b3d91; color: #fff; font-weight: 600; }
td.l, th.l { text-align: left; }
tr:nth-child(even) td { background: #f4f7fb; }
.peak td { background: #fff3cd !important; font-weight: 600; }
.kpi { display: flex; gap: 10px; margin: 10px 0; }
.kpi div { flex: 1; background: #0b3d91; color: #fff; border-radius: 6px; padding: 10px; text-align: center; }
.kpi b { display: block; font-size: 20px; }
.kpi span { font-size: 10px; opacity: .9; }
code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-size: 11px; }
.foot { margin-top: 24px; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 6px; }
</style></head><body>
<h1>Sportoonline — Haftalık Trafik Raporu</h1>
<div class="sub">Dönem: {$first} – {$last} &nbsp;|&nbsp; Kaynak: <i>sportoonline.access.log</i> &nbsp;|&nbsp; Otomatik uretildi: {$generated}</div>
<div class="kpi">
  <div><b>{$avgIp}</b><span>Ortalama tekil IP / gun</span></div>
  <div><b>{$totalErrFmt}</b><span>Toplam 5xx (donemde)</span></div>
  <div><b>{$last}</b><span>Son tam gun</span></div>
</div>
<h2>1. Gunluk Trafik Tablosu</h2>
<table><tr><th class="l">Gun</th><th>Sporto istek</th><th>Tekil IP</th><th>Sayfa goruntuleme</th><th>5xx</th><th>Bot hit</th></tr>
{$rowsTraffic}</table>
<h2>2. En Cok Goruntulenen Sayfalar</h2>
<table><tr><th>#</th><th class="l">Sayfa</th><th>Goruntuleme</th></tr>
{$rowsPages}</table>
<h2>3. En Cok Patlayan Endpoint'ler (5xx)</h2>
<table><tr><th>#</th><th class="l">Endpoint [status]</th><th>Hata sayisi</th></tr>
{$rowsErr}</table>
<div class="foot">Sportoonline — QuickEcommerce | Haftalik trafik raporu (php artisan reports:weekly-traffic). Rakamlar UTC günlerine göredir.</div>
</body></html>
HTML;
    }
}
