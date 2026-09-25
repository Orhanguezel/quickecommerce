<?php

namespace App\Observers;

use App\Services\SearchNormalizer;

class ProductSearchObserver
{
    public function saving(object $product): void
    {
        $product->search_text = app(SearchNormalizer::class)->productSearchText($product);
    }

    public function saved(object $product): void
    {
        app(SearchNormalizer::class)->forgetVocabulary();
    }
}
