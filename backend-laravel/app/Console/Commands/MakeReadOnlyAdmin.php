<?php

namespace App\Console\Commands;

use App\Models\CustomPermission;
use App\Models\CustomRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

/**
 * Salt-okunur (read-only / inceleme) bir yonetici hesabi olusturur.
 *
 * - "read_only = true" isaretli bir sistem rolu olusturur/gunceller ve
 *   TUM system_level izinleri view=true (insert/update/delete=false) ile baglar,
 *   boylece kullanici butun admin menulerini gorur ama hicbir sey degistiremez.
 * - Verilen e-posta icin system_level bir kullanici olusturur/bulur ve role atar.
 *
 * Gercek yazma engeli RestrictReadOnlyAdmin middleware tarafindan uygulanir.
 *
 * Ornek:
 *   php artisan admin:make-readonly inceleme@sportoonline.com 'GucluParola123' --name="Inceleme Hesabi"
 */
class MakeReadOnlyAdmin extends Command
{
    protected $signature = 'admin:make-readonly
                            {email : Hesabin e-posta adresi}
                            {password : Hesabin parolasi}
                            {--name=Salt Okunur Yonetici : Kullanicinin gorunen adi}
                            {--role=Salt Okunur Yonetici : Olusturulacak/kullanilacak rol adi}';

    protected $description = 'Sadece goruntuleme yetkisi olan (read-only) bir yonetici hesabi olusturur';

    public function handle(): int
    {
        $email = strtolower(trim($this->argument('email')));
        $password = $this->argument('password');
        $displayName = $this->option('name');
        $roleName = $this->option('role');

        // 1) Salt-okunur rolu olustur/guncelle
        $role = CustomRole::firstOrNew([
            'name' => $roleName,
            'guard_name' => 'api',
        ]);
        $role->available_for = 'system_level';
        $role->read_only = true;
        $role->status = 1;
        $role->save();
        $this->info("Rol hazir: #{$role->id} {$role->name} (read_only=true)");

        // 2) Tum system_level izinleri view=true ile bagla
        $permissions = CustomPermission::where('available_for', 'system_level')->get();
        if ($permissions->isEmpty()) {
            $this->warn('system_level izin bulunamadi. RolesSeeder/PermissionSeeder calistirildi mi?');
        }
        $syncData = [];
        foreach ($permissions as $perm) {
            $syncData[$perm->id] = [
                'view'   => true,
                'insert' => false,
                'update' => false,
                'delete' => false,
                'others' => false,
            ];
        }
        $role->permissions()->sync($syncData);
        $this->info(count($syncData) . ' izin view=true olarak baglandi.');

        // 3) Kullaniciyi olustur/bul ve role ata
        $user = User::withTrashed()->where('email', $email)->first();
        $isNew = !$user;

        $nameParts = preg_split('/\s+/', trim($displayName), 2);
        $firstName = $nameParts[0] ?? 'Inceleme';
        $lastName = $nameParts[1] ?? null;

        if ($isNew) {
            $user = new User();
            $user->email = $email;
            $user->slug = username_slug_generator($firstName, $lastName);
        }
        $user->first_name = $firstName;
        $user->last_name = $lastName;
        $user->activity_scope = 'system_level';
        $user->status = 1;
        $user->email_verified = 1;
        $user->password = Hash::make($password);
        if (method_exists($user, 'restore') && $user->trashed()) {
            $user->restore();
        }
        $user->save();

        // Eski rolleri temizleyip sadece salt-okunur rolu ata (yetki sismesi olmasin)
        $user->syncRoles([$role->name]);

        // Spatie izin cache'ini temizle
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->newLine();
        $this->info('✔ Salt-okunur yonetici hazir.');
        $this->table(
            ['Alan', 'Deger'],
            [
                ['Durum', $isNew ? 'Yeni olusturuldu' : 'Guncellendi'],
                ['Kullanici ID', $user->id],
                ['E-posta', $user->email],
                ['Rol', $role->name],
                ['activity_scope', $user->activity_scope],
            ]
        );
        $this->warn('Not: Bu hesap admin panelde her seyi GORUR, hicbir sey DEGISTIREMEZ (POST/PUT/PATCH/DELETE -> 403).');

        return self::SUCCESS;
    }
}
