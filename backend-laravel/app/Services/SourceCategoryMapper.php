<?php

namespace App\Services;

use App\Models\ProductCategory;
use Illuminate\Support\Str;
use RuntimeException;

class SourceCategoryMapper
{
    /** @var array<int, ProductCategory> */
    private array $categoryCache = [];

    /**
     * @return array{source:string, raw_category:string, category_id:int, category_name:string, matched_by:string}
     */
    public function resolve(string $sourceName, ?string $rawCategory, ?string $rawParent = null): array
    {
        $source = $this->canonicalSourceName($sourceName);
        $policy = config("source_category_mappings.{$source}");

        if (!is_array($policy) || empty($policy['fallback_category_id'])) {
            throw new RuntimeException(
                "{$sourceName} kaynagi icin config/source_category_mappings.php politikasi eksik. Import guvenlik nedeniyle durduruldu."
            );
        }

        $mappings = is_array($policy['mappings'] ?? null) ? $policy['mappings'] : [];
        $keys = array_values(array_unique(array_filter([
            $this->normalize($rawCategory),
            $this->normalize($rawParent),
            $this->normalize($this->breadcrumbLeaf($rawCategory)),
        ])));

        $categoryId = null;
        $matchedBy = 'fallback';
        foreach ($keys as $key) {
            if (isset($mappings[$key])) {
                $categoryId = (int) $mappings[$key];
                $matchedBy = "mapping:{$key}";
                break;
            }
        }
        $categoryId ??= (int) $policy['fallback_category_id'];

        $category = $this->categoryCache[$categoryId] ??= ProductCategory::query()->find($categoryId);
        if (!$category || !(bool) $category->status) {
            throw new RuntimeException(
                "{$source} kategori politikasi gecersiz/pasif category_id={$categoryId} hedefine bagli. Import durduruldu."
            );
        }

        return [
            'source' => $source,
            'raw_category' => trim((string) $rawCategory),
            'category_id' => $categoryId,
            'category_name' => (string) $category->category_name,
            'matched_by' => $matchedBy,
        ];
    }

    public function canonicalSourceName(string $sourceName): string
    {
        $normalized = Str::of($sourceName)
            ->lower()
            ->replace(['_products', '-products'], '')
            ->slug('_')
            ->toString();
        $source = ScraperSourceRegistry::find($normalized);

        if (!$source) {
            throw new RuntimeException(
                "{$sourceName} ScraperSourceRegistry icinde kayitli degil. Kategori politikasi olmadan import yapilamaz."
            );
        }

        return $source['name'];
    }

    private function normalize(?string $value): ?string
    {
        $value = trim(html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return $value === '' ? null : Str::slug($value);
    }

    private function breadcrumbLeaf(?string $value): ?string
    {
        $decoded = html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $parts = preg_split('/\s*(?:>|»|›)\s*/u', $decoded) ?: [];

        return $parts ? trim((string) end($parts)) : null;
    }
}
