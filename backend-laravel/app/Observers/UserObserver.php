<?php

namespace App\Observers;

use App\Models\User;
use Modules\Chat\app\Models\Chat;
use Modules\Wallet\app\Models\Wallet;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        if ($user->activity_scope === 'delivery_level'){
            // Create a wallet for the user with initial balance
            Wallet::create([
                'owner_id' => $user->id,
                'owner_type' => User::class,  // Set the polymorphic type
                'balance' => 0,  // Set initial balance
                'status' => 1,   // Set the wallet as active
            ]);

            // Create live chat data
            if (moduleExists('Chat')) {
                Chat::create([
                    'user_id' => $user->id,
                    'user_type' => 'deliveryman',
                ]);
            }
        }

        if ($user->activity_scope === 'system_level'){
            // Create live chat data
            if (moduleExists('Chat')) {
                Chat::create([
                    'user_id' => $user->id,
                    'user_type' => 'admin',
                ]);
            }
        }

    }

    /**
     * Handle the User "updated" event.
     */

    public function updated(User $user): void
    {

    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
