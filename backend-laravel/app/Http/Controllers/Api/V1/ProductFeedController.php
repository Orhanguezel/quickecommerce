<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class ProductFeedController extends Controller
{
    /**
     * Cimri XML Product Feed
     * URL: /feeds/cimri.xml
     *
     * Tum aktif urunleri Google Merchant RSS yapisinda XML olarak doner.
     * 6 saat cache'lenir — cache temizlemek icin: php artisan cache:clear
     */
    public function cimri(): Response
    {
        $xml = Cache::remember('cimri_product_feed_google_only_v2', 6 * 60 * 60, function () {
            return $this->generateCimriXml();
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function generateCimriXml(): string
    {
        $siteUrl = rtrim(config('app.frontend_url', 'https://sportoonline.com'), '/');
        $backendUrl = rtrim(config('app.url', 'https://api.sportoonline.com'), '/');

        // Aktif urunleri variant + kategori + marka ile cek
        $products = Product::where('status', 'approved')
            ->whereNull('deleted_at')
            ->with([
                'variants' => fn($q) => $q->where('status', 1)->whereNull('deleted_at'),
                'category',
                'brand',
            ])
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml .= "  <channel>\n";
        $xml .= "    <title>Sportoonline Product Feed</title>\n";
        $xml .= "    <link>" . $this->xmlEscape($siteUrl) . "</link>\n";
        $xml .= "    <description>Sportoonline Google Merchant product feed</description>\n";

        foreach ($products as $product) {
            $variant = $product->displayVariant();
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

            // Urun URL
            $productUrl = $siteUrl . '/tr/urun/' . $product->slug;

            // Gorsel URL
            $imageUrl = '';
            if ($product->image) {
                $imageUrl = com_option_get_id_wise_url($product->image);
            }

            // Kategori yolu
            $categoryPath = $this->buildCategoryPath($product->category);

            // Marka — Google g:brand zorunlu sayilir. Bos ise site adi kullanilir.
            $brandName = $product->brand?->brand_name ?: 'Sportoonline';

            // Description — Google Merchant zorunlu alan. Bossa feed'den exclude et.
            // >5000 karakter ise truncate.
            $descriptionText = trim(strip_tags((string) $product->description));
            if ($descriptionText === '') {
                continue; // Google reject etmesin diye description bos urunleri atlayalim
            }
            if (mb_strlen($descriptionText) > 5000) {
                $descriptionText = mb_substr($descriptionText, 0, 4997) . '...';
            }

            // Fiyat
            $price = number_format((float) $variant->price, 2, '.', '');
            $specialPrice = ($variant->special_price && (float) $variant->special_price > 0)
                ? number_format((float) $variant->special_price, 2, '.', '')
                : null;

            // Stok durumu
            $stockStatus = ($variant->stock_quantity > 0) ? 'in stock' : 'out of stock';

            // SKU / Barkod
            $sku = $variant->sku ?: ('SP-' . $product->id);

            $xml .= "    <item>\n";
            $xml .= "      <g:id>" . $this->xmlEscape($sku) . "</g:id>\n";
            $xml .= "      <g:title><![CDATA[" . $product->name . "]]></g:title>\n";
            $xml .= "      <g:description><![CDATA[" . $descriptionText . "]]></g:description>\n";
            $xml .= "      <g:link><![CDATA[" . $productUrl . "]]></g:link>\n";
            $xml .= "      <g:image_link><![CDATA[" . $imageUrl . "]]></g:image_link>\n";

            // Galeri gorselleri
            if ($product->gallery_images) {
                $galleryIds = explode(',', $product->gallery_images);
                foreach (array_slice($galleryIds, 0, 5) as $imgId) {
                    $galleryUrl = com_option_get_id_wise_url(trim($imgId));
                    if ($galleryUrl) {
                        $xml .= "      <g:additional_image_link><![CDATA[" . $galleryUrl . "]]></g:additional_image_link>\n";
                    }
                }
            }

            $xml .= "      <g:condition>new</g:condition>\n";
            $xml .= "      <g:availability>" . $stockStatus . "</g:availability>\n";

            // Fiyat — Google Feed TRY para birimiyle fiyat bekler
            if ($specialPrice && $specialPrice < $price) {
                $xml .= "      <g:price>" . $price . " TRY</g:price>\n";
                $xml .= "      <g:sale_price>" . $specialPrice . " TRY</g:sale_price>\n";
            } else {
                $xml .= "      <g:price>" . $price . " TRY</g:price>\n";
            }

            $xml .= "      <g:product_type><![CDATA[" . $categoryPath . "]]></g:product_type>\n";

            // brandName her zaman dolu (default "Sportoonline")
            $xml .= "      <g:brand><![CDATA[" . $brandName . "]]></g:brand>\n";

            if ($variant->sku) {
                $xml .= "      <g:mpn>" . $this->xmlEscape($variant->sku) . "</g:mpn>\n";
            }

            $xml .= "    </item>\n";
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

    private function xmlEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
