<?php

namespace App\Observers;

use App\Models\Store;
use App\Models\StoreType;
use Modules\Chat\app\Models\Chat;

class StoreObserver
{
    /**
     * Handle the Store "created" event.
     */
    public function created(Store $store): void
    {
        if ($store->store_type) {
            StoreType::where('type', $store->store_type)->increment('total_stores');
        }
    }

    /**
     * Handle the Store "updated" event.
     */
    public function updated(Store $store): void
    {
        //
    }

    /**
     * Handle the Store "deleted" event.
     */
    public function deleted(Store $store): void
    {
        if ($store->store_type) {
            StoreType::where('type', $store->store_type)->decrement('total_stores');
        }
    }

    /**
     * Handle the Store "restored" event.
     */
    public function restored(Store $store): void
    {
        //
    }

    /**
     * Handle the Store "force deleted" event.
     */
    public function forceDeleted(Store $store): void
    {
        //
    }
}
