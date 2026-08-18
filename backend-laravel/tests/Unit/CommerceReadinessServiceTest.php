<?php

namespace Tests\Unit;

use App\Models\Store;
use App\Services\CommerceReadinessService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class CommerceReadinessServiceTest extends TestCase
{
    #[DataProvider('centrallyOperatedModels')]
    public function test_centrally_operated_stores_do_not_require_physical_sender_fields(string $model): void
    {
        $store = new Store([
            'name' => 'Managed Store',
            'slug' => 'managed-store',
            'store_seller_id' => 3,
            'fulfillment_model' => $model,
        ]);

        $result = (new CommerceReadinessService())->refreshStore($store, false);

        self::assertSame(100, $result['score']);
        self::assertSame($model, $result['fulfillment_model']);
        self::assertArrayNotHasKey('geliver_sender', $result['checks']);
        self::assertArrayNotHasKey('address', $result['checks']);
    }

    public static function centrallyOperatedModels(): array
    {
        return [['dropship'], ['digital']];
    }

    public function test_independent_physical_seller_still_requires_profile_and_sender_address(): void
    {
        $store = new Store([
            'name' => 'Physical Seller',
            'slug' => 'physical-seller',
            'store_seller_id' => 9,
            'fulfillment_model' => 'seller',
        ]);

        $result = (new CommerceReadinessService())->refreshStore($store, false);

        self::assertSame(0, $result['score']);
        self::assertArrayHasKey('geliver_sender', $result['checks']);
        self::assertArrayHasKey('address', $result['checks']);
    }
}
