<?php

namespace App\Console\Commands;

use App\Services\ProductSeoQuality;
use Illuminate\Console\Command;

class ValidateScrapedProducts extends Command
{
    protected $signature = 'scrapers:validate-products
                            {json_file : Scraper JSON dosyası}
                            {--max-warnings=0 : İzin verilen uyarı sayısı; 0 sınırsız}
                            {--csv= : Sorunları CSV dosyasına yaz}';

    protected $description = 'Scraper ürün JSON’unu import öncesi SEO/veri bütünlüğü açısından doğrular';

    public function handle(ProductSeoQuality $quality): int
    {
        $path = (string) $this->argument('json_file');
        if (!is_file($path)) {
            $this->error("Dosya bulunamadı: {$path}");
            return self::FAILURE;
        }

        $rows = json_decode((string) file_get_contents($path), true);
        if (!is_array($rows) || $rows === []) {
            $this->error('JSON boş veya ürün listesi değil.');
            return self::FAILURE;
        }

        $seenSlugs = [];
        $issues = [];
        foreach ($rows as $index => $row) {
            if (!is_array($row)) {
                $issues[] = [$index + 1, '', '', 'error', 'invalid_row', 'Ürün satırı nesne değil.'];
                continue;
            }

            $name = trim((string) ($row['name'] ?? ''));
            $slug = trim((string) ($row['slug'] ?? ''));
            foreach ($quality->validateScrapedProduct($row) as $issue) {
                $issues[] = [$index + 1, $name, $slug, $issue['severity'], $issue['code'], $issue['message']];
            }

            if ($slug !== '') {
                if (isset($seenSlugs[$slug])) {
                    $issues[] = [$index + 1, $name, $slug, 'error', 'duplicate_slug', "Aynı slug daha önce {$seenSlugs[$slug]}. satırda var."];
                } else {
                    $seenSlugs[$slug] = $index + 1;
                }
            }
        }

        $errors = count(array_filter($issues, static fn (array $row) => $row[3] === 'error'));
        $warnings = count($issues) - $errors;
        $this->table(
            ['Metrik', 'Adet'],
            [
                ['Ürün', count($rows)],
                ['Hata', $errors],
                ['Uyarı', $warnings],
            ]
        );

        foreach (array_slice($issues, 0, 50) as $issue) {
            $this->line(sprintf(
                '[%s] satır %d %s (%s): %s',
                strtoupper($issue[3]),
                $issue[0],
                $issue[1] ?: '(adsız)',
                $issue[4],
                $issue[5]
            ));
        }
        if (count($issues) > 50) {
            $this->comment('İlk 50 sorun gösterildi; tam liste için --csv kullanın.');
        }

        if ($csvPath = $this->option('csv')) {
            $handle = fopen((string) $csvPath, 'wb');
            fputcsv($handle, ['row', 'name', 'slug', 'severity', 'code', 'message']);
            foreach ($issues as $issue) {
                fputcsv($handle, $issue);
            }
            fclose($handle);
            $this->info("CSV yazıldı: {$csvPath}");
        }

        $maxWarnings = (int) $this->option('max-warnings');
        $tooManyWarnings = $maxWarnings > 0 && $warnings > $maxWarnings;

        return ($errors > 0 || $tooManyWarnings) ? self::FAILURE : self::SUCCESS;
    }
}
