<?php

namespace Database\Seeders;

use App\Models\OrderRefundReason;
use App\Models\Translation;
use Illuminate\Database\Seeder;

class OrderRefundReasonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * SAFE: Uses firstOrCreate — will NOT delete existing data.
     */
    public function run(): void
    {
        $reasons = [
            [
                'tr' => 'Ürün hasarlı/bozuk geldi',
                'en' => 'Product arrived damaged/defective',
            ],
            [
                'tr' => 'Yanlış ürün gönderildi',
                'en' => 'Wrong product was sent',
            ],
            [
                'tr' => 'Ürün açıklamayla uyuşmuyor',
                'en' => 'Product does not match description',
            ],
            [
                'tr' => 'Ürün hiç gelmedi',
                'en' => 'Product never arrived',
            ],
            [
                'tr' => 'Ürünü beğenmedim / fikrim değişti',
                'en' => 'Changed my mind / not satisfied',
            ],
            [
                'tr' => 'Diğer',
                'en' => 'Other',
            ],
        ];

        foreach ($reasons as $reasonData) {
            $reason = OrderRefundReason::firstOrCreate(
                ['reason' => $reasonData['tr']]
            );

            // Turkish translation
            Translation::firstOrCreate(
                [
                    'translatable_type' => OrderRefundReason::class,
                    'translatable_id'   => $reason->id,
                    'language'          => 'tr',
                    'key'               => 'reason',
                ],
                ['value' => $reasonData['tr']]
            );

            // English translation
            Translation::firstOrCreate(
                [
                    'translatable_type' => OrderRefundReason::class,
                    'translatable_id'   => $reason->id,
                    'language'          => 'en',
                    'key'               => 'reason',
                ],
                ['value' => $reasonData['en']]
            );
        }
    }
}
