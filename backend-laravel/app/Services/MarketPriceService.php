<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductMarketPriceObservation;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class MarketPriceService
{
    public function __construct(private readonly CommerceReadinessService $readinessService) {}

    public function recordObservation(
        Product $product,
        string $sourceName,
        float $price,
        CarbonInterface $observedAt,
        ?string $sourceUrl = null,
        string $currencyCode = 'TRY',
        bool $isAvailable = true,
        ?array $metadata = null,
    ): ProductMarketPriceObservation {
        $sourceName = trim($sourceName) ?: 'manual_csv';
        $sourceUrl = filled($sourceUrl) ? trim((string) $sourceUrl) : null;
        $currencyCode = strtoupper(trim($currencyCode)) ?: 'TRY';
        $sourceKey = hash('sha256', mb_strtolower($sourceName).'|'.($sourceUrl ?? ''));
        $observationKey = hash('sha256', implode('|', [
            $product->getKey(),
            $sourceKey,
            number_format($price, 4, '.', ''),
            $currencyCode,
            $isAvailable ? '1' : '0',
            $observedAt->copy()->utc()->format('Y-m-d\TH:i:s.u\Z'),
        ]));

        return ProductMarketPriceObservation::query()->firstOrCreate(
            ['observation_key' => $observationKey],
            [
                'product_id' => $product->getKey(),
                'source_name' => $sourceName,
                'source_key' => $sourceKey,
                'source_url' => $sourceUrl,
                'price' => $price,
                'currency_code' => $currencyCode,
                'is_available' => $isAvailable,
                'observed_at' => $observedAt,
                'metadata' => $metadata,
            ]
        );
    }

    public function refreshProductAggregate(Product $product): array
    {
        $freshAfter = now()->subHours((int) config('commerce.market_price_max_age_hours', 48));
        $latestBySource = ProductMarketPriceObservation::query()
            ->where('product_id', $product->getKey())
            ->where('currency_code', 'TRY')
            ->where('is_available', true)
            ->where('price', '>', 0)
            ->where('observed_at', '>=', $freshAfter)
            ->orderByDesc('observed_at')
            ->get()
            ->unique('source_key')
            ->values();

        $summary = $this->summarizePrices($latestBySource->pluck('price')->all());
        $checkedAt = $latestBySource->max('observed_at');

        $product->forceFill([
            'market_min_price' => $summary['minimum'],
            'market_median_price' => $summary['median'],
            'market_price_source_count' => $summary['source_count'],
            'market_price_checked_at' => $checkedAt,
        ])->saveQuietly();

        $this->readinessService->refreshProduct($product->fresh(['variants', 'store']));

        return $summary + ['checked_at' => $checkedAt];
    }

    public function summarizePrices(array|Collection $prices): array
    {
        $values = collect($prices)
            ->map(fn ($price) => (float) $price)
            ->filter(fn (float $price) => $price > 0)
            ->sort()
            ->values();

        $count = $values->count();
        if ($count === 0) {
            return ['minimum' => null, 'median' => null, 'source_count' => 0];
        }

        $middle = intdiv($count, 2);
        $median = $count % 2 === 1
            ? $values[$middle]
            : ($values[$middle - 1] + $values[$middle]) / 2;

        return [
            'minimum' => round((float) $values->first(), 4),
            'median' => round((float) $median, 4),
            'source_count' => $count,
        ];
    }
}
