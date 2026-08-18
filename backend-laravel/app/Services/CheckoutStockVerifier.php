<?php

namespace App\Services;

use App\Models\ProductSourceMapping;

/**
 * Checkout-oncesi canli stok dogrulama. Sepet/siparis satirlarini tedarikci
 * kaynaginda canli kontrol eder. Kaynak stok sinyali kesin degilse urunu
 * satmaz: stok iadesi, gecici satis kaybindan daha maliyetlidir.
 *
 * @see SourceStockProbe::probeMany()
 */
class CheckoutStockVerifier
{
    public function __construct(private readonly SourceStockProbe $probe) {}

    /**
     * @param array<int, array{product_id?:int|null, variant_id?:int|null, name?:string|null}> $lines
     * @return array{ok:bool, out_of_stock:list<array<string,mixed>>, checked:int, uncertain:int}
     */
    public function verify(array $lines): array
    {
        // Satir -> kaynak URL eslemesi (varyant once, yoksa urun bazli mapping).
        $lineUrls = [];
        $lineMappings = [];
        $urls = [];
        $variantIds = array_values(array_unique(array_filter(array_map(
            fn (array $line) => isset($line['variant_id']) ? (int) $line['variant_id'] : null,
            $lines
        ))));
        $productIds = array_values(array_unique(array_filter(array_map(
            fn (array $line) => isset($line['product_id']) ? (int) $line['product_id'] : null,
            $lines
        ))));
        $mappings = ProductSourceMapping::query()
            ->whereIn('product_variant_id', $variantIds ?: [0])
            ->orWhereIn('product_id', $productIds ?: [0])
            ->get();
        $byVariant = $mappings->keyBy('product_variant_id');
        $byProduct = $mappings->keyBy('product_id');

        foreach ($lines as $i => $line) {
            $vid = isset($line['variant_id']) ? (int) $line['variant_id'] : null;
            $pid = isset($line['product_id']) ? (int) $line['product_id'] : null;
            $map = ($vid ? $byVariant->get($vid) : null) ?: ($pid ? $byProduct->get($pid) : null);

            if ($map) {
                $lineMappings[$i] = $map;
            }

            $url = $map && $map->source_product_url ? trim((string) $map->source_product_url) : null;
            if ($url !== null && $url !== '') {
                $lineUrls[$i] = $url;
                $urls[] = $url;
            }
        }

        // Mapping'siz (kendi/manuel urun) → kontrol gerekmez, DB stogu yeterli.
        if (empty($lineMappings)) {
            return ['ok' => true, 'out_of_stock' => [], 'checked' => 0, 'uncertain' => 0];
        }

        $results = empty($urls) ? [] : $this->probe->probeMany(array_values(array_unique($urls)));

        $outOfStock = [];
        $uncertain = 0;
        foreach ($lines as $i => $line) {
            $mapping = $lineMappings[$i] ?? null;
            if (!$mapping) {
                continue;
            }
            $url = $lineUrls[$i] ?? null;
            if ($url === null) {
                $uncertain++;
                $outOfStock[] = $this->blockedLine($line, 'source_url_missing');
                continue;
            }
            $pr = $results[$url] ?? null;
            if ($pr === null) {
                $uncertain++;
                $outOfStock[] = $this->blockedLine($line, 'verification_unavailable');
                continue;
            }

            if ($pr->inStock === false) {
                $outOfStock[] = $this->blockedLine($line, $pr->signal);
            } elseif ($pr->inStock === null) {
                $uncertain++;
                $outOfStock[] = $this->blockedLine($line, $pr->signal ?: 'verification_uncertain');
            }
        }

        return [
            'ok' => empty($outOfStock),
            'out_of_stock' => $outOfStock,
            'checked' => count($lineUrls),
            'uncertain' => $uncertain,
        ];
    }

    /** @param array<string,mixed> $line */
    private function blockedLine(array $line, string $signal): array
    {
        return [
            'product_id' => $line['product_id'] ?? null,
            'variant_id' => $line['variant_id'] ?? null,
            'name' => $line['name'] ?? null,
            'signal' => $signal,
        ];
    }
}
