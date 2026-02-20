<?php

namespace Database\Seeders;

use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * SafeProductAttributeSeeder
 *
 * ✅ SAFE: Uses firstOrCreate — can be run multiple times without data loss.
 *
 * Covers all standard store types. Run this on production to ensure
 * attributes are available for variant selection when creating products.
 *
 * Usage:
 *   php artisan db:seed --class=SafeProductAttributeSeeder --force
 */
class SafeProductAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $sets = [
            // Kitaplar
            'books' => [
                'Yazar'      => ['Yazar A', 'Yazar B', 'Yazar C', 'Diğer'],
                'Tür'        => ['Roman', 'Kurgu Dışı', 'Bilim Kurgu', 'Tarih', 'Biyografi', 'Çocuk', 'Kişisel Gelişim'],
                'Dil'        => ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'Arapça'],
                'Kapak Türü' => ['Karton Kapak', 'Sert Kapak', 'Spiralli'],
            ],
            // Giyim
            'clothing' => [
                'Renk'    => ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Gri', 'Lacivert', 'Pembe', 'Mor'],
                'Beden'   => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
                'Malzeme' => ['Pamuk', 'Polyester', 'Naylon', 'Yün', 'Deri', 'Keten', 'İpek'],
            ],
            // Ayakkabı
            'footwear' => [
                'Renk'   => ['Siyah', 'Beyaz', 'Kahverengi', 'Gri', 'Lacivert'],
                'Numara' => ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
            ],
            // Teknoloji / Gadget
            'gadgets' => [
                'Renk'  => ['Siyah', 'Beyaz', 'Gümüş', 'Altın', 'Mavi', 'Kırmızı'],
                'Boyut' => ['Küçük', 'Orta', 'Büyük', 'Kompakt'],
            ],
            // Market
            'grocery' => [
                'Ağırlık' => ['100g', '250g', '500g', '1kg', '2kg', '5kg'],
                'Ambalaj' => ['Tekli Paket', 'Çoklu Paket', 'Şişe', 'Kutu', 'Torba'],
            ],
            // Fırın / Pastane
            'bakery' => [
                'Tat'         => ['Vanilya', 'Çikolata', 'Çilek'],
                'Ağırlık'     => ['500g', '1kg', '2kg'],
                'Ambalaj Türü' => ['Kutu', 'Torba', 'Plastik'],
            ],
            // İlaç / Eczane
            'medicine' => [
                'Doz'   => ['50mg', '100mg', '200mg', '500mg'],
                'Tür'   => ['Tablet', 'Kapsül', 'Şurup', 'Enjeksiyon'],
            ],
            // Makyaj / Kozmetik
            'makeup' => [
                'Ton'         => ['Açık', 'Orta', 'Koyu'],
                'Cilt Tipi'   => ['Yağlı', 'Kuru', 'Karma', 'Hassas', 'Normal'],
                'Ürün Türü'   => ['Fondöten', 'Kapatıcı', 'Ruj', 'Maskara', 'Far'],
            ],
            // Çantalar
            'bags' => [
                'Malzeme' => ['Deri', 'Kanvas', 'Naylon', 'Polyester'],
                'Boyut'   => ['Küçük', 'Orta', 'Büyük', 'Ekstra Büyük'],
                'Renk'    => ['Siyah', 'Kahverengi', 'Bej', 'Lacivert', 'Kırmızı'],
            ],
            // Mobilya
            'furniture' => [
                'Malzeme' => ['Ahşap', 'Metal', 'Plastik', 'Cam', 'Deri', 'Kumaş'],
                'Renk'    => ['Siyah', 'Beyaz', 'Gri', 'Kahverengi', 'Bej'],
            ],
            // Evcil Hayvan
            'animals-pet' => [
                'Yaş'    => ['Yavru', 'Genç', 'Yetişkin', 'Yaşlı'],
                'Boyut'  => ['Küçük', 'Orta', 'Büyük', 'Ekstra Büyük'],
                'Renk'   => ['Siyah', 'Beyaz', 'Kahverengi', 'Sarı', 'Gri'],
            ],
            // Balık
            'fish' => [
                'Ağırlık'       => ['1kg\'a kadar', '1-2kg', '2-5kg', '5kg üzeri'],
                'Ambalaj'       => ['Bütün Balık', 'Fileto', 'Dilimlendi', 'Dondurulmuş'],
                'Saklama'       => ['Buzdolabı', 'Dondurucuda', 'Serin Ortam'],
            ],
            // Bisiklet
            'cycling' => [
                'Kadro Boyu'   => ['XS (13")', 'S (15")', 'M (17")', 'L (19")', 'XL (21")'],
                'Tekerlek Boyu' => ['20"', '24"', '26"', '27.5"', '29"'],
                'Renk'          => ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Gri'],
            ],
            // Besin Takviyesi
            'supplements' => [
                'Tat/Aroma' => ['Çikolata', 'Vanilya', 'Çilek', 'Muz', 'Aromasız'],
                'Ağırlık'   => ['300g', '500g', '1kg', '1.5kg', '2kg', '2.5kg'],
            ],
            // Elektronik
            'electronics' => [
                'Renk'  => ['Siyah', 'Beyaz', 'Gümüş', 'Altın'],
                'Boyut' => ['Küçük', 'Orta', 'Büyük'],
            ],
        ];

        foreach ($sets as $storeType => $attributes) {
            foreach ($attributes as $attrName => $values) {
                $attr = ProductAttribute::firstOrCreate(
                    ['name' => $attrName, 'product_type' => $storeType],
                    [
                        'status'     => 1,
                        'created_by' => 1,
                        'updated_by' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );

                foreach ($values as $val) {
                    ProductAttributeValue::firstOrCreate(
                        ['attribute_id' => $attr->id, 'value' => $val],
                        ['created_at' => $now, 'updated_at' => $now]
                    );
                }
            }
        }

        $this->command->info('✅ SafeProductAttributeSeeder completed.');
    }
}
