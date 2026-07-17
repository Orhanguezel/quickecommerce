<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductSourceMapping;
use App\Models\ProductVariant;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SyncSourcePrices extends Command
{
    protected $signature = 'sync:source-prices
                            {source_name : Kaynak adi (swan, everlast vs.)}
                            {json_file : Guncel scraper JSON dosyasi}
                            {--store_id= : Sadece belirli magazayi sync et}
                            {--apply : Degisiklikleri DB\'ye yaz}
                            {--backfill-by-slug : Mapping yoksa slug + varyant bilgisiyle esleme onizle/olustur}
                            {--backfill-by-name : Mapping yoksa urun adiyla esleme (slug uyusmazsa; birebir ad, ayni ad birden fazlaysa atlar)}
                            {--backfill-only : Sadece mapping backfill yap, fiyat/stok sync calistirma}
                            {--max-change-percent=30 : Fiyat degisim yuzdesi bu siniri asarsa fiyati atla (stok yine guncellenir)}
                            {--allow-zero-price : 0 fiyat gelirse de uygula (varsayilan: engelle)}
                            {--keep-missing-stock : Kaynakta bulunamayan urunlerde stogu sifirlama (varsayilan: sifirla)}';

    protected $description = 'Kaynak JSON dosyasindan sadece fiyat ve stok senkronu yapar. Varsayilan dry-run modudur.';

    private string $sourceName;
    private array $sourceProducts = [];
    private bool $apply = false;
    private bool $backfillBySlug = false;
    private bool $backfillByName = false;
    private bool $allowZeroPrice = false;
    private float $maxChangePercent = 30.0;
    private bool $zeroMissingStock = true;
    private bool $safeToZeroMissing = true;

    public function handle(): int
    {
        $this->sourceName = $this->normalizeSourceName($this->argument('source_name'));
        $jsonFile = $this->argument('json_file');
        $this->apply = (bool) $this->option('apply');
        $this->backfillBySlug = (bool) $this->option('backfill-by-slug');
        $this->backfillByName = (bool) $this->option('backfill-by-name');
        $this->allowZeroPrice = (bool) $this->option('allow-zero-price');
        $this->maxChangePercent = (float) $this->option('max-change-percent');
        $this->zeroMissingStock = !$this->option('keep-missing-stock');

        if (!file_exists($jsonFile)) {
            $this->error("JSON dosyasi bulunamadi: {$jsonFile}");
            return self::FAILURE;
        }

        $products = json_decode(file_get_contents($jsonFile), true);
        if (!is_array($products)) {
            $this->error('JSON dosyasi okunamadi veya urun listesi degil.');
            return self::FAILURE;
        }

        $this->sourceProducts = $this->indexSourceProducts($products);
        $this->line($this->apply ? 'APPLY modu aktif.' : 'DRY-RUN modu aktif. DB yazimi yok.');

        $backfilled = 0;
        if ($this->backfillBySlug || $this->backfillByName) {
            $backfilled = $this->backfillMappings($products);
        }

        if ($this->option('backfill-only')) {
            $this->table(
                ['Metrik', 'Adet'],
                [
                    ['Backfill mapping', $backfilled],
                    ['Kontrol edilen', 0],
                    [$this->apply ? 'Guncellenen' : 'Guncellenecek', 0],
                    ['Degismeyen', 0],
                    ['Kaynakta bulunamayan', 0],
                    ['Gecersiz/0 fiyat', 0],
                    ['Fiyat degisim limiti', 0],
                    ['Hata', 0],
                ]
            );

            return self::SUCCESS;
        }

        $query = ProductSourceMapping::query()
            ->with(['variant.product'])
            ->where('source_name', $this->sourceName);

        if ($this->option('store_id')) {
            $query->where('store_id', (int) $this->option('store_id'));
        }

        $stats = [
            'checked' => 0,
            'updated' => 0,
            'would_update' => 0,
            'unchanged' => 0,
            'missing' => 0,
            'missing_zeroed' => 0,
            'invalid_price' => 0,
            'price_guard' => 0,
            'errors' => 0,
        ];

        // Guvenlik: kaynak JSON, mevcut mapping sayisinin yarisindan az urun
        // iceriyorsa scrape muhtemelen kismidir; 'missing' urunlerde stok
        // sifirlamayi DEVRE DISI birak (yoksa saglam urunler yanlislikla 0 olur).
        $mappingTotal = (clone $query)->count();
        $sourceUnique = max(
            count($this->sourceProducts['slug']),
            count($this->sourceProducts['url']),
            count($this->sourceProducts['id'])
        );
        $this->safeToZeroMissing = $this->zeroMissingStock
            && $sourceUnique >= max(1, (int) floor(0.5 * $mappingTotal));

        if ($this->zeroMissingStock && !$this->safeToZeroMissing) {
            $this->warn("GUVENLIK: kaynak urun ({$sourceUnique}) < mapping yarisi ({$mappingTotal}); 'missing' stok sifirlama DEVRE DISI (kismi scrape suphesi).");
        }

        $query->orderBy('id')->chunkById(200, function ($mappings) use (&$stats) {
            foreach ($mappings as $mapping) {
                $stats['checked']++;

                try {
                    $result = $this->syncMapping($mapping);
                    $stats[$result] = ($stats[$result] ?? 0) + 1;
                } catch (\Throwable $exception) {
                    $stats['errors']++;
                    if ($this->output->isVerbose()) {
                        $this->warn("HATA mapping #{$mapping->id}: {$exception->getMessage()}");
                    }
                }
            }
        });

        $this->table(
            ['Metrik', 'Adet'],
            [
                ['Backfill mapping', $backfilled],
                ['Kontrol edilen', $stats['checked']],
                [$this->apply ? 'Guncellenen' : 'Guncellenecek', $this->apply ? $stats['updated'] : $stats['would_update']],
                ['Degismeyen', $stats['unchanged']],
                ['Kaynakta bulunamayan', $stats['missing']],
                ['Missing -> stok 0', $stats['missing_zeroed']],
                ['Gecersiz/0 fiyat (stok yine guncellendi)', $stats['invalid_price']],
                ['Fiyat limiti (stok yine guncellendi)', $stats['price_guard']],
                ['Hata', $stats['errors']],
            ]
        );

        return $stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function syncMapping(ProductSourceMapping $mapping): string
    {
        $variant = $mapping->variant;
        if (!$variant) {
            $this->markMapping($mapping, 'missing', 'Local variant not found.');
            return 'missing';
        }

        $sourceProduct = $this->findSourceProduct($mapping);
        if (!$sourceProduct) {
            // Kaynaktan kalkmis urun: satisi durdurmak icin stogu sifirla
            // (yalnizca scrape tam gorunuyorsa — bkz. safeToZeroMissing).
            if ($this->safeToZeroMissing && (int) $variant->stock_quantity !== 0) {
                if (!$this->apply) {
                    return 'missing_zeroed';
                }
                $variant->update(['stock_quantity' => 0]);
                $this->markMapping($mapping, 'missing_zeroed', 'Source product not found; stock zeroed.');
                return 'missing_zeroed';
            }
            // 2026-07-17: Tek scrape'te kaybolma cogu zaman GECICI (urun sayfasinin
            // fetch/parse'i o an basarisiz oldu / run-all timing) — gercekten
            // kaldirilmis degil. Daha once basariyla sync olmus (last_synced_price
            // dolu) bir urun ILK kez kayboluyorsa 'missing_transient' (health-check
            // ALARMI YOK). Arka arkaya 2. turda da yoksa 'missing' (gercek kalkma).
            // musclepump'in her gun bosuna flaglenmesini onler; stok davranisi
            // degismez (yukaridaki safeToZeroMissing zaten koruyor).
            $neverSynced = $mapping->last_synced_price === null;
            $wasTransient = $mapping->last_sync_status === 'missing_transient';
            $missStatus = ($neverSynced || $wasTransient) ? 'missing' : 'missing_transient';
            $this->markMapping(
                $mapping,
                $missStatus,
                $missStatus === 'missing'
                    ? 'Source product not found.'
                    : 'Not in this scrape — transient (1st miss, no alarm).'
            );
            return $missStatus;
        }

        $sourceVariant = $this->findSourceVariant($mapping, $sourceProduct);
        $incoming = $this->extractIncomingValues($sourceProduct, $sourceVariant);

        // 1) STOK — fiyattan BAGIMSIZ, her zaman degerlendirilir.
        $changes = [];
        if ($incoming['stock_quantity'] !== null
            && (int) $variant->stock_quantity !== (int) $incoming['stock_quantity']) {
            $changes['stock_quantity'] = (int) $incoming['stock_quantity'];
        }

        // 2) FIYAT — kendi korumalari var; basarisizsa SADECE fiyat atlanir,
        //    stok degisikligi yine uygulanir.
        $priceStatus = null;
        $incomingStockZero = isset($changes['stock_quantity'])
            ? (int) $changes['stock_quantity'] === 0
            : (int) $variant->stock_quantity === 0
              && $incoming['stock_quantity'] !== null
              && (int) $incoming['stock_quantity'] === 0;

        if ($incomingStockZero) {
            // 2026-06-04: Tukenmis (stok=0) urunlerde tedarikciler fiyat alanini
            // genelde bozuk veriyor (eprotein Cellucor C4: 1500 TL gercek ->
            // tukendiginde JSON-LD'de 194 TL gosterildi). Bu yuzden stok=0 ise
            // fiyati hic sync etme — DB'deki son guvenilir fiyat korunsun.
            $priceStatus = 'stock_zero_skip_price';
        } elseif (!$this->hasValidPrice($incoming['price'], $incoming['special_price'])) {
            $priceStatus = 'invalid_price';
        } elseif (!$this->withinPriceGuard($variant, $incoming['price'], $incoming['special_price'])) {
            $priceStatus = 'price_guard';
        } else {
            foreach (['price', 'special_price'] as $field) {
                $incomingValue = $incoming[$field];
                $currentValue = $variant->{$field};
                if ($incomingValue !== null && round((float) $currentValue, 2) !== round((float) $incomingValue, 2)) {
                    $changes[$field] = $incomingValue;
                }
            }

            // BAYAT INDIRIM TEMIZLIGI (2026-07-17): Kaynak artik indirim yapmiyorsa
            // (incoming special_price null) ama bizde eski bir special takiliysa TEMIZLE.
            // Aksi halde kaynagin indirimi bitince/degisince bizim special bayat kalip
            // tedarikci maliyetinin ALTINDA satisa (zarar) yol aciyordu — ceysport CPBP-10
            // vakasi: 3450 special, tedarikci 4450. Yalniz bu dal (fiyat guvenilir) icinde.
            if ($incoming['special_price'] === null
                && $variant->special_price !== null
                && (float) $variant->special_price > 0) {
                $changes['special_price'] = null;
            }
        }

        if (empty($changes)) {
            // Yazilacak bir sey yok: fiyat donduysa onu, degilse 'unchanged' raporla.
            $status = $priceStatus ?? 'unchanged';
            $note = match ($priceStatus) {
                'invalid_price' => 'Source returned empty or zero price.',
                'price_guard' => 'Price change exceeded max-change-percent.',
                'stock_zero_skip_price' => 'Stock is zero; price not synced (source price may be unreliable).',
                default => 'No price or stock change.',
            };
            $this->markMapping($mapping, $status, $note);
            return $status;
        }

        if (!$this->apply) {
            if ($this->output->isVerbose()) {
                $this->line("WOULD UPDATE variant #{$variant->id}: " . json_encode($changes, JSON_UNESCAPED_UNICODE)
                    . ($priceStatus ? " (fiyat atlandi: {$priceStatus})" : ''));
            }
            return 'would_update';
        }

        $variant->update($changes);
        $note = $priceStatus
            ? "Stock updated; price skipped ({$priceStatus})."
            : 'Price/stock updated.';
        $this->markMapping($mapping, 'updated', $note, $incoming);

        return 'updated';
    }

    private function indexSourceProducts(array $products): array
    {
        $index = [
            'slug' => [],
            'url' => [],
            'id' => [],
        ];

        foreach ($products as $product) {
            if (!is_array($product)) {
                continue;
            }

            $slug = $this->normalizeSlug($product['slug'] ?? '');
            $url = trim((string) ($product['url'] ?? ''));
            $id = trim((string) ($product['source_product_id'] ?? $product['id'] ?? ''));

            if ($slug !== '') {
                $index['slug'][$slug] = $product;
            }
            if ($url !== '') {
                $index['url'][$url] = $product;
            }
            if ($id !== '') {
                $index['id'][$id] = $product;
            }
        }

        return $index;
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

    private function findSourceVariant(ProductSourceMapping $mapping, array $sourceProduct): ?array
    {
        $variants = $sourceProduct['variants'] ?? [];
        if (!is_array($variants) || count($variants) === 0) {
            return null;
        }

        foreach (['source_variant_id' => 'id', 'source_variant_sku' => 'sku', 'source_variant_barcode' => 'barcode'] as $mappingKey => $variantKey) {
            $expected = trim((string) $mapping->{$mappingKey});
            if ($expected === '') {
                continue;
            }

            foreach ($variants as $variant) {
                if (trim((string) ($variant[$variantKey] ?? '')) === $expected) {
                    return $variant;
                }
            }
        }

        $title = $this->normalizeVariantTitle($mapping->source_variant_title);
        if ($title !== '') {
            foreach ($variants as $variant) {
                if ($this->normalizeVariantTitle($variant['title'] ?? '') === $title) {
                    return $variant;
                }
            }
        }

        return count($variants) === 1 ? Arr::first($variants) : null;
    }

    private function extractIncomingValues(array $sourceProduct, ?array $sourceVariant): array
    {
        if ($sourceVariant) {
            $price = $this->numberOrNull($sourceVariant['price'] ?? $sourceProduct['original_price'] ?? null);
            $compare = $this->numberOrNull($sourceVariant['compare_at_price'] ?? null);
            $special = null;

            if ($compare !== null && $price !== null && $compare > $price) {
                $special = $price;
                $price = $compare;
            }

            return [
                'price' => $price,
                'special_price' => $special,
                'stock_quantity' => $this->stockFromSource($sourceVariant, $sourceProduct),
            ];
        }

        // Bazi scraperlar ( or. musclepump) variant uretmez ve farkli alan
        // adlari kullanir: original_price yerine 'price'.
        return [
            'price' => $this->numberOrNull($sourceProduct['original_price'] ?? $sourceProduct['price'] ?? null),
            'special_price' => $this->numberOrNull($sourceProduct['discounted_price'] ?? null),
            'stock_quantity' => $this->stockFromSource($sourceProduct),
        ];
    }

    /**
     * Kaynaktan gelen stok sinyalini DB miktarina cevirir.
     *
     * 2026-06-04 KOKLU DEGISIKLIK: bool sinyal -> 100 yerine 1. Tedarikci
     * siteler genelde gercek miktari vermez, sadece "stokta var/yok" boolean
     * doner. Eskiden bool true -> 100 yaziyorduk, musteri "Stokta (100)"
     * goruyordu ve 50 siparis verebiliyordu. Gercek stok 0 cikinca yok satis.
     *
     * Yeni semantik:
     *   - INT stok varsa (real number)  -> oldugu gibi kullan
     *   - BOOL true                     -> 1 (var ama miktar bilinmiyor)
     *   - BOOL false                    -> 0 (kesin yok)
     *   - Hicbir sinyal yok             -> 0 (kullanici kurali: belirsizse satma)
     *
     * UI tarafi stock_quantity sayisini gizler, sadece "Stokta"/"Tukendi"
     * gosterir (Faz 4). 1 degeri sembolik: oversell minimize.
     */
    private function stockFromSource(array $source, ?array $fallback = null): int
    {
        foreach (['stock_quantity', 'stock'] as $key) {
            if (isset($source[$key]) && is_numeric($source[$key])) {
                return max(0, (int) $source[$key]);
            }
            if ($fallback && isset($fallback[$key]) && is_numeric($fallback[$key])) {
                return max(0, (int) $fallback[$key]);
            }
        }

        foreach (['available', 'in_stock'] as $boolKey) {
            if (array_key_exists($boolKey, $source)) {
                return $source[$boolKey] ? 1 : 0;
            }
            if ($fallback && array_key_exists($boolKey, $fallback)) {
                return $fallback[$boolKey] ? 1 : 0;
            }
        }

        // Hicbir stok sinyali yok: tedbirli davran, satma.
        // Daha onceki 100 default'u 13000+ urunde yanlis "100 stok" iddiasi
        // dogurdu (provitanya/proteinmax/ayakkabi vs.).
        return 0;
    }

    private function hasValidPrice(?float $price, ?float $specialPrice): bool
    {
        if ($this->allowZeroPrice) {
            return $price !== null || $specialPrice !== null;
        }

        return ($price !== null && $price > 0) || ($specialPrice !== null && $specialPrice > 0);
    }

    private function withinPriceGuard(ProductVariant $variant, ?float $price, ?float $specialPrice): bool
    {
        $current = $variant->effectivePrice();
        $incoming = $this->effectivePrice($price, $specialPrice);

        if ($current <= 0 || $incoming <= 0) {
            return $this->allowZeroPrice;
        }

        $changePercent = abs($incoming - $current) / $current * 100;

        return $changePercent <= $this->maxChangePercent;
    }

    private function markMapping(ProductSourceMapping $mapping, string $status, string $note, ?array $incoming = null): void
    {
        if (!$this->apply) {
            return;
        }

        $payload = [
            'last_sync_status' => $status,
            'last_sync_note' => $note,
            'last_sync_at' => now(),
        ];

        if ($incoming) {
            $payload['last_synced_price'] = $incoming['price'];
            $payload['last_synced_special_price'] = $incoming['special_price'];
            $payload['last_synced_stock'] = $incoming['stock_quantity'];
        }

        $mapping->update($payload);
    }

    private function backfillMappings(array $products): int
    {
        $created = 0;
        $storeId = $this->option('store_id') ? (int) $this->option('store_id') : null;
        $plannedVariantIds = [];

        // Isim modu: ayni ada sahip DB urunlerini onceden indeksle; bir ad
        // birden fazla urune denk geliyorsa belirsizdir, eslestirilmez.
        $nameIndex = $this->backfillByName ? $this->buildNameIndex($storeId) : [];

        foreach ($products as $sourceProduct) {
            $slug = $this->normalizeSlug($sourceProduct['slug'] ?? '');
            if ($slug === '') {
                continue;
            }

            if ($this->backfillByName) {
                $nameKey = $this->normalizeName($sourceProduct['name'] ?? '');
                $product = ($nameKey !== '' && count($nameIndex[$nameKey] ?? []) === 1)
                    ? $nameIndex[$nameKey][0]
                    : null;
            } else {
                $productQuery = Product::query()->with('variants')->where('slug', $slug);
                if ($storeId) {
                    $productQuery->where('store_id', $storeId);
                }
                $product = $productQuery->first();
            }

            if (!$product) {
                continue;
            }

            foreach ($product->variants as $variant) {
                if (
                    isset($plannedVariantIds[$variant->id])
                    || ProductSourceMapping::where('product_variant_id', $variant->id)->exists()
                ) {
                    continue;
                }

                $sourceVariant = $this->findVariantForBackfill($variant, $sourceProduct);
                if (!$sourceVariant && count($sourceProduct['variants'] ?? []) > 1) {
                    continue;
                }

                if (!$this->apply) {
                    if ($this->output->isVerbose()) {
                        $this->line("WOULD BACKFILL variant #{$variant->id} ({$product->slug})");
                    }
                    $plannedVariantIds[$variant->id] = true;
                    $created++;
                    continue;
                }

                $incoming = $this->extractIncomingValues($sourceProduct, $sourceVariant);
                ProductSourceMapping::create([
                    'source_name' => $this->sourceName,
                    'store_id' => $product->store_id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'source_product_url' => $sourceProduct['url'] ?? null,
                    'source_product_id' => $sourceProduct['source_product_id'] ?? $sourceProduct['id'] ?? null,
                    'source_product_slug' => $sourceProduct['slug'] ?? $product->slug,
                    'source_variant_id' => $sourceVariant['source_variant_id'] ?? $sourceVariant['id'] ?? null,
                    'source_variant_sku' => $sourceVariant['sku'] ?? $sourceProduct['sku'] ?? null,
                    'source_variant_barcode' => $sourceVariant['barcode'] ?? $sourceProduct['barcode'] ?? null,
                    'source_variant_title' => $sourceVariant['title'] ?? $variant->variant_slug,
                    'last_synced_price' => $incoming['price'],
                    'last_synced_special_price' => $incoming['special_price'],
                    'last_synced_stock' => $incoming['stock_quantity'],
                    'last_sync_status' => 'backfilled',
                    'last_sync_note' => 'Created by sync backfill.',
                    'last_sync_at' => now(),
                ]);
                $plannedVariantIds[$variant->id] = true;
                $created++;
            }
        }

        return $created;
    }

    private function findVariantForBackfill(ProductVariant $variant, array $sourceProduct): ?array
    {
        $sourceVariants = $sourceProduct['variants'] ?? [];
        if (!is_array($sourceVariants) || count($sourceVariants) === 0) {
            return null;
        }

        $sku = trim((string) $variant->sku);
        if ($sku !== '') {
            foreach ($sourceVariants as $sourceVariant) {
                if (trim((string) ($sourceVariant['sku'] ?? '')) === $sku) {
                    return $sourceVariant;
                }
            }
        }

        $title = $this->normalizeVariantTitle($variant->variant_slug);
        if ($title !== '') {
            foreach ($sourceVariants as $sourceVariant) {
                if ($this->normalizeVariantTitle($sourceVariant['title'] ?? '') === $title) {
                    return $sourceVariant;
                }
            }
        }

        return count($sourceVariants) === 1 ? Arr::first($sourceVariants) : null;
    }

    private function numberOrNull(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? round((float) $value, 2) : null;
    }

    private function effectivePrice(?float $price, ?float $specialPrice): float
    {
        $price = (float) ($price ?? 0);
        $specialPrice = (float) ($specialPrice ?? 0);

        return $specialPrice > 0 && ($price <= 0 || $specialPrice < $price) ? $specialPrice : $price;
    }

    private function normalizeSourceName(string $value): string
    {
        return Str::of($value)->lower()->replace(['_products', '-products'], '')->slug('_')->toString();
    }

    private function normalizeSlug(?string $value): string
    {
        return Str::of((string) $value)->lower()->trim()->toString();
    }

    /**
     * Backfill icin: store urunlerini normalize edilmis ada gore indeksler.
     *
     * @return array<string, list<Product>>
     */
    private function buildNameIndex(?int $storeId): array
    {
        $query = Product::query()->with('variants');
        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $index = [];
        foreach ($query->get() as $product) {
            $key = $this->normalizeName($product->name);
            if ($key !== '') {
                $index[$key][] = $product;
            }
        }

        return $index;
    }

    private function normalizeName(?string $value): string
    {
        return Str::of((string) $value)->lower()->trim()->replaceMatches('/\s+/', ' ')->toString();
    }

    private function normalizeVariantTitle(?string $value): string
    {
        return Str::of((string) $value)->lower()->trim()->replaceMatches('/\s+/', ' ')->toString();
    }
}
