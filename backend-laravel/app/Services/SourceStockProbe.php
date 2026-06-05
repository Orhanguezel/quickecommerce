<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Tek bir kaynak URL'yi yerel scraper service'e sorar ve stok durumunu donen
 * sinyal kanonik kelimelerle yorumlar. Boolean stok veren tedarikciler icin
 * "out-of-stock" sinyalleri agirlikli — pozitif "stokta" varsayilan kabul.
 *
 * Sonuc:
 *   - inStock = true  → urun stokta (veya stokta gibi gozukuyor)
 *   - inStock = false → kesin "stokta yok" sinyali alindi
 *   - inStock = null  → scraper hata verdi / yorumlanamadi (admin manuel)
 *
 * Pattern listesi `ideasoft_scraper.py` / `shopify_scraper.py` ile birebir
 * ayni; tek kaynaktan beslenir.
 */
class SourceStockProbe
{
    /** Kanonik out-of-stock kelimeler (gorsel sayfa text'i icinde) */
    private const OUT_OF_STOCK_TEXT_TERMS = [
        'stokta yok',
        'stok yok',
        'tükendi',
        'tukendi',
        'tukenmiştir',
        'tükenmiştir',
        'out of stock',
        'sold out',
        'gelince haber ver',
        'sezon dışı',
        'sezon disi',
    ];

    /** Kanonik in-stock kelimeler (pozitif sinyal) */
    private const IN_STOCK_TEXT_TERMS = [
        'sepete ekle',
        'sepete at',
        'hemen satin al',
        'hemen satın al',
        'add to cart',
    ];

    /** Schema.org availability degerleri (lowercase, normalize) */
    private const OUT_OF_STOCK_JSONLD = ['outofstock', 'soldout', 'discontinued'];
    private const IN_STOCK_JSONLD = ['instock', 'preorder', 'backorder', 'limitedavailability'];

    public function probe(string $sourceUrl): ProbeResult
    {
        $apiKey = (string) config('services.local_scraper.api_key', env('LOCAL_SCRAPER_API_KEY', ''));
        $base = rtrim((string) config('services.local_scraper.url', env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200')), '/');

        try {
            $started = microtime(true);
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post("{$base}/api/v1/scrape", [
                'url' => $sourceUrl,
                'mode' => 'fast',
                'return_html' => true,
                'return_text' => true,
            ]);
            $durationMs = (int) round((microtime(true) - $started) * 1000);

            if (!$response->successful()) {
                return new ProbeResult(null, 'http_' . $response->status(), $durationMs, "Scraper HTTP {$response->status()}");
            }

            $body = $response->json();
            if (empty($body['success'])) {
                $err = (string) ($body['error'] ?? 'unknown');
                return new ProbeResult(null, 'scraper_failure', $durationMs, $err);
            }

            $html = (string) ($body['html'] ?? '');
            $text = strtolower((string) ($body['text'] ?? ''));

            // 1. JSON-LD availability (en saglam)
            $jsonldSignal = $this->detectFromJsonLd($body['data']['structured_data'] ?? []);
            if ($jsonldSignal !== null) {
                return new ProbeResult($jsonldSignal['in_stock'], $jsonldSignal['signal'], $durationMs);
            }

            // 2. HTML attribute (button value, data-out-of-stock vb.)
            $htmlSignal = $this->detectFromHtmlAttributes($html);
            if ($htmlSignal !== null) {
                return new ProbeResult($htmlSignal['in_stock'], $htmlSignal['signal'], $durationMs);
            }

            // 3. Gorsel text (en zayif ama yaygin)
            foreach (self::OUT_OF_STOCK_TEXT_TERMS as $term) {
                if (str_contains($text, $term)) {
                    return new ProbeResult(false, 'text:' . $term, $durationMs);
                }
            }
            foreach (self::IN_STOCK_TEXT_TERMS as $term) {
                if (str_contains($text, $term)) {
                    return new ProbeResult(true, 'text:' . $term, $durationMs);
                }
            }

            // Hicbir sinyal yakalanmadi — belirsiz (manuel kontrol)
            return new ProbeResult(null, 'no_signal', $durationMs);
        } catch (\Throwable $e) {
            Log::warning('SourceStockProbe exception', ['url' => $sourceUrl, 'error' => $e->getMessage()]);
            return new ProbeResult(null, 'exception', 0, $e->getMessage());
        }
    }

    /** @param array<int, array<string, mixed>> $structuredData */
    private function detectFromJsonLd(array $structuredData): ?array
    {
        foreach ($structuredData as $item) {
            $offers = $item['offers'] ?? null;
            if (!is_array($offers)) continue;
            // offers tek obje veya array olabilir
            $list = isset($offers[0]) ? $offers : [$offers];
            foreach ($list as $offer) {
                $avail = is_array($offer) ? (string)($offer['availability'] ?? '') : '';
                if ($avail === '') continue;
                $norm = strtolower(str_replace(['/', '_', 'http:', 'https:', 'schema.org'], '', $avail));
                foreach (self::OUT_OF_STOCK_JSONLD as $key) {
                    if (str_contains($norm, $key)) return ['in_stock' => false, 'signal' => 'jsonld:' . $key];
                }
                foreach (self::IN_STOCK_JSONLD as $key) {
                    if (str_contains($norm, $key)) return ['in_stock' => true, 'signal' => 'jsonld:' . $key];
                }
            }
        }
        return null;
    }

    private function detectFromHtmlAttributes(string $html): ?array
    {
        // OpenCart/IdeaSoft yaygin: button value="SEPETE EKLE" id="button-cart" → stokta
        if (preg_match('/<button[^>]*disabled[^>]*(?:id="button-cart"|class="[^"]*cart)/i', $html)) {
            return ['in_stock' => false, 'signal' => 'html:button_disabled'];
        }
        if (preg_match('/value="(?:SEPETE EKLE|HEMEN SATIN AL)"/i', $html)) {
            return ['in_stock' => true, 'signal' => 'html:add_to_cart_button'];
        }
        if (preg_match('/value="(?:GELİNCE HABER VER|GELINCE HABER VER)"/i', $html)) {
            return ['in_stock' => false, 'signal' => 'html:gelince_haber_ver'];
        }
        return null;
    }
}
