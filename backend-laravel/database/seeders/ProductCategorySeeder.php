<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // ============ GİYİM & AYAKKABI ============
            [
                'slug' => 'giyim-ve-ayakkabi',
                'type' => 'clothing',
                'parent_id' => null,
                'level' => 1,
                'order' => 1,
                'image' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
                'tr' => ['name' => 'Giyim ve Ayakkabı', 'meta_title' => 'Giyim ve Ayakkabı', 'meta_description' => 'Kadın, erkek ve çocuklar için spor giyim ve ayakkabı ürünleri'],
                'en' => ['name' => 'Clothing and Footwear', 'meta_title' => 'Clothing and Footwear', 'meta_description' => 'Sports clothing and footwear for women, men and children'],
                'children' => [
                    ['slug' => 'kadin-giyim', 'image' => 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400', 'tr' => ['name' => 'Kadın Giyim'], 'en' => ['name' => 'Women Clothing']],
                    ['slug' => 'erkek-giyim', 'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400', 'tr' => ['name' => 'Erkek Giyim'], 'en' => ['name' => 'Men Clothing']],
                    ['slug' => 'cocuk-giyim', 'image' => 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', 'tr' => ['name' => 'Çocuk Giyim'], 'en' => ['name' => 'Kids Clothing']],
                    ['slug' => 'spor-ayakkabi', 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'tr' => ['name' => 'Spor Ayakkabı'], 'en' => ['name' => 'Sports Shoes']],
                    ['slug' => 'kosu-ayakkabisi', 'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'tr' => ['name' => 'Koşu Ayakkabısı'], 'en' => ['name' => 'Running Shoes']],
                    ['slug' => 'outdoor-bot', 'image' => 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=400', 'tr' => ['name' => 'Outdoor Bot'], 'en' => ['name' => 'Outdoor Boots']],
                ],
            ],

            // ============ KAMP & OUTDOOR ============
            [
                'slug' => 'kamp-ve-outdoor',
                'type' => 'outdoor',
                'parent_id' => null,
                'level' => 1,
                'order' => 2,
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
                'tr' => ['name' => 'Kamp ve Outdoor', 'meta_title' => 'Kamp ve Outdoor Ürünleri', 'meta_description' => 'Kamp, doğa ve outdoor ekipmanları'],
                'en' => ['name' => 'Camping and Outdoor', 'meta_title' => 'Camping and Outdoor Products', 'meta_description' => 'Camping, nature and outdoor equipment'],
                'children' => [
                    ['slug' => 'cadirlar', 'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400', 'tr' => ['name' => 'Çadırlar'], 'en' => ['name' => 'Tents']],
                    ['slug' => 'uyku-tulumlari', 'image' => 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400', 'tr' => ['name' => 'Uyku Tulumları'], 'en' => ['name' => 'Sleeping Bags']],
                    ['slug' => 'kamp-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400', 'tr' => ['name' => 'Kamp Aksesuarları'], 'en' => ['name' => 'Camping Accessories']],
                    ['slug' => 'mataralar-termoslar', 'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'tr' => ['name' => 'Mataralar ve Termoslar'], 'en' => ['name' => 'Bottles and Thermoses']],
                    ['slug' => 'trekking-malzemeleri', 'image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', 'tr' => ['name' => 'Trekking Malzemeleri'], 'en' => ['name' => 'Trekking Gear']],
                    ['slug' => 'outdoor-giyim', 'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', 'tr' => ['name' => 'Outdoor Giyim'], 'en' => ['name' => 'Outdoor Clothing']],
                ],
            ],

            // ============ BESİN TAKVİYELERİ ============
            [
                'slug' => 'besin-takviyeleri',
                'type' => 'supplements',
                'parent_id' => null,
                'level' => 1,
                'order' => 3,
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
                'tr' => ['name' => 'Besin Takviyeleri', 'meta_title' => 'Besin Takviyeleri', 'meta_description' => 'Vitamin, mineral ve sporcu takviyeleri'],
                'en' => ['name' => 'Supplements', 'meta_title' => 'Supplements', 'meta_description' => 'Vitamins, minerals and sports supplements'],
                'children' => [
                    ['slug' => 'proteinler', 'image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400', 'tr' => ['name' => 'Proteinler'], 'en' => ['name' => 'Proteins']],
                    ['slug' => 'bcaa-aminoasitler', 'image' => 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', 'tr' => ['name' => 'BCAA ve Aminoasitler'], 'en' => ['name' => 'BCAA and Amino Acids']],
                    ['slug' => 'kreatin', 'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', 'tr' => ['name' => 'Kreatin'], 'en' => ['name' => 'Creatine']],
                    ['slug' => 'vitamin-mineraller', 'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 'tr' => ['name' => 'Vitamin ve Mineraller'], 'en' => ['name' => 'Vitamins and Minerals']],
                    ['slug' => 'kilo-alma', 'image' => 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400', 'tr' => ['name' => 'Kilo Alma'], 'en' => ['name' => 'Weight Gain']],
                    ['slug' => 'kilo-verme', 'image' => 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400', 'tr' => ['name' => 'Kilo Verme'], 'en' => ['name' => 'Weight Loss']],
                    ['slug' => 'pre-workout', 'image' => 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400', 'tr' => ['name' => 'Pre-Workout'], 'en' => ['name' => 'Pre-Workout']],
                    ['slug' => 'sporcu-gidalari', 'image' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', 'tr' => ['name' => 'Sporcu Gıdaları'], 'en' => ['name' => 'Sports Nutrition']],
                ],
            ],

            // ============ FİTNESS EKİPMANLARI ============
            [
                'slug' => 'fitness-ekipmanlari',
                'type' => 'fitness',
                'parent_id' => null,
                'level' => 1,
                'order' => 4,
                'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
                'tr' => ['name' => 'Fitness Ekipmanları', 'meta_title' => 'Fitness Ekipmanları', 'meta_description' => 'Ev ve profesyonel fitness ekipmanları'],
                'en' => ['name' => 'Fitness Equipment', 'meta_title' => 'Fitness Equipment', 'meta_description' => 'Home and professional fitness equipment'],
                'children' => [
                    ['slug' => 'agirliklar-dambillar', 'image' => 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400', 'tr' => ['name' => 'Ağırlıklar ve Dambıllar'], 'en' => ['name' => 'Weights and Dumbbells']],
                    ['slug' => 'kardiyo-ekipmanlari', 'image' => 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400', 'tr' => ['name' => 'Kardiyo Ekipmanları'], 'en' => ['name' => 'Cardio Equipment']],
                    ['slug' => 'yoga-pilates', 'image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'tr' => ['name' => 'Yoga ve Pilates'], 'en' => ['name' => 'Yoga and Pilates']],
                    ['slug' => 'fitness-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 'tr' => ['name' => 'Fitness Aksesuarları'], 'en' => ['name' => 'Fitness Accessories']],
                    ['slug' => 'kettlebell', 'image' => 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=400', 'tr' => ['name' => 'Kettlebell'], 'en' => ['name' => 'Kettlebell']],
                    ['slug' => 'direnc-bantlari', 'image' => 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400', 'tr' => ['name' => 'Direnç Bantları'], 'en' => ['name' => 'Resistance Bands']],
                ],
            ],

            // ============ TAKIM SPORLARI ============
            [
                'slug' => 'takim-sporlari',
                'type' => 'team-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 5,
                'image' => 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400',
                'tr' => ['name' => 'Takım Sporları', 'meta_title' => 'Takım Sporları Ekipmanları', 'meta_description' => 'Futbol, basketbol, voleybol ekipmanları'],
                'en' => ['name' => 'Team Sports', 'meta_title' => 'Team Sports Equipment', 'meta_description' => 'Football, basketball, volleyball equipment'],
                'children' => [
                    ['slug' => 'futbol', 'image' => 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400', 'tr' => ['name' => 'Futbol'], 'en' => ['name' => 'Football']],
                    ['slug' => 'basketbol', 'image' => 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400', 'tr' => ['name' => 'Basketbol'], 'en' => ['name' => 'Basketball']],
                    ['slug' => 'voleybol', 'image' => 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400', 'tr' => ['name' => 'Voleybol'], 'en' => ['name' => 'Volleyball']],
                    ['slug' => 'hentbol', 'image' => 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400', 'tr' => ['name' => 'Hentbol'], 'en' => ['name' => 'Handball']],
                ],
            ],

            // ============ RAKET SPORLARI ============
            [
                'slug' => 'raket-sporlari',
                'type' => 'racket-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 6,
                'image' => 'https://images.unsplash.com/photo-1617083934555-ac7d4c10cd50?w=400',
                'tr' => ['name' => 'Raket Sporları', 'meta_title' => 'Raket Sporları Ekipmanları', 'meta_description' => 'Tenis, badminton, squash ekipmanları'],
                'en' => ['name' => 'Racket Sports', 'meta_title' => 'Racket Sports Equipment', 'meta_description' => 'Tennis, badminton, squash equipment'],
                'children' => [
                    ['slug' => 'tenis', 'image' => 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400', 'tr' => ['name' => 'Tenis'], 'en' => ['name' => 'Tennis']],
                    ['slug' => 'badminton', 'image' => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400', 'tr' => ['name' => 'Badminton'], 'en' => ['name' => 'Badminton']],
                    ['slug' => 'masa-tenisi', 'image' => 'https://images.unsplash.com/photo-1558287906-c20471dcc32b?w=400', 'tr' => ['name' => 'Masa Tenisi'], 'en' => ['name' => 'Table Tennis']],
                    ['slug' => 'squash', 'image' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400', 'tr' => ['name' => 'Squash'], 'en' => ['name' => 'Squash']],
                ],
            ],

            // ============ YÜZME ============
            [
                'slug' => 'yuzme',
                'type' => 'swimming',
                'parent_id' => null,
                'level' => 1,
                'order' => 7,
                'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
                'tr' => ['name' => 'Yüzme', 'meta_title' => 'Yüzme Ekipmanları', 'meta_description' => 'Yüzme kıyafetleri, gözlükler ve ekipmanları'],
                'en' => ['name' => 'Swimming', 'meta_title' => 'Swimming Equipment', 'meta_description' => 'Swimwear, goggles and swimming equipment'],
                'children' => [
                    ['slug' => 'mayo-bikini', 'image' => 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400', 'tr' => ['name' => 'Mayo ve Bikini'], 'en' => ['name' => 'Swimsuits and Bikinis']],
                    ['slug' => 'yuzucu-gozlugu', 'image' => 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=400', 'tr' => ['name' => 'Yüzücü Gözlüğü'], 'en' => ['name' => 'Swimming Goggles']],
                    ['slug' => 'bone-kulaklik', 'image' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', 'tr' => ['name' => 'Bone ve Kulaklık'], 'en' => ['name' => 'Caps and Ear Plugs']],
                    ['slug' => 'palet-el-paleti', 'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 'tr' => ['name' => 'Palet ve El Paleti'], 'en' => ['name' => 'Fins and Hand Paddles']],
                ],
            ],

            // ============ KOŞU & MARATON ============
            [
                'slug' => 'kosu-maraton',
                'type' => 'running',
                'parent_id' => null,
                'level' => 1,
                'order' => 8,
                'image' => 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
                'tr' => ['name' => 'Koşu ve Maraton', 'meta_title' => 'Koşu ve Maraton Ekipmanları', 'meta_description' => 'Koşu ayakkabıları, kıyafetleri ve aksesuarları'],
                'en' => ['name' => 'Running and Marathon', 'meta_title' => 'Running and Marathon Equipment', 'meta_description' => 'Running shoes, apparel and accessories'],
                'children' => [
                    ['slug' => 'kosu-ayakkabilari', 'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'tr' => ['name' => 'Koşu Ayakkabıları'], 'en' => ['name' => 'Running Shoes']],
                    ['slug' => 'kosu-kiyafetleri', 'image' => 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=400', 'tr' => ['name' => 'Koşu Kıyafetleri'], 'en' => ['name' => 'Running Apparel']],
                    ['slug' => 'kosu-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400', 'tr' => ['name' => 'Koşu Aksesuarları'], 'en' => ['name' => 'Running Accessories']],
                ],
            ],

            // ============ BİSİKLET ============
            [
                'slug' => 'bisiklet',
                'type' => 'cycling',
                'parent_id' => null,
                'level' => 1,
                'order' => 9,
                'image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
                'tr' => ['name' => 'Bisiklet', 'meta_title' => 'Bisiklet ve Aksesuarları', 'meta_description' => 'Bisikletler, bisiklet aksesuarları ve yedek parçalar'],
                'en' => ['name' => 'Cycling', 'meta_title' => 'Bicycles and Accessories', 'meta_description' => 'Bicycles, cycling accessories and spare parts'],
                'children' => [
                    ['slug' => 'bisikletler', 'image' => 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400', 'tr' => ['name' => 'Bisikletler'], 'en' => ['name' => 'Bicycles']],
                    ['slug' => 'bisiklet-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=400', 'tr' => ['name' => 'Bisiklet Aksesuarları'], 'en' => ['name' => 'Cycling Accessories']],
                    ['slug' => 'bisiklet-giyim', 'image' => 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400', 'tr' => ['name' => 'Bisiklet Giyim'], 'en' => ['name' => 'Cycling Apparel']],
                    ['slug' => 'bisiklet-kask', 'image' => 'https://images.unsplash.com/photo-1557803175-2f8c4c4c3f4b?w=400', 'tr' => ['name' => 'Bisiklet Kaskları'], 'en' => ['name' => 'Cycling Helmets']],
                ],
            ],

            // ============ DÖVÜŞ SPORLARI ============
            [
                'slug' => 'dovus-sporlari',
                'type' => 'combat-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 10,
                'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400',
                'tr' => ['name' => 'Dövüş Sporları', 'meta_title' => 'Dövüş Sporları Ekipmanları', 'meta_description' => 'Boks, kickboks, MMA ekipmanları'],
                'en' => ['name' => 'Combat Sports', 'meta_title' => 'Combat Sports Equipment', 'meta_description' => 'Boxing, kickboxing, MMA equipment'],
                'children' => [
                    ['slug' => 'boks', 'image' => 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=400', 'tr' => ['name' => 'Boks'], 'en' => ['name' => 'Boxing']],
                    ['slug' => 'kickboks', 'image' => 'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=400', 'tr' => ['name' => 'Kickboks'], 'en' => ['name' => 'Kickboxing']],
                    ['slug' => 'mma', 'image' => 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400', 'tr' => ['name' => 'MMA'], 'en' => ['name' => 'MMA']],
                    ['slug' => 'judo-karate', 'image' => 'https://images.unsplash.com/photo-1555597906-a4d7cff0a6f5?w=400', 'tr' => ['name' => 'Judo ve Karate'], 'en' => ['name' => 'Judo and Karate']],
                ],
            ],

            // ============ KIŞ SPORLARI ============
            [
                'slug' => 'kis-sporlari',
                'type' => 'winter-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 11,
                'image' => 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400',
                'tr' => ['name' => 'Kış Sporları', 'meta_title' => 'Kış Sporları Ekipmanları', 'meta_description' => 'Kayak, snowboard ve kış sporları ekipmanları'],
                'en' => ['name' => 'Winter Sports', 'meta_title' => 'Winter Sports Equipment', 'meta_description' => 'Ski, snowboard and winter sports equipment'],
                'children' => [
                    ['slug' => 'kayak', 'image' => 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=400', 'tr' => ['name' => 'Kayak'], 'en' => ['name' => 'Skiing']],
                    ['slug' => 'snowboard', 'image' => 'https://images.unsplash.com/photo-1478700485868-972b69dc3fc4?w=400', 'tr' => ['name' => 'Snowboard'], 'en' => ['name' => 'Snowboard']],
                    ['slug' => 'kis-giyim', 'image' => 'https://images.unsplash.com/photo-1544923246-77307dd628b8?w=400', 'tr' => ['name' => 'Kış Giyim'], 'en' => ['name' => 'Winter Clothing']],
                    ['slug' => 'kis-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1516398977785-23492e20f835?w=400', 'tr' => ['name' => 'Kış Aksesuarları'], 'en' => ['name' => 'Winter Accessories']],
                ],
            ],

            // ============ SPOR ELEKTRONİĞİ ============
            [
                'slug' => 'spor-elektronigi',
                'type' => 'electronics',
                'parent_id' => null,
                'level' => 1,
                'order' => 12,
                'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
                'tr' => ['name' => 'Spor Elektroniği', 'meta_title' => 'Spor Elektroniği', 'meta_description' => 'Akıllı saatler, fitness bileklikleri ve spor elektronik cihazları'],
                'en' => ['name' => 'Sports Electronics', 'meta_title' => 'Sports Electronics', 'meta_description' => 'Smart watches, fitness bands and sports electronic devices'],
                'children' => [
                    ['slug' => 'akilli-saatler', 'image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400', 'tr' => ['name' => 'Akıllı Saatler'], 'en' => ['name' => 'Smart Watches']],
                    ['slug' => 'fitness-bileklikleri', 'image' => 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400', 'tr' => ['name' => 'Fitness Bileklikleri'], 'en' => ['name' => 'Fitness Bands']],
                    ['slug' => 'spor-kulakliklari', 'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 'tr' => ['name' => 'Spor Kulaklıkları'], 'en' => ['name' => 'Sports Headphones']],
                    ['slug' => 'aksiyon-kameralari', 'image' => 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400', 'tr' => ['name' => 'Aksiyon Kameraları'], 'en' => ['name' => 'Action Cameras']],
                    ['slug' => 'bisiklet-bilgisayarlari', 'image' => 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=400', 'tr' => ['name' => 'Bisiklet Bilgisayarları'], 'en' => ['name' => 'Bike Computers']],
                    ['slug' => 'gps-cihazlari', 'image' => 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400', 'tr' => ['name' => 'GPS Cihazları'], 'en' => ['name' => 'GPS Devices']],
                ],
            ],

            // ============ ÇANTA & AKSESUAR ============
            [
                'slug' => 'canta-aksesuar',
                'type' => 'bags',
                'parent_id' => null,
                'level' => 1,
                'order' => 13,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                'tr' => ['name' => 'Çanta ve Aksesuar', 'meta_title' => 'Çanta ve Aksesuar', 'meta_description' => 'Spor çantaları, sırt çantaları ve aksesuarlar'],
                'en' => ['name' => 'Bags and Accessories', 'meta_title' => 'Bags and Accessories', 'meta_description' => 'Sports bags, backpacks and accessories'],
                'children' => [
                    ['slug' => 'spor-cantalari', 'image' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'tr' => ['name' => 'Spor Çantaları'], 'en' => ['name' => 'Sports Bags']],
                    ['slug' => 'sirt-cantalari', 'image' => 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400', 'tr' => ['name' => 'Sırt Çantaları'], 'en' => ['name' => 'Backpacks']],
                    ['slug' => 'gozlukler', 'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', 'tr' => ['name' => 'Gözlükler'], 'en' => ['name' => 'Sunglasses']],
                    ['slug' => 'saatler', 'image' => 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 'tr' => ['name' => 'Saatler'], 'en' => ['name' => 'Watches']],
                    ['slug' => 'kaslar', 'image' => 'https://images.unsplash.com/photo-1582994254571-b4e90bd9d149?w=400', 'tr' => ['name' => 'Kasklar'], 'en' => ['name' => 'Helmets']],
                ],
            ],

            // ============ KİŞİSEL BAKIM ============
            [
                'slug' => 'kisisel-bakim',
                'type' => 'cosmetics',
                'parent_id' => null,
                'level' => 1,
                'order' => 14,
                'image' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
                'tr' => ['name' => 'Kişisel Bakım', 'meta_title' => 'Kişisel Bakım', 'meta_description' => 'Cilt, saç ve kişisel bakım ürünleri'],
                'en' => ['name' => 'Personal Care', 'meta_title' => 'Personal Care', 'meta_description' => 'Skin, hair and personal care products'],
                'children' => [
                    ['slug' => 'cilt-bakimi', 'image' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 'tr' => ['name' => 'Cilt Bakımı'], 'en' => ['name' => 'Skin Care']],
                    ['slug' => 'sac-bakimi', 'image' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', 'tr' => ['name' => 'Saç Bakımı'], 'en' => ['name' => 'Hair Care']],
                    ['slug' => 'vucut-bakimi', 'image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400', 'tr' => ['name' => 'Vücut Bakımı'], 'en' => ['name' => 'Body Care']],
                    ['slug' => 'spor-hijyen', 'image' => 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', 'tr' => ['name' => 'Spor Hijyen'], 'en' => ['name' => 'Sports Hygiene']],
                ],
            ],

            // ============ DOĞAL & ORGANİK ============
            [
                'slug' => 'dogal-organik',
                'type' => 'organic',
                'parent_id' => null,
                'level' => 1,
                'order' => 15,
                'image' => 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400',
                'tr' => ['name' => 'Doğal ve Organik', 'meta_title' => 'Doğal ve Organik Ürünler', 'meta_description' => 'Organik gıda ve doğal ürünler'],
                'en' => ['name' => 'Natural and Organic', 'meta_title' => 'Natural and Organic Products', 'meta_description' => 'Organic food and natural products'],
                'children' => [
                    ['slug' => 'organik-gida', 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'tr' => ['name' => 'Organik Gıda'], 'en' => ['name' => 'Organic Food']],
                    ['slug' => 'dogal-takviyeler', 'image' => 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400', 'tr' => ['name' => 'Doğal Takviyeler'], 'en' => ['name' => 'Natural Supplements']],
                    ['slug' => 'aktariye', 'image' => 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 'tr' => ['name' => 'Aktariye'], 'en' => ['name' => 'Herbal Products']],
                ],
            ],

            // ============ KİTAPLAR ============
            [
                'slug' => 'kitaplar',
                'type' => 'books',
                'parent_id' => null,
                'level' => 1,
                'order' => 16,
                'image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                'tr' => ['name' => 'Kitaplar', 'meta_title' => 'Spor ve Outdoor Kitapları', 'meta_description' => 'Spor, fitness, outdoor ve macera kitapları'],
                'en' => ['name' => 'Books', 'meta_title' => 'Sports and Outdoor Books', 'meta_description' => 'Sports, fitness, outdoor and adventure books'],
                'children' => [
                    ['slug' => 'spor-fitness-kitaplari', 'image' => 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', 'tr' => ['name' => 'Spor ve Fitness Kitapları'], 'en' => ['name' => 'Sports and Fitness Books']],
                    ['slug' => 'outdoor-macera-kitaplari', 'image' => 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 'tr' => ['name' => 'Outdoor ve Macera Kitapları'], 'en' => ['name' => 'Outdoor and Adventure Books']],
                    ['slug' => 'dagcilik-tirmanis-kitaplari', 'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'tr' => ['name' => 'Dağcılık ve Tırmanış Kitapları'], 'en' => ['name' => 'Mountaineering and Climbing Books']],
                    ['slug' => 'beslenme-saglik-kitaplari', 'image' => 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400', 'tr' => ['name' => 'Beslenme ve Sağlık Kitapları'], 'en' => ['name' => 'Nutrition and Health Books']],
                ],
            ],
        ];

        DB::transaction(function () use ($categories) {
            // Clean existing data
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\ProductCategory')
                ->delete();
            DB::table('product_category')->delete();

            foreach ($categories as $index => $category) {
                $parentId = $this->createCategory($category, null, null, null, $index + 1);

                if (isset($category['children'])) {
                    // Get parent category name for paths
                    $parentName = $category['tr']['name'];

                    foreach ($category['children'] as $childIndex => $child) {
                        $child['type'] = $category['type'];
                        $child['parent_id'] = $parentId;
                        $child['level'] = 2;
                        $child['order'] = $childIndex + 1;
                        $this->createCategory($child, $parentId, $parentName, (string)$parentId, $childIndex + 1);
                    }
                }
            }
        });

        echo "Categories seeded successfully!\n";
    }

    private function createCategory(array $data, ?int $parentId, ?string $parentName, ?string $parentPath, int $order): int
    {
        $trData = $data['tr'];
        $enData = $data['en'] ?? $data['tr'];

        // Build category_name_paths and parent_path for children
        $categoryNamePaths = $parentName ?? null;
        $categoryParentPath = $parentPath ?? null;

        $categoryId = DB::table('product_category')->insertGetId([
            'category_name' => $trData['name'],
            'category_slug' => $data['slug'],
            'type' => $data['type'] ?? 'ecommerce',
            'category_name_paths' => $categoryNamePaths,
            'parent_path' => $categoryParentPath,
            'parent_id' => $parentId,
            'category_level' => $data['level'] ?? ($parentId ? 2 : 1),
            'display_order' => $order,
            'is_featured' => 1,
            'status' => 1,
            'category_thumb' => $data['image'] ?? null,
            'meta_title' => $trData['meta_title'] ?? $trData['name'],
            'meta_description' => $trData['meta_description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // TR translations (default)
        $this->addTranslation($categoryId, 'df', 'category_name', $trData['name']);
        $this->addTranslation($categoryId, 'df', 'meta_title', $trData['meta_title'] ?? $trData['name']);
        if (isset($trData['meta_description'])) {
            $this->addTranslation($categoryId, 'df', 'meta_description', $trData['meta_description']);
        }

        // TR translations
        $this->addTranslation($categoryId, 'tr', 'category_name', $trData['name']);
        $this->addTranslation($categoryId, 'tr', 'meta_title', $trData['meta_title'] ?? $trData['name']);
        if (isset($trData['meta_description'])) {
            $this->addTranslation($categoryId, 'tr', 'meta_description', $trData['meta_description']);
        }

        // EN translations
        $this->addTranslation($categoryId, 'en', 'category_name', $enData['name']);
        $this->addTranslation($categoryId, 'en', 'meta_title', $enData['meta_title'] ?? $enData['name']);
        if (isset($enData['meta_description'])) {
            $this->addTranslation($categoryId, 'en', 'meta_description', $enData['meta_description']);
        }

        return $categoryId;
    }

    private function addTranslation(int $id, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $id,
            'translatable_type' => 'App\\Models\\ProductCategory',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
