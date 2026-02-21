<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [

            // ============ SPOR BESLENMESİ (sports) ============
            [
                'slug' => 'spor-beslenmesi',
                'type' => 'sports',
                'level' => 1, 'order' => 1,
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
                'tr' => ['name' => 'Spor Beslenmesi', 'meta_title' => 'Spor Beslenmesi', 'meta_description' => 'Protein, kreatin, BCAA ve spor takviyeleri'],
                'en' => ['name' => 'Sports Nutrition', 'meta_title' => 'Sports Nutrition', 'meta_description' => 'Protein, creatine, BCAA and sports supplements'],
                'children' => [
                    ['slug' => 'proteinler', 'image' => 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400', 'tr' => ['name' => 'Proteinler'], 'en' => ['name' => 'Proteins']],
                    ['slug' => 'bcaa-aminoasitler', 'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'tr' => ['name' => 'BCAA & Aminoasitler'], 'en' => ['name' => 'BCAA & Amino Acids']],
                    ['slug' => 'kreatin', 'image' => 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', 'tr' => ['name' => 'Kreatin'], 'en' => ['name' => 'Creatine']],
                    ['slug' => 'pre-workout', 'image' => 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=400', 'tr' => ['name' => 'Pre-Workout'], 'en' => ['name' => 'Pre-Workout']],
                    ['slug' => 'vitamin-mineraller', 'image' => 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', 'tr' => ['name' => 'Vitamin & Mineraller'], 'en' => ['name' => 'Vitamins & Minerals']],
                ],
            ],

            // ============ FITNESS & EGZERSIZ (sports) ============
            [
                'slug' => 'fitness-egzersiz',
                'type' => 'sports',
                'level' => 1, 'order' => 2,
                'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
                'tr' => ['name' => 'Fitness & Egzersiz', 'meta_title' => 'Fitness Ekipmanları', 'meta_description' => 'Ağırlık, dambıl, yoga ve fitness ekipmanları'],
                'en' => ['name' => 'Fitness & Exercise', 'meta_title' => 'Fitness Equipment', 'meta_description' => 'Weights, dumbbells, yoga and fitness equipment'],
                'children' => [
                    ['slug' => 'agirliklar-dambillar', 'image' => 'https://images.unsplash.com/photo-1517963879433-6ad2171073a4?w=400', 'tr' => ['name' => 'Ağırlıklar & Dambıllar'], 'en' => ['name' => 'Weights & Dumbbells']],
                    ['slug' => 'yoga-pilates', 'image' => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', 'tr' => ['name' => 'Yoga & Pilates'], 'en' => ['name' => 'Yoga & Pilates']],
                    ['slug' => 'fitness-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', 'tr' => ['name' => 'Fitness Aksesuarları'], 'en' => ['name' => 'Fitness Accessories']],
                    ['slug' => 'kardiyo-ekipmanlari', 'image' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', 'tr' => ['name' => 'Kardiyo Ekipmanları'], 'en' => ['name' => 'Cardio Equipment']],
                ],
            ],

            // ============ OUTDOOR & KAMP (sports) ============
            [
                'slug' => 'outdoor-kamp',
                'type' => 'sports',
                'level' => 1, 'order' => 3,
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
                'tr' => ['name' => 'Outdoor & Kamp', 'meta_title' => 'Outdoor ve Kamp Ekipmanları', 'meta_description' => 'Çadır, uyku tulumu ve kamp malzemeleri'],
                'en' => ['name' => 'Outdoor & Camping', 'meta_title' => 'Outdoor and Camping Equipment', 'meta_description' => 'Tents, sleeping bags and camping gear'],
                'children' => [
                    ['slug' => 'cadirlar', 'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400', 'tr' => ['name' => 'Çadırlar'], 'en' => ['name' => 'Tents']],
                    ['slug' => 'uyku-tulumlari', 'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400', 'tr' => ['name' => 'Uyku Tulumları'], 'en' => ['name' => 'Sleeping Bags']],
                    ['slug' => 'mataralar-termoslar', 'image' => 'https://images.unsplash.com/photo-1571864680000-b8c9c0b47b2d?w=400', 'tr' => ['name' => 'Matara & Termoslar'], 'en' => ['name' => 'Water Bottles & Thermoses']],
                    ['slug' => 'sirt-cantalari', 'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'tr' => ['name' => 'Sırt Çantaları'], 'en' => ['name' => 'Backpacks']],
                    ['slug' => 'kamp-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400', 'tr' => ['name' => 'Kamp Aksesuarları'], 'en' => ['name' => 'Camping Accessories']],
                ],
            ],

            // ============ TAKIM & BİREYSEL SPORLAR (sports) ============
            [
                'slug' => 'takim-bireysel-sporlar',
                'type' => 'sports',
                'level' => 1, 'order' => 4,
                'image' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
                'tr' => ['name' => 'Takım & Bireysel Sporlar', 'meta_title' => 'Takım ve Bireysel Sporlar', 'meta_description' => 'Futbol, basketbol, tenis ve daha fazlası'],
                'en' => ['name' => 'Team & Individual Sports', 'meta_title' => 'Team and Individual Sports', 'meta_description' => 'Football, basketball, tennis and more'],
                'children' => [
                    ['slug' => 'futbol', 'image' => 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400', 'tr' => ['name' => 'Futbol'], 'en' => ['name' => 'Football']],
                    ['slug' => 'basketbol', 'image' => 'https://images.unsplash.com/photo-1546519638405-a9e55f4c4c4a?w=400', 'tr' => ['name' => 'Basketbol'], 'en' => ['name' => 'Basketball']],
                    ['slug' => 'tenis', 'image' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400', 'tr' => ['name' => 'Tenis'], 'en' => ['name' => 'Tennis']],
                    ['slug' => 'yuzucu-gozlugu', 'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400', 'tr' => ['name' => 'Yüzme & Su Sporları'], 'en' => ['name' => 'Swimming & Water Sports']],
                    ['slug' => 'boks', 'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400', 'tr' => ['name' => 'Boks & Dövüş Sporları'], 'en' => ['name' => 'Boxing & Martial Arts']],
                    ['slug' => 'bisiklet', 'image' => 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', 'tr' => ['name' => 'Bisiklet'], 'en' => ['name' => 'Cycling']],
                    ['slug' => 'kos-kosma', 'image' => 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400', 'tr' => ['name' => 'Koşu'], 'en' => ['name' => 'Running']],
                    ['slug' => 'dagcilik-tirmanis', 'image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400', 'tr' => ['name' => 'Dağcılık & Tırmanış'], 'en' => ['name' => 'Mountaineering & Climbing']],
                ],
            ],

            // ============ SPOR GİYİM & AYAKKABI (clothing) ============
            [
                'slug' => 'spor-giyim-ayakkabi',
                'type' => 'clothing',
                'level' => 1, 'order' => 5,
                'image' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
                'tr' => ['name' => 'Spor Giyim & Ayakkabı', 'meta_title' => 'Spor Giyim ve Ayakkabı', 'meta_description' => 'Spor kıyafeti, ayakkabı ve spor giyim'],
                'en' => ['name' => 'Sports Clothing & Shoes', 'meta_title' => 'Sports Clothing and Shoes', 'meta_description' => 'Sports apparel, shoes and activewear'],
                'children' => [
                    ['slug' => 'spor-ayakkabi', 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'tr' => ['name' => 'Spor Ayakkabı'], 'en' => ['name' => 'Sports Shoes']],
                    ['slug' => 'erkek-giyim', 'image' => 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400', 'tr' => ['name' => 'Erkek Spor Giyim'], 'en' => ['name' => "Men's Sportswear"]],
                    ['slug' => 'kadin-giyim', 'image' => 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'tr' => ['name' => 'Kadın Spor Giyim'], 'en' => ['name' => "Women's Sportswear"]],
                    ['slug' => 'spor-ic-giyim', 'image' => 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400', 'tr' => ['name' => 'Spor İç Giyim'], 'en' => ['name' => 'Sports Underwear']],
                ],
            ],

            // ============ SPOR TEKNOLOJİ (gadgets) ============
            [
                'slug' => 'spor-teknoloji',
                'type' => 'gadgets',
                'level' => 1, 'order' => 6,
                'image' => 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400',
                'tr' => ['name' => 'Spor Teknoloji', 'meta_title' => 'Spor Teknoloji Ürünleri', 'meta_description' => 'Akıllı saat, aksiyon kamera ve spor teknolojisi'],
                'en' => ['name' => 'Sports Technology', 'meta_title' => 'Sports Technology Products', 'meta_description' => 'Smartwatch, action camera and sports tech'],
                'children' => [
                    ['slug' => 'akilli-saatler', 'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'tr' => ['name' => 'Akıllı Saatler'], 'en' => ['name' => 'Smartwatches']],
                    ['slug' => 'aksiyon-kameralari', 'image' => 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', 'tr' => ['name' => 'Aksiyon Kameraları'], 'en' => ['name' => 'Action Cameras']],
                    ['slug' => 'spor-kulakliklari', 'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'tr' => ['name' => 'Spor Kulaklıkları'], 'en' => ['name' => 'Sports Headphones']],
                    ['slug' => 'fitness-takip-bantlari', 'image' => 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400', 'tr' => ['name' => 'Fitness Takip Bantları'], 'en' => ['name' => 'Fitness Trackers']],
                ],
            ],

            // ============ ÇANTA & AKSESUAR (bags) ============
            [
                'slug' => 'canta-aksesuar',
                'type' => 'bags',
                'level' => 1, 'order' => 7,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                'tr' => ['name' => 'Çanta & Aksesuar', 'meta_title' => 'Spor Çanta ve Aksesuar', 'meta_description' => 'Spor çantaları, gözlükler ve aksesuarlar'],
                'en' => ['name' => 'Bags & Accessories', 'meta_title' => 'Sports Bags and Accessories', 'meta_description' => 'Sports bags, glasses and accessories'],
                'children' => [
                    ['slug' => 'spor-cantalari', 'image' => 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400', 'tr' => ['name' => 'Spor Çantaları'], 'en' => ['name' => 'Sports Bags']],
                    ['slug' => 'gozlukler', 'image' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 'tr' => ['name' => 'Güneş & Spor Gözlükleri'], 'en' => ['name' => 'Sunglasses & Sports Glasses']],
                    ['slug' => 'bel-cantalari', 'image' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'tr' => ['name' => 'Bel Çantaları'], 'en' => ['name' => 'Waist Bags']],
                    ['slug' => 'spor-aksesuarlari', 'image' => 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400', 'tr' => ['name' => 'Spor Aksesuarları'], 'en' => ['name' => 'Sports Accessories']],
                ],
            ],

            // ============ SPOR KİTAPLARI (books) ============
            [
                'slug' => 'spor-kitaplari',
                'type' => 'books',
                'level' => 1, 'order' => 8,
                'image' => 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
                'tr' => ['name' => 'Spor Kitapları', 'meta_title' => 'Spor ve Fitness Kitapları', 'meta_description' => 'Spor, fitness, outdoor ve sağlık kitapları'],
                'en' => ['name' => 'Sports Books', 'meta_title' => 'Sports and Fitness Books', 'meta_description' => 'Sports, fitness, outdoor and health books'],
                'children' => [
                    ['slug' => 'spor-fitness-kitaplari', 'image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'tr' => ['name' => 'Spor & Fitness Kitapları'], 'en' => ['name' => 'Sports & Fitness Books']],
                    ['slug' => 'outdoor-macera-kitaplari', 'image' => 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400', 'tr' => ['name' => 'Outdoor & Macera Kitapları'], 'en' => ['name' => 'Outdoor & Adventure Books']],
                    ['slug' => 'dagcilik-tirmanis-kitaplari', 'image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400', 'tr' => ['name' => 'Dağcılık & Tırmanış Kitapları'], 'en' => ['name' => 'Mountaineering & Climbing Books']],
                    ['slug' => 'saglik-beslenme-kitaplari', 'image' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', 'tr' => ['name' => 'Sağlık & Beslenme Kitapları'], 'en' => ['name' => 'Health & Nutrition Books']],
                ],
            ],

            // ============ MARKET (grocery) ============
            [
                'slug' => 'market',
                'type' => 'grocery',
                'level' => 1, 'order' => 9,
                'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
                'tr' => ['name' => 'Market', 'meta_title' => 'Market Ürünleri', 'meta_description' => 'Temel gıda ve market ürünleri'],
                'en' => ['name' => 'Grocery', 'meta_title' => 'Grocery Products', 'meta_description' => 'Essential food and grocery products'],
                'children' => [
                    ['slug' => 'temel-gida', 'image' => 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400', 'tr' => ['name' => 'Temel Gıda'], 'en' => ['name' => 'Basic Food']],
                    ['slug' => 'sut-urunleri', 'image' => 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 'tr' => ['name' => 'Süt Ürünleri'], 'en' => ['name' => 'Dairy Products']],
                    ['slug' => 'atistirmalik-market', 'image' => 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', 'tr' => ['name' => 'Atıştırmalık'], 'en' => ['name' => 'Snacks']],
                ],
            ],

            // ============ FIRIN & PASTANE (bakery) ============
            [
                'slug' => 'firin-pastane',
                'type' => 'bakery',
                'level' => 1, 'order' => 10,
                'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
                'tr' => ['name' => 'Fırın & Pastane', 'meta_title' => 'Fırın ve Pastane', 'meta_description' => 'Ekmek, pasta ve fırın ürünleri'],
                'en' => ['name' => 'Bakery', 'meta_title' => 'Bakery', 'meta_description' => 'Bread, cakes and bakery products'],
                'children' => [
                    ['slug' => 'ekmekler', 'image' => 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 'tr' => ['name' => 'Ekmekler'], 'en' => ['name' => 'Breads']],
                    ['slug' => 'pastalar', 'image' => 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', 'tr' => ['name' => 'Pastalar'], 'en' => ['name' => 'Cakes']],
                    ['slug' => 'kurabiyeler', 'image' => 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 'tr' => ['name' => 'Kurabiyeler'], 'en' => ['name' => 'Cookies']],
                ],
            ],

            // ============ ECZANE & SAĞLIK (medicine) ============
            [
                'slug' => 'eczane-saglik',
                'type' => 'medicine',
                'level' => 1, 'order' => 11,
                'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
                'tr' => ['name' => 'Eczane & Sağlık', 'meta_title' => 'Eczane ve Sağlık', 'meta_description' => 'Vitamin, sağlık ve tıbbi ürünler'],
                'en' => ['name' => 'Pharmacy & Health', 'meta_title' => 'Pharmacy and Health', 'meta_description' => 'Vitamins, health and medical products'],
                'children' => [
                    ['slug' => 'vitaminler-mineraller', 'image' => 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', 'tr' => ['name' => 'Vitamin & Mineral'], 'en' => ['name' => 'Vitamins & Minerals']],
                    ['slug' => 'saglik-urunleri', 'image' => 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400', 'tr' => ['name' => 'Sağlık Ürünleri'], 'en' => ['name' => 'Health Products']],
                    ['slug' => 'tibbi-malzeme', 'image' => 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', 'tr' => ['name' => 'Tıbbi Malzeme'], 'en' => ['name' => 'Medical Supplies']],
                ],
            ],

            // ============ MAKYAJ & GÜZELLİK (makeup) ============
            [
                'slug' => 'makyaj-guzellik',
                'type' => 'makeup',
                'level' => 1, 'order' => 12,
                'image' => 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
                'tr' => ['name' => 'Makyaj & Güzellik', 'meta_title' => 'Makyaj ve Güzellik', 'meta_description' => 'Makyaj, cilt bakımı ve güzellik ürünleri'],
                'en' => ['name' => 'Makeup & Beauty', 'meta_title' => 'Makeup and Beauty', 'meta_description' => 'Makeup, skincare and beauty products'],
                'children' => [
                    ['slug' => 'yuz-makyaji', 'image' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'tr' => ['name' => 'Yüz Makyajı'], 'en' => ['name' => 'Face Makeup']],
                    ['slug' => 'cilt-bakimi', 'image' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 'tr' => ['name' => 'Cilt Bakımı'], 'en' => ['name' => 'Skin Care']],
                    ['slug' => 'parfum', 'image' => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400', 'tr' => ['name' => 'Parfüm'], 'en' => ['name' => 'Perfume']],
                ],
            ],

            // ============ MOBİLYA (furniture) ============
            [
                'slug' => 'mobilya',
                'type' => 'furniture',
                'level' => 1, 'order' => 13,
                'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
                'tr' => ['name' => 'Mobilya', 'meta_title' => 'Mobilya ve Ev Eşyaları', 'meta_description' => 'Ev mobilyası ve dekorasyon'],
                'en' => ['name' => 'Furniture', 'meta_title' => 'Furniture and Home Items', 'meta_description' => 'Home furniture and decoration'],
                'children' => [
                    ['slug' => 'oturma-grubu', 'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 'tr' => ['name' => 'Oturma Grupları'], 'en' => ['name' => 'Living Room Sets']],
                    ['slug' => 'yatak-odasi', 'image' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 'tr' => ['name' => 'Yatak Odası'], 'en' => ['name' => 'Bedroom']],
                    ['slug' => 'mutfak-mobilya', 'image' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'tr' => ['name' => 'Mutfak Mobilyaları'], 'en' => ['name' => 'Kitchen Furniture']],
                ],
            ],

            // ============ EV DEKORASYON (home-decor) ============
            [
                'slug' => 'ev-dekorasyon',
                'type' => 'home-decor',
                'level' => 1, 'order' => 14,
                'image' => 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
                'tr' => ['name' => 'Ev Dekorasyon', 'meta_title' => 'Ev Dekorasyon Ürünleri', 'meta_description' => 'Ev dekorasyonu ve aksesuar'],
                'en' => ['name' => 'Home Decor', 'meta_title' => 'Home Decoration Products', 'meta_description' => 'Home decoration and accessories'],
                'children' => [
                    ['slug' => 'hali-kilim', 'image' => 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 'tr' => ['name' => 'Halı & Kilim'], 'en' => ['name' => 'Rugs & Carpets']],
                    ['slug' => 'perde-tekstil', 'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 'tr' => ['name' => 'Perde & Tekstil'], 'en' => ['name' => 'Curtains & Textiles']],
                    ['slug' => 'dekor-aksesuar', 'image' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 'tr' => ['name' => 'Dekor Aksesuar'], 'en' => ['name' => 'Decor Accessories']],
                ],
            ],

            // ============ HAYVANCıLIK & EV HAYVANı (animals-pet) ============
            [
                'slug' => 'evcil-hayvan',
                'type' => 'animals-pet',
                'level' => 1, 'order' => 15,
                'image' => 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
                'tr' => ['name' => 'Evcil Hayvan', 'meta_title' => 'Evcil Hayvan Ürünleri', 'meta_description' => 'Köpek, kedi ve evcil hayvan malzemeleri'],
                'en' => ['name' => 'Pet Supplies', 'meta_title' => 'Pet Products', 'meta_description' => 'Dog, cat and pet supplies'],
                'children' => [
                    ['slug' => 'kopek-urunleri', 'image' => 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 'tr' => ['name' => 'Köpek Ürünleri'], 'en' => ['name' => 'Dog Products']],
                    ['slug' => 'kedi-urunleri', 'image' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 'tr' => ['name' => 'Kedi Ürünleri'], 'en' => ['name' => 'Cat Products']],
                    ['slug' => 'kus-balik-urunleri', 'image' => 'https://images.unsplash.com/photo-1545529468-b8fd5dc75e7c?w=400', 'tr' => ['name' => 'Kuş & Balık Ürünleri'], 'en' => ['name' => 'Bird & Fish Products']],
                ],
            ],

            // ============ BALIKÇILIK (fish) ============
            [
                'slug' => 'balikcililik',
                'type' => 'fish',
                'level' => 1, 'order' => 16,
                'image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
                'tr' => ['name' => 'Balıkçılık', 'meta_title' => 'Balıkçılık Ürünleri', 'meta_description' => 'Olta, olta malzemeleri ve balıkçılık ekipmanları'],
                'en' => ['name' => 'Fishing', 'meta_title' => 'Fishing Products', 'meta_description' => 'Fishing rods, tackle and equipment'],
                'children' => [
                    ['slug' => 'olta-takimlari', 'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 'tr' => ['name' => 'Olta Takımları'], 'en' => ['name' => 'Fishing Rods & Reels']],
                    ['slug' => 'balik-yem-aksesuar', 'image' => 'https://images.unsplash.com/photo-1545816250-8c75a78d4b72?w=400', 'tr' => ['name' => 'Yem & Aksesuar'], 'en' => ['name' => 'Bait & Accessories']],
                ],
            ],

            // ============ RESTORAN (restaurant) ============
            [
                'slug' => 'restoran',
                'type' => 'restaurant',
                'level' => 1, 'order' => 17,
                'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                'tr' => ['name' => 'Restoran', 'meta_title' => 'Restoran Menüsü', 'meta_description' => 'Ana yemekler, mezeler ve tatlılar'],
                'en' => ['name' => 'Restaurant', 'meta_title' => 'Restaurant Menu', 'meta_description' => 'Main dishes, appetizers and desserts'],
                'children' => [
                    ['slug' => 'ana-yemekler', 'image' => 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400', 'tr' => ['name' => 'Ana Yemekler'], 'en' => ['name' => 'Main Dishes']],
                    ['slug' => 'mezeler-salatalar', 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'tr' => ['name' => 'Mezeler & Salatalar'], 'en' => ['name' => 'Appetizers & Salads']],
                    ['slug' => 'tatlilar-restoran', 'image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 'tr' => ['name' => 'Tatlılar'], 'en' => ['name' => 'Desserts']],
                ],
            ],

            // ============ KAFE (cafe) ============
            [
                'slug' => 'kafe',
                'type' => 'cafe',
                'level' => 1, 'order' => 18,
                'image' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
                'tr' => ['name' => 'Kafe', 'meta_title' => 'Kafe Menüsü', 'meta_description' => 'Kahve, çay ve kafe içecekleri'],
                'en' => ['name' => 'Cafe', 'meta_title' => 'Cafe Menu', 'meta_description' => 'Coffee, tea and cafe beverages'],
                'children' => [
                    ['slug' => 'kahve-cesitleri', 'image' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 'tr' => ['name' => 'Kahve Çeşitleri'], 'en' => ['name' => 'Coffee Varieties']],
                    ['slug' => 'cay-sicak-icecekler', 'image' => 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', 'tr' => ['name' => 'Çay & Sıcak İçecekler'], 'en' => ['name' => 'Tea & Hot Drinks']],
                    ['slug' => 'kafe-atistirmalik', 'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'tr' => ['name' => 'Atıştırmalık'], 'en' => ['name' => 'Snacks']],
                ],
            ],

            // ============ FAST FOOD (fast-food) ============
            [
                'slug' => 'fast-food',
                'type' => 'fast-food',
                'level' => 1, 'order' => 19,
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'tr' => ['name' => 'Fast Food', 'meta_title' => 'Fast Food Menüsü', 'meta_description' => 'Burger, pizza ve fast food'],
                'en' => ['name' => 'Fast Food', 'meta_title' => 'Fast Food Menu', 'meta_description' => 'Burgers, pizza and fast food'],
                'children' => [
                    ['slug' => 'burgerler', 'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'tr' => ['name' => 'Burgerler'], 'en' => ['name' => 'Burgers']],
                    ['slug' => 'pizzalar', 'image' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 'tr' => ['name' => 'Pizzalar'], 'en' => ['name' => 'Pizzas']],
                    ['slug' => 'sandvicler', 'image' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400', 'tr' => ['name' => 'Sandviçler'], 'en' => ['name' => 'Sandwiches']],
                ],
            ],

            // ============ ÇİÇEKÇİ (florist) ============
            [
                'slug' => 'cicekci',
                'type' => 'florist',
                'level' => 1, 'order' => 20,
                'image' => 'https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=400',
                'tr' => ['name' => 'Çiçekçi', 'meta_title' => 'Çiçek ve Aranjman', 'meta_description' => 'Çiçek buketi, aranjman ve bitki'],
                'en' => ['name' => 'Florist', 'meta_title' => 'Flowers and Arrangements', 'meta_description' => 'Flower bouquets, arrangements and plants'],
                'children' => [
                    ['slug' => 'cicek-buketleri', 'image' => 'https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=400', 'tr' => ['name' => 'Çiçek Buketleri'], 'en' => ['name' => 'Flower Bouquets']],
                    ['slug' => 'ev-bitkileri', 'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 'tr' => ['name' => 'Ev Bitkileri'], 'en' => ['name' => 'House Plants']],
                ],
            ],

            // ============ OYUNCAK (toy) ============
            [
                'slug' => 'oyuncak',
                'type' => 'toy',
                'level' => 1, 'order' => 21,
                'image' => 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400',
                'tr' => ['name' => 'Oyuncak', 'meta_title' => 'Oyuncaklar', 'meta_description' => 'Çocuk oyuncakları ve eğitim setleri'],
                'en' => ['name' => 'Toys', 'meta_title' => 'Toys', 'meta_description' => 'Children toys and educational sets'],
                'children' => [
                    ['slug' => 'bebek-oyuncaklari', 'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', 'tr' => ['name' => 'Bebek Oyuncakları'], 'en' => ['name' => 'Baby Toys']],
                    ['slug' => 'egitici-oyuncaklar', 'image' => 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400', 'tr' => ['name' => 'Eğitici Oyuncaklar'], 'en' => ['name' => 'Educational Toys']],
                    ['slug' => 'spor-oyuncaklari', 'image' => 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400', 'tr' => ['name' => 'Spor Oyuncakları'], 'en' => ['name' => 'Sports Toys']],
                ],
            ],

            // ============ TAKI & MÜCEVHER (jewelry) ============
            [
                'slug' => 'taki-mucevher',
                'type' => 'jewelry',
                'level' => 1, 'order' => 22,
                'image' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
                'tr' => ['name' => 'Takı & Mücevher', 'meta_title' => 'Takı ve Mücevher', 'meta_description' => 'Altın, gümüş ve değerli takılar'],
                'en' => ['name' => 'Jewelry', 'meta_title' => 'Jewelry', 'meta_description' => 'Gold, silver and precious jewelry'],
                'children' => [
                    ['slug' => 'altin-taki', 'image' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'tr' => ['name' => 'Altın Takı'], 'en' => ['name' => 'Gold Jewelry']],
                    ['slug' => 'gumus-taki', 'image' => 'https://images.unsplash.com/photo-1573408301185-9519f94797e0?w=400', 'tr' => ['name' => 'Gümüş Takı'], 'en' => ['name' => 'Silver Jewelry']],
                    ['slug' => 'fantezi-taki', 'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'tr' => ['name' => 'Fantezi Takı'], 'en' => ['name' => 'Fashion Jewelry']],
                ],
            ],

            // ============ OTO YEDEK PARÇA (auto-parts) ============
            [
                'slug' => 'oto-yedek-parca',
                'type' => 'auto-parts',
                'level' => 1, 'order' => 23,
                'image' => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
                'tr' => ['name' => 'Oto Yedek Parça', 'meta_title' => 'Oto Yedek Parça', 'meta_description' => 'Araç yedek parçaları ve aksesuar'],
                'en' => ['name' => 'Auto Parts', 'meta_title' => 'Auto Parts', 'meta_description' => 'Vehicle spare parts and accessories'],
                'children' => [
                    ['slug' => 'motor-parcalari', 'image' => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', 'tr' => ['name' => 'Motor Parçaları'], 'en' => ['name' => 'Engine Parts']],
                    ['slug' => 'ic-aksesuar-oto', 'image' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', 'tr' => ['name' => 'İç Aksesuar'], 'en' => ['name' => 'Interior Accessories']],
                ],
            ],

            // ============ ORGANİK (organic) ============
            [
                'slug' => 'organik',
                'type' => 'organic',
                'level' => 1, 'order' => 24,
                'image' => 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
                'tr' => ['name' => 'Organik Ürünler', 'meta_title' => 'Organik Ürünler', 'meta_description' => 'Sertifikalı organik gıda ve ürünler'],
                'en' => ['name' => 'Organic Products', 'meta_title' => 'Organic Products', 'meta_description' => 'Certified organic food and products'],
                'children' => [
                    ['slug' => 'organik-gida', 'image' => 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400', 'tr' => ['name' => 'Organik Gıda'], 'en' => ['name' => 'Organic Food']],
                    ['slug' => 'organik-bakim', 'image' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 'tr' => ['name' => 'Organik Bakım'], 'en' => ['name' => 'Organic Care']],
                ],
            ],

            // ============ KASAP (butcher) ============
            [
                'slug' => 'kasap',
                'type' => 'butcher',
                'level' => 1, 'order' => 25,
                'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
                'tr' => ['name' => 'Kasap', 'meta_title' => 'Kasap Ürünleri', 'meta_description' => 'Et, tavuk ve şarküteri ürünleri'],
                'en' => ['name' => 'Butcher', 'meta_title' => 'Butcher Products', 'meta_description' => 'Meat, chicken and deli products'],
                'children' => [
                    ['slug' => 'kirmizi-et', 'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'tr' => ['name' => 'Kırmızı Et'], 'en' => ['name' => 'Red Meat']],
                    ['slug' => 'tavuk-urunleri', 'image' => 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400', 'tr' => ['name' => 'Tavuk Ürünleri'], 'en' => ['name' => 'Chicken Products']],
                    ['slug' => 'sarkuteri', 'image' => 'https://images.unsplash.com/photo-1612192861309-e10ac3f84481?w=400', 'tr' => ['name' => 'Şarküteri'], 'en' => ['name' => 'Deli']],
                ],
            ],

            // ============ MEYVE & SEBZE (fruit-vegetable) ============
            [
                'slug' => 'meyve-sebze',
                'type' => 'fruit-vegetable',
                'level' => 1, 'order' => 26,
                'image' => 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
                'tr' => ['name' => 'Meyve & Sebze', 'meta_title' => 'Taze Meyve ve Sebze', 'meta_description' => 'Taze meyve, sebze ve kuru meyve'],
                'en' => ['name' => 'Fruits & Vegetables', 'meta_title' => 'Fresh Fruits and Vegetables', 'meta_description' => 'Fresh fruit, vegetables and dried fruit'],
                'children' => [
                    ['slug' => 'taze-meyveler', 'image' => 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', 'tr' => ['name' => 'Taze Meyveler'], 'en' => ['name' => 'Fresh Fruits']],
                    ['slug' => 'taze-sebzeler', 'image' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 'tr' => ['name' => 'Taze Sebzeler'], 'en' => ['name' => 'Fresh Vegetables']],
                    ['slug' => 'kuru-meyve-kuruyemis', 'image' => 'https://images.unsplash.com/photo-1548907040-4d42bfc1a0e7?w=400', 'tr' => ['name' => 'Kuru Meyve & Kuruyemiş'], 'en' => ['name' => 'Dried Fruit & Nuts']],
                ],
            ],

            // ============ DONDURMA (ice-cream) ============
            [
                'slug' => 'dondurma',
                'type' => 'ice-cream',
                'level' => 1, 'order' => 27,
                'image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
                'tr' => ['name' => 'Dondurma', 'meta_title' => 'Dondurma ve Donuk Tatlılar', 'meta_description' => 'Dondurma çeşitleri ve donuk tatlılar'],
                'en' => ['name' => 'Ice Cream', 'meta_title' => 'Ice Cream and Frozen Desserts', 'meta_description' => 'Ice cream varieties and frozen desserts'],
                'children' => [
                    ['slug' => 'geleneksel-dondurma', 'image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 'tr' => ['name' => 'Geleneksel Dondurma'], 'en' => ['name' => 'Traditional Ice Cream']],
                    ['slug' => 'donuk-tatlilar', 'image' => 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 'tr' => ['name' => 'Donuk Tatlılar'], 'en' => ['name' => 'Frozen Desserts']],
                ],
            ],

            // ============ HIRDAVAT (hardware) ============
            [
                'slug' => 'hirdavat',
                'type' => 'hardware',
                'level' => 1, 'order' => 28,
                'image' => 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
                'tr' => ['name' => 'Hırdavat', 'meta_title' => 'Hırdavat ve Yapı Malzemeleri', 'meta_description' => 'El aletleri, elektrikli aletler ve yapı malzemeleri'],
                'en' => ['name' => 'Hardware', 'meta_title' => 'Hardware and Building Materials', 'meta_description' => 'Hand tools, power tools and building materials'],
                'children' => [
                    ['slug' => 'el-aletleri', 'image' => 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', 'tr' => ['name' => 'El Aletleri'], 'en' => ['name' => 'Hand Tools']],
                    ['slug' => 'elektrikli-aletler', 'image' => 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400', 'tr' => ['name' => 'Elektrikli Aletler'], 'en' => ['name' => 'Power Tools']],
                    ['slug' => 'yapi-malzemeleri', 'image' => 'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=400', 'tr' => ['name' => 'Yapı Malzemeleri'], 'en' => ['name' => 'Building Materials']],
                ],
            ],

            // ============ BEBEK & ÇOCUK (baby-kids) ============
            [
                'slug' => 'bebek-cocuk',
                'type' => 'baby-kids',
                'level' => 1, 'order' => 29,
                'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
                'tr' => ['name' => 'Bebek & Çocuk', 'meta_title' => 'Bebek ve Çocuk Ürünleri', 'meta_description' => 'Bebek giyim, oyuncak ve bakım ürünleri'],
                'en' => ['name' => 'Baby & Kids', 'meta_title' => 'Baby and Kids Products', 'meta_description' => 'Baby clothing, toys and care products'],
                'children' => [
                    ['slug' => 'bebek-giyim-kk', 'image' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 'tr' => ['name' => 'Bebek Giyim'], 'en' => ['name' => 'Baby Clothing']],
                    ['slug' => 'cocuk-giyim-kk', 'image' => 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', 'tr' => ['name' => 'Çocuk Giyim'], 'en' => ['name' => "Children's Clothing"]],
                    ['slug' => 'bebek-bakimi-kk', 'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', 'tr' => ['name' => 'Bebek Bakımı'], 'en' => ['name' => 'Baby Care']],
                    ['slug' => 'puset-karyola', 'image' => 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=400', 'tr' => ['name' => 'Puset & Karyola'], 'en' => ['name' => 'Strollers & Cribs']],
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
                    $parentName = $category['tr']['name'];

                    foreach ($category['children'] as $childIndex => $child) {
                        $child['type'] = $category['type'];
                        $child['parent_id'] = $parentId;
                        $child['level'] = 2;
                        $child['order'] = $childIndex + 1;
                        $this->createCategory($child, $parentId, $parentName, (string) $parentId, $childIndex + 1);
                    }
                }
            }
        });

        echo "Categories seeded successfully! (" . count($categories) . " root categories covering all 27 store types)\n";
    }

    private function createCategory(array $data, ?int $parentId, ?string $parentName, ?string $parentPath, int $order): int
    {
        $trData = $data['tr'];
        $enData = $data['en'] ?? $data['tr'];

        $categoryNamePaths = $parentName ?? null;
        $categoryParentPath = $parentPath ?? null;

        $categoryId = DB::table('product_category')->insertGetId([
            'category_name' => $trData['name'],
            'category_slug' => $data['slug'],
            'type' => $data['type'] ?? 'general',
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

        // Default (df) translations
        $this->addTranslation($categoryId, 'df', 'category_name', $trData['name']);
        $this->addTranslation($categoryId, 'df', 'meta_title', $trData['meta_title'] ?? $trData['name']);
        if (isset($trData['meta_description'])) {
            $this->addTranslation($categoryId, 'df', 'meta_description', $trData['meta_description']);
        }

        // Turkish translations
        $this->addTranslation($categoryId, 'tr', 'category_name', $trData['name']);
        $this->addTranslation($categoryId, 'tr', 'meta_title', $trData['meta_title'] ?? $trData['name']);
        if (isset($trData['meta_description'])) {
            $this->addTranslation($categoryId, 'tr', 'meta_description', $trData['meta_description']);
        }

        // English translations
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
