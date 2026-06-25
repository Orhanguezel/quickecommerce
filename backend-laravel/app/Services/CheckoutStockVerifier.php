<?php

namespace App\Services;

use App\Models\ProductSourceMapping;

/**
 * Checkout-oncesi canli stok dogrulama. Sepet/siparis satirlarini tedarikci
 * kaynaginda canli kontrol eder; SADECE KESIN tukenmis (inStock === false)
 * satirlari "out_of_stock" doner.
 *
 * FAIL-OPEN: probe belirsiz (CF / timeout / no_signal => null) ise satir
 * engellenmez — overselling'i 30 dk'lik PostOrderStockCheckJob yakalar.
 * Probe kirilganligi satis kaybettirmemeli.
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
        $urls = [];
        foreach ($lines as $i => $line) {
            $vid = $line['variant_id'] ?? null;
            $pid = $line['product_id'] ?? null;

            $map = null;
            if ($vid) {
                $map = ProductSourceMapping::where('product_variant_id', $vid)->first();
            }
            if (!$map && $pid) {
                $map = ProductSourceMapping::where('product_id', $pid)->first();
            }

            $url = $map && $map->source_product_url ? trim((string) $map->source_product_url) : null;
            if ($url !== null && $url !== '') {
                $lineUrls[$i] = $url;
                $urls[] = $url;
            }
        }

        // Mapping'siz (kendi/manuel urun) → kontrol gerekmez, DB stogu yeterli.
        if (empty($urls)) {
            return ['ok' => true, 'out_of_stock' => [], 'checked' => 0, 'uncertain' => 0];
        }

        $results = $this->probe->probeMany($urls);

        $outOfStock = [];
        $uncertain = 0;
        foreach ($lines as $i => $line) {
            $url = $lineUrls[$i] ?? null;
            if ($url === null) {
                continue;
            }
            $pr = $results[$url] ?? null;
            if ($pr === null) {
                continue;
            }

            if ($pr->inStock === false) {
                $outOfStock[] = [
                    'product_id' => $line['product_id'] ?? null,
                    'variant_id' => $line['variant_id'] ?? null,
                    'name' => $line['name'] ?? null,
                    'signal' => $pr->signal,
                ];
            } elseif ($pr->inStock === null) {
                $uncertain++; // fail-open: engellenmez
            }
        }

        return [
            'ok' => empty($outOfStock),
            'out_of_stock' => $outOfStock,
            'checked' => count($lineUrls),
            'uncertain' => $uncertain,
        ];
    }
}
