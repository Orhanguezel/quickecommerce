<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminGoogleAuthService
{
    private const STATE_PREFIX = 'admin_google_oauth_state:';

    private const EXCHANGE_PREFIX = 'admin_google_oauth_exchange:';

    public function enabled(): bool
    {
        return (bool) config('admin_google_auth.enabled', false);
    }

    public function begin(string $locale): string
    {
        $state = 'admin_' . Str::random(64);

        Cache::put(
            self::STATE_PREFIX . $state,
            ['locale' => $this->normalizeLocale($locale)],
            now()->addSeconds((int) config('admin_google_auth.state_ttl_seconds', 600))
        );

        return $state;
    }

    public function isAdminState(string $state): bool
    {
        return Str::startsWith($state, 'admin_');
    }

    public function consumeState(string $state): ?array
    {
        $payload = Cache::pull(self::STATE_PREFIX . $state);

        return is_array($payload) ? $payload : null;
    }

    public function findTargetAdmin(string $googleEmail): ?User
    {
        if (!$this->isAllowedEmail($googleEmail)) {
            return null;
        }

        return User::query()
            ->whereRaw('LOWER(email) = ?', [$this->targetAdminEmail()])
            ->where('activity_scope', 'system_level')
            ->where('status', 1)
            ->first();
    }

    public function isAllowedEmail(string $email): bool
    {
        return in_array(
            strtolower(trim($email)),
            config('admin_google_auth.allowed_emails', []),
            true
        );
    }

    public function createExchangeCode(User $admin, string $googleEmail): string
    {
        $code = Str::random(80);

        Cache::put(
            self::EXCHANGE_PREFIX . $code,
            [
                'user_id' => $admin->id,
                'google_email' => strtolower(trim($googleEmail)),
            ],
            now()->addSeconds((int) config('admin_google_auth.exchange_ttl_seconds', 60))
        );

        return $code;
    }

    public function consumeExchangeCode(string $code): ?User
    {
        $payload = Cache::pull(self::EXCHANGE_PREFIX . $code);

        if (!is_array($payload) || !$this->isAllowedEmail((string) ($payload['google_email'] ?? ''))) {
            return null;
        }

        return User::query()
            ->whereKey($payload['user_id'] ?? null)
            ->whereRaw('LOWER(email) = ?', [$this->targetAdminEmail()])
            ->where('activity_scope', 'system_level')
            ->where('status', 1)
            ->first();
    }

    public function normalizeLocale(string $locale): string
    {
        return in_array($locale, ['tr', 'en'], true) ? $locale : 'tr';
    }

    private function targetAdminEmail(): string
    {
        return strtolower(trim((string) config('admin_google_auth.target_admin_email')));
    }
}
