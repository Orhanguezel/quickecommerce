<?php

namespace Tests\Unit;

use App\Services\CommerceReadinessService;
use App\Services\MarketPriceService;
use PHPUnit\Framework\TestCase;

class MarketPriceServiceTest extends TestCase
{
    public function test_it_summarizes_an_odd_number_of_source_prices(): void
    {
        $summary = $this->service()->summarizePrices([120, 100, 110]);

        self::assertSame(100.0, $summary['minimum']);
        self::assertSame(110.0, $summary['median']);
        self::assertSame(3, $summary['source_count']);
    }

    public function test_it_averages_the_middle_values_for_an_even_source_count(): void
    {
        $summary = $this->service()->summarizePrices([140, 100, 120, 110]);

        self::assertSame(100.0, $summary['minimum']);
        self::assertSame(115.0, $summary['median']);
        self::assertSame(4, $summary['source_count']);
    }

    public function test_it_discards_non_positive_prices(): void
    {
        $summary = $this->service()->summarizePrices([0, -10, null]);

        self::assertNull($summary['minimum']);
        self::assertNull($summary['median']);
        self::assertSame(0, $summary['source_count']);
    }

    private function service(): MarketPriceService
    {
        return new MarketPriceService(new CommerceReadinessService);
    }
}
