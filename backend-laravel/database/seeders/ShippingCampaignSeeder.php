<?php

namespace Database\Seeders;

use App\Models\ShippingCampaign;
use Illuminate\Database\Seeder;

class ShippingCampaignSeeder extends Seeder
{
    public function run(): void
    {
        ShippingCampaign::updateOrCreate(
            ['title' => '1000 TL Üzeri Kargo Bedava'],
            [
                'description'       => '1000 TL ve üzeri tüm siparişlerinizde kargo ücreti alınmaz! Fırsatı kaçırma, hemen alışverişe başla.',
                'image'             => 'shipping-campaign/kargo-bedava-bg.jpg',
                'background_color'  => '#0F2B5B',
                'title_color'       => '#FFFFFF',
                'description_color' => '#B8D4F5',
                'button_text'       => 'Alışverişe Başla',
                'button_text_color' => '#FFFFFF',
                'button_bg_color'   => '#F97316',
                'button_url'        => '/',
                'min_order_value'   => 1000.00,
                'status'            => true,
            ]
        );

        $this->command->info('✅ Shipping campaign seeded.');
    }
}
