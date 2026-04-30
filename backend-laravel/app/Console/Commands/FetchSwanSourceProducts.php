<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FetchSwanSourceProducts extends Command
{
    protected $signature = 'source:swan-fetch
                            {--output= : JSON cikti yolu}
                            {--limit=0 : Ilk N urunu cek}
                            {--sleep-ms=200 : Istekler arasi bekleme}';

    protected $description = 'Swan Uniform kaynak sitesinden fiyat/stok icin guncel urun JSON dosyasi uretir.';

    private const BASE_URL = 'https://swanuniform.com';
    private const SITEMAP_URL = 'https://swanuniform.com/products.xml';

    public function handle(): int
    {
        $output = $this->option('output') ?: storage_path('app/source-sync/swan_products_latest.json');
        $limit = max(0, (int) $this->option('limit'));
        $sleepMs = max(0, (int) $this->option('sleep-ms'));

        $urls = $this->fetchProductUrls();
        if ($limit > 0) {
            $urls = array_slice($urls, 0, $limit);
        }

        $products = [];
        $errors = 0;

        $bar = $this->output->createProgressBar(count($urls));
        $bar->start();

        foreach ($urls as $url) {
            try {
                $products[] = $this->fetchProduct($url);
            } catch (\Throwable $exception) {
                $errors++;
                if ($this->output->isVerbose()) {
                    $this->warn("HATA {$url}: {$exception->getMessage()}");
                }
            }

            $bar->advance();
            if ($sleepMs > 0) {
                usleep($sleepMs * 1000);
            }
        }

        $bar->finish();
        $this->newLine(2);

        File::ensureDirectoryExists(dirname($output));
        File::put($output, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->table(
            ['Metrik', 'Adet'],
            [
                ['URL', count($urls)],
                ['Basarili urun', count($products)],
                ['Hata', $errors],
            ]
        );
        $this->info("Cikti: {$output}");

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function fetchProductUrls(): array
    {
        $response = Http::timeout(30)
            ->withUserAgent($this->userAgent())
            ->get(self::SITEMAP_URL)
            ->throw();

        $xml = simplexml_load_string($response->body());
        if (!$xml) {
            throw new \RuntimeException('Sitemap XML okunamadi.');
        }

        $urls = [];
        foreach ($xml->url as $urlNode) {
            $loc = trim((string) $urlNode->loc);
            if ($loc !== '') {
                $urls[] = $loc;
            }
        }

        return $urls;
    }

    private function fetchProduct(string $url): array
    {
        $html = Http::timeout(30)
            ->withUserAgent($this->userAgent())
            ->get($url)
            ->throw()
            ->body();

        if (!preg_match('/<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s', $html, $matches)) {
            throw new \RuntimeException('__NEXT_DATA__ bulunamadi.');
        }

        $nextData = json_decode(html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'), true);
        $product = data_get($nextData, 'props.pageProps.pageSpecificData');
        if (!is_array($product)) {
            throw new \RuntimeException('Urun verisi bulunamadi.');
        }

        [$options, $variants] = $this->buildVariants($product);
        $mainVariant = collect($variants)->firstWhere('available', true) ?: ($variants[0] ?? null);
        $priceInfo = data_get($product, 'prices.0', []);
        $originalPrice = $this->numberOrNull($priceInfo['sellPrice'] ?? null);
        $discountedPrice = $this->numberOrNull($priceInfo['discountPrice'] ?? null);

        if ($discountedPrice !== null && $originalPrice !== null && $discountedPrice >= $originalPrice) {
            $discountedPrice = null;
        }

        if ($originalPrice === null && $mainVariant) {
            $originalPrice = $mainVariant['compare_at_price'] ?? $mainVariant['price'] ?? null;
            $discountedPrice = isset($mainVariant['compare_at_price']) ? ($mainVariant['price'] ?? null) : null;
        }

        $name = trim((string) ($product['name'] ?? ''));
        if ($name === '') {
            throw new \RuntimeException('Urun adi bos.');
        }

        return [
            'name' => $name,
            'slug' => $product['slug'] ?? Str::slug($name),
            'url' => $url,
            'category' => data_get($product, 'categories.0.name', 'Genel'),
            'parent_category' => null,
            'vendor' => data_get($product, 'brand.name', 'SWAN UNIFORM'),
            'product_type' => 'medical-uniform',
            'description_html' => $product['description'] ?? '',
            'description_text' => strip_tags($product['description'] ?? ''),
            'original_price' => $originalPrice,
            'discounted_price' => $discountedPrice,
            'discount_rate' => null,
            'sku' => $product['sku'] ?? $product['barcode'] ?? ($mainVariant['sku'] ?? ''),
            'barcode' => $product['barcode'] ?? ($mainVariant['barcode'] ?? ''),
            'specifications' => [],
            'all_image_urls' => [],
            'thumbnail_url' => '',
            'variants' => $variants,
            'options' => $options,
            'downloaded_images' => [],
            'tags' => [],
        ];
    }

    private function buildVariants(array $product): array
    {
        $options = [];
        foreach (($product['variantTypes'] ?? $product['productVariantTypes'] ?? []) as $variantTypeNode) {
            $variantType = $variantTypeNode['variantType'] ?? $variantTypeNode;
            $name = $variantType['name'] ?? '';
            $values = [];
            foreach (($variantType['values'] ?? $variantTypeNode['variantValues'] ?? []) as $valueNode) {
                if (!empty($valueNode['name'])) {
                    $values[] = $valueNode['name'];
                }
            }
            if ($name !== '') {
                $options[] = ['name' => $name, 'values' => $values];
            }
        }

        $variants = [];
        foreach (($product['variants'] ?? []) as $variant) {
            $priceInfo = $variant['prices'][0] ?? [];
            $sellPrice = $this->numberOrNull($priceInfo['sellPrice'] ?? null);
            $discountPrice = $this->numberOrNull($priceInfo['discountPrice'] ?? null);

            $price = $sellPrice;
            $compareAtPrice = null;
            if ($discountPrice !== null && $sellPrice !== null && $discountPrice < $sellPrice) {
                $compareAtPrice = $sellPrice;
                $price = $discountPrice;
            }

            $stockTotal = 0;
            foreach (($variant['stocks'] ?? []) as $stock) {
                $stockTotal += (int) ($stock['stockCount'] ?? 0);
            }

            $valueNames = [];
            foreach (($variant['variantValues'] ?? $variant['selectedVariantValues'] ?? []) as $valueNode) {
                if (!empty($valueNode['name'])) {
                    $valueNames[] = $valueNode['name'];
                }
            }

            $item = [
                'title' => $valueNames ? implode(' / ', $valueNames) : 'default',
                'sku' => $variant['sku'] ?? '',
                'barcode' => $variant['barcode'] ?? (($variant['barcodeList'] ?? [])[0] ?? ''),
                'price' => $price,
                'compare_at_price' => $compareAtPrice,
                'available' => $stockTotal > 0 || (bool) ($variant['sellIfOutOfStock'] ?? false),
                'stock_quantity' => $stockTotal,
            ];

            foreach (array_slice($valueNames, 0, 3) as $index => $value) {
                $item['option' . ($index + 1)] = $value;
            }

            $variants[] = $item;
        }

        return [$options, $variants];
    }

    private function numberOrNull(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? round((float) $value, 2) : null;
    }

    private function userAgent(): string
    {
        return 'Mozilla/5.0 (compatible; SportoonlineSourceSync/1.0)';
    }
}
