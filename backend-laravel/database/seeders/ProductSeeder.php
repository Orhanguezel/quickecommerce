<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    private array $categoryMap = [];
    private array $brandMap = [];
    private array $storeMap = [];
    private array $unitMap = [];
    private array $tagMap = [];

    public function run(): void
    {
        $this->loadMaps();

        DB::transaction(function () {
            // Mevcut verileri temizle
            DB::table('translations')->where('translatable_type', 'App\\Models\\Product')->delete();
            DB::table('product_tags')->delete();
            DB::table('product_specifications')->delete();
            DB::table('product_variants')->delete();
            DB::table('products')->delete();

            $products = $this->getProducts();
            $count = 0;

            foreach ($products as $product) {
                $this->createProduct($product);
                $count++;
            }

            echo "Products seeded: {$count}\n";
        });
    }

    private function loadMaps(): void
    {
        // Categories
        foreach (DB::table('product_category')->get() as $cat) {
            $this->categoryMap[$cat->category_slug] = $cat->id;
        }

        // Brands
        foreach (DB::table('product_brand')->get() as $brand) {
            $this->brandMap[$brand->brand_slug] = $brand->id;
        }

        // Stores
        foreach (DB::table('stores')->get() as $store) {
            $this->storeMap[Str::slug($store->name)] = $store->id;
        }

        // Units
        foreach (DB::table('units')->get() as $unit) {
            $this->unitMap[Str::slug($unit->name)] = $unit->id;
        }

        // Tags
        foreach (DB::table('tags')->get() as $tag) {
            $this->tagMap[Str::slug($tag->name)] = $tag->id;
        }
    }

    private function getProducts(): array
    {
        return [
            // ============ SUPPLEMENT (Supplementler) ============
            [
                'tr' => ['name' => 'Whey Protein 3 Matrix 2300g', 'description' => 'Yüksek kaliteli whey protein karışımı. Kas gelişimi ve toparlanma için ideal. Her serviste 24g protein.'],
                'en' => ['name' => 'Whey Protein 3 Matrix 2300g', 'description' => 'High quality whey protein blend. Ideal for muscle growth and recovery. 24g protein per serving.'],
                'category' => 'proteinler',
                'brand' => 'hardline-nutrition',
                'store' => 'supplementler',
                'unit' => 'kilogram',
                'price' => 2500,
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600',
                'tags' => ['cok-satan', 'protein', 'fitness', 'kas-yapma'],
                'variants' => [
                    ['name' => 'Çikolata', 'sku' => 'HL-WM-CHO-2300', 'price' => 2500, 'stock' => 50],
                    ['name' => 'Vanilya', 'sku' => 'HL-WM-VAN-2300', 'price' => 2500, 'stock' => 40],
                    ['name' => 'Çilek', 'sku' => 'HL-WM-STR-2300', 'price' => 2500, 'stock' => 35],
                    ['name' => 'Muz', 'sku' => 'HL-WM-BAN-2300', 'price' => 2500, 'stock' => 30],
                ],
            ],
            [
                'tr' => ['name' => 'BCAA Fusion 500g', 'description' => 'Dallanmış zincirli amino asit karışımı. Kas onarımı ve dayanıklılık artışı için formüle edildi.'],
                'en' => ['name' => 'BCAA Fusion 500g', 'description' => 'Branched chain amino acid blend. Formulated for muscle repair and endurance.'],
                'category' => 'bcaa-aminoasitler',
                'brand' => 'hardline-nutrition',
                'store' => 'supplementler',
                'unit' => 'gram',
                'price' => 1200,
                'image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600',
                'tags' => ['bcaa', 'antrenman', 'dayaniklilik'],
                'variants' => [
                    ['name' => 'Limon', 'sku' => 'HL-BCAA-LEM-500', 'price' => 1200, 'stock' => 60],
                    ['name' => 'Karpuz', 'sku' => 'HL-BCAA-WAT-500', 'price' => 1200, 'stock' => 50],
                    ['name' => 'Portakal', 'sku' => 'HL-BCAA-ORA-500', 'price' => 1200, 'stock' => 45],
                ],
            ],
            [
                'tr' => ['name' => 'Creatine Monohydrate 500g', 'description' => 'Saf kreatin monohidrat. Güç, performans ve kas hacmi artışı için.'],
                'en' => ['name' => 'Creatine Monohydrate 500g', 'description' => 'Pure creatine monohydrate. For strength, performance and muscle volume.'],
                'category' => 'kreatin',
                'brand' => 'olimp',
                'store' => 'supplementler',
                'unit' => 'gram',
                'price' => 900,
                'image' => 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600',
                'tags' => ['kreatin', 'guc', 'kas-yapma'],
                'variants' => [
                    ['name' => 'Aromasız', 'sku' => 'OL-CRE-500', 'price' => 900, 'stock' => 80],
                ],
            ],
            [
                'tr' => ['name' => 'Pre-Workout Explosive 300g', 'description' => 'Antrenman öncesi enerji patlaması. Kafein, beta-alanin ve sitrülin malat içerir.'],
                'en' => ['name' => 'Pre-Workout Explosive 300g', 'description' => 'Pre-workout energy explosion. Contains caffeine, beta-alanine and citrulline malate.'],
                'category' => 'pre-workout',
                'brand' => 'bigjoy',
                'store' => 'supplementler',
                'unit' => 'gram',
                'price' => 800,
                'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
                'tags' => ['pre-workout', 'antrenman', 'fitness'],
                'variants' => [
                    ['name' => 'Meyve Punch', 'sku' => 'BJ-PRE-FP-300', 'price' => 800, 'stock' => 45],
                    ['name' => 'Mavi Ahududu', 'sku' => 'BJ-PRE-BR-300', 'price' => 800, 'stock' => 40],
                ],
            ],
            [
                'tr' => ['name' => 'Omega-3 Fish Oil 120 Kapsül', 'description' => 'Yüksek EPA ve DHA içerikli moleküler damıtılmış balık yağı.'],
                'en' => ['name' => 'Omega-3 Fish Oil 120 Capsules', 'description' => 'Molecularly distilled fish oil with high EPA and DHA content.'],
                'category' => 'vitamin-mineraller',
                'brand' => 'solgar',
                'store' => 'supplementler',
                'unit' => 'kapsul',
                'price' => 550,
                'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
                'tags' => ['vitamin', 'mineral', 'premium'],
                'variants' => [
                    ['name' => '120 Kapsül', 'sku' => 'SL-OM3-120', 'price' => 550, 'stock' => 70],
                ],
            ],

            // ============ FITNESS (Decathlon) ============
            [
                'tr' => ['name' => 'Ayarlanabilir Dambıl Seti 24kg', 'description' => 'Hızlı ağırlık değişimi sistemi. by 2.5kg-24kg arası ayarlanabilir.'],
                'en' => ['name' => 'Adjustable Dumbbell Set 24kg', 'description' => 'Quick weight change system. Adjustable from 2.5kg to 24kg.'],
                'category' => 'agirliklar-dambillar',
                'brand' => 'body-solid',
                'store' => 'decathlon',
                'unit' => 'set',
                'price' => 5000,
                'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
                'tags' => ['fitness', 'agirlik-antrenmani', 'ev-tipi'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'BS-AD24-BLK', 'price' => 5000, 'stock' => 20],
                ],
            ],
            [
                'tr' => ['name' => 'Kettlebell Set 4-8-12-16kg', 'description' => 'Döküm demir kettlebell seti. Vinyl kaplama, kaymaz taban.'],
                'en' => ['name' => 'Kettlebell Set 4-8-12-16kg', 'description' => 'Cast iron kettlebell set. Vinyl coated, non-slip base.'],
                'category' => 'agirliklar-dambillar',
                'brand' => 'body-solid',
                'store' => 'decathlon',
                'unit' => 'set',
                'price' => 3000,
                'image' => 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600',
                'tags' => ['fitness', 'antrenman', 'crossfit'],
                'variants' => [
                    ['name' => 'Set', 'sku' => 'BS-KB-SET4', 'price' => 3000, 'stock' => 15],
                ],
            ],
            [
                'tr' => ['name' => 'Yoga Matı Premium 8mm', 'description' => 'Ekstra kalın, çift taraflı kaymaz yüzey. TPE malzeme, çevre dostu.'],
                'en' => ['name' => 'Premium Yoga Mat 8mm', 'description' => 'Extra thick, double-sided non-slip surface. TPE material, eco-friendly.'],
                'category' => 'yoga-pilates',
                'brand' => 'decathlon',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 400,
                'image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
                'tags' => ['yoga', 'pilates', 'esneme'],
                'variants' => [
                    ['name' => 'Mor', 'sku' => 'DC-YM8-PUR', 'price' => 400, 'stock' => 60],
                    ['name' => 'Mavi', 'sku' => 'DC-YM8-BLU', 'price' => 400, 'stock' => 55],
                    ['name' => 'Siyah', 'sku' => 'DC-YM8-BLK', 'price' => 400, 'stock' => 50],
                ],
            ],
            [
                'tr' => ['name' => 'Direnç Bandı Pro Set', 'description' => '5 farklı direnç seviyesi. Kapı aparatı ve taşıma çantası dahil.'],
                'en' => ['name' => 'Resistance Band Pro Set', 'description' => '5 different resistance levels. Door anchor and carrying bag included.'],
                'category' => 'fitness-aksesuarlari',
                'brand' => 'decathlon',
                'store' => 'decathlon',
                'unit' => 'set',
                'price' => 350,
                'image' => 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600',
                'tags' => ['fitness', 'direnc-bandi', 'ev-tipi'],
                'variants' => [
                    ['name' => 'Set', 'sku' => 'DC-RB-PRO', 'price' => 350, 'stock' => 80],
                ],
            ],
            [
                'tr' => ['name' => 'Atlama İpi Speed Rope', 'description' => 'Çelik tel, hızlı dönüş için bilyalı rulman sistemi.'],
                'en' => ['name' => 'Speed Jump Rope', 'description' => 'Steel cable, ball bearing system for fast rotation.'],
                'category' => 'fitness-aksesuarlari',
                'brand' => 'decathlon',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 150,
                'image' => 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600',
                'tags' => ['kardiyo', 'crossfit', 'antrenman'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'DC-SR-BLK', 'price' => 150, 'stock' => 100],
                ],
            ],

            // ============ OUTDOOR (Kutupayısı) ============
            [
                'tr' => ['name' => 'Kamp Çadırı 4 Kişilik Pro', 'description' => '3000mm su sütunu, çift katmanlı, fiberglas çubuklar. Kolay kurulum.'],
                'en' => ['name' => 'Pro 4 Person Camping Tent', 'description' => '3000mm water column, double layer, fiberglass poles. Easy setup.'],
                'category' => 'cadirlar',
                'brand' => 'quechua',
                'store' => 'kutupayisi',
                'unit' => 'adet',
                'price' => 3500,
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
                'tags' => ['kamp', 'outdoor', 'su-gecirmez'],
                'variants' => [
                    ['name' => 'Yeşil', 'sku' => 'QC-T4P-GRN', 'price' => 3500, 'stock' => 20],
                    ['name' => 'Turuncu', 'sku' => 'QC-T4P-ORA', 'price' => 3500, 'stock' => 15],
                ],
            ],
            [
                'tr' => ['name' => 'Uyku Tulumu -15°C Extreme', 'description' => '-15°C konfor sıcaklığı. Mumya tipi, su geçirmez dış yüzey.'],
                'en' => ['name' => 'Extreme Sleeping Bag -15°C', 'description' => '-15°C comfort temperature. Mummy type, waterproof outer surface.'],
                'category' => 'uyku-tulumlari',
                'brand' => 'coleman',
                'store' => 'kutupayisi',
                'unit' => 'adet',
                'price' => 1900,
                'image' => 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600',
                'tags' => ['kamp', 'kis-sezonu', 'dagcilik'],
                'variants' => [
                    ['name' => 'Lacivert', 'sku' => 'CL-SB15-NVY', 'price' => 1900, 'stock' => 25],
                ],
            ],
            [
                'tr' => ['name' => 'Termos Classic 1.4L', 'description' => 'Efsanevi Stanley termosu. 40 saat sıcak, 45 saat soğuk tutma.'],
                'en' => ['name' => 'Classic Thermos 1.4L', 'description' => 'Legendary Stanley thermos. 40 hours hot, 45 hours cold retention.'],
                'category' => 'mataralar-termoslar',
                'brand' => 'stanley',
                'store' => 'kutupayisi',
                'unit' => 'adet',
                'price' => 1300,
                'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
                'tags' => ['outdoor', 'kamp', 'premium'],
                'variants' => [
                    ['name' => 'Hammertone Green', 'sku' => 'ST-CL14-GRN', 'price' => 1300, 'stock' => 40],
                    ['name' => 'Matte Black', 'sku' => 'ST-CL14-BLK', 'price' => 1300, 'stock' => 35],
                ],
            ],
            [
                'tr' => ['name' => 'Hiking Sırt Çantası 50L', 'description' => 'Ergonomik sırt sistemi, yağmur kılıfı dahil. Nefes alan arka panel.'],
                'en' => ['name' => 'Hiking Backpack 50L', 'description' => 'Ergonomic back system, rain cover included. Breathable back panel.'],
                'category' => 'sirt-cantalari',
                'brand' => 'osprey',
                'store' => 'kutupayisi',
                'unit' => 'adet',
                'price' => 3300,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
                'tags' => ['outdoor', 'dagcilik', 'ergonomik'],
                'variants' => [
                    ['name' => 'Yeşil', 'sku' => 'OS-HK50-GRN', 'price' => 3300, 'stock' => 18],
                    ['name' => 'Mavi', 'sku' => 'OS-HK50-BLU', 'price' => 3300, 'stock' => 15],
                ],
            ],
            [
                'tr' => ['name' => 'Kamp Sandalyesi Katlanır', 'description' => 'Alüminyum iskelet, 120kg kapasite. Taşıma çantası dahil.'],
                'en' => ['name' => 'Folding Camp Chair', 'description' => 'Aluminum frame, 120kg capacity. Carrying bag included.'],
                'category' => 'kamp-aksesuarlari',
                'brand' => 'coleman',
                'store' => 'kutupayisi',
                'unit' => 'adet',
                'price' => 450,
                'image' => 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600',
                'tags' => ['kamp', 'outdoor', 'aksesuarlar'],
                'variants' => [
                    ['name' => 'Mavi', 'sku' => 'CL-CC-BLU', 'price' => 450, 'stock' => 50],
                    ['name' => 'Yeşil', 'sku' => 'CL-CC-GRN', 'price' => 450, 'stock' => 45],
                ],
            ],

            // ============ TAKIM SPORLARI (Intersport) ============
            [
                'tr' => ['name' => 'Futbol Topu Flight Pro', 'description' => 'FIFA Quality Pro onaylı. Aerow Trac olukları, ACC teknolojisi.'],
                'en' => ['name' => 'Flight Pro Football', 'description' => 'FIFA Quality Pro approved. Aerow Trac grooves, ACC technology.'],
                'category' => 'futbol',
                'brand' => 'nike',
                'store' => 'intersport',
                'unit' => 'adet',
                'price' => 1300,
                'image' => 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600',
                'tags' => ['futbol', 'profesyonel', 'orijinal'],
                'variants' => [
                    ['name' => 'Beyaz/Siyah', 'sku' => 'NK-FLP-WB', 'price' => 1300, 'stock' => 30],
                ],
            ],
            [
                'tr' => ['name' => 'Basketbol Topu TF-1000 Legacy', 'description' => 'FIBA onaylı, ZK microfiber kompozit deri.'],
                'en' => ['name' => 'Basketball TF-1000 Legacy', 'description' => 'FIBA approved, ZK microfiber composite leather.'],
                'category' => 'basketbol',
                'brand' => 'spalding',
                'store' => 'intersport',
                'unit' => 'adet',
                'price' => 1200,
                'image' => 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600',
                'tags' => ['basketbol', 'profesyonel', 'indoor'],
                'variants' => [
                    ['name' => '7 Numara', 'sku' => 'SP-TF1000-7', 'price' => 1200, 'stock' => 25],
                ],
            ],
            [
                'tr' => ['name' => 'Tenis Raketi Pure Aero', 'description' => 'Profesyonel performans raketi. 300g, 100 sq.in.'],
                'en' => ['name' => 'Pure Aero Tennis Racket', 'description' => 'Professional performance racket. 300g, 100 sq.in.'],
                'category' => 'tenis',
                'brand' => 'babolat',
                'store' => 'intersport',
                'unit' => 'adet',
                'price' => 4500,
                'image' => 'https://images.unsplash.com/photo-1617083934555-ac7d4c10cd50?w=600',
                'tags' => ['tenis', 'profesyonel', 'ileri-seviye'],
                'variants' => [
                    ['name' => 'Grip 2', 'sku' => 'BB-PA-G2', 'price' => 4500, 'stock' => 12],
                    ['name' => 'Grip 3', 'sku' => 'BB-PA-G3', 'price' => 4500, 'stock' => 10],
                ],
            ],
            [
                'tr' => ['name' => 'Yüzücü Gözlüğü Fastskin', 'description' => 'Yarış gözlüğü. Anti-fog, UV koruma, düşük profil.'],
                'en' => ['name' => 'Fastskin Swimming Goggles', 'description' => 'Racing goggles. Anti-fog, UV protection, low profile.'],
                'category' => 'yuzucu-gozlugu',
                'brand' => 'speedo',
                'store' => 'intersport',
                'unit' => 'adet',
                'price' => 600,
                'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
                'tags' => ['yuzme', 'profesyonel', 'yaris'],
                'variants' => [
                    ['name' => 'Siyah/Smoke', 'sku' => 'SP-FS-BLK', 'price' => 600, 'stock' => 40],
                    ['name' => 'Mavi/Mavi', 'sku' => 'SP-FS-BLU', 'price' => 600, 'stock' => 35],
                ],
            ],
            [
                'tr' => ['name' => 'Boks Eldiveni Pro 14oz', 'description' => 'Premium hakiki deri. Çok katmanlı köpük, bilek desteği.'],
                'en' => ['name' => 'Pro Boxing Gloves 14oz', 'description' => 'Premium genuine leather. Multi-layer foam, wrist support.'],
                'category' => 'boks',
                'brand' => 'everlast',
                'store' => 'intersport',
                'unit' => 'cift',
                'price' => 1300,
                'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600',
                'tags' => ['boks', 'mma', 'profesyonel'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'EV-BP14-BLK', 'price' => 1300, 'stock' => 20],
                    ['name' => 'Kırmızı', 'sku' => 'EV-BP14-RED', 'price' => 1300, 'stock' => 18],
                ],
            ],

            // ============ GİYİM & AYAKKABI (Decathlon) ============
            [
                'tr' => ['name' => 'Air Max 270 React', 'description' => 'React köpük ve Air Max birimi. Tüm gün konfor için tasarlandı.'],
                'en' => ['name' => 'Air Max 270 React', 'description' => 'React foam and Air Max unit. Designed for all-day comfort.'],
                'category' => 'spor-ayakkabi',
                'brand' => 'nike',
                'store' => 'decathlon',
                'unit' => 'cift',
                'price' => 4000,
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
                'tags' => ['kosu', 'gunluk-kullanim', 'erkek'],
                'variants' => [
                    ['name' => 'Siyah - 41', 'sku' => 'NK-AM270R-41', 'price' => 4000, 'stock' => 8],
                    ['name' => 'Siyah - 42', 'sku' => 'NK-AM270R-42', 'price' => 4000, 'stock' => 10],
                    ['name' => 'Siyah - 43', 'sku' => 'NK-AM270R-43', 'price' => 4000, 'stock' => 12],
                    ['name' => 'Beyaz - 42', 'sku' => 'NK-AM270RW-42', 'price' => 4000, 'stock' => 8],
                ],
            ],
            [
                'tr' => ['name' => 'Ultraboost 23 Light', 'description' => 'Light Boost yastıklama. Primeknit üst, Continental kauçuk taban.'],
                'en' => ['name' => 'Ultraboost 23 Light', 'description' => 'Light Boost cushioning. Primeknit upper, Continental rubber outsole.'],
                'category' => 'spor-ayakkabi',
                'brand' => 'adidas',
                'store' => 'decathlon',
                'unit' => 'cift',
                'price' => 4800,
                'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
                'tags' => ['kosu', 'premium', 'unisex'],
                'variants' => [
                    ['name' => 'Core Black - 41', 'sku' => 'AD-UB23L-41', 'price' => 4800, 'stock' => 6],
                    ['name' => 'Core Black - 42', 'sku' => 'AD-UB23L-42', 'price' => 4800, 'stock' => 8],
                    ['name' => 'Cloud White - 42', 'sku' => 'AD-UB23LW-42', 'price' => 4800, 'stock' => 6],
                ],
            ],
            [
                'tr' => ['name' => 'Dri-FIT Running T-Shirt', 'description' => 'Hafif Dri-FIT kumaş. Nefes alan örgü paneller.'],
                'en' => ['name' => 'Dri-FIT Running T-Shirt', 'description' => 'Lightweight Dri-FIT fabric. Breathable mesh panels.'],
                'category' => 'erkek-giyim',
                'brand' => 'nike',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 700,
                'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
                'tags' => ['kosu', 'erkek', 'nefes-alabilir'],
                'variants' => [
                    ['name' => 'Siyah - S', 'sku' => 'NK-DFRT-S', 'price' => 700, 'stock' => 25],
                    ['name' => 'Siyah - M', 'sku' => 'NK-DFRT-M', 'price' => 700, 'stock' => 35],
                    ['name' => 'Siyah - L', 'sku' => 'NK-DFRT-L', 'price' => 700, 'stock' => 30],
                    ['name' => 'Beyaz - M', 'sku' => 'NK-DFRTW-M', 'price' => 700, 'stock' => 25],
                ],
            ],
            [
                'tr' => ['name' => 'Essentials Fleece Hoodie', 'description' => 'Yumuşak pamuklu polar. Kanguru cep, ayarlanabilir kapüşon.'],
                'en' => ['name' => 'Essentials Fleece Hoodie', 'description' => 'Soft cotton fleece. Kangaroo pocket, adjustable hood.'],
                'category' => 'erkek-giyim',
                'brand' => 'adidas',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 1300,
                'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
                'tags' => ['gunluk-kullanim', 'erkek', 'sonbahar'],
                'variants' => [
                    ['name' => 'Siyah - M', 'sku' => 'AD-EFH-M', 'price' => 1300, 'stock' => 20],
                    ['name' => 'Siyah - L', 'sku' => 'AD-EFH-L', 'price' => 1300, 'stock' => 22],
                    ['name' => 'Gri - L', 'sku' => 'AD-EFHG-L', 'price' => 1300, 'stock' => 18],
                ],
            ],
            [
                'tr' => ['name' => 'Training Tayt Kadın', 'description' => 'Yüksek bel, sıkıştırma teknolojisi. Cepli.'],
                'en' => ['name' => 'Women Training Leggings', 'description' => 'High waist, compression technology. With pockets.'],
                'category' => 'kadin-giyim',
                'brand' => 'nike',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 900,
                'image' => 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
                'tags' => ['fitness', 'kadin', 'antrenman'],
                'variants' => [
                    ['name' => 'Siyah - S', 'sku' => 'NK-TTK-S', 'price' => 900, 'stock' => 20],
                    ['name' => 'Siyah - M', 'sku' => 'NK-TTK-M', 'price' => 900, 'stock' => 25],
                    ['name' => 'Mor - M', 'sku' => 'NK-TTKP-M', 'price' => 900, 'stock' => 18],
                ],
            ],

            // ============ ELEKTRONİK (Decathlon) ============
            [
                'tr' => ['name' => 'Forerunner 265 GPS', 'description' => 'AMOLED ekran, 13 gün pil ömrü. Koşu dinamikleri, harita.'],
                'en' => ['name' => 'Forerunner 265 GPS', 'description' => 'AMOLED display, 13-day battery life. Running dynamics, maps.'],
                'category' => 'akilli-saatler',
                'brand' => 'garmin',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 13000,
                'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
                'tags' => ['akilli-cihaz', 'kosu', 'premium'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'GR-FR265-BLK', 'price' => 13000, 'stock' => 15],
                    ['name' => 'Beyaz', 'sku' => 'GR-FR265-WHT', 'price' => 13000, 'stock' => 12],
                ],
            ],
            [
                'tr' => ['name' => 'HERO12 Black Creator Edition', 'description' => '5.3K60 video, HyperSmooth 6.0. Mod, ışık, batarya dahil.'],
                'en' => ['name' => 'HERO12 Black Creator Edition', 'description' => '5.3K60 video, HyperSmooth 6.0. Mod, light, battery included.'],
                'category' => 'aksiyon-kameralari',
                'brand' => 'gopro',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 16000,
                'image' => 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600',
                'tags' => ['elektronik', 'profesyonel', 'outdoor'],
                'variants' => [
                    ['name' => 'Creator Edition', 'sku' => 'GP-H12-CE', 'price' => 16000, 'stock' => 10],
                ],
            ],
            [
                'tr' => ['name' => 'Endurance Peak 3 TWS', 'description' => 'IP68, 50 saat toplam pil. Powerhook tasarım, dual connect.'],
                'en' => ['name' => 'Endurance Peak 3 TWS', 'description' => 'IP68, 50 hours total battery. Powerhook design, dual connect.'],
                'category' => 'spor-kulakliklari',
                'brand' => 'jbl',
                'store' => 'decathlon',
                'unit' => 'adet',
                'price' => 3300,
                'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
                'tags' => ['elektronik', 'su-gecirmez', 'fitness'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'JBL-EP3-BLK', 'price' => 3300, 'stock' => 30],
                    ['name' => 'Mavi', 'sku' => 'JBL-EP3-BLU', 'price' => 3300, 'stock' => 25],
                ],
            ],

            // ============ ÇANTA & AKSESUAR (Intersport) ============
            [
                'tr' => ['name' => 'Brasilia XL Duffel', 'description' => '60L kapasite. Su geçirmez taban, ayakkabı bölmesi.'],
                'en' => ['name' => 'Brasilia XL Duffel', 'description' => '60L capacity. Waterproof base, shoe compartment.'],
                'category' => 'spor-cantalari',
                'brand' => 'nike',
                'store' => 'intersport',
                'unit' => 'adet',
                'price' => 1200,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
                'tags' => ['aksesuarlar', 'dayanikli', 'fitness'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'NK-BRXL-BLK', 'price' => 1200, 'stock' => 35],
                ],
            ],
            [
                'tr' => ['name' => 'Holbrook XL Güneş Gözlüğü', 'description' => 'Prizm lens teknolojisi. O Matter çerçeve, 3 nokta fit.'],
                'en' => ['name' => 'Holbrook XL Sunglasses', 'description' => 'Prizm lens technology. O Matter frame, 3-point fit.'],
                'category' => 'gozlukler',
                'brand' => 'oakley',
                'store' => 'intersport',
                'unit' => 'adet',
                'price' => 2500,
                'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
                'tags' => ['aksesuarlar', 'uv-korumali', 'outdoor'],
                'variants' => [
                    ['name' => 'Matte Black/Prizm Sapphire', 'sku' => 'OK-HBXL-BPS', 'price' => 2500, 'stock' => 20],
                ],
            ],

            // ============ KADIN FİTNESS GİYİM (Superstacy) ============
            [
                'tr' => ['name' => 'High Waist Spor Tayt', 'description' => 'Yüksek bel, şekillendirici kesim. Squat-proof kumaş, 4 yönlü esneklik. Hareket özgürlüğü için tasarlandı.'],
                'en' => ['name' => 'High Waist Sports Leggings', 'description' => 'High waist, shaping cut. Squat-proof fabric, 4-way stretch. Designed for freedom of movement.'],
                'category' => 'kadin-giyim',
                'brand' => null,
                'store' => 'superstacy',
                'unit' => 'adet',
                'price' => 599,
                'image' => 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600',
                'tags' => ['fitness', 'kadin', 'antrenman'],
                'variants' => [
                    ['name' => 'Siyah - XS', 'sku' => 'SS-HWT-XS', 'price' => 599, 'stock' => 30],
                    ['name' => 'Siyah - S', 'sku' => 'SS-HWT-S', 'price' => 599, 'stock' => 40],
                    ['name' => 'Siyah - M', 'sku' => 'SS-HWT-M', 'price' => 599, 'stock' => 45],
                    ['name' => 'Siyah - L', 'sku' => 'SS-HWT-L', 'price' => 599, 'stock' => 35],
                ],
            ],
            [
                'tr' => ['name' => 'Seamless Spor Büstiyer', 'description' => 'Dikişsiz tasarım, orta destek. Nefes alabilir kumaş, çıkarılabilir pedler.'],
                'en' => ['name' => 'Seamless Sports Bra', 'description' => 'Seamless design, medium support. Breathable fabric, removable pads.'],
                'category' => 'kadin-giyim',
                'brand' => null,
                'store' => 'superstacy',
                'unit' => 'adet',
                'price' => 399,
                'image' => 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600',
                'tags' => ['fitness', 'kadin', 'antrenman'],
                'variants' => [
                    ['name' => 'Siyah - S', 'sku' => 'SS-SB-S', 'price' => 399, 'stock' => 50],
                    ['name' => 'Siyah - M', 'sku' => 'SS-SB-M', 'price' => 399, 'stock' => 55],
                    ['name' => 'Pudra - M', 'sku' => 'SS-SBP-M', 'price' => 399, 'stock' => 40],
                ],
            ],
            [
                'tr' => ['name' => 'Crop Top Antrenman Tişört', 'description' => 'Kısa kesim, rahat fit. Hafif ve nefes alabilir kumaş. Yoga ve pilates için ideal.'],
                'en' => ['name' => 'Crop Top Training T-Shirt', 'description' => 'Cropped cut, relaxed fit. Lightweight and breathable fabric. Ideal for yoga and pilates.'],
                'category' => 'kadin-giyim',
                'brand' => null,
                'store' => 'superstacy',
                'unit' => 'adet',
                'price' => 299,
                'image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
                'tags' => ['fitness', 'kadin', 'yoga'],
                'variants' => [
                    ['name' => 'Beyaz - S', 'sku' => 'SS-CT-WS', 'price' => 299, 'stock' => 35],
                    ['name' => 'Beyaz - M', 'sku' => 'SS-CT-WM', 'price' => 299, 'stock' => 40],
                    ['name' => 'Gri - M', 'sku' => 'SS-CT-GM', 'price' => 299, 'stock' => 30],
                ],
            ],
            [
                'tr' => ['name' => 'Yoga Seti 2\'li (Tayt + Büstiyer)', 'description' => 'Uyumlu renkler, premium kumaş kalitesi. Set olarak ekonomik fiyat avantajı.'],
                'en' => ['name' => 'Yoga Set 2-Piece (Leggings + Bra)', 'description' => 'Matching colors, premium fabric quality. Set price advantage.'],
                'category' => 'kadin-giyim',
                'brand' => null,
                'store' => 'superstacy',
                'unit' => 'set',
                'price' => 899,
                'image' => 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600',
                'tags' => ['fitness', 'kadin', 'yoga', 'premium'],
                'variants' => [
                    ['name' => 'Bordo Set - S', 'sku' => 'SS-YS-BS', 'price' => 899, 'stock' => 25],
                    ['name' => 'Bordo Set - M', 'sku' => 'SS-YS-BM', 'price' => 899, 'stock' => 30],
                    ['name' => 'Lacivert Set - M', 'sku' => 'SS-YS-NM', 'price' => 899, 'stock' => 25],
                ],
            ],

            // ============ KAMP EKİPMANLARI (Orcamp) ============
            [
                'tr' => ['name' => 'Extreme 4 Mevsim Çadır 3 Kişilik', 'description' => 'Alüminyum çubuklar, 4000mm su sütunu. Dört mevsim kullanım, çift katmanlı yapı.'],
                'en' => ['name' => 'Extreme 4 Season Tent 3 Person', 'description' => 'Aluminum poles, 4000mm water column. Four season use, double layer construction.'],
                'category' => 'cadirlar',
                'brand' => 'orcamp',
                'store' => 'orcamp',
                'unit' => 'adet',
                'price' => 4500,
                'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
                'tags' => ['kamp', 'outdoor', 'su-gecirmez'],
                'variants' => [
                    ['name' => 'Yeşil', 'sku' => 'OC-E4S3-GRN', 'price' => 4500, 'stock' => 15],
                    ['name' => 'Mavi', 'sku' => 'OC-E4S3-BLU', 'price' => 4500, 'stock' => 12],
                ],
            ],
            [
                'tr' => ['name' => 'Comfort Uyku Tulumu -20°C', 'description' => 'Ekstrem soğuk koşullar için. Sentetik dolgu, mumya tipi kesim. Kompresyon çantası dahil.'],
                'en' => ['name' => 'Comfort Sleeping Bag -20°C', 'description' => 'For extreme cold conditions. Synthetic fill, mummy cut. Compression bag included.'],
                'category' => 'uyku-tulumlari',
                'brand' => 'orcamp',
                'store' => 'orcamp',
                'unit' => 'adet',
                'price' => 2200,
                'image' => 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600',
                'tags' => ['kamp', 'kis-sezonu', 'dagcilik'],
                'variants' => [
                    ['name' => 'Turuncu', 'sku' => 'OC-CS20-ORA', 'price' => 2200, 'stock' => 20],
                    ['name' => 'Mavi', 'sku' => 'OC-CS20-BLU', 'price' => 2200, 'stock' => 18],
                ],
            ],
            [
                'tr' => ['name' => 'Kamp Ocağı Pro 3500W', 'description' => 'Piezo ateşleme, ayarlanabilir alev. Rüzgar kalkanı dahil. Kompakt tasarım.'],
                'en' => ['name' => 'Camp Stove Pro 3500W', 'description' => 'Piezo ignition, adjustable flame. Wind shield included. Compact design.'],
                'category' => 'kamp-aksesuarlari',
                'brand' => 'orcamp',
                'store' => 'orcamp',
                'unit' => 'adet',
                'price' => 650,
                'image' => 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600',
                'tags' => ['kamp', 'outdoor', 'aksesuarlar'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'OC-KO35-BLK', 'price' => 650, 'stock' => 40],
                ],
            ],
            [
                'tr' => ['name' => 'Şişme Mat Ultralight', 'description' => 'R-değeri 4.0, 5cm kalınlık. Ultra hafif, küçük paket hacmi. Self-inflating teknoloji.'],
                'en' => ['name' => 'Inflatable Mat Ultralight', 'description' => 'R-value 4.0, 5cm thickness. Ultra lightweight, small pack volume. Self-inflating technology.'],
                'category' => 'kamp-aksesuarlari',
                'brand' => 'orcamp',
                'store' => 'orcamp',
                'unit' => 'adet',
                'price' => 890,
                'image' => 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600',
                'tags' => ['kamp', 'outdoor', 'ergonomik'],
                'variants' => [
                    ['name' => 'Yeşil', 'sku' => 'OC-SMU-GRN', 'price' => 890, 'stock' => 35],
                ],
            ],
            [
                'tr' => ['name' => 'Kamp Lambası LED Şarjlı', 'description' => '3 aydınlatma modu, 10000mAh powerbank özelliği. IP65 su geçirmezlik.'],
                'en' => ['name' => 'LED Camping Lantern Rechargeable', 'description' => '3 lighting modes, 10000mAh powerbank feature. IP65 water resistance.'],
                'category' => 'kamp-aksesuarlari',
                'brand' => 'orcamp',
                'store' => 'orcamp',
                'unit' => 'adet',
                'price' => 450,
                'image' => 'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=600',
                'tags' => ['kamp', 'outdoor', 'elektronik'],
                'variants' => [
                    ['name' => 'Siyah', 'sku' => 'OC-KL-BLK', 'price' => 450, 'stock' => 50],
                ],
            ],

            // ============ KİTAPLAR (Spor Kitaplığı) ============
            [
                'tr' => ['name' => 'Koşmak İçin Doğduk', 'description' => 'Christopher McDougall\'ın bestseller eseri. Meksika\'nın Bakır Kanyonu\'ndaki Tarahumara yerlilerinin koşu kültürü ve yalın ayak koşunun evrimsel kökenlerini keşfedin.'],
                'en' => ['name' => 'Born to Run', 'description' => 'Christopher McDougall\'s bestseller. Discover the running culture of the Tarahumara people in Mexico\'s Copper Canyon and the evolutionary origins of barefoot running.'],
                'category' => 'spor-fitness-kitaplari',
                'brand' => null,
                'store' => 'spor-kitapligi',
                'unit' => 'adet',
                'price' => 180,
                'image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
                'tags' => ['kosu', 'fitness', 'premium'],
                'variants' => [
                    ['name' => 'Karton Kapak', 'sku' => 'BK-BTR-KK', 'price' => 180, 'stock' => 50],
                    ['name' => 'Ciltli', 'sku' => 'BK-BTR-CL', 'price' => 280, 'stock' => 25],
                ],
            ],
            [
                'tr' => ['name' => 'Vahşi Doğaya', 'description' => 'Jon Krakauer\'ın unutulmaz eseri. Christopher McCandless\'ın Alaska vahşi doğasındaki trajik hikayesi. Özgürlük ve doğa arayışının güçlü bir anlatımı.'],
                'en' => ['name' => 'Into the Wild', 'description' => 'Jon Krakauer\'s unforgettable work. The tragic story of Christopher McCandless in the Alaskan wilderness. A powerful narrative of the search for freedom and nature.'],
                'category' => 'outdoor-macera-kitaplari',
                'brand' => null,
                'store' => 'spor-kitapligi',
                'unit' => 'adet',
                'price' => 160,
                'image' => 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
                'tags' => ['outdoor', 'kamp', 'premium'],
                'variants' => [
                    ['name' => 'Karton Kapak', 'sku' => 'BK-ITW-KK', 'price' => 160, 'stock' => 60],
                ],
            ],
            [
                'tr' => ['name' => 'İnce Havaya Doğru', 'description' => 'Jon Krakauer\'ın 1996 Everest faciasını anlattığı nefes kesen eseri. Dağcılık tarihinin en trajik olaylarından birinin görgü tanığı anlatımı.'],
                'en' => ['name' => 'Into Thin Air', 'description' => 'Jon Krakauer\'s breathtaking account of the 1996 Everest disaster. An eyewitness account of one of the most tragic events in mountaineering history.'],
                'category' => 'dagcilik-tirmanis-kitaplari',
                'brand' => null,
                'store' => 'spor-kitapligi',
                'unit' => 'adet',
                'price' => 200,
                'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
                'tags' => ['dagcilik', 'outdoor', 'profesyonel'],
                'variants' => [
                    ['name' => 'Karton Kapak', 'sku' => 'BK-ITA-KK', 'price' => 200, 'stock' => 45],
                ],
            ],
            [
                'tr' => ['name' => 'Ultramarathon Man', 'description' => 'Dean Karnazes\'in inanılmaz hikayesi. 50 eyalette 50 günde 50 maraton koşan adamın dayanıklılık ve motivasyon dolu otobiyografisi.'],
                'en' => ['name' => 'Ultramarathon Man', 'description' => 'Dean Karnazes\' incredible story. The autobiography of the man who ran 50 marathons in 50 states in 50 days, full of endurance and motivation.'],
                'category' => 'spor-fitness-kitaplari',
                'brand' => null,
                'store' => 'spor-kitapligi',
                'unit' => 'adet',
                'price' => 170,
                'image' => 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600',
                'tags' => ['kosu', 'fitness', 'dayaniklilik'],
                'variants' => [
                    ['name' => 'Karton Kapak', 'sku' => 'BK-UMM-KK', 'price' => 170, 'stock' => 40],
                ],
            ],
            [
                'tr' => ['name' => 'Duvardaki Yalnızlık', 'description' => 'Alex Honnold\'un "Alone on the Wall" kitabı. El Capitan\'ı ipsiz tırmanan efsane dağcının korkusuz yolculuğu ve zihinsel hazırlık süreci.'],
                'en' => ['name' => 'Alone on the Wall', 'description' => 'Alex Honnold\'s book. The fearless journey of the legendary climber who free soloed El Capitan and his mental preparation process.'],
                'category' => 'dagcilik-tirmanis-kitaplari',
                'brand' => null,
                'store' => 'spor-kitapligi',
                'unit' => 'adet',
                'price' => 220,
                'image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600',
                'tags' => ['dagcilik', 'profesyonel', 'premium'],
                'variants' => [
                    ['name' => 'Karton Kapak', 'sku' => 'BK-AOW-KK', 'price' => 220, 'stock' => 35],
                    ['name' => 'Ciltli', 'sku' => 'BK-AOW-CL', 'price' => 320, 'stock' => 15],
                ],
            ],
            [
                'tr' => ['name' => 'Hayatta Kalma Rehberi', 'description' => 'Bear Grylls\'in kapsamlı hayatta kalma el kitabı. Doğada hayatta kalma teknikleri, acil durum becerileri ve pratik ipuçları.'],
                'en' => ['name' => 'Survival Guide', 'description' => 'Bear Grylls\' comprehensive survival handbook. Wilderness survival techniques, emergency skills and practical tips.'],
                'category' => 'outdoor-macera-kitaplari',
                'brand' => null,
                'store' => 'spor-kitapligi',
                'unit' => 'adet',
                'price' => 250,
                'image' => 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600',
                'tags' => ['outdoor', 'kamp', 'dagcilik'],
                'variants' => [
                    ['name' => 'Karton Kapak', 'sku' => 'BK-SRV-KK', 'price' => 250, 'stock' => 55],
                ],
            ],
        ];
    }

    private function createProduct(array $data): void
    {
        $categoryId = $this->categoryMap[$data['category']] ?? null;
        $brandId = $this->brandMap[$data['brand']] ?? null;
        $storeId = $this->storeMap[$data['store']] ?? array_values($this->storeMap)[0] ?? 1;
        $unitId = $this->unitMap[$data['unit']] ?? null;

        if (!$categoryId) {
            echo "Category not found: {$data['category']}\n";
            return;
        }

        $slug = Str::slug($data['tr']['name']);

        // Determine product type based on store/category
        $productType = $this->determineProductType($data['category']);

        $productId = DB::table('products')->insertGetId([
            'store_id' => $storeId,
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'unit_id' => $unitId,
            'type' => $productType,
            'behaviour' => 'physical',
            'name' => $data['tr']['name'],
            'slug' => $slug,
            'description' => $data['tr']['description'],
            'image' => $data['image'] ?? null,
            'status' => 'approved',
            'is_featured' => rand(0, 1),
            'cash_on_delivery' => 1,
            'max_cart_qty' => 10,
            'order_count' => rand(0, 100),
            'views' => rand(50, 500),
            'warranty' => rand(0, 1) ? json_encode([['warranty_period' => '2 Yıl']]) : null,
            'return_in_days' => 14,
            'meta_title' => $data['tr']['name'],
            'meta_description' => $data['tr']['description'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Get tag names for meta keywords
        $tagNamesTr = [];
        $tagNamesEn = [];
        if (isset($data['tags'])) {
            foreach ($data['tags'] as $tagSlug) {
                $tag = DB::table('tags')->where('id', $this->tagMap[$tagSlug] ?? 0)->first();
                if ($tag) {
                    $tagNamesTr[] = $tag->name;
                    $enTrans = DB::table('translations')
                        ->where('translatable_type', 'App\\Models\\Tag')
                        ->where('translatable_id', $tag->id)
                        ->where('language', 'en')
                        ->where('key', 'name')
                        ->first();
                    $tagNamesEn[] = $enTrans?->value ?? $tag->name;
                }
            }
        }

        // Translations
        $this->addProductTranslations($productId, 'df', $data['tr']['name'], $data['tr']['description'], $tagNamesTr, 'tr');
        $this->addProductTranslations($productId, 'tr', $data['tr']['name'], $data['tr']['description'], $tagNamesTr, 'tr');
        $this->addProductTranslations($productId, 'en', $data['en']['name'], $data['en']['description'], $tagNamesEn, 'en');

        // Tags
        if (isset($data['tags'])) {
            foreach ($data['tags'] as $tagSlug) {
                $tagId = $this->tagMap[$tagSlug] ?? null;
                if ($tagId) {
                    DB::table('product_tags')->insert([
                        'product_id' => $productId,
                        'tag_id' => $tagId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Variants
        foreach ($data['variants'] as $variant) {
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'variant_slug' => Str::slug($data['tr']['name'] . '-' . $variant['name']),
                'sku' => $variant['sku'],
                'price' => $variant['price'],
                'special_price' => rand(0, 1) ? round($variant['price'] * 0.9, 2) : null,
                'stock_quantity' => $variant['stock'],
                'attributes' => json_encode(['name' => $variant['name']]),
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function determineProductType(string $category): string
    {
        $typeMap = [
            // Supplements -> grocery (closest match)
            'proteinler' => 'grocery',
            'bcaa-aminoasitler' => 'grocery',
            'kreatin' => 'grocery',
            'pre-workout' => 'grocery',
            'vitamin-mineraller' => 'grocery',
            // Clothing & Footwear
            'erkek-giyim' => 'clothing',
            'kadin-giyim' => 'clothing',
            'cocuk-giyim' => 'clothing',
            'spor-ayakkabi' => 'clothing',
            // Fitness Equipment -> furniture (closest match)
            'agirliklar-dambillar' => 'furniture',
            'yoga-pilates' => 'furniture',
            'fitness-aksesuarlari' => 'furniture',
            // Outdoor & Camping
            'cadirlar' => 'furniture',
            'uyku-tulumlari' => 'furniture',
            'mataralar-termoslar' => 'bags',
            'sirt-cantalari' => 'bags',
            'kamp-aksesuarlari' => 'furniture',
            // Team Sports
            'futbol' => 'clothing',
            'basketbol' => 'clothing',
            'tenis' => 'clothing',
            'yuzucu-gozlugu' => 'clothing',
            'boks' => 'clothing',
            // Electronics
            'akilli-saatler' => 'gadgets',
            'aksiyon-kameralari' => 'gadgets',
            'spor-kulakliklari' => 'gadgets',
            // Bags & Accessories
            'spor-cantalari' => 'bags',
            'gozlukler' => 'bags',
            // Books
            'spor-fitness-kitaplari' => 'grocery',
            'outdoor-macera-kitaplari' => 'grocery',
            'dagcilik-tirmanis-kitaplari' => 'grocery',
            'beslenme-saglik-kitaplari' => 'grocery',
        ];

        return $typeMap[$category] ?? 'clothing';
    }

    private function addProductTranslations(int $productId, string $lang, string $name, string $description, array $tags = [], string $originalLang = 'tr'): void
    {
        // Return text based on language
        $returnText = $originalLang === 'tr'
            ? "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz. Ürün kullanılmamış, orijinal ambalajında ve etiketleri sökülmemiş olmalıdır. İade işlemi için müşteri hizmetlerimizle iletişime geçebilirsiniz."
            : "You can return the product within 14 days from the date of delivery. The product must be unused, in its original packaging, and with tags intact. Please contact our customer service for return process.";

        // Delivery time text
        $deliveryText = $originalLang === 'tr'
            ? "Siparişiniz 1-3 iş günü içinde kargoya verilir. Teslimat süresi bulunduğunuz bölgeye göre 2-5 iş günü arasında değişmektedir."
            : "Your order will be shipped within 1-3 business days. Delivery time varies between 2-5 business days depending on your location.";

        $translations = [
            ['key' => 'name', 'value' => $name],
            ['key' => 'description', 'value' => $description],
            ['key' => 'meta_title', 'value' => $name],
            ['key' => 'meta_description', 'value' => $description],
            ['key' => 'meta_keywords', 'value' => implode(', ', $tags)],
            ['key' => 'return_text', 'value' => $returnText],
            ['key' => 'delivery_time_text', 'value' => $deliveryText],
        ];

        foreach ($translations as $t) {
            DB::table('translations')->insert([
                'translatable_id' => $productId,
                'translatable_type' => 'App\\Models\\Product',
                'language' => $lang,
                'key' => $t['key'],
                'value' => $t['value'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
