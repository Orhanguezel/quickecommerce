<?php

namespace App\Enums;

enum StoreType: string
{
    case GENERAL = 'general';
    case GROCERY = 'grocery';
    case BAKERY = 'bakery';
    case MEDICINE = 'medicine';
    case MAKEUP = 'makeup';
    case BAGS = 'bags';
    case CLOTHING = 'clothing';
    case FURNITURE = 'furniture';
    case BOOKS = 'books';
    case GADGET = 'gadgets';
    case ANIMALS_PET = 'animals-pet';
    case FISH = 'fish';
    case RESTAURANT = 'restaurant';
    case CAFE = 'cafe';
    case FAST_FOOD = 'fast-food';
    case FLORIST = 'florist';
    case SPORTS = 'sports';
    case TOY = 'toy';
    case JEWELRY = 'jewelry';
    case HOME_DECOR = 'home-decor';
    case AUTO_PARTS = 'auto-parts';
    case ORGANIC = 'organic';
    case BUTCHER = 'butcher';
    case FRUIT_VEGETABLE = 'fruit-vegetable';
    case ICE_CREAM = 'ice-cream';
    case HARDWARE = 'hardware';
    case BABY_KIDS = 'baby-kids';

    // Static method to get store type-specific settings
    public static function getSettings(StoreType $storeType): array
    {
        $settings = [
            self::GENERAL->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 200.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 10.00,
                'range_wise_charges_data' => null,
            ],
            self::GROCERY->value => [
                'delivery_time_per_km' => 15, // 15 minutes per km
                'min_order_delivery_fee' => 500.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 10.00,
                'range_wise_charges_data' => null,
            ],
            self::BAKERY->value => [
                'delivery_time_per_km' => 10, // 10 minutes per km
                'min_order_delivery_fee' => 300.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 50.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::MEDICINE->value => [
                'delivery_time_per_km' => 20, // 20 minutes per km
                'min_order_delivery_fee' => 800.00,
                'delivery_charge_method' => 'range_wise',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => json_encode([
                    'ranges' => [
                        ['min' => 0, 'max' => 5, 'charge' => 50],
                        ['min' => 6, 'max' => 10, 'charge' => 100],
                    ]
                ]),
            ],
            self::MAKEUP->value => [
                'delivery_time_per_km' => 15, // 15 minutes per km
                'min_order_delivery_fee' => 400.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 30.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::BAGS->value => [
                'delivery_time_per_km' => 25, // 25 minutes per km
                'min_order_delivery_fee' => 600.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 15.00,
                'range_wise_charges_data' => null,
            ],
            self::CLOTHING->value => [
                'delivery_time_per_km' => 20, // 20 minutes per km
                'min_order_delivery_fee' => 700.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 12.00,
                'range_wise_charges_data' => null,
            ],
            self::FURNITURE->value => [
                'delivery_time_per_km' => 30, // 30 minutes per km
                'min_order_delivery_fee' => 1000.00,
                'delivery_charge_method' => 'range_wise',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => json_encode([
                    'ranges' => [
                        ['min' => 0, 'max' => 5, 'charge' => 100],
                        ['min' => 6, 'max' => 10, 'charge' => 200],
                    ]
                ]),
            ],
            self::BOOKS->value => [
                'delivery_time_per_km' => 10, // 10 minutes per km
                'min_order_delivery_fee' => 200.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 20.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::GADGET->value => [
                'delivery_time_per_km' => 15, // 15 minutes per km
                'min_order_delivery_fee' => 700.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 20.00,
                'range_wise_charges_data' => null,
            ],
            self::ANIMALS_PET->value => [
                'delivery_time_per_km' => 20, // 20 minutes per km
                'min_order_delivery_fee' => 900.00,
                'delivery_charge_method' => 'range_wise',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => json_encode([
                    'ranges' => [
                        ['min' => 0, 'max' => 5, 'charge' => 60],
                        ['min' => 6, 'max' => 10, 'charge' => 120],
                    ]
                ]),
            ],
            self::FISH->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 350.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 40.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::RESTAURANT->value => [
                'delivery_time_per_km' => 10,
                'min_order_delivery_fee' => 150.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 8.00,
                'range_wise_charges_data' => null,
            ],
            self::CAFE->value => [
                'delivery_time_per_km' => 10,
                'min_order_delivery_fee' => 100.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 15.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::FAST_FOOD->value => [
                'delivery_time_per_km' => 8,
                'min_order_delivery_fee' => 80.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 10.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::FLORIST->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 200.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 25.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::SPORTS->value => [
                'delivery_time_per_km' => 20,
                'min_order_delivery_fee' => 500.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 12.00,
                'range_wise_charges_data' => null,
            ],
            self::TOY->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 300.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 20.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::JEWELRY->value => [
                'delivery_time_per_km' => 25,
                'min_order_delivery_fee' => 1000.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 50.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::HOME_DECOR->value => [
                'delivery_time_per_km' => 25,
                'min_order_delivery_fee' => 800.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 18.00,
                'range_wise_charges_data' => null,
            ],
            self::AUTO_PARTS->value => [
                'delivery_time_per_km' => 30,
                'min_order_delivery_fee' => 500.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 15.00,
                'range_wise_charges_data' => null,
            ],
            self::ORGANIC->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 400.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 10.00,
                'range_wise_charges_data' => null,
            ],
            self::BUTCHER->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 300.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 30.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::FRUIT_VEGETABLE->value => [
                'delivery_time_per_km' => 12,
                'min_order_delivery_fee' => 150.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 15.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::ICE_CREAM->value => [
                'delivery_time_per_km' => 8,
                'min_order_delivery_fee' => 80.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 10.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
            self::HARDWARE->value => [
                'delivery_time_per_km' => 30,
                'min_order_delivery_fee' => 600.00,
                'delivery_charge_method' => 'per_km',
                'fixed_charge_amount' => null,
                'per_km_charge_amount' => 15.00,
                'range_wise_charges_data' => null,
            ],
            self::BABY_KIDS->value => [
                'delivery_time_per_km' => 15,
                'min_order_delivery_fee' => 300.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 20.00,
                'per_km_charge_amount' => null,
                'range_wise_charges_data' => null,
            ],
        ];

        return $settings[$storeType->value] ?? [];
    }

    public static function images(): array
    {
        return [
            self::GROCERY->value => '',
            self::BAKERY->value => '',
            self::MEDICINE->value => '',
            self::MAKEUP->value => '',
            self::BAGS->value => '',
            self::CLOTHING->value => '',
            self::BOOKS->value => '',
            self::GADGET->value => '',
            self::ANIMALS_PET->value => '',
            self::FISH->value => '',
            self::RESTAURANT->value => '',
            self::CAFE->value => '',
            self::FAST_FOOD->value => '',
            self::FLORIST->value => '',
            self::SPORTS->value => '',
            self::TOY->value => '',
            self::JEWELRY->value => '',
            self::HOME_DECOR->value => '',
            self::AUTO_PARTS->value => '',
            self::ORGANIC->value => '',
            self::BUTCHER->value => '',
            self::FRUIT_VEGETABLE->value => '',
            self::ICE_CREAM->value => '',
            self::HARDWARE->value => '',
            self::BABY_KIDS->value => '',
        ];
    }

    public function image(): string
    {
        return self::images()[$this->value] ?? '';
    }
}

