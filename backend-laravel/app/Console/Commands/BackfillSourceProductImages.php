<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductSourceMapping;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class BackfillSourceProductImages extends Command
{
    protected $signature = 'source-images:backfill
                            {source_name : Kaynak adi (proteinmax, compexturkiye vs.)}
                            {json_file : Scraper JSON dosyasi}
                            {--store_id= : Sadece belirli magazayi isle}
                            {--apply : Degisiklikleri DB\'ye yaz}
                            {--limit=0 : Test icin en fazla N urun}';

    protected $description = 'Kaynak JSON image URL\'leriyle mevcut urunlerde bos image/gallery_images alanlarini backfill eder.';

    private array $sourceProducts = [
        'url' => [],
        'id' => [],
        'slug' => [],
    ];

    public function handle(): int
    {
        $sourceName = $this->normalizeSourceName($this->argument('source_name'));
        $jsonFile = $this->argument('json_file');
        $apply = (bool) $this->option('apply');
        $limit = max(0, (int) $this->option('limit'));

        if (!file_exists($jsonFile)) {
            $this->error("JSON dosyasi bulunamadi: {$jsonFile}");
            return self::FAILURE;
        }

        $products = json_decode(file_get_contents($jsonFile), true);
        if (!is_array($products)) {
            $this->error('JSON dosyasi okunamadi veya urun listesi degil.');
            return self::FAILURE;
        }
        $this->indexSourceProducts($products);

        $query = ProductSourceMapping::query()
            ->with('product:id,image,gallery_images,slug')
            ->where('source_name', $sourceName);

        if ($this->option('store_id')) {
            $query->where('store_id', (int) $this->option('store_id'));
        }

        $stats = [
            'checked' => 0,
            'updated' => 0,
            'would_update' => 0,
            'missing_source' => 0,
            'missing_product' => 0,
            'no_images' => 0,
            'unchanged' => 0,
        ];

        $processed = 0;
        $query->orderBy('id')->chunkById(200, function ($mappings) use (&$stats, &$processed, $limit, $apply) {
            foreach ($mappings as $mapping) {
                if ($limit > 0 && $processed >= $limit) {
                    return false;
                }
                $processed++;
                $stats['checked']++;

                $product = $mapping->product;
                if (!$product) {
                    $stats['missing_product']++;
                    continue;
                }

                $sourceProduct = $this->findSourceProduct($mapping);
                if (!$sourceProduct) {
                    $stats['missing_source']++;
                    continue;
                }

                $images = $this->extractImages($sourceProduct);
                if (empty($images)) {
                    $stats['no_images']++;
                    continue;
                }

                $payload = [];
                if ($this->isBlank($product->image)) {
                    $payload['image'] = $images[0];
                }
                if ($this->isBlank($product->gallery_images) && count($images) > 1) {
                    $payload['gallery_images'] = implode(',', array_slice($images, 1));
                }

                if (empty($payload)) {
                    $stats['unchanged']++;
                    continue;
                }

                if ($apply) {
                    Product::withoutGlobalScopes()
                        ->where('id', $product->id)
                        ->update($payload + ['updated_at' => now()]);
                    $stats['updated']++;
                } else {
                    $stats['would_update']++;
                    if ($this->output->isVerbose()) {
                        $this->line("WOULD UPDATE product #{$product->id}: " . json_encode($payload, JSON_UNESCAPED_UNICODE));
                    }
                }
            }
        });

        $this->table(
            ['Metrik', 'Adet'],
            [
                ['Kontrol edilen', $stats['checked']],
                [$apply ? 'Guncellenen' : 'Guncellenecek', $apply ? $stats['updated'] : $stats['would_update']],
                ['Degismeyen', $stats['unchanged']],
                ['Kaynakta bulunamayan', $stats['missing_source']],
                ['Urun bulunamayan', $stats['missing_product']],
                ['Kaynakta image yok', $stats['no_images']],
            ]
        );

        return self::SUCCESS;
    }

    private function indexSourceProducts(array $products): void
    {
        foreach ($products as $product) {
            if (!is_array($product)) {
                continue;
            }

            $slug = $this->normalizeSlug($product['slug'] ?? '');
            $url = trim((string) ($product['url'] ?? ''));
            $id = trim((string) ($product['source_product_id'] ?? $product['id'] ?? ''));

            if ($slug !== '') {
                $this->sourceProducts['slug'][$slug] = $product;
            }
            if ($url !== '') {
                $this->sourceProducts['url'][$url] = $product;
            }
            if ($id !== '') {
                $this->sourceProducts['id'][$id] = $product;
            }
        }
    }

    private function findSourceProduct(ProductSourceMapping $mapping): ?array
    {
        $url = trim((string) $mapping->source_product_url);
        $id = trim((string) $mapping->source_product_id);
        $slug = $this->normalizeSlug($mapping->source_product_slug);

        if ($url !== '' && isset($this->sourceProducts['url'][$url])) {
            return $this->sourceProducts['url'][$url];
        }
        if ($id !== '' && isset($this->sourceProducts['id'][$id])) {
            return $this->sourceProducts['id'][$id];
        }
        if ($slug !== '' && isset($this->sourceProducts['slug'][$slug])) {
            return $this->sourceProducts['slug'][$slug];
        }

        return null;
    }

    private function extractImages(array $sourceProduct): array
    {
        $images = [];
        foreach (['thumbnail_url', 'image'] as $key) {
            if (!empty($sourceProduct[$key]) && is_string($sourceProduct[$key])) {
                $images[] = $sourceProduct[$key];
            }
        }
        foreach (['all_image_urls', 'images'] as $key) {
            $values = $sourceProduct[$key] ?? [];
            if (is_string($values)) {
                $values = [$values];
            }
            if (!is_array($values)) {
                continue;
            }
            foreach ($values as $value) {
                if (is_string($value)) {
                    $images[] = $value;
                } elseif (is_array($value) && !empty($value['src'])) {
                    $images[] = $value['src'];
                }
            }
        }

        $images = array_map(fn ($url) => trim((string) $url), $images);
        $images = array_filter($images, fn ($url) => str_starts_with($url, 'http://') || str_starts_with($url, 'https://'));

        return array_values(array_unique($images));
    }

    private function isBlank(mixed $value): bool
    {
        return $value === null || trim((string) $value) === '';
    }

    private function normalizeSourceName(string $value): string
    {
        return Str::of($value)->lower()->replace(['_products', '-products'], '')->slug('_')->toString();
    }

    private function normalizeSlug(?string $value): string
    {
        return Str::of((string) $value)->lower()->trim()->toString();
    }
}
