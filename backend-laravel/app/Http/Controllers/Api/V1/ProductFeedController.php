<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class ProductFeedController extends Controller
{
    /**
     * Cimri XML Product Feed
     * URL: /feeds/cimri.xml
     *
     * Tum aktif urunleri Cimri formatinda XML olarak doner.
     * 6 saat cache'lenir — cache temizlemek icin: php artisan cache:clear
     */
    public function cimri(): Response
    {
        $xml = Cache::remember('cimri_product_feed', 6 * 60 * 60, function () {
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
                'store',
            ])
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<products>' . "\n";

        foreach ($products as $product) {
            // Fiyatli variant olmayan urunleri atla
            $variant = $product->variants->first();
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

            // Marka
            $brandName = $product->brand?->brand_name ?? '';

            // Fiyat
            $price = number_format((float) $variant->price, 2, '.', '');
            $specialPrice = ($variant->special_price && (float) $variant->special_price > 0)
                ? number_format((float) $variant->special_price, 2, '.', '')
                : null;

            // Stok durumu
            $stockStatus = ($variant->stock_quantity > 0) ? 'inStock' : 'outOfStock';

            // SKU / Barkod
            $sku = $variant->sku ?: ('SP-' . $product->id);

            // Kargo
            $freeShipping = $product->free_shipping ? 'true' : 'false';

            $xml .= "  <product>\n";
            $xml .= "    <merchantItemId>" . $this->xmlEscape($sku) . "</merchantItemId>\n";
            $xml .= "    <itemTitle><![CDATA[" . $product->name . "]]></itemTitle>\n";
            $xml .= "    <itemUrl><![CDATA[" . $productUrl . "]]></itemUrl>\n";
            $xml .= "    <imageUrl><![CDATA[" . $imageUrl . "]]></imageUrl>\n";

            // Galeri gorselleri
            if ($product->gallery_images) {
                $galleryIds = explode(',', $product->gallery_images);
                foreach (array_slice($galleryIds, 0, 5) as $imgId) {
                    $galleryUrl = com_option_get_id_wise_url(trim($imgId));
                    if ($galleryUrl) {
                        $xml .= "    <additionalImageUrl><![CDATA[" . $galleryUrl . "]]></additionalImageUrl>\n";
                    }
                }
            }

            // Fiyat — indirimli varsa onu goster, orijinali ayri yaz
            if ($specialPrice && $specialPrice < $price) {
                $xml .= "    <price>" . $specialPrice . "</price>\n";
                $xml .= "    <oldPrice>" . $price . "</oldPrice>\n";
            } else {
                $xml .= "    <price>" . $price . "</price>\n";
            }

            $xml .= "    <currencyId>TRY</currencyId>\n";
            $xml .= "    <categoryName><![CDATA[" . $categoryPath . "]]></categoryName>\n";

            if ($brandName) {
                $xml .= "    <brand><![CDATA[" . $brandName . "]]></brand>\n";
            }

            $xml .= "    <stockStatus>" . $stockStatus . "</stockStatus>\n";

            if ($variant->sku) {
                $xml .= "    <barcode>" . $this->xmlEscape($variant->sku) . "</barcode>\n";
            }

            $xml .= "    <freeShipping>" . $freeShipping . "</freeShipping>\n";

            // Magaza bilgisi
            if ($product->store) {
                $xml .= "    <merchantName><![CDATA[" . $product->store->name . "]]></merchantName>\n";
            }

            $xml .= "  </product>\n";
        }

        $xml .= '</products>';

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
