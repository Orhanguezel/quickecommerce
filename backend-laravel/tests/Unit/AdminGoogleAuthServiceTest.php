<?php

namespace Tests\Unit;

use App\Services\Auth\AdminGoogleAuthService;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AdminGoogleAuthServiceTest extends TestCase
{
    public function test_only_configured_google_emails_are_allowed(): void
    {
        config()->set('admin_google_auth.allowed_emails', [
            'sportoonlinecom@gmail.com',
            'engineserplus@gmail.com',
        ]);

        $service = app(AdminGoogleAuthService::class);

        $this->assertTrue($service->isAllowedEmail('sportoonlinecom@gmail.com'));
        $this->assertTrue($service->isAllowedEmail(' ENGINESERPLUS@GMAIL.COM '));
        $this->assertFalse($service->isAllowedEmail('someoneelse@gmail.com'));
        $this->assertFalse($service->isAllowedEmail('admin@sportoonline.com'));
    }

    public function test_oauth_state_is_single_use_and_keeps_supported_locale(): void
    {
        Cache::clear();
        config()->set('admin_google_auth.state_ttl_seconds', 600);

        $service = app(AdminGoogleAuthService::class);
        $state = $service->begin('tr');

        $this->assertTrue($service->isAdminState($state));
        $this->assertSame(['locale' => 'tr'], $service->consumeState($state));
        $this->assertNull($service->consumeState($state));
    }
}
