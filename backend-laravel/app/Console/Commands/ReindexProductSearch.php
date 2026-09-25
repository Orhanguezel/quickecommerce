<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\SearchNormalizer;
use Illuminate\Console\Command;

class ReindexProductSearch extends Command
{
    protected $signature = 'search:reindex-products {--apply}';
    protected $description = 'Build Turkish-normalized product search text';

    public function handle(SearchNormalizer $normalizer): int
    {
        $apply = (bool) $this->option('apply');
        $count = 0;
        Product::withoutGlobalScopes()->select(['id', 'name', 'description', 'meta_keywords', 'slug', 'search_text'])
            ->chunkById(500, function ($products) use ($normalizer, $apply, &$count) {
                foreach ($products as $product) {
                    $text = $normalizer->productSearchText($product);
                    if ($apply && $product->search_text !== $text) {
                        Product::withoutGlobalScopes()->whereKey($product->id)->update(['search_text' => $text]);
                    }
                    $count++;
                }
            });
        if ($apply) $normalizer->forgetVocabulary();
        $this->info(($apply ? 'APPLIED' : 'DRY-RUN') . ": {$count} products indexed.");
        return self::SUCCESS;
    }
}
