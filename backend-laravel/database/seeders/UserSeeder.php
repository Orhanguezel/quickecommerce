<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'activity_scope' => 'system_level',
                'created_at' => now(),
                'email' => 'admin@sportoonline.com',
                'email_verified_at' => now(),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'password' => Hash::make('Admin123!'),
                'remember_token' => null,
                'slug' => 'admin-user',
                'status' => 1,
                'store_owner' => 0,
                'stores' => null,
                'updated_at' => now(),
            ],
            [
                'activity_scope' => 'store_level',
                'created_at' => now(),
                'email' => 'seller@sportoonline.com',
                'email_verified_at' => now(),
                'first_name' => 'Seller',
                'last_name' => 'User',
                'password' => Hash::make('Admin123!'),
                'remember_token' => null,
                'slug' => 'seller-user',
                'status' => 1,
                'store_owner' => 1,
                'stores' => null,
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['slug' => $user['slug']],
                $user
            );
        }

        // Assign Super Admin role to system_level user
        $adminUser = User::where('email', 'admin@sportoonline.com')->first();
        $superAdminRole = Role::where('available_for', 'system_level')->first();

        if ($adminUser && $superAdminRole) {
            $permissions = Permission::whereIn('available_for', ['system_level', 'COMMON'])->get();
            $superAdminRole->syncPermissions($permissions);
            $adminUser->syncRoles([$superAdminRole]);

            // Enable all permission flags for Super Admin
            DB::table('role_has_permissions')
                ->where('role_id', $superAdminRole->id)
                ->update([
                    'view' => true,
                    'insert' => true,
                    'update' => true,
                    'delete' => true,
                ]);
        }

        // Also assign Super Admin role to developer user if exists
        $devUser = User::where('email', 'orhanguzell@gmail.com')->first();
        if ($devUser && $superAdminRole) {
            $devUser->syncRoles([$superAdminRole]);
        }

        // Assign Store Admin role to seller user
        $sellerUser = User::where('email', 'seller@sportoonline.com')->first();
        $storeAdminRole = Role::where('name', 'Store Admin')->first();

        if ($sellerUser && $storeAdminRole) {
            $storePermissions = Permission::whereIn('available_for', ['store_level', 'COMMON'])->get();
            $storeAdminRole->syncPermissions($storePermissions);
            $sellerUser->syncRoles([$storeAdminRole]);

            DB::table('role_has_permissions')
                ->where('role_id', $storeAdminRole->id)
                ->update([
                    'view' => true,
                    'insert' => true,
                    'update' => true,
                    'delete' => true,
                ]);
        }
    }
}
