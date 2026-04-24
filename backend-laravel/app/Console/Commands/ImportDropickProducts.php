<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductSpecification;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\Translation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class ImportDropickProducts extends Command
{
    protected $signature = 'import:products
                            {json_file : JSON dosyasinin yolu (dropick veya norfolk formatı)}
                            {store_id : Urunlerin eklenmesine istenen store ID}
                            {--dry-run : Gercek kayit yapmadan onizleme}
                            {--skip-images : Gorsel indirmeyi atla (sadece URL kullan)}
                            {--status=approved : Urun statusu (pending, approved, inactive)}
                            {--type=sports : Store type (sports, general, etc.)}
                            {--lang=tr : Varsayilan dil}
                            {--sku-prefix=PRD : SKU on eki (DPK, NFK vs.)}';

    protected $description = 'Scraper JSON ciktisini QuickEcommerce sistemine import eder (Dropick, Norfolk, Swan vs.)';

    private int $storeId;
    private string $defaultLang;
    private string $productType;
    private string $productStatus;
    private string $skuPrefix;
    private bool $dryRun;
    private bool $skipImages;
    private array $categoryCache = [];
    private string $imageBasePath;

    public function handle(): int
    {
        $jsonFile = $this->argument('json_file');
        $this->storeId = (int) $this->argument('store_id');
        $this->dryRun = (bool) $this->option('dry-run');
        $this->skipImages = (bool) $this->option('skip-images');
        $this->productStatus = $this->option('status');
        $this->productType = $this->option('type');
        $this->defaultLang = $this->option('lang');
        $this->skuPrefix = $this->option('sku-prefix');

        // Validasyonlar
        if (!file_exists($jsonFile)) {
            $this->error("JSON dosyasi bulunamadi: {$jsonFile}");
            return 1;
        }

        $store = Store::find($this->storeId);
        if (!$store) {
            $this->error("Store bulunamadi: ID {$this->storeId}");
            return 1;
        }

        $this->info("Store: {$store->name} (ID: {$store->id})");

        // Gorsel dizini
        $this->imageBasePath = storage_path('app/public/uploads/media-uploader/default');
        if (!File::exists($this->imageBasePath)) {
            File::makeDirectory($this->imageBasePath, 0755, true);
        }

        // JSON oku
        $products = json_decode(file_get_contents($jsonFile), true);
        if (!$products) {
            $this->error("JSON dosyasi okunamadi veya bos.");
            return 1;
        }

        $this->info("Toplam {$this->countUniqueProducts($products)} urun import edilecek.");

        if ($this->dryRun) {
            $this->warn("DRY-RUN modu aktif. Veritabanina yazilmayacak.");
        }

        $this->newLine();

        // Kategorileri olustur
        $this->info("Kategoriler olusturuluyor...");
        $this->createCategories($products);

        // Urunleri import et
        $this->info("Urunler import ediliyor...");
        $bar = $this->output->createProgressBar(count($products));
        $bar->start();

        $imported = 0;
        $skipped = 0;
        $errors = 0;
        $seenSlugs = [];

        foreach ($products as $productData) {
            $slug = $productData['slug'] ?? Str::slug($productData['name']);

            // Duplicate slug kontrolu
            if (isset($seenSlugs[$slug])) {
                $bar->advance();
                $skipped++;
                continue;
            }
            $seenSlugs[$slug] = true;

            // Zaten varsa atla
            if (Product::where('slug', $slug)->exists()) {
                $bar->advance();
                $skipped++;
                continue;
            }

            try {
                if (!$this->dryRun) {
                    $this->importProduct($productData, $slug);
                }
                $imported++;
            } catch (\Throwable $e) {
                $errors++;
                $this->newLine();
                $this->error("HATA [{$productData['name']}]: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Import tamamlandi!");
        $this->table(
            ['Durum', 'Adet'],
            [
                ['Import edilen', $imported],
                ['Atlanan (duplicate)', $skipped],
                ['Hata', $errors],
            ]
        );

        return 0;
    }

    private function countUniqueProducts(array $products): int
    {
        $seen = [];
        foreach ($products as $p) {
            $slug = $p['slug'] ?? Str::slug($p['name']);
            $seen[$slug] = true;
        }
        return count($seen);
    }

    private function createCategories(array $products): void
    {
        // Oncelikle benzersiz kategori + parent bilgilerini topla
        $categoryMap = [];
        foreach ($products as $p) {
            $catName = $p['category'];
            $parentName = $p['parent_category'] ?? null;
            if (!isset($categoryMap[$catName])) {
                $categoryMap[$catName] = $parentName;
            }
        }

        // Once parent'lari olustur
        foreach ($categoryMap as $catName => $parentName) {
            if ($parentName === null) {
                $this->findOrCreateCategory($catName, null);
            }
        }

        // Sonra child'lari olustur
        foreach ($categoryMap as $catName => $parentName) {
            if ($parentName !== null) {
                $parentId = $this->findOrCreateCategory($parentName, null);
                $this->findOrCreateCategory($catName, $parentId);
            }
        }

        $this->info("  " . count($this->categoryCache) . " kategori hazirlandi.");
    }

    private function findOrCreateCategory(string $name, ?int $parentId): int
    {
        $cacheKey = $name . '_' . ($parentId ?? 'root');

        if (isset($this->categoryCache[$cacheKey])) {
            return $this->categoryCache[$cacheKey];
        }

        $slug = Str::slug($name);

        // Mevcut kategoriyi bul
        $query = ProductCategory::where('category_slug', $slug);
        if ($parentId) {
            $query->where('parent_id', $parentId);
        }
        $existing = $query->first();

        if ($existing) {
            $this->categoryCache[$cacheKey] = $existing->id;
            return $existing->id;
        }

        if ($this->dryRun) {
            $fakeId = crc32($cacheKey) & 0x7FFFFFFF;
            $this->categoryCache[$cacheKey] = $fakeId;
            return $fakeId;
        }

        $level = $parentId ? 2 : 1;

        $category = ProductCategory::create([
            'category_name' => $name,
            'category_slug' => $slug,
            'type'          => $this->productType,
            'parent_id'     => $parentId,
            'category_level' => $level,
            'is_featured'   => true,
            'status'        => 1,
        ]);

        // Turkce translation ekle
        Translation::create([
            'translatable_type' => ProductCategory::class,
            'translatable_id'   => $category->id,
            'language'           => $this->defaultLang,
            'key'                => 'category_name',
            'value'              => $name,
        ]);

        $this->categoryCache[$cacheKey] = $category->id;
        return $category->id;
    }

    private function importProduct(array $data, string $slug): void
    {
        DB::beginTransaction();

        try {
            // Kategori ID bul
            $catName = $data['category'];
            $parentName = $data['parent_category'] ?? null;
            $cacheKey = $catName . '_' . ($parentName ?? 'root');
            $categoryId = $this->categoryCache[$cacheKey] ?? null;

            // Gorselleri isle
            $mainImageId = null;
            $galleryImageIds = [];

            $imageUrls = $data['all_image_urls'] ?? [];
            $downloadedImages = $data['downloaded_images'] ?? [];

            if (!$this->skipImages && !empty($downloadedImages)) {
                // Yerel dosyalardan import
                foreach ($downloadedImages as $i => $imgInfo) {
                    $mediaId = $this->importImageFromLocal($imgInfo['local_path'], $slug, $i);
                    if ($mediaId) {
                        if ($i === 0) {
                            $mainImageId = $mediaId;
                        } else {
                            $galleryImageIds[] = $mediaId;
                        }
                    }
                }
            } elseif (!empty($imageUrls)) {
                // URL'lerden indirip import
                foreach ($imageUrls as $i => $imgUrl) {
                    $mediaId = $this->importImageFromUrl($imgUrl, $slug, $i);
                    if ($mediaId) {
                        if ($i === 0) {
                            $mainImageId = $mediaId;
                        } else {
                            $galleryImageIds[] = $mediaId;
                        }
                    }
                }
            }

            // Fallback: thumbnail URL
            if (!$mainImageId && !empty($data['thumbnail_url'])) {
                $mainImageId = $this->importImageFromUrl($data['thumbnail_url'], $slug, 0);
            }

            // Urun olustur
            $product = Product::create([
                'store_id'     => $this->storeId,
                'category_id'  => $categoryId,
                'type'         => $this->productType,
                'behaviour'    => 'physical',
                'name'         => $data['name'],
                'slug'         => $slug,
                'description'  => $data['description_html'] ?: $data['description_text'] ?: null,
                'image'        => $mainImageId ? (string) $mainImageId : null,
                'gallery_images' => !empty($galleryImageIds) ? implode(',', $galleryImageIds) : null,
                'status'       => $this->productStatus,
                'is_featured'  => false,
                'free_shipping' => 0,
                'cash_on_delivery' => 0,
            ]);

            // Media binding (main image)
            if ($mainImageId) {
                Media::where('id', $mainImageId)->update([
                    'user_id'    => $this->storeId,
                    'user_type'  => Store::class,
                ]);
            }

            // Gallery image bindings
            foreach ($galleryImageIds as $gId) {
                Media::where('id', $gId)->update([
                    'user_id'    => $this->storeId,
                    'user_type'  => Store::class,
                ]);
            }

            // Translations
            $translationKeys = [
                'name'        => $data['name'],
                'description' => $data['description_html'] ?: $data['description_text'] ?: '',
            ];

            foreach ($translationKeys as $key => $value) {
                if ($value) {
                    Translation::create([
                        'translatable_type' => Product::class,
                        'translatable_id'   => $product->id,
                        'language'           => $this->defaultLang,
                        'key'                => $key,
                        'value'              => $value,
                    ]);
                }
            }

            // Varyantlar — coklu varyant varsa (Norfolk beden vs.) hepsini olustur
            $variants = $data['variants'] ?? [];

            if (!empty($variants) && count($variants) > 1) {
                // Coklu varyant (beden, renk vs.)
                foreach ($variants as $v) {
                    $vPrice = $v['price'] ?? $data['original_price'] ?? 0;
                    $vCompare = $v['compare_at_price'] ?? null;
                    $vSpecial = null;

                    // compare_at_price > price ise: compare orijinal, price indirimli
                    if ($vCompare && $vCompare > $vPrice) {
                        $vSpecial = $vPrice;
                        $vPrice = $vCompare;
                    }

                    $vSku = $v['sku'] ?: generateUniqueSku($this->skuPrefix . '-');
                    $vSlug = $v['title'] ?? 'default';
                    $stockQty = $this->variantStockQuantity($v);

                    $attributes = [];
                    if (!empty($v['option1'])) $attributes['option1'] = $v['option1'];
                    if (!empty($v['option2'])) $attributes['option2'] = $v['option2'];
                    if (!empty($v['option3'])) $attributes['option3'] = $v['option3'];

                    ProductVariant::create([
                        'product_id'     => $product->id,
                        'variant_slug'   => $vSlug,
                        'sku'            => $vSku,
                        'price'          => $vPrice,
                        'special_price'  => $vSpecial,
                        'stock_quantity' => $stockQty,
                        'attributes'     => !empty($attributes) ? json_encode($attributes) : null,
                        'status'         => 1,
                        'image'          => $mainImageId ? (string) $mainImageId : null,
                    ]);
                }
            } else {
                // Tekli varyant (Dropick vs.)
                $price = $data['original_price'] ?? 0;
                $specialPrice = $data['discounted_price'] ?? null;
                $sku = $data['sku'] ?: generateUniqueSku($this->skuPrefix . '-');
                $stockQty = $this->productStockQuantity($data);

                ProductVariant::create([
                    'product_id'     => $product->id,
                    'variant_slug'   => 'default',
                    'sku'            => $sku,
                    'price'          => $price,
                    'special_price'  => $specialPrice,
                    'stock_quantity' => $stockQty,
                    'status'         => 1,
                    'image'          => $mainImageId ? (string) $mainImageId : null,
                ]);
            }

            // Ozellikler (specifications)
            if (!empty($data['specifications'])) {
                foreach ($data['specifications'] as $spec) {
                    ProductSpecification::create([
                        'product_id'   => $product->id,
                        'name'         => $spec['name'] ?? '',
                        'type'         => 'text',
                        'custom_value' => $spec['value'] ?? '',
                    ]);
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function variantStockQuantity(array $variant): int
    {
        if (isset($variant['stock_quantity']) && is_numeric($variant['stock_quantity'])) {
            return max(0, (int) $variant['stock_quantity']);
        }

        if (isset($variant['stock']) && is_numeric($variant['stock'])) {
            return max(0, (int) $variant['stock']);
        }

        return ($variant['available'] ?? true) ? 100 : 0;
    }

    private function productStockQuantity(array $product): int
    {
        if (isset($product['stock_quantity']) && is_numeric($product['stock_quantity'])) {
            return max(0, (int) $product['stock_quantity']);
        }

        if (isset($product['stock']) && is_numeric($product['stock'])) {
            return max(0, (int) $product['stock']);
        }

        if (isset($product['available'])) {
            return $product['available'] ? 100 : 0;
        }

        return 100;
    }

    private function importImageFromLocal(string $localPath, string $slug, int $index): ?int
    {
        $absPath = base_path("../{$localPath}");

        // dropick_images/ proje kokunde olabilir
        if (!file_exists($absPath)) {
            $absPath = base_path($localPath);
        }
        if (!file_exists($absPath)) {
            // Dogrudan verilen path'i dene
            $absPath = $localPath;
        }
        if (!file_exists($absPath)) {
            return null;
        }

        $ext = pathinfo($absPath, PATHINFO_EXTENSION) ?: 'jpg';
        $filename = Str::slug($slug) . '-' . $index . '-' . time() . '.' . $ext;
        $destPath = $this->imageBasePath . '/' . $filename;

        // Dosyayi kopyala
        File::copy($absPath, $destPath);

        // Boyutlari al
        $dimensions = '';
        $imgSize = @getimagesize($destPath);
        if ($imgSize) {
            $dimensions = $imgSize[0] . ' x ' . $imgSize[1] . ' pixels';
        }

        $fileSize = File::size($destPath);

        return Media::create([
            'name'       => $filename,
            'format'     => strtolower($ext),
            'file_size'  => formatBytes($fileSize),
            'path'       => 'uploads/media-uploader/default/' . $filename,
            'dimensions' => $dimensions,
            'alt_text'   => $slug,
            'user_id'    => $this->storeId,
            'user_type'  => Store::class,
        ])->id;
    }

    private function importImageFromUrl(string $url, string $slug, int $index): ?int
    {
        if (empty($url) || !str_starts_with($url, 'http')) {
            return null;
        }

        try {
            $response = @file_get_contents($url, false, stream_context_create([
                'http' => [
                    'timeout' => 15,
                    'user_agent' => 'Mozilla/5.0 (compatible; QuickEcommerce/1.0)',
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]));

            if (!$response) {
                // 2000x2000 basarisiz olursa 800x800'e dusur
                $fallback = preg_replace('/-2000x2000\./', '-800x800.', $url);
                if ($fallback !== $url) {
                    $response = @file_get_contents($fallback, false, stream_context_create([
                        'http' => ['timeout' => 15, 'user_agent' => 'Mozilla/5.0'],
                        'ssl'  => ['verify_peer' => false, 'verify_peer_name' => false],
                    ]));
                }
            }

            if (!$response) {
                return null;
            }

            // Uzantiyi URL'den bul
            $urlPath = parse_url($url, PHP_URL_PATH);
            $ext = pathinfo($urlPath, PATHINFO_EXTENSION) ?: 'jpg';
            $filename = Str::slug($slug) . '-' . $index . '-' . time() . '.' . $ext;
            $destPath = $this->imageBasePath . '/' . $filename;

            file_put_contents($destPath, $response);

            $dimensions = '';
            $imgSize = @getimagesize($destPath);
            if ($imgSize) {
                $dimensions = $imgSize[0] . ' x ' . $imgSize[1] . ' pixels';
            }

            $fileSize = filesize($destPath);

            return Media::create([
                'name'       => $filename,
                'format'     => strtolower($ext),
                'file_size'  => formatBytes($fileSize),
                'path'       => 'uploads/media-uploader/default/' . $filename,
                'dimensions' => $dimensions,
                'alt_text'   => $slug,
                'user_id'    => $this->storeId,
                'user_type'  => Store::class,
            ])->id;
        } catch (\Throwable $e) {
            $this->warn("Gorsel indirilemedi: {$url} - {$e->getMessage()}");
            return null;
        }
    }
}
