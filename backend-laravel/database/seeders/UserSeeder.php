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
                'created_at' => '2021-06-27 04:13:00',
                'email' => 'owner@store.com',
                'email_verified_at' => null,
                'first_name' => 'Store Admin',
                'password' => '$2y$10$oSKpyEavNDBqA29RYY1UueFB1Y0hTUXmHqQeJC9lB1gnzoVTHpVV2',
                'remember_token' => null,
                'slug' => 'store-owner',
                'status' => 1,
                'store_owner' => 1,
                'stores' => '[1,2,3,4]',
                'updated_at' => '2023-10-02 06:53:37',
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
    }
}
