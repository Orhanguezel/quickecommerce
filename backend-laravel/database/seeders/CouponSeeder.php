<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('coupons') || !Schema::hasTable('coupon_lines')) {
            $this->command->warn('CouponSeeder: coupons or coupon_lines table does not exist. Skipping...');
            return;
        }

        // Mevcut coupon translation'larını sil
        DB::table('translations')
            ->where('translatable_type', 'App\\Models\\Coupon')
            ->delete();

        DB::table('coupon_lines')->delete();
        DB::table('coupons')->delete();

        $couponData = [
            [
                'title_tr' => 'Hoş Geldin İndirimi',
                'title_en' => 'Welcome Discount',
                'desc_tr' => 'Yeni üyelere özel hoş geldin indirimi. İlk siparişinizde geçerlidir.',
                'desc_en' => 'Special welcome discount for new members. Valid on your first order.',
                'code' => 'HOSGELDIN',
                'discount_type' => 'percentage',
                'discount' => 15,
                'min_order' => 100,
                'max_discount' => 200,
                'usage_limit' => 500,
            ],
            [
                'title_tr' => 'Yaz Sezonu Kampanyası',
                'title_en' => 'Summer Season Campaign',
                'desc_tr' => 'Yaz koleksiyonunda geçerli özel indirim fırsatı.',
                'desc_en' => 'Special discount on the summer collection.',
                'code' => 'YAZ2025',
                'discount_type' => 'percentage',
                'discount' => 20,
                'min_order' => 200,
                'max_discount' => 500,
                'usage_limit' => 300,
            ],
            [
                'title_tr' => 'Ücretsiz Kargo',
                'title_en' => 'Free Shipping',
                'desc_tr' => 'Tüm siparişlerde ücretsiz kargo fırsatı. Minimum sipariş tutarı yoktur.',
                'desc_en' => 'Free shipping on all orders. No minimum order amount required.',
                'code' => 'KARGO0',
                'discount_type' => 'amount',
                'discount' => 50,
                'min_order' => 0,
                'max_discount' => 50,
                'usage_limit' => 1000,
            ],
            [
                'title_tr' => 'Hafta Sonu Özel',
                'title_en' => 'Weekend Special',
                'desc_tr' => 'Hafta sonu alışverişlerinize özel indirim kuponu.',
                'desc_en' => 'Special discount coupon for your weekend shopping.',
                'code' => 'HAFTASONU',
                'discount_type' => 'percentage',
                'discount' => 10,
                'min_order' => 150,
                'max_discount' => 300,
                'usage_limit' => 200,
            ],
            [
                'title_tr' => 'Sadakat Ödülü',
                'title_en' => 'Loyalty Reward',
                'desc_tr' => 'Sadık müşterilerimize özel teşekkür indirimi.',
                'desc_en' => 'Special thank-you discount for our loyal customers.',
                'code' => 'SADAKAT25',
                'discount_type' => 'percentage',
                'discount' => 25,
                'min_order' => 300,
                'max_discount' => 750,
                'usage_limit' => 100,
            ],
            [
                'title_tr' => '50 TL İndirim',
                'title_en' => '50 TL Off',
                'desc_tr' => '250 TL ve üzeri alışverişlerde 50 TL anında indirim.',
                'desc_en' => 'Instant 50 TL discount on orders of 250 TL or more.',
                'code' => '50TLOFF',
                'discount_type' => 'amount',
                'discount' => 50,
                'min_order' => 250,
                'max_discount' => 50,
                'usage_limit' => 400,
            ],
            [
                'title_tr' => 'Flash Sale Kuponu',
                'title_en' => 'Flash Sale Coupon',
                'desc_tr' => 'Sınırlı süreli flash sale indirimi. Acele edin!',
                'desc_en' => 'Limited-time flash sale discount. Hurry up!',
                'code' => 'FLASH30',
                'discount_type' => 'percentage',
                'discount' => 30,
                'min_order' => 400,
                'max_discount' => 600,
                'usage_limit' => 50,
            ],
            [
                'title_tr' => 'Doğum Günü İndirimi',
                'title_en' => 'Birthday Discount',
                'desc_tr' => 'Doğum gününüze özel kişiye özel indirim kuponu.',
                'desc_en' => 'Personalized birthday discount coupon just for you.',
                'code' => 'DGUNU20',
                'discount_type' => 'percentage',
                'discount' => 20,
                'min_order' => 100,
                'max_discount' => 400,
                'usage_limit' => 1000,
            ],
            [
                'title_tr' => 'İlk Sipariş Fırsatı',
                'title_en' => 'First Order Deal',
                'desc_tr' => 'İlk siparişinize özel büyük indirim fırsatı.',
                'desc_en' => 'Big discount deal exclusively for your first order.',
                'code' => 'ILKSIPARIS',
                'discount_type' => 'percentage',
                'discount' => 15,
                'min_order' => 50,
                'max_discount' => 200,
                'usage_limit' => 800,
            ],
            [
                'title_tr' => '100 TL İndirim',
                'title_en' => '100 TL Off',
                'desc_tr' => '500 TL ve üzeri siparişlerde 100 TL indirim.',
                'desc_en' => '100 TL discount on orders of 500 TL or more.',
                'code' => '100TLOFF',
                'discount_type' => 'amount',
                'discount' => 100,
                'min_order' => 500,
                'max_discount' => 100,
                'usage_limit' => 200,
            ],
            [
                'title_tr' => 'Kış Koleksiyonu İndirimi',
                'title_en' => 'Winter Collection Discount',
                'desc_tr' => 'Kış koleksiyonu ürünlerinde geçerli özel indirim.',
                'desc_en' => 'Special discount valid on winter collection products.',
                'code' => 'KIS2025',
                'discount_type' => 'percentage',
                'discount' => 25,
                'min_order' => 200,
                'max_discount' => 500,
                'usage_limit' => 250,
            ],
            [
                'title_tr' => 'Arkadaşını Getir',
                'title_en' => 'Refer a Friend',
                'desc_tr' => 'Arkadaşınızı davet edin, her ikiniz de indirim kazanın.',
                'desc_en' => 'Invite your friend and both of you earn a discount.',
                'code' => 'DAVET10',
                'discount_type' => 'percentage',
                'discount' => 10,
                'min_order' => 100,
                'max_discount' => 150,
                'usage_limit' => 600,
            ],
            [
                'title_tr' => 'Mega İndirim Günleri',
                'title_en' => 'Mega Discount Days',
                'desc_tr' => 'Yılın en büyük indirim günlerinde ekstra kupon fırsatı.',
                'desc_en' => 'Extra coupon deal during the biggest discount days of the year.',
                'code' => 'MEGA35',
                'discount_type' => 'percentage',
                'discount' => 35,
                'min_order' => 500,
                'max_discount' => 1000,
                'usage_limit' => 100,
            ],
            [
                'title_tr' => 'Spor Giyim İndirimi',
                'title_en' => 'Sportswear Discount',
                'desc_tr' => 'Spor giyim kategorisindeki tüm ürünlerde geçerli indirim.',
                'desc_en' => 'Discount valid on all products in the sportswear category.',
                'code' => 'SPOR15',
                'discount_type' => 'percentage',
                'discount' => 15,
                'min_order' => 150,
                'max_discount' => 300,
                'usage_limit' => 350,
            ],
            [
                'title_tr' => 'Gece Yarısı Fırsatı',
                'title_en' => 'Midnight Deal',
                'desc_tr' => 'Gece 00:00 - 06:00 arası geçerli özel indirim.',
                'desc_en' => 'Special discount valid between midnight and 6 AM.',
                'code' => 'GECE20',
                'discount_type' => 'percentage',
                'discount' => 20,
                'min_order' => 200,
                'max_discount' => 400,
                'usage_limit' => 150,
            ],
            [
                'title_tr' => '200 TL İndirim',
                'title_en' => '200 TL Off',
                'desc_tr' => '1000 TL ve üzeri alışverişlerde 200 TL indirim kuponu.',
                'desc_en' => '200 TL discount coupon on purchases of 1000 TL or more.',
                'code' => '200TLOFF',
                'discount_type' => 'amount',
                'discount' => 200,
                'min_order' => 1000,
                'max_discount' => 200,
                'usage_limit' => 100,
            ],
            [
                'title_tr' => 'Bahar Kampanyası',
                'title_en' => 'Spring Campaign',
                'desc_tr' => 'Bahar sezonuna özel tüm kategorilerde geçerli indirim.',
                'desc_en' => 'Spring season discount valid across all categories.',
                'code' => 'BAHAR15',
                'discount_type' => 'percentage',
                'discount' => 15,
                'min_order' => 175,
                'max_discount' => 350,
                'usage_limit' => 300,
            ],
            [
                'title_tr' => 'VIP Müşteri Kuponu',
                'title_en' => 'VIP Customer Coupon',
                'desc_tr' => 'VIP müşterilerimize özel yüksek tutarlı indirim kuponu.',
                'desc_en' => 'High-value discount coupon exclusive to our VIP customers.',
                'code' => 'VIP40',
                'discount_type' => 'percentage',
                'discount' => 40,
                'min_order' => 750,
                'max_discount' => 1500,
                'usage_limit' => 50,
            ],
            [
                'title_tr' => 'Mobil Uygulama İndirimi',
                'title_en' => 'Mobile App Discount',
                'desc_tr' => 'Mobil uygulama üzerinden yapılan alışverişlere özel indirim.',
                'desc_en' => 'Exclusive discount for purchases made via the mobile app.',
                'code' => 'MOBIL10',
                'discount_type' => 'percentage',
                'discount' => 10,
                'min_order' => 100,
                'max_discount' => 200,
                'usage_limit' => 500,
            ],
            [
                'title_tr' => 'Yılbaşı Özel Kuponu',
                'title_en' => 'New Year Special Coupon',
                'desc_tr' => 'Yeni yıla özel kutlama indirimi. Mutlu yıllar!',
                'desc_en' => 'New Year celebration discount. Happy New Year!',
                'code' => 'YILBASI25',
                'discount_type' => 'percentage',
                'discount' => 25,
                'min_order' => 300,
                'max_discount' => 600,
                'usage_limit' => 200,
            ],
        ];

        foreach ($couponData as $index => $data) {
            // Coupon oluştur
            $couponId = DB::table('coupons')->insertGetId([
                'title' => $data['title_tr'],
                'description' => $data['desc_tr'],
                'status' => 1,
                'created_by' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // TR çevirileri
            DB::table('translations')->insert([
                [
                    'translatable_type' => 'App\\Models\\Coupon',
                    'translatable_id' => $couponId,
                    'language' => 'tr',
                    'key' => 'title',
                    'value' => $data['title_tr'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'translatable_type' => 'App\\Models\\Coupon',
                    'translatable_id' => $couponId,
                    'language' => 'tr',
                    'key' => 'description',
                    'value' => $data['desc_tr'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // EN çevirileri
            DB::table('translations')->insert([
                [
                    'translatable_type' => 'App\\Models\\Coupon',
                    'translatable_id' => $couponId,
                    'language' => 'en',
                    'key' => 'title',
                    'value' => $data['title_en'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'translatable_type' => 'App\\Models\\Coupon',
                    'translatable_id' => $couponId,
                    'language' => 'en',
                    'key' => 'description',
                    'value' => $data['desc_en'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // Coupon line oluştur
            DB::table('coupon_lines')->insert([
                'coupon_id' => $couponId,
                'customer_id' => null,
                'coupon_code' => $data['code'],
                'discount_type' => $data['discount_type'],
                'discount' => $data['discount'],
                'min_order_value' => $data['min_order'],
                'max_discount' => $data['max_discount'],
                'usage_limit' => $data['usage_limit'],
                'usage_count' => rand(0, (int) ($data['usage_limit'] * 0.3)),
                'start_date' => Carbon::now()->subDays(rand(1, 30)),
                'end_date' => Carbon::now()->addDays(rand(30, 90)),
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
