<?php

namespace App\Observers;

use App\Models\Store;
use Modules\Chat\app\Models\Chat;
use Modules\Wallet\app\Models\Wallet;

class SellerStoreWiseObserver
{
    /**
     * Handle the Store "created" event.
     */
    public function created(Store $store): void
    {
        // Create a wallet for the customer with initial balance
        Wallet::create([
            'owner_id' => $store->id,
            'owner_type' => Store::class,  // Set the polymorphic type
            'balance' => 0,  // Set initial balance
            'status' => 1,   // Set the wallet as active
        ]);

        // Create live chat data
        if (moduleExists('Chat')) {
            Chat::create([
                'user_id' => $store->id,
                'user_type' => 'store',
            ]);
        }
    }

}
