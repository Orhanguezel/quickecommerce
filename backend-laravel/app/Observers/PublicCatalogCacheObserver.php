<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class PublicCatalogCacheObserver
{
    public function saved(object $model): void
    {
        $this->bump();
    }

    public function deleted(object $model): void
    {
        $this->bump();
    }

    public function restored(object $model): void
    {
        $this->bump();
    }

    private function bump(): void
    {
        Cache::forever('public-catalog:version', (string) hrtime(true));
    }
}
