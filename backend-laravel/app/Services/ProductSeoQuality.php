<?php

namespace App\Services;

use Illuminate\Support\Str;

class ProductSeoQuality
{
    private const TOKEN_STOP_WORDS = [
        've', 'ile', 'icin', 'bir', 'urun', 'urunu', 'gr', 'ml', 'kg', 'lt',
        'cm', 'mm', 'adet', 'set', 'the', 'for', 'with',
    ];

    /**
     * Validate one scraper row before it can create a public product.
     *
     * @return array<int, array{severity: string, code: string, message: string}>
     */
    public function validateScrapedProduct(array $row): array
    {
        $issues = [];
        $name = trim((string) ($row['name'] ?? ''));
        $slug = trim((string) ($row['slug'] ?? ''));
        $description = $this->plainText(
            (string) ($row['description_html'] ?? $row['description_text'] ?? $row['description'] ?? '')
        );
        $images = array_filter((array) ($row['all_image_urls'] ?? $row['images'] ?? []));
        $thumbnail = trim((string) ($row['thumbnail_url'] ?? $row['image_url'] ?? $row['image'] ?? ''));

        if ($name === '') {
            $issues[] = $this->issue('error', 'missing_name', 'Ürün adı boş.');
        }
        if ($slug === '') {
            $issues[] = $this->issue('warning', 'missing_slug', 'Slug boş; ürün adından üretilecek.');
        } elseif ($name !== '' && !$this->slugMatchesName($name, $slug)) {
            $issues[] = $this->issue(
                'error',
                'slug_name_mismatch',
                "Slug ürün adıyla uyuşmuyor: {$slug}"
            );
        }
        if ($description === '') {
            $issues[] = $this->issue('warning', 'missing_description', 'Ürün açıklaması boş.');
        } elseif (mb_strlen($description) < 80) {
            $issues[] = $this->issue('warning', 'short_description', 'Ürün açıklaması 80 karakterden kısa.');
        }
        if ($thumbnail === '' && $images === [] && empty($row['downloaded_images'])) {
            $issues[] = $this->issue('error', 'missing_image', 'Ana görsel veya galeri görseli yok.');
        }

        $prices = $this->extractPrices($row);
        if ($prices === [] || max($prices) <= 0) {
            $issues[] = $this->issue('error', 'invalid_price', 'Pozitif ürün/varyant fiyatı yok.');
        }

        $sourceUrl = trim((string) ($row['url'] ?? $row['product_url'] ?? ''));
        if ($sourceUrl !== '' && filter_var($sourceUrl, FILTER_VALIDATE_URL) === false) {
            $issues[] = $this->issue('error', 'invalid_source_url', 'Kaynak ürün URL’si geçersiz.');
        }

        return $issues;
    }

    public function slugMatchesName(string $name, string $slug): bool
    {
        $nameTokens = $this->tokens($name);
        $slugTokens = $this->tokens($slug);

        if ($nameTokens === [] || $slugTokens === []) {
            return false;
        }

        // Model/ürün kodları tek başına anlamlıdır; en az bir ortak, ayırt edici
        // token çapraz eşleşmiş scraper satırlarını güvenilir biçimde yakalar.
        return array_intersect($nameTokens, $slugTokens) !== [];
    }

    public function plainText(?string $html): string
    {
        $decoded = html_entity_decode((string) $html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', strip_tags($decoded)) ?? '';

        return trim($text);
    }

    /**
     * @return string[]
     */
    private function tokens(string $value): array
    {
        $folded = Str::ascii(mb_strtolower($value, 'UTF-8'));
        preg_match_all('/[a-z0-9]+/', $folded, $matches);

        return array_values(array_unique(array_filter(
            $matches[0] ?? [],
            static fn (string $token) => strlen($token) >= 3
                && !in_array($token, self::TOKEN_STOP_WORDS, true)
        )));
    }

    /**
     * @return float[]
     */
    private function extractPrices(array $row): array
    {
        $prices = [];
        foreach (['original_price', 'discounted_price', 'price', 'special_price'] as $key) {
            if (isset($row[$key]) && is_numeric($row[$key])) {
                $prices[] = (float) $row[$key];
            }
        }
        foreach ((array) ($row['variants'] ?? []) as $variant) {
            foreach (['price', 'compare_at_price', 'special_price'] as $key) {
                if (isset($variant[$key]) && is_numeric($variant[$key])) {
                    $prices[] = (float) $variant[$key];
                }
            }
        }

        return $prices;
    }

    /**
     * @return array{severity: string, code: string, message: string}
     */
    private function issue(string $severity, string $code, string $message): array
    {
        return compact('severity', 'code', 'message');
    }
}
