<?php

namespace Database\Seeders;

use App\Models\SellerApplication;
use App\Models\StoreSeller;
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

            // Create StoreSeller record for seller user
            StoreSeller::updateOrCreate(
                ['user_id' => $sellerUser->id],
                [
                    'phone' => '+905551234567',
                    'address' => 'Merkez Mah. Satıcı Cad. No:1, İstanbul',
                    'status' => 1,
                ]
            );

            // Create SellerApplication record (approved) for seller user
            if (DB::getSchemaBuilder()->hasTable('seller_applications')) {
                SellerApplication::updateOrCreate(
                    ['user_id' => $sellerUser->id],
                    [
                        'company_name' => 'Sportoo Mağaza',
                        'brand_name' => 'Sportoo',
                        'sector' => 'Spor ve Outdoor',
                        'tax_office' => 'İstanbul VD',
                        'tax_number' => 'TR1234567890',
                        'mersis_number' => '0001234567890001',
                        'website_url' => 'https://sportoonline.com',
                        'address_country' => 'Türkiye',
                        'address_city' => 'İstanbul',
                        'address_district' => 'Kadıköy',
                        'address_postal_code' => '34710',
                        'address_line1' => 'Merkez Mah. Satıcı Cad. No:1',
                        'address_line2' => null,
                        'bank_name' => 'Ziraat Bankası',
                        'bank_account_holder' => 'Seller User',
                        'bank_iban' => 'TR000000000000000000000001',
                        'bank_account_number' => '1234567890',
                        'bank_branch_code' => '001',
                        'bank_swift_code' => 'TCZBTR2A',
                        'note' => null,
                        'status' => SellerApplication::STATUS_APPROVED,
                        'admin_note' => 'Seeder tarafından otomatik onaylandı.',
                        'reviewed_by' => $adminUser?->id,
                        'reviewed_at' => now(),
                    ]
                );
            }
        }
    }
}
