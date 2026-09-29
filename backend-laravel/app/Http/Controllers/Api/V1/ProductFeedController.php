<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\FlashSale;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductBrand;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class ProductFeedController extends Controller
{
    /**
     * Cimri XML Product Feed
     * URL: /feeds/cimri.xml
     *
     * Tum aktif urunleri fiyat karsilastirma feed'i olarak doner.
     * 6 saat cache'lenir — cache temizlemek icin: php artisan cache:clear
     */
    public function cimri(): Response
    {
        return $this->serveFeed('cimri_product_feed_v3', 'feed_lock_cimri', 'cimri');
    }

    /**
     * Google Merchant XML Product Feed
     * URL: /feeds/google.xml
     *
     * Google Merchant icin sorun cikarabilecek urunleri feed disinda birakir.
     */
    public function google(): Response
    {
        return $this->serveFeed('google_product_feed_v2', 'feed_lock_google', 'google');
    }

    /**
     * Cache lock pattern: ayni anda gelen 4 cache-miss istegi, hep birlikte
     * regenerate edip 4-5 ardisik 500 dondurmek yerine yalniz 1 istek regenerate
     * eder; digerleri 503 + Retry-After ile geri cevirilir. Bot/crawler retry
     * yapar; sonraki istekler cache HIT olur.
     */
    private function serveFeed(string $cacheKey, string $lockKey, string $feedType): Response
    {
        // FPM php.ini memory_limit genelde 128M; cimri cache 37 MB string + Redis
        // read sirasinda heap allocation -> Connection.php:119'da exhaust olur.
        // Cache HIT yolunda bile Cache::get(38MB) 128M'i asar. CLI'da limit -1
        // oldugu icin feeds:warm sorunsuz; HTTP route'unda burada artiriyoruz.
        ini_set('memory_limit', '512M');

        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return $this->xmlResponse($cached);
        }

        $lock = Cache::lock($lockKey, 60);
        if (!$lock->get()) {
            return response('Feed regenerating, retry shortly', 503, [
                'Retry-After' => '30',
            ]);
        }

        try {
            $xml = $this->generateProductXml($feedType);
            Cache::put($cacheKey, $xml, 6 * 60 * 60);
            return $this->xmlResponse($xml);
        } finally {
            $lock->release();
        }
    }

    private function xmlResponse(string $xml): Response
    {
        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function generateProductXml(string $feedType): string
    {
        $siteUrl = rtrim(config('app.frontend_url', 'https://sportoonline.com'), '/');

        // Aktif urunleri variant + kategori + marka ile cek. Kategori parent
        // zincirini eager-load et — aksi halde buildCategoryPath her urunde
        // lazy-load N+1 sorgu uretir (cimri ~3600 urunde 30 sn'i asar).
        $products = Product::where('status', 'approved')
            ->whereNull('deleted_at')
            ->when(
                $feedType === 'google' && config('commerce.google_feed_ads_eligible_only'),
                fn ($query) => $query->where('ads_eligible', true)
            )
            ->with([
                'variants' => fn($q) => $q->where('status', 1)->whereNull('deleted_at'),
                'category.parent.parent.parent.parent',
                'brand',
                'store',
                'flashSale',
            ])
            ->get();

        $brandLookup = $this->buildBrandLookup();

        // N+1 onleme: tum gerekli Media kayitlarini tek sorguda topla.
        // com_option_get_id_wise_url her cagri da Media::find yapardi -> binlerce
        // sorgu. Burada batch fetch + in-memory lookup map kullaniyoruz.
        $mediaMap = $this->buildMediaMap($products, $feedType);
        $categoryPathCache = [];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml .= "  <channel>\n";
        $feedName = $this->xmlEscape((string) config('app.name'));
        $xml .= "    <title>" . $feedName . " " . ($feedType === 'google' ? 'Google Merchant' : 'Cimri') . " Product Feed</title>\n";
        $xml .= "    <link>" . $this->xmlEscape($siteUrl) . "</link>\n";
        $xml .= "    <description>" . $feedName . " " . ($feedType === 'google' ? 'Google Merchant' : 'price comparison') . " product feed</description>\n";

        foreach ($products as $product) {
            // Urun URL
            $productUrl = $siteUrl . '/tr/urun/' . $product->slug;

            // Gorsel URL — batch-fetch'lenmis Media map'inden cozumle (DB sorgusu yok)
            $imageUrl = $this->resolveImageUrl($product->image, $mediaMap);
            if ($imageUrl === '') {
                continue;
            }
            if ($feedType === 'google' && !$this->hasMerchantSafeImageUrl($imageUrl)) {
                continue;
            }

            // Kategori yolu — paylasilan kategoriler icin tek sefer hesaplanir
            $catId = $product->category_id ?? ($product->category?->id);
            $categoryPath = $catId !== null
                ? ($categoryPathCache[$catId] ??= $this->buildCategoryPath($product->category))
                : '';
            if ($feedType === 'google' && $this->isRestrictedForGoogleMerchant($product, $categoryPath)) {
                continue;
            }

            // Marka — urunun kendi markasi, yoksa urun adinin basindaki kayitli
            // marka adi. Hicbiri yoksa bos kalir: pazaryeri adi uretici markasi
            // yerine yazilmaz (Merchant'ta 2.738 kayit "Sportoonline" markali
            // gidiyordu — derin analiz 2026-09-29).
            $brandName = $this->resolveBrandName($product, $brandLookup);
            $flashSale = $this->activeFlashSale($product);

            // Description — Google Merchant zorunlu alan. Bossa feed'den exclude et.
            // >5000 karakter ise truncate.
            $descriptionText = trim(strip_tags((string) $product->description));
            $descriptionText = preg_replace('/\s+/', ' ', $descriptionText) ?: '';
            if ($feedType === 'google' && !$this->hasMerchantSafeDescription($descriptionText)) {
                continue; // Google reject etmesin diye zayif/placeholder aciklamali urunleri atlayalim
            }

            if ($feedType === 'cimri' && $descriptionText === '') {
                $descriptionText = (string) $product->name;
            }

            if ($feedType === 'google' && !$this->hasMerchantSafeStore($product->store)) {
                continue; // Satici seffafligi icin iletisim bilgisi eksik urunleri feed'e koymayalim
            }
            if (mb_strlen($descriptionText) > 5000) {
                $descriptionText = mb_substr($descriptionText, 0, 4997) . '...';
            }

            $feedVariants = $feedType === 'cimri'
                ? $product->variants
                : collect([$product->displayVariant()])->filter();

            foreach ($feedVariants as $variant) {
                if (!$variant) {
                    continue;
                }

                // Gercek fiyat: special_price > 0 ise o, degilse price
                $effectivePrice = ((float) $variant->special_price > 0)
                    ? (float) $variant->special_price
                    : (float) $variant->price;

                if ($effectivePrice <= 0) {
                    continue;
                }

                // Fiyat — sitede gorunen ve sipariste tahsil edilen fiyatla ayni
                // kural: special_price, ustune aktif flash sale indirimi
                // (OrderService ile ayni formul).
                $finalPrice = $effectivePrice - $this->flashSaleDiscount($flashSale, $effectivePrice);
                $price = number_format((float) $variant->price, 2, '.', '');
                $specialPrice = ($finalPrice > 0 && $finalPrice < (float) $variant->price)
                    ? number_format($finalPrice, 2, '.', '')
                    : null;

                // Stok durumu
                $stockStatus = ($variant->stock_quantity > 0) ? 'in stock' : 'out of stock';
                if ($feedType === 'google' && $stockStatus !== 'in stock') {
                    continue;
                }

                // SKU / Barkod
                $sku = $variant->sku ?: ('SP-' . $product->id . '-' . $variant->id);
                $title = $this->buildFeedTitle($product, $variant, $feedType);
                $variantText = $this->variantAttributesText($variant);
                $itemDescription = $descriptionText;
                if ($feedType === 'cimri' && $variantText !== '' && !str_contains($itemDescription, $variantText)) {
                    $itemDescription = trim($itemDescription . ' Seçenek: ' . $variantText);
                }

                $xml .= "    <item>\n";
                $xml .= "      <g:id>" . $this->xmlEscape($sku) . "</g:id>\n";
                $xml .= "      <g:title><![CDATA[" . $title . "]]></g:title>\n";
                $xml .= "      <g:description><![CDATA[" . $itemDescription . "]]></g:description>\n";
                $xml .= "      <g:link><![CDATA[" . $productUrl . "]]></g:link>\n";
                $xml .= "      <g:image_link><![CDATA[" . $imageUrl . "]]></g:image_link>\n";

                // Galeri gorselleri — batch-fetch map'inden cozumle
                if ($product->gallery_images) {
                    $galleryIds = explode(',', $product->gallery_images);
                    foreach (array_slice($galleryIds, 0, 5) as $imgId) {
                        $galleryUrl = $this->resolveImageUrl(trim($imgId), $mediaMap);
                        if ($galleryUrl !== '') {
                            $xml .= "      <g:additional_image_link><![CDATA[" . $galleryUrl . "]]></g:additional_image_link>\n";
                        }
                    }
                }

                $xml .= "      <g:condition>new</g:condition>\n";
                $xml .= "      <g:availability>" . $stockStatus . "</g:availability>\n";

                // Fiyat — Google Feed TRY para birimiyle fiyat bekler
                if ($specialPrice !== null) {
                    $xml .= "      <g:price>" . $price . " TRY</g:price>\n";
                    $xml .= "      <g:sale_price>" . $specialPrice . " TRY</g:sale_price>\n";
                    if ($flashSale && $flashSale->start_time && $flashSale->end_time) {
                        $xml .= "      <g:sale_price_effective_date>"
                            . Carbon::parse($flashSale->start_time)->toIso8601String() . '/'
                            . Carbon::parse($flashSale->end_time)->toIso8601String()
                            . "</g:sale_price_effective_date>\n";
                    }
                } else {
                    $xml .= "      <g:price>" . $price . " TRY</g:price>\n";
                }

                $xml .= "      <g:product_type><![CDATA[" . $categoryPath . "]]></g:product_type>\n";

                if ($brandName !== '') {
                    $xml .= "      <g:brand><![CDATA[" . $brandName . "]]></g:brand>\n";
                    if ($variant->sku) {
                        $xml .= "      <g:mpn>" . $this->xmlEscape($variant->sku) . "</g:mpn>\n";
                    }
                } elseif ($feedType === 'google') {
                    // Marka ve GTIN yok: uydurma tanimlayici yerine acikca beyan.
                    $xml .= "      <g:identifier_exists>no</g:identifier_exists>\n";
                }

                $xml .= "    </item>\n";
            }
        }

        $xml .= "  </channel>\n";
        $xml .= '</rss>';

        return $xml;
    }

    /**
     * Kategori yolunu parent > child seklinde olusturur
     */
    private function buildCategoryPath($category): string
    {
        if (!$category) {
            return '';
        }

        $parts = [];
        $current = $category;
        $depth = 0;

        while ($current && $depth < 5) {
            $parts[] = $current->category_name;
            $current = $current->parent;
            $depth++;
        }

        return implode(' > ', array_reverse($parts));
    }

    private function buildFeedTitle(Product $product, $variant, string $feedType): string
    {
        $title = trim((string) $product->name);

        if ($feedType !== 'cimri') {
            return $title;
        }

        $variantText = $this->variantAttributesText($variant);
        if ($variantText === '') {
            return $title;
        }

        return str_contains($title, $variantText) ? $title : trim($title . ' ' . $variantText);
    }

    private function variantAttributesText($variant): string
    {
        $attributes = $variant->attributes ?? null;
        if (is_string($attributes)) {
            $attributes = json_decode($attributes, true);
        }

        if (!is_array($attributes)) {
            return '';
        }

        $values = [];
        foreach ($attributes as $value) {
            if (is_array($value)) {
                foreach ($value as $subValue) {
                    $values[] = trim((string) $subValue);
                }
            } else {
                $values[] = trim((string) $value);
            }
        }

        $values = array_values(array_unique(array_filter($values)));
        return implode(' ', $values);
    }

    /**
     * Kayitli marka adlari, uzundan kisaya ("Muscle Pump" "Muscle"dan once
     * eslessin). Anahtar kucuk harf, deger gorunen ad.
     *
     * @return array<string, string>
     */
    private function buildBrandLookup(): array
    {
        $lookup = [];
        foreach (ProductBrand::query()->whereNotNull('brand_name')->pluck('brand_name') as $name) {
            $name = trim((string) $name);
            if (mb_strlen($name) >= 3) {
                $lookup[mb_strtolower($name)] = $name;
            }
        }
        uksort($lookup, fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a));

        return $lookup;
    }

    /**
     * @param array<string, string> $brandLookup
     */
    private function resolveBrandName(Product $product, array $brandLookup): string
    {
        $brandName = trim((string) $product->brand?->brand_name);
        if ($brandName !== '') {
            return $brandName;
        }

        // Yalniz urun adinin BASINDAKI kayitli marka — ad icinde gecen her
        // kelimeyi marka saymak yanlis eslesme uretir.
        $name = mb_strtolower(trim((string) $product->name));
        foreach ($brandLookup as $needle => $label) {
            if (str_starts_with($name, $needle . ' ') || $name === $needle) {
                return $label;
            }
        }

        // Tedarikci adlarinda markanin ad icinde/slug'da gectigi bilinen kaynaklar.
        $haystack = $name . ' ' . mb_strtolower((string) $product->slug);
        $knownBrands = [
            'xpro nutrition' => 'Xpro Nutrition',
            'yeşilmarka' => 'YEŞİLMARKA',
            'yesilmarka' => 'YEŞİLMARKA',
            'west nutrition' => 'West Nutrition',
            'torq nutrition' => 'Torq Nutrition',
            'torq' => 'Torq Nutrition',
        ];
        foreach ($knownBrands as $needle => $label) {
            if (str_contains($haystack, $needle)) {
                return $label;
            }
        }

        return '';
    }

    private function activeFlashSale(Product $product): ?FlashSale
    {
        $flashSale = $product->flashSale;
        if (!$flashSale || (int) $flashSale->status !== 1) {
            return null;
        }
        if ($flashSale->start_time && now()->lt($flashSale->start_time)) {
            return null;
        }
        if (!$flashSale->end_time || now()->gt($flashSale->end_time)) {
            return null;
        }
        if ($flashSale->purchase_limit !== null && (int) $flashSale->purchase_limit <= 0) {
            return null;
        }

        return $flashSale;
    }

    private function flashSaleDiscount(?FlashSale $flashSale, float $basePrice): float
    {
        if (!$flashSale || (float) $flashSale->discount_amount <= 0) {
            return 0.0;
        }

        $discount = $flashSale->discount_type === 'percentage'
            ? $basePrice * (float) $flashSale->discount_amount / 100
            : (float) $flashSale->discount_amount;

        return min($discount, $basePrice);
    }

    private function hasMerchantSafeDescription(string $description): bool
    {
        if ($description === '' || mb_strlen($description) < 20) {
            return false;
        }

        if (preg_match('/^\$[a-z0-9]+$/i', $description)) {
            return false;
        }

        return !preg_match('/\b(lorem|placeholder|demo|test)\b/i', $description);
    }

    private function hasMerchantSafeStore($store): bool
    {
        // Eskiden phone+email+address uclusunun hepsini zorunlu kiliyordu;
        // sportoonline kataloğunda 70+ magazadan yalnız 1-2'sinde bunlar dolu —
        // sonuc: Google feed pratikte bos kaliyordu (~13.5k urunden 13.5k'i atilirdi).
        // Marketplace iletisim bilgisi Google Merchant tarafinda merchant
        // seviyesinde zaten tanimli; per-store contact info zorunlu degil.
        // Magaza var ve silinmemis olsun yeterli; placeholder adresleri reddet.
        if (!$store) {
            return false;
        }
        $address = trim((string) ($store->address ?? ''));
        if ($address !== '' && preg_match('/^(address not found|adres bulunamad[ıi]|no address)$/i', $address)) {
            return false;
        }
        return true;
    }

    private function isRestrictedForGoogleMerchant(Product $product, string $categoryPath): bool
    {
        $haystack = mb_strtolower(implode(' ', [
            $categoryPath,
            (string) $product->name,
            strip_tags((string) $product->description),
            (string) $product->type,
            (string) $product->store?->store_type,
        ]));

        $restrictedTerms = [
            'spor beslenmesi',
            'sporcu besin',
            'besin takviyesi',
            'supplement',
            'protein',
            'whey',
            'kreatin',
            'creatine',
            'bcaa',
            'amino',
            'pre-workout',
            'pre workout',
            'vitamin',
            'mineral',
            'zma',
            'kolajen',
            'collagen',
            'cla',
            'omega',
            'tribulus',
            'testo',
            'carnitine',
            'l-carnitine',
            'yağ yak',
            'detox',
            'takviye',
            'gıda takviyesi',
            'gida takviyesi',
            'beslenme desteği',
            'beslenme destegi',
            'cilt bakımı',
            'cilt bakimi',
            'ayak kokusu',
            'krem',
            'kozmetik',
            'pekmez',
            'bal',
            'reçel',
            'recel',
            'bitkisel',
            'organik',
            'doğal',
            'dogal',
            'tütün',
            'tutun',
            'tobacco',
            'sigara',
            'puro',
            'nargile',
            'alkol',
            'alkollü',
            'alkollu',
            'alcohol',
            'bira',
            'şarap',
            'sarap',
            'rakı',
            'raki',
            'viski',
            'vodka',
            'likör',
            'likor',
        ];

        foreach ($restrictedTerms as $term) {
            if (str_contains($haystack, $term)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Feed icin ihtiyac duyulan tum Media kayitlarini tek sorguda toplar.
     * Cikti: [id => Media] map'i. resolveImageUrl bunu lookup eder.
     *
     * Onceden her urun (ve cimri'de her gallery image) icin Media::find
     * cagriliyordu -> ~3600 urunde 20.000+ DB sorgusu. Bu metot tek sorgu.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<Product>  $products
     * @return array<int, Media>
     */
    private function buildMediaMap($products, string $feedType): array
    {
        $ids = [];
        foreach ($products as $p) {
            $img = $p->image;
            if (is_numeric($img)) {
                $ids[] = (int) $img;
            }
            if ($feedType === 'cimri' && $p->gallery_images) {
                foreach (array_slice(explode(',', $p->gallery_images), 0, 5) as $g) {
                    $g = trim($g);
                    if (is_numeric($g)) {
                        $ids[] = (int) $g;
                    }
                }
            }
        }
        $ids = array_values(array_unique(array_filter($ids)));
        if (empty($ids)) {
            return [];
        }
        return Media::whereIn('id', $ids)->get()->keyBy('id')->all();
    }

    /**
     * Image ID veya direkt URL'den public URL cozumler.
     * - URL ise (http/https) oldugu gibi dondurur.
     * - Sayi ise mediaMap'ten Media kaydini bulup `asset(storage/{path})` uretir.
     * - Bulamazsa bos string.
     *
     * @param  array<int, Media>  $mediaMap
     */
    private function resolveImageUrl($id, array $mediaMap): string
    {
        if ($id === null || $id === '') {
            return '';
        }
        if (is_string($id) && (str_starts_with($id, 'http://') || str_starts_with($id, 'https://'))) {
            return $id;
        }
        if (!is_numeric($id)) {
            return '';
        }
        $media = $mediaMap[(int) $id] ?? null;
        if (!$media) {
            return '';
        }
        return asset('storage/' . $media->path);
    }

    private function hasMerchantSafeImageUrl(string $imageUrl): bool
    {
        // Google Merchant mutlak http(s) URL + standart gorsel uzantisi bekler.
        // NOT: gorsel boyutu burada getimagesize() ile DOGRULANMAZ — uzak URL'de
        // getimagesize her urun icin gorseli HTTP ile indirir; ~3000 urunluk
        // feed'de bu, 30 sn PHP execution limitini asip /feeds/google.xml'i
        // surekli 500'e dusururdu. Uzanti + protokol kontrolu yeterli; dusuk
        // cozunurluklu nadir gorselleri Google Merchant kendi tarafinda eler.
        if (!preg_match('#^https?://#i', $imageUrl)) {
            return false;
        }

        $path = parse_url($imageUrl, PHP_URL_PATH) ?: '';
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true);
    }

    private function xmlEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
