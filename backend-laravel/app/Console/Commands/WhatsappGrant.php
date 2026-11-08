<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;

class WhatsappGrant extends Command
{
    protected $signature = 'whatsapp:grant {user_id} {--inbox-only}';

    protected $description = 'Grant explicit WhatsApp permissions to one existing system administrator';

    public function handle(): int
    {
        $user = User::findOrFail($this->argument('user_id'));
        if ($user->activity_scope !== 'system_level') {
            $this->error('Only system administrators may receive this permission.');

            return self::FAILURE;
        }
        $guard = 'api';
        foreach ($this->option('inbox-only') ? ['whatsapp.inbox'] : ['whatsapp.inbox', 'whatsapp.manage', 'whatsapp.send'] as $name) {
            $permission = Permission::findOrCreate($name, $guard);
            $user->givePermissionTo($permission);
        }
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        $this->info('WhatsApp permissions granted.');

        return self::SUCCESS;
    }
}
