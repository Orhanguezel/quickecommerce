<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\ProductSeoQuality;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class AuditProductSeo extends Command
{
    protected $signature = 'products:seo-audit
                            {--store_id= : Yalnız bir mağazayı tara}
                            {--include-unpublished : Onaylı olmayan ürünleri de tara}
                            {--output= : CSV çıktı yolu}';

    protected $description = 'Tüm ürünleri indekslenebilirlik, içerik kalitesi ve slug bütünlüğü için tarar';

    public function handle(ProductSeoQuality $quality): int
    {
        $base = Product::query()
            ->when(
                !$this->option('include-unpublished'),
                static fn (Builder $query) => $query->where('status', 'approved')
            )
            ->when(
                $this->option('store_id'),
                fn (Builder $query) => $query->where('store_id', (int) $this->option('store_id'))
            );

        $duplicateNames = (clone $base)
            ->selectRaw('LOWER(TRIM(name)) AS fingerprint, COUNT(*) AS total')
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->groupBy('fingerprint')
            ->having('total', '>', 1)
            ->pluck('total', 'fingerprint')
            ->all();
        $duplicateDescriptions = (clone $base)
            ->selectRaw('MD5(TRIM(description)) AS fingerprint, COUNT(*) AS total')
            ->whereNotNull('description')
            ->where('description', '!=', '')
            ->groupBy('fingerprint')
            ->having('total', '>', 1)
            ->pluck('total', 'fingerprint')
            ->all();

        $output = (string) ($this->option('output')
            ?: storage_path('app/reports/product-seo-audit-' . now()->format('Ymd-His') . '.csv'));
        $directory = dirname($output);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
        $handle = fopen($output, 'wb');
        if ($handle === false) {
            $this->error("CSV açılamadı: {$output}");
            return self::FAILURE;
        }

        fputcsv($handle, [
            'product_id',
            'store_id',
            'name',
            'slug',
            'severity',
            'issue_code',
            'detail',
            'recommended_action',
        ]);

        $counts = ['products' => 0, 'errors' => 0, 'warnings' => 0, 'clean' => 0];
        $issueCounts = [];

        $base->select([
            'id',
            'store_id',
            'category_id',
            'name',
            'slug',
            'description',
            'image',
            'meta_title',
            'meta_description',
            'status',
        ])
            ->with(['variants' => fn ($query) => $query->select([
                'id',
                'product_id',
                'price',
                'special_price',
                'stock_quantity',
                'status',
                'deleted_at',
            ])])
            ->orderBy('products.id')
            ->chunkById(300, function ($products) use (
                $quality,
                $handle,
                $duplicateNames,
                $duplicateDescriptions,
                &$counts,
                &$issueCounts
            ) {
                foreach ($products as $product) {
                    $counts['products']++;
                    $issues = $this->issuesFor(
                        $product,
                        $quality,
                        $duplicateNames,
                        $duplicateDescriptions
                    );

                    if ($issues === []) {
                        $counts['clean']++;
                        continue;
                    }

                    foreach ($issues as $issue) {
                        $counter = $issue['severity'] === 'error' ? 'errors' : 'warnings';
                        $counts[$counter]++;
                        $issueCounts[$issue['code']] = ($issueCounts[$issue['code']] ?? 0) + 1;
                        fputcsv($handle, [
                            $product->id,
                            $product->store_id,
                            $product->name,
                            $product->slug,
                            $issue['severity'],
                            $issue['code'],
                            $issue['detail'],
                            $issue['action'],
                        ]);
                    }
                }
            }, 'products.id', 'id');

        fclose($handle);
        arsort($issueCounts);

        $this->table(
            ['Metrik', 'Adet'],
            [
                ['Taranan ürün', $counts['products']],
                ['Temiz ürün', $counts['clean']],
                ['Hata', $counts['errors']],
                ['Uyarı', $counts['warnings']],
            ]
        );
        $this->table(
            ['Sorun', 'Adet'],
            array_map(
                static fn (string $code, int $count) => [$code, $count],
                array_keys($issueCounts),
                array_values($issueCounts)
            )
        );
        $this->info("Rapor: {$output}");

        return $counts['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * @return array<int, array{severity: string, code: string, detail: string, action: string}>
     */
    private function issuesFor(
        Product $product,
        ProductSeoQuality $quality,
        array $duplicateNames,
        array $duplicateDescriptions
    ): array {
        $issues = [];
        $name = trim((string) $product->name);
        $slug = trim((string) $product->slug);
        $description = $quality->plainText($product->description);

        $add = static function (
            string $severity,
            string $code,
            string $detail,
            string $action
        ) use (&$issues): void {
            $issues[] = compact('severity', 'code', 'detail', 'action');
        };

        if ($name === '') {
            $add('error', 'missing_name', 'Ürün adı boş.', 'Kaynak veriden doğru adı doldur; ürünü o zamana kadar yayından kaldır.');
        }
        if ($slug === '') {
            $add('error', 'missing_slug', 'Slug boş.', 'Benzersiz slug üret ve eski URL varsa redirect kaydı oluştur.');
        } elseif ($name !== '' && !$quality->slugMatchesName($name, $slug)) {
            $add('error', 'slug_name_mismatch', 'Slug ürün adıyla semantik olarak uyuşmuyor.', 'products:fix-slug-mismatches --dry-run ile incele; sonra redirect korumalı uygula.');
        }
        if ($description === '') {
            $add('warning', 'missing_description', 'Açıklama boş.', 'Kaynak ürünün özgün açıklamasını çek.');
        } elseif (mb_strlen($description) < 80) {
            $add('warning', 'short_description', 'Açıklama 80 karakterden kısa.', 'Özgün özellik, kullanım ve içerik bilgileri ekle.');
        }
        if (empty($product->image)) {
            $add('error', 'missing_image', 'Ana görsel yok.', 'Yerel Media kaydı bağla; düzelene kadar public katalogdan çıkar.');
        }
        if (empty($product->category_id)) {
            $add('warning', 'missing_category', 'Kategori atanmamış.', 'Kanonik kategori eşlemesini scraper/import katmanında düzelt.');
        }

        $hasSellableVariant = $product->variants->contains(static function ($variant) {
            $price = (float) ($variant->special_price ?: $variant->price);
            return !$variant->deleted_at
                && (int) $variant->status === 1
                && (int) $variant->stock_quantity > 0
                && $price > 0;
        });
        if (!$hasSellableVariant) {
            $add('warning', 'not_publicly_sellable', 'Stokta ve pozitif fiyatlı aktif varyant yok.', 'Sitemap dışında tut; scraper stok/fiyat sonucunu doğrula.');
        }

        $nameFingerprint = mb_strtolower($name, 'UTF-8');
        if ($name !== '' && isset($duplicateNames[$nameFingerprint])) {
            $add('warning', 'duplicate_name', $duplicateNames[$nameFingerprint] . ' ürün aynı ada sahip.', 'Gerçek varyantları birleştir veya adı ayırt edici model/ölçü ile özgünleştir.');
        }
        if ($description !== '') {
            $descriptionFingerprint = md5(trim((string) $product->description));
            if (isset($duplicateDescriptions[$descriptionFingerprint])) {
                $add('warning', 'duplicate_description', $duplicateDescriptions[$descriptionFingerprint] . ' ürün aynı açıklamaya sahip.', 'Ürüne özgü açıklama üret; şablon tekrarını azalt.');
            }
        }

        if (empty($product->meta_title)) {
            $add('warning', 'meta_title_fallback', 'Özel meta title yok; ürün adı kullanılıyor.', 'Gerekliyse marka + model + ana özellik içeren özgün title yaz.');
        }
        if (empty($product->meta_description)) {
            $add('warning', 'meta_description_fallback', 'Özel meta description yok; açıklamadan türetiliyor.', 'Önemli ürünlerde 120–160 karakter özgün meta description yaz.');
        }

        return $issues;
    }
}
