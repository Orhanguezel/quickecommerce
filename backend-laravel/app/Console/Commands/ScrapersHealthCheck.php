<?php

namespace App\Console\Commands;

use App\Services\ScraperAlerter;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Scraper sisteminin gunluk saglik raporu.
 *
 * Kontroller:
 *  - JSON tazeligi (>24h alarm)
 *  - Scrape exit kodu (bugunun log dosyasini parse eder)
 *  - DB mapping istatistikleri (per-source missing / invalid orani)
 *
 * Cron: 0 9 * * * php artisan scrapers:health-check
 * (gunluk cron 02:00 UTC = 05:00 TR; health check 4 saat sonra = 09:00 TR)
 */
class ScrapersHealthCheck extends Command
{
    protected $signature = 'scrapers:health-check
                            {--quiet-when-ok : Sorun yoksa Telegram\'a mesaj atma}
                            {--data-dir=/var/www/quikecommerce/data/source-products : JSON dosyalarinin oldugu dizin}
                            {--logs-dir=/var/www/quikecommerce/logs : Cron log dizini}';

    protected $description = 'Tum scraper kaynaklarinin saglik durumunu kontrol edip Telegram\'a rapor gonderir.';

    private const STALE_HOURS = 24;
    private const MISSING_RATE_WARN = 0.20;   // %20+ mapping missing -> uyari
    private const STOCK100_RATE_WARN = 0.80;  // %80+ stok=100 -> bool default supheli

    public function handle(): int
    {
        $dataDir = (string) $this->option('data-dir');
        $logsDir = (string) $this->option('logs-dir');

        $issues = [];
        $info = [];

        // 2026-06-06: STATUS_PASSIVE kaynaklari (powertec/raketspor CF 1010
        // bani vs) sagliktan haric — JSON tabii ki eski, ama kullanilmiyor.
        // STATUS_PASSIVE kaynaklari hem 'name' (JSON dosya adi) hem
        // 'db_source_name' (DB'de mapping.source_name) ile isaretle —
        // ikisi farkli olabilir (orn. name='maraton', db='maraton_import').
        $passiveSources = [];
        foreach (\App\Services\ScraperSourceRegistry::all() as $src) {
            if (($src['status'] ?? null) === \App\Services\ScraperSourceRegistry::STATUS_PASSIVE) {
                $passiveSources[$src['name']] = true;
                if (!empty($src['db_source_name'])) {
                    $passiveSources[$src['db_source_name']] = true;
                }
            }
        }

        // 1) JSON tazeligi
        $jsonFiles = is_dir($dataDir) ? glob($dataDir . '/*_products.json') : [];
        if (empty($jsonFiles)) {
            $issues[] = "Veri dizini bos veya yok: {$dataDir}";
        }

        $jsonAges = [];
        foreach ($jsonFiles as $jf) {
            $source = preg_replace('/_products\.json$/', '', basename($jf));
            if (isset($passiveSources[$source])) {
                continue;
            }
            $size = filesize($jf);
            $ageH = (time() - filemtime($jf)) / 3600;
            $jsonAges[$source] = ['age_h' => $ageH, 'size' => $size, 'path' => $jf];

            if ($size < 50) {
                $issues[] = "{$source}: JSON bos (size={$size}b, yas=" . round($ageH, 1) . 'h)';
            } elseif ($ageH > self::STALE_HOURS) {
                $issues[] = "{$source}: JSON eski (" . round($ageH, 1) . " saat, esik " . self::STALE_HOURS . 'h)';
            }
        }

        // 2) Bugunun cron logundan FAIL satirlari
        $today = Carbon::now()->format('Ymd');
        $logFile = "{$logsDir}/scrapers-{$today}.log";
        if (file_exists($logFile)) {
            $log = file_get_contents($logFile);
            // "FAIL: <name> scraper, sync atlaniyor" satirlari
            if (preg_match_all('/FAIL:\s*(\S+)\s+scraper/i', $log, $matches)) {
                foreach (array_unique($matches[1]) as $failed) {
                    $issues[] = "{$failed}: bugun scrape FAIL etti (cron log)";
                }
            }
            // "scraper exit: <nonzero>" sayisi
            if (preg_match_all('/scraper exit:\s*([1-9]\d*)/', $log, $m2)) {
                $info[] = 'Cron log: ' . count($m2[1]) . ' scraper nonzero exit kodu ile bitti.';
            }
        } else {
            $issues[] = "Bugunun cron logu yok: {$logFile} (cron tetiklenmedi mi?)";
        }

        // 3) DB mapping istatistikleri
        $rows = DB::table('product_source_mappings')
            ->select('source_name')
            ->selectRaw('COUNT(*) AS total')
            ->selectRaw('SUM(CASE WHEN last_sync_status = "missing" THEN 1 ELSE 0 END) AS missing')
            ->selectRaw('SUM(CASE WHEN last_sync_status = "invalid_price" THEN 1 ELSE 0 END) AS invalid')
            ->selectRaw('MAX(last_sync_at) AS last_sync')
            ->groupBy('source_name')
            ->get();

        foreach ($rows as $r) {
            if ($r->total <= 0 || isset($passiveSources[$r->source_name])) {
                continue;
            }
            $missingRate = $r->missing / $r->total;
            if ($missingRate >= self::MISSING_RATE_WARN) {
                $issues[] = sprintf('%s: %d/%d mapping (%.0f%%) kaynakta bulunamadi',
                    $r->source_name, $r->missing, $r->total, $missingRate * 100);
            }

            // Last sync >48 saat ise alarm
            if ($r->last_sync) {
                $lastSyncH = Carbon::parse($r->last_sync)->diffInHours(now());
                if ($lastSyncH > 48) {
                    $issues[] = sprintf('%s: son sync %d saat once (%s)',
                        $r->source_name, $lastSyncH, $r->last_sync);
                }
            }
        }

        // 4) Stok=100 oran kontrolu (bool default suphesi)
        $stockRows = DB::table('product_source_mappings AS psm')
            ->join('product_variants AS pv', 'pv.id', '=', 'psm.product_variant_id')
            ->select('psm.source_name')
            ->selectRaw('COUNT(*) AS total')
            ->selectRaw('SUM(CASE WHEN pv.stock_quantity = 100 THEN 1 ELSE 0 END) AS s_100')
            ->groupBy('psm.source_name')
            ->get();

        foreach ($stockRows as $r) {
            if ($r->total < 30 || isset($passiveSources[$r->source_name])) {
                continue;   // kucuk source veya passive (CF banli vs)
            }
            $rate = $r->s_100 / $r->total;
            if ($rate >= self::STOCK100_RATE_WARN) {
                $issues[] = sprintf('%s: %d/%d (%.0f%%) urun stok=100 (eski bool default - sync bekliyor)',
                    $r->source_name, $r->s_100, $r->total, $rate * 100);
            }
        }

        // 5) Sessiz bozukluk: exit=0 + JSON tazel AMA veri dejenere.
        //    proteinmax 2026-06-25: scraper "basarili" (exit=0, JSON tazel) ama
        //    ".ekle_button_stokta_yok" her sayfanin related-urun bolumunde
        //    eslesip 2046/2046 urun available=False oldu. ~20 gun kimse fark
        //    etmedi cunku yukaridaki kontrollerin HICBIRI tetiklenmiyordu.
        $activeNames = [];
        foreach (\App\Services\ScraperSourceRegistry::all() as $src) {
            if (($src['status'] ?? null) === \App\Services\ScraperSourceRegistry::STATUS_ACTIVE) {
                $activeNames[$src['name']] = true;
            }
        }
        foreach ($jsonAges as $source => $meta) {
            if (!isset($activeNames[$source])) {
                continue;
            }
            $data = json_decode((string) @file_get_contents($meta['path']), true);
            if (!is_array($data) || count($data) < 30) {
                continue;
            }
            $total = 0;
            $defIn = 0;
            $defOut = 0;
            $priced = 0;
            foreach ($data as $p) {
                if (!is_array($p)) {
                    continue;
                }
                $total++;
                $s = $this->productInStock($p);
                if ($s === true) {
                    $defIn++;
                } elseif ($s === false) {
                    $defOut++;
                }
                if ($this->productPriced($p)) {
                    $priced++;
                }
            }
            if ($total < 30) {
                continue;
            }
            // TUM urunler kesin "tukendi" (null/unknown degil) -> stok tespiti kirilmis
            if ($defOut === $total) {
                $issues[] = "{$source}: SESSIZ BOZUK? {$total} urunun TAMAMI 'tukendi' isaretli — stok tespiti kirilmis olabilir (exit=0 + JSON tazel)";
            }
            // Hicbir urunde fiyat yok -> fiyat tespiti kirilmis
            if ($priced === 0) {
                $issues[] = "{$source}: SESSIZ BOZUK? {$total} urunun hicbirinde fiyat yok — fiyat tespiti kirilmis olabilir";
            }
        }

        $issueCount = count($issues);
        $sourceCount = count($jsonAges);

        // Konsola yaz
        $this->info("Scraper saglik raporu");
        $this->line('  Kaynak sayisi: ' . $sourceCount);
        $this->line('  Sorun: ' . $issueCount);
        foreach ($issues as $i) {
            $this->warn('  - ' . $i);
        }

        // Telegram
        if ($issueCount === 0) {
            if (!$this->option('quiet-when-ok')) {
                ScraperAlerter::alert(
                    'Scraper saglik raporu — TEMIZ',
                    "Bugun {$sourceCount} kaynak kontrol edildi, sorun yok.",
                    ScraperAlerter::LEVEL_INFO
                );
            }
            return self::SUCCESS;
        }

        $level = $issueCount >= 5 ? ScraperAlerter::LEVEL_CRIT : ScraperAlerter::LEVEL_WARN;
        ScraperAlerter::digest(
            "Scraper saglik raporu — {$issueCount} sorun",
            $issues,
            $level
        );

        return self::SUCCESS;
    }

    /**
     * Bir scraper urununun kesin stok durumu. Scraper ciktilarinda alan adlari
     * degisir: top-level stock_quantity/available/in_stock veya variants[].
     *
     * @return bool|null true=kesin stokta, false=kesin tukendi, null=bilinmiyor
     */
    private function productInStock(array $p): ?bool
    {
        foreach (['stock_quantity', 'stock'] as $k) {
            if (isset($p[$k]) && is_numeric($p[$k])) {
                return ((int) $p[$k]) > 0;
            }
        }
        foreach (['available', 'in_stock'] as $b) {
            if (array_key_exists($b, $p) && $p[$b] !== null) {
                return (bool) $p[$b];
            }
        }
        if (!empty($p['variants']) && is_array($p['variants'])) {
            foreach ($p['variants'] as $v) {
                if (!is_array($v)) {
                    continue;
                }
                foreach (['available', 'in_stock'] as $b) {
                    if (array_key_exists($b, $v) && $v[$b] !== null && $v[$b]) {
                        return true;
                    }
                }
                if (isset($v['stock_quantity']) && is_numeric($v['stock_quantity']) && (int) $v['stock_quantity'] > 0) {
                    return true;
                }
            }
        }
        return null;
    }

    /** Urunde gecerli (>0) bir fiyat var mi? (top-level veya variant). */
    private function productPriced(array $p): bool
    {
        foreach (['original_price', 'discounted_price', 'price'] as $k) {
            if (isset($p[$k]) && is_numeric($p[$k]) && (float) $p[$k] > 0) {
                return true;
            }
        }
        if (!empty($p['variants']) && is_array($p['variants'])) {
            foreach ($p['variants'] as $v) {
                if (is_array($v) && isset($v['price']) && is_numeric($v['price']) && (float) $v['price'] > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
