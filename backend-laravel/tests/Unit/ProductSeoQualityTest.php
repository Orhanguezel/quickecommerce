<?php

namespace Tests\Unit;

use App\Services\ProductSeoQuality;
use PHPUnit\Framework\TestCase;

class ProductSeoQualityTest extends TestCase
{
    public function test_it_accepts_a_complete_consistent_scraper_product(): void
    {
        $issues = (new ProductSeoQuality())->validateScrapedProduct([
            'name' => 'Newvit Vitamin D3 K2 Sprey 30 ml',
            'slug' => 'newvit-vitamin-d3-k2-sprey-30-ml',
            'description_text' => str_repeat('Ürüne özgü açıklama ve kullanım bilgisi. ', 3),
            'thumbnail_url' => 'https://example.com/newvit.jpg',
            'original_price' => 499.90,
            'url' => 'https://example.com/newvit-vitamin-d3-k2-sprey',
        ]);

        $this->assertSame([], array_values(array_filter(
            $issues,
            static fn (array $issue) => $issue['severity'] === 'error'
        )));
    }

    public function test_it_rejects_cross_wired_name_and_slug(): void
    {
        $issues = (new ProductSeoQuality())->validateScrapedProduct([
            'name' => 'Newvit Vitamin D3 K2 Sprey 30 ml',
            'slug' => 'ligone-kreatin-monohidrat-500-gr',
            'description_text' => str_repeat('Ürüne özgü açıklama ve kullanım bilgisi. ', 3),
            'thumbnail_url' => 'https://example.com/newvit.jpg',
            'original_price' => 499.90,
            'url' => 'https://example.com/ligone-kreatin-monohidrat',
        ]);

        $this->assertContains(
            'slug_name_mismatch',
            array_column($issues, 'code')
        );
    }

    public function test_it_rejects_missing_image_and_non_positive_price(): void
    {
        $issues = (new ProductSeoQuality())->validateScrapedProduct([
            'name' => 'Örnek Spor Ürünü',
            'slug' => 'ornek-spor-urunu',
            'description_text' => str_repeat('Ürüne özgü açıklama. ', 5),
            'original_price' => 0,
        ]);

        $this->assertContains('missing_image', array_column($issues, 'code'));
        $this->assertContains('invalid_price', array_column($issues, 'code'));
    }
}
