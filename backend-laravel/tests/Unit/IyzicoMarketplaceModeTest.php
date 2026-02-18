<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\V1\IyzicoPaymentController;
use App\Services\IyzicoService;
use Tests\TestCase;

class IyzicoMarketplaceModeTest extends TestCase
{
    private function controller(): IyzicoPaymentController
    {
        $service = $this->createMock(IyzicoService::class);
        return new IyzicoPaymentController($service);
    }

    public function test_marketplace_disabled_when_only_api_and_secret_exist(): void
    {
        $controller = $this->controller();

        $this->assertFalse($controller->isMarketplaceEnabled([
            'api_key' => 'k',
            'secret_key' => 's',
        ]));
    }

    public function test_marketplace_enabled_only_with_explicit_true_flag(): void
    {
        $controller = $this->controller();

        $this->assertTrue($controller->isMarketplaceEnabled([
            'marketplace_mode' => true,
        ]));
        $this->assertTrue($controller->isMarketplaceEnabled([
            'marketplace_mode' => 'true',
        ]));
    }

    public function test_store_sub_merchant_keys_empty_json_does_not_enable_marketplace(): void
    {
        $controller = $this->controller();

        $this->assertFalse($controller->isMarketplaceEnabled([
            'store_sub_merchant_keys' => '{}',
        ]));
    }

    public function test_has_sub_merchant_configuration_checks_non_empty_values(): void
    {
        $controller = $this->controller();

        $this->assertFalse($controller->hasSubMerchantConfiguration([
            'store_sub_merchant_keys' => '{}',
            'sub_merchant_key' => '',
        ]));

        $this->assertTrue($controller->hasSubMerchantConfiguration([
            'store_sub_merchant_keys' => '{"25":"subKey25"}',
        ]));
    }
}
