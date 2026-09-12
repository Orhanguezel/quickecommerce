<?php

namespace Tests\Unit;

use App\Enums\OrderStatusType;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class OrderStatusTypeTest extends TestCase
{
    #[DataProvider('transitionProvider')]
    public function test_order_status_transition_policy(string $current, string $requested, bool $allowed): void
    {
        $this->assertSame($allowed, OrderStatusType::canTransition($current, $requested));
    }

    public static function transitionProvider(): array
    {
        return [
            'pending cannot be saved again' => ['pending', 'pending', false],
            'confirmed cannot return to pending' => ['confirmed', 'pending', false],
            'processing cannot return to confirmed' => ['processing', 'confirmed', false],
            'pending can advance to confirmed' => ['pending', 'confirmed', true],
            'confirmed can skip ahead to shipped' => ['confirmed', 'shipped', true],
            'active order can be cancelled' => ['processing', 'cancelled', true],
            'cancelled order is terminal' => ['cancelled', 'confirmed', false],
            'delivered order is terminal' => ['delivered', 'cancelled', false],
            'on-hold order can resume' => ['on_hold', 'processing', true],
        ];
    }
}
