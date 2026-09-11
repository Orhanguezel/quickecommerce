<?php

namespace App\Services;

use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
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

    /** Checkout senkron probe timeout (sn) — tek tek 30s yerine kisa. */
    private const CHECKOUT_TIMEOUT_SEC = 8;

    /**
     * Cloudflare challenge'i cozen ikinci gecisin suresi.
     *
     * Scraper servisinin `solve_cloudflare` secenegi olcumde ~28 sn suruyor ve
     * kendi `timeout` alani EN FAZLA 120 kabul ediyor (openapi: maximum 120).
     * Laravel tarafi bundan biraz uzun olmali, yoksa scraper isini bitirmeden
     * baglanti kopar ve urun bosuna "dogrulanamadi" sayilir.
     */
    private const CF_SOLVE_TIMEOUT_SEC = 35;

    /** Scraper servisinin kabul ettigi ust sinir (openapi: maximum 120). */
    private const SCRAPER_MAX_TIMEOUT_SEC = 120;
    /** Kesin sonuc cache (sn) */
    private const CACHE_TTL_OK_SEC = 600;
    /** Belirsiz sonuc cache (sn) — kisa, yakinda tekrar denenir */
    private const CACHE_TTL_UNKNOWN_SEC = 120;

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

            $result = $this->interpretBody($response->json(), $durationMs);

            // Hizli gecis Cloudflare duvarina takildiysa, challenge'i cozen
            // pahali gecisi dene. Aksi halde CF arkasindaki her kaynak
            // (eprotein gibi) kalici olarak "dogrulanamadi" sayilir ve
            // satilabilir urunler odeme adiminda bloke olur.
            if ($result->signal === 'cf_challenge') {
                return $this->probeSolvingCloudflare($sourceUrl);
            }

            return $result;
        } catch (\Throwable $e) {
            Log::warning('SourceStockProbe exception', ['url' => $sourceUrl, 'error' => $e->getMessage()]);
            return new ProbeResult(null, 'exception', 0, $e->getMessage());
        }
    }

    /**
     * Cloudflare challenge'ini cozerek tekrar dener (yavas, ~28 sn).
     *
     * DIKKAT — bu uc ayar BIRLIKTE dogru olmali, biri eksikse CF asilmaz:
     *   mode = "stealthy"  (servis yalnizca fast|stealthy|dynamic kabul eder;
     *                       "stealth" yazmak 422 doner)
     *   options.solve_cloudflare = true   (ust seviyede DEGIL, options icinde)
     *   options.timeout <= 120            (buyugu 422 doner)
     */
    private function probeSolvingCloudflare(string $sourceUrl): ProbeResult
    {
        $apiKey = (string) config('services.local_scraper.api_key', env('LOCAL_SCRAPER_API_KEY', ''));
        $base = rtrim((string) config('services.local_scraper.url', env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200')), '/');

        try {
            $started = microtime(true);
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(self::CF_SOLVE_TIMEOUT_SEC)
                ->post("{$base}/api/v1/scrape", $this->cloudflareRequestBody($sourceUrl));
            $durationMs = (int) round((microtime(true) - $started) * 1000);

            if (!$response->successful()) {
                return new ProbeResult(null, 'http_' . $response->status(), $durationMs, "Scraper HTTP {$response->status()}");
            }

            return $this->interpretBody($response->json(), $durationMs);
        } catch (\Throwable $e) {
            Log::warning('SourceStockProbe cloudflare exception', ['url' => $sourceUrl, 'error' => $e->getMessage()]);
            return new ProbeResult(null, 'cf_solve_failed', 0, $e->getMessage());
        }
    }

    /** @return array<string, mixed> */
    private function cloudflareRequestBody(string $url): array
    {
        return [
            'url' => $url,
            'mode' => 'stealthy',
            'options' => [
                'solve_cloudflare' => true,
                'timeout' => self::SCRAPER_MAX_TIMEOUT_SEC,
            ],
            'return_html' => true,
            'return_text' => true,
        ];
    }

    /**
     * Birden fazla URL'yi PARALEL prober (checkout-oncesi senkron kontrol).
     * Redis cache: kesin sonuc 10dk, belirsiz 2dk — checkout hizli, tedarikci
     * yorulmaz, ayni urunu alan cok musteri tek probe.
     *
     * @param array<int, string> $urls
     * @return array<string, ProbeResult>  url => sonuc
     */
    public function probeMany(array $urls): array
    {
        $urls = array_values(array_unique(array_filter(array_map(
            fn ($u) => trim((string) $u),
            $urls
        ))));
        if (empty($urls)) {
            return [];
        }

        $results = [];
        $toFetch = [];
        foreach ($urls as $url) {
            $cached = Cache::get($this->cacheKey($url));
            if ($cached instanceof ProbeResult) {
                $results[$url] = $cached;
            } else {
                $toFetch[] = $url;
            }
        }

        if (!empty($toFetch)) {
            $apiKey = (string) config('services.local_scraper.api_key', env('LOCAL_SCRAPER_API_KEY', ''));
            $base = rtrim((string) config('services.local_scraper.url', env('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200')), '/');

            try {
                $responses = Http::pool(fn (Pool $pool) => array_map(
                    fn ($url) => $pool->as($url)
                        ->withHeaders([
                            'Authorization' => 'Bearer ' . $apiKey,
                            'Content-Type' => 'application/json',
                        ])
                        ->timeout(self::CHECKOUT_TIMEOUT_SEC)
                        ->post("{$base}/api/v1/scrape", [
                            'url' => $url,
                            'mode' => 'fast',
                            'return_html' => true,
                            'return_text' => true,
                        ]),
                    $toFetch
                ));
            } catch (\Throwable $e) {
                Log::warning('SourceStockProbe pool exception', ['error' => $e->getMessage()]);
                $responses = [];
            }

            $needsCloudflare = [];
            foreach ($toFetch as $url) {
                $resp = $responses[$url] ?? null;
                $pr = $this->interpretResponse($resp);

                // Cloudflare duvarina takilanlari simdi cachelemE — ikinci
                // gecisten sonraki GERCEK sonuc cachelenmeli, yoksa challenge
                // sayfasi 2 dakika boyunca "dogrulanamadi" olarak yapisir.
                if ($pr->signal === 'cf_challenge') {
                    $needsCloudflare[] = $url;
                    continue;
                }

                $results[$url] = $pr;
                // Sadece kesin sonuc uzun, belirsiz kisa cachelenir.
                Cache::put(
                    $this->cacheKey($url),
                    $pr,
                    $pr->inStock === null ? self::CACHE_TTL_UNKNOWN_SEC : self::CACHE_TTL_OK_SEC
                );
            }

            // IKINCI GECIS — yalnizca CF arkasindaki adresler icin.
            // Pahali (~28 sn), o yuzden hizli gecise takilmayan adresler bu
            // beklemeyi hic yasamaz. Sonuc cachelendigi icin bedeli yalnizca
            // ilk musteri oder.
            if (!empty($needsCloudflare)) {
                $cfResponses = [];
                try {
                    $cfResponses = Http::pool(fn (Pool $pool) => array_map(
                        fn ($url) => $pool->as($url)
                            ->withHeaders([
                                'Authorization' => 'Bearer ' . $apiKey,
                                'Content-Type' => 'application/json',
                            ])
                            ->timeout(self::CF_SOLVE_TIMEOUT_SEC)
                            ->post("{$base}/api/v1/scrape", $this->cloudflareRequestBody($url)),
                        $needsCloudflare
                    ));
                } catch (\Throwable $e) {
                    Log::warning('SourceStockProbe cloudflare pool exception', ['error' => $e->getMessage()]);
                }

                foreach ($needsCloudflare as $url) {
                    $pr = $this->interpretResponse($cfResponses[$url] ?? null);
                    $results[$url] = $pr;
                    Cache::put(
                        $this->cacheKey($url),
                        $pr,
                        $pr->inStock === null ? self::CACHE_TTL_UNKNOWN_SEC : self::CACHE_TTL_OK_SEC
                    );
                }
            }
        }

        return $results;
    }

    /** Http::pool sonucunu (Response veya hata) ProbeResult'a cevirir. */
    private function interpretResponse(mixed $response): ProbeResult
    {
        if (!$response instanceof \Illuminate\Http\Client\Response) {
            // ConnectionException / TransferException / null → belirsiz (fail-open)
            return new ProbeResult(null, 'pool_error', 0,
                $response instanceof \Throwable ? $response->getMessage() : 'no_response');
        }
        if (!$response->successful()) {
            return new ProbeResult(null, 'http_' . $response->status(), 0, "Scraper HTTP {$response->status()}");
        }
        return $this->interpretBody($response->json(), 0);
    }

    /** Scraper service yanit govdesinden stok sinyalini cikarir. */
    private function interpretBody(mixed $body, int $durationMs): ProbeResult
    {
        if (!is_array($body) || empty($body['success'])) {
            $err = is_array($body) ? (string) ($body['error'] ?? 'unknown') : 'invalid_body';
            return new ProbeResult(null, 'scraper_failure', $durationMs, $err);
        }

        $html = (string) ($body['html'] ?? '');
        $text = strtolower((string) ($body['text'] ?? ''));

        // 0. KAYNAK SITENIN kendi HTTP durumu.
        //
        // Scraper servisi challenge sayfasini basariyla "cekmis" sayip bize
        // success=true + HTTP 200 doner; gercek durum govdenin ICINDEKI
        // status_code alanindadir. Bu kontrol olmadan bir Cloudflare 403
        // sayfasi asagidaki desen aramalarina dusuyor, hicbir sey bulamiyor ve
        // "no_signal" olarak donuyordu -- yani "sitede stok sinyali yok" gibi
        // gorunuyor, oysa sayfaya hic ULASILAMAMISTI. Teshis yanlis yone
        // gidiyor, urun de bosuna satilamaz oluyordu.
        $sourceStatus = (int) ($body['status_code'] ?? 0);
        if ($this->looksLikeCloudflareChallenge($sourceStatus, $body, $text)) {
            return new ProbeResult(null, 'cf_challenge', $durationMs, 'Cloudflare challenge');
        }
        if ($sourceStatus >= 400) {
            return new ProbeResult(null, 'source_http_' . $sourceStatus, $durationMs, "Kaynak site HTTP {$sourceStatus}");
        }

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
    }

    /**
     * Yanit, kaynak siteye degil Cloudflare challenge sayfasina mi ait?
     *
     * Yalnizca 403'e bakmak yetmez: challenge bazen 503 ya da 200 ile de
     * gelebiliyor. Sayfanin kendisi ("Just a moment...", JS/cerez uyarisi)
     * ayirt edici isaret.
     */
    private function looksLikeCloudflareChallenge(int $status, array $body, string $lowerText): bool
    {
        $title = strtolower((string) ($body['data']['title'] ?? ''));

        $challengeMarkers = str_contains($title, 'just a moment')
            || str_contains($lowerText, 'just a moment')
            || str_contains($lowerText, 'enable javascript and cookies')
            || str_contains($lowerText, 'checking your browser');

        if ($challengeMarkers) {
            return true;
        }

        // Govde bos ve durum engelleme kodu ise de challenge varsay.
        return in_array($status, [403, 503], true) && trim($lowerText) === '';
    }

    private function cacheKey(string $url): string
    {
        return 'stockprobe:' . sha1($url);
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
