<?php

namespace App\Enums;

enum StoreType: string
{
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

    // Static method to get store type-specific settings
    public static function getSettings(StoreType $storeType): array
    {
        $settings = [
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
                'delivery_time_per_km' => 15, // 15 minutes per km
                'min_order_delivery_fee' => 350.00,
                'delivery_charge_method' => 'fixed',
                'fixed_charge_amount' => 40.00,
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
        ];
    }

    public function image(): string
    {
        return self::images()[$this->value] ?? '';
    }
}

