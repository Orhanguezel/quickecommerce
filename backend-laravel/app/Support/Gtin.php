<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Kaynak eslemelerindeki (product_source_mappings.source_variant_barcode)
 * barkodlari GTIN olarak yayinlar. Yalniz 8/12/13/14 haneli ve GS1 kontrol
 * hanesi tutan degerler gecer; yanlis GTIN, hic GTIN vermemekten kotudur.
 */
class Gtin
{
    public static function isValid(?string $value): bool
    {
        $value = trim((string) $value);
        if (! preg_match('/^(\d{8}|\d{12,14})$/', $value) || ltrim($value, '0') === '') {
            return false;
        }

        $digits = array_reverse(str_split($value));
        $check = (int) array_shift($digits);
        $sum = 0;
        foreach ($digits as $i => $digit) {
            $sum += (int) $digit * ($i % 2 === 0 ? 3 : 1);
        }

        return (10 - $sum % 10) % 10 === $check;
    }

    /**
     * @param  array<int>  $productIds
     * @return array<int, array<int|string, string>> product_id => [variant_id|'*' => gtin]
     */
    public static function forProducts(array $productIds): array
    {
        if ($productIds === []) {
            return [];
        }

        $map = [];
        DB::table('product_source_mappings')
            ->whereIn('product_id', $productIds)
            ->whereNotNull('source_variant_barcode')
            ->orderByDesc('last_sync_at')
            ->get(['product_id', 'product_variant_id', 'source_variant_barcode'])
            ->each(function ($row) use (&$map): void {
                $gtin = trim((string) $row->source_variant_barcode);
                if (! self::isValid($gtin)) {
                    return;
                }
                $map[$row->product_id][$row->product_variant_id ?: '*'] ??= $gtin;
                $map[$row->product_id]['*'] ??= $gtin;
            });

        return $map;
    }

    /** Varyanta ozel barkod; varyant eslemesi yoksa urunun tek barkodu. */
    public static function pick(array $map, int $productId, ?int $variantId): ?string
    {
        $product = $map[$productId] ?? [];
        if ($variantId && isset($product[$variantId])) {
            return $product[$variantId];
        }
        // Birden fazla farkli barkod varsa varyantsiz secim tahmin olur.
        $distinct = array_unique(array_values($product));

        return count($distinct) === 1 ? $distinct[0] : null;
    }
}
