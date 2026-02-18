<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class StoreLoginAccountSeeder extends Seeder
{
    /**
     * Ensure a reusable store login account exists for test/UAT environments.
     */
    public function run(): void
    {
        $email = 'seller@sportoonline.com';
        $defaultSlug = 'seller-user';

        $user = User::firstOrNew(['email' => $email]);

        if (!$user->exists) {
            $slug = $defaultSlug;
            $i = 1;
            while (User::where('slug', $slug)->exists()) {
                $i++;
                $slug = $defaultSlug . '-' . $i;
            }
            $user->slug = $slug;
        } elseif (empty($user->slug)) {
            $user->slug = $defaultSlug . '-' . $user->id;
        }

        $user->first_name = 'Seller';
        $user->last_name = 'User';
        $user->activity_scope = 'store_level';
        $user->status = 1;
        $user->store_owner = 1;
        $user->email_verified = 1;
        $user->email_verified_at = now();
        $user->password = Hash::make('Admin123!');
        $user->save();

        $storeAdminRole = Role::where('name', 'Store Admin')->first();
        if ($storeAdminRole) {
            $user->syncRoles([$storeAdminRole]);
        }
    }
}

