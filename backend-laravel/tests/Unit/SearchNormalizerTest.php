<?php

namespace Tests\Unit;

use App\Services\SearchNormalizer;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class SearchNormalizerTest extends TestCase
{
    #[Test]
    public function it_folds_turkish_letters_and_punctuation(): void
    {
        $normalizer = new SearchNormalizer();

        $this->assertSame('sisli kosu bandi 3 hp', $normalizer->normalize(' ŞİŞLİ / Koşu Bandı — 3 HP '));
    }

    #[Test]
    public function it_builds_a_normalized_product_document(): void
    {
        $normalizer = new SearchNormalizer();
        $product = (object) [
            'name' => 'Çantalı Dambıl Seti',
            'description' => '<p>Evde güç antrenmanı için.</p>',
            'meta_keywords' => 'ağırlık, fitness',
            'slug' => 'cantali-dambil-seti',
        ];

        $document = $normalizer->productSearchText($product);

        $this->assertStringContainsString('cantali dambil seti', $document);
        $this->assertStringContainsString('agirlik fitness', $document);
        $this->assertStringNotContainsString('<p>', $document);
    }
}
