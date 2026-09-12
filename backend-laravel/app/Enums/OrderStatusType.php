<?php

namespace App\Enums;

enum OrderStatusType: string
{
    case PENDING = 'pending';
    case ACTIVE = 'confirmed';
    case PROCESSING = 'processing';
    case PICKUP = 'pickup';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';
    case ON_HOLD = 'on_hold';

    public static function canTransition(string $currentStatus, string $requestedStatus): bool
    {
        if (
            $currentStatus === $requestedStatus
            || $requestedStatus === self::PENDING->value
            || in_array($currentStatus, [self::CANCELLED->value, self::DELIVERED->value], true)
        ) {
            return false;
        }

        $forwardFlow = [
            self::PENDING->value,
            self::ACTIVE->value,
            self::PROCESSING->value,
            self::PICKUP->value,
            self::SHIPPED->value,
            self::DELIVERED->value,
        ];
        $currentIndex = array_search($currentStatus, $forwardFlow, true);
        $requestedIndex = array_search($requestedStatus, $forwardFlow, true);

        return $currentIndex === false
            || $requestedIndex === false
            || $requestedIndex > $currentIndex;
    }
}
