<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            // ============ POPÜLER ETİKETLER ============
            ['tr' => 'Yeni Ürün', 'en' => 'New Arrival'],
            ['tr' => 'Çok Satan', 'en' => 'Best Seller'],
            ['tr' => 'İndirimli', 'en' => 'On Sale'],
            ['tr' => 'Sınırlı Stok', 'en' => 'Limited Stock'],
            ['tr' => 'Özel Fırsat', 'en' => 'Special Offer'],
            ['tr' => 'Sezonun Favorisi', 'en' => 'Season Favorite'],
            ['tr' => 'Editörün Seçimi', 'en' => 'Editor\'s Choice'],
            ['tr' => 'Trend', 'en' => 'Trending'],
            ['tr' => 'Premium', 'en' => 'Premium'],
            ['tr' => 'Ekonomik', 'en' => 'Budget Friendly'],

            // ============ SPOR DALLARI ============
            ['tr' => 'Fitness', 'en' => 'Fitness'],
            ['tr' => 'Koşu', 'en' => 'Running'],
            ['tr' => 'Yüzme', 'en' => 'Swimming'],
            ['tr' => 'Futbol', 'en' => 'Football'],
            ['tr' => 'Basketbol', 'en' => 'Basketball'],
            ['tr' => 'Voleybol', 'en' => 'Volleyball'],
            ['tr' => 'Tenis', 'en' => 'Tennis'],
            ['tr' => 'Badminton', 'en' => 'Badminton'],
            ['tr' => 'Masa Tenisi', 'en' => 'Table Tennis'],
            ['tr' => 'Golf', 'en' => 'Golf'],
            ['tr' => 'Bisiklet', 'en' => 'Cycling'],
            ['tr' => 'Kamp', 'en' => 'Camping'],
            ['tr' => 'Dağcılık', 'en' => 'Mountaineering'],
            ['tr' => 'Kayak', 'en' => 'Skiing'],
            ['tr' => 'Snowboard', 'en' => 'Snowboarding'],
            ['tr' => 'Boks', 'en' => 'Boxing'],
            ['tr' => 'MMA', 'en' => 'MMA'],
            ['tr' => 'Yoga', 'en' => 'Yoga'],
            ['tr' => 'Pilates', 'en' => 'Pilates'],
            ['tr' => 'CrossFit', 'en' => 'CrossFit'],

            // ============ KULLANIM AMACI ============
            ['tr' => 'Antrenman', 'en' => 'Training'],
            ['tr' => 'Profesyonel', 'en' => 'Professional'],
            ['tr' => 'Amatör', 'en' => 'Amateur'],
            ['tr' => 'Başlangıç Seviye', 'en' => 'Beginner Level'],
            ['tr' => 'İleri Seviye', 'en' => 'Advanced Level'],
            ['tr' => 'Yarış', 'en' => 'Competition'],
            ['tr' => 'Günlük Kullanım', 'en' => 'Daily Use'],
            ['tr' => 'Outdoor', 'en' => 'Outdoor'],
            ['tr' => 'Indoor', 'en' => 'Indoor'],
            ['tr' => 'Ev Tipi', 'en' => 'Home Use'],

            // ============ CİNSİYET / YAŞ ============
            ['tr' => 'Erkek', 'en' => 'Men'],
            ['tr' => 'Kadın', 'en' => 'Women'],
            ['tr' => 'Unisex', 'en' => 'Unisex'],
            ['tr' => 'Çocuk', 'en' => 'Kids'],
            ['tr' => 'Genç', 'en' => 'Youth'],
            ['tr' => 'Yetişkin', 'en' => 'Adult'],

            // ============ SEZON ============
            ['tr' => 'Yaz Sezonu', 'en' => 'Summer Season'],
            ['tr' => 'Kış Sezonu', 'en' => 'Winter Season'],
            ['tr' => 'İlkbahar', 'en' => 'Spring'],
            ['tr' => 'Sonbahar', 'en' => 'Autumn'],
            ['tr' => 'Tüm Sezon', 'en' => 'All Season'],

            // ============ MALZEME / TEKNOLOJİ ============
            ['tr' => 'Su Geçirmez', 'en' => 'Waterproof'],
            ['tr' => 'Nefes Alabilir', 'en' => 'Breathable'],
            ['tr' => 'Hafif', 'en' => 'Lightweight'],
            ['tr' => 'Dayanıklı', 'en' => 'Durable'],
            ['tr' => 'Termal', 'en' => 'Thermal'],
            ['tr' => 'UV Korumalı', 'en' => 'UV Protected'],
            ['tr' => 'Anti-Bakteriyel', 'en' => 'Anti-Bacterial'],
            ['tr' => 'Ergonomik', 'en' => 'Ergonomic'],
            ['tr' => 'Organik', 'en' => 'Organic'],
            ['tr' => 'Geri Dönüştürülmüş', 'en' => 'Recycled'],

            // ============ TAKVİYE / SUPPLEMENT ============
            ['tr' => 'Protein', 'en' => 'Protein'],
            ['tr' => 'BCAA', 'en' => 'BCAA'],
            ['tr' => 'Kreatin', 'en' => 'Creatine'],
            ['tr' => 'Pre-Workout', 'en' => 'Pre-Workout'],
            ['tr' => 'Post-Workout', 'en' => 'Post-Workout'],
            ['tr' => 'Vitamin', 'en' => 'Vitamin'],
            ['tr' => 'Mineral', 'en' => 'Mineral'],
            ['tr' => 'Vegan', 'en' => 'Vegan'],
            ['tr' => 'Şeker İçermez', 'en' => 'Sugar Free'],
            ['tr' => 'Glutensiz', 'en' => 'Gluten Free'],

            // ============ EKİPMAN ============
            ['tr' => 'Ağırlık Antrenmanı', 'en' => 'Weight Training'],
            ['tr' => 'Kardiyo', 'en' => 'Cardio'],
            ['tr' => 'Esneme', 'en' => 'Stretching'],
            ['tr' => 'Direnç Bandı', 'en' => 'Resistance Band'],
            ['tr' => 'Aksesuarlar', 'en' => 'Accessories'],
            ['tr' => 'Koruyucu Ekipman', 'en' => 'Protective Gear'],
            ['tr' => 'Elektronik', 'en' => 'Electronics'],
            ['tr' => 'Akıllı Cihaz', 'en' => 'Smart Device'],

            // ============ MARKA / KOLEKSİYON ============
            ['tr' => 'Orijinal', 'en' => 'Original'],
            ['tr' => 'Lisanslı Ürün', 'en' => 'Licensed Product'],
            ['tr' => 'Limited Edition', 'en' => 'Limited Edition'],
            ['tr' => 'Signature Series', 'en' => 'Signature Series'],
            ['tr' => 'Pro Series', 'en' => 'Pro Series'],
            ['tr' => 'Koleksiyon', 'en' => 'Collection'],

            // ============ BEDENSÖL / FİZİK ============
            ['tr' => 'Kilo Verme', 'en' => 'Weight Loss'],
            ['tr' => 'Kas Yapma', 'en' => 'Muscle Building'],
            ['tr' => 'Dayanıklılık', 'en' => 'Endurance'],
            ['tr' => 'Esneklik', 'en' => 'Flexibility'],
            ['tr' => 'Güç', 'en' => 'Strength'],
            ['tr' => 'Hız', 'en' => 'Speed'],
            ['tr' => 'Denge', 'en' => 'Balance'],
            ['tr' => 'Koordinasyon', 'en' => 'Coordination'],

            // ============ TESLIMAT / HİZMET ============
            ['tr' => 'Hızlı Kargo', 'en' => 'Fast Shipping'],
            ['tr' => 'Ücretsiz Kargo', 'en' => 'Free Shipping'],
            ['tr' => 'Aynı Gün Teslimat', 'en' => 'Same Day Delivery'],
            ['tr' => 'Hediye Paketi', 'en' => 'Gift Wrapped'],
            ['tr' => 'Garanti Kapsamında', 'en' => 'Under Warranty'],
        ];

        DB::transaction(function () use ($tags) {
            // Mevcut tagları temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\Tag')
                ->delete();
            DB::table('product_tags')->delete();
            DB::table('tags')->delete();

            foreach ($tags as $index => $tag) {
                $tagId = DB::table('tags')->insertGetId([
                    'name' => $tag['tr'],
                    'order' => $index + 1,
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // TR translation (default)
                $this->addTranslation($tagId, 'df', $tag['tr']);
                $this->addTranslation($tagId, 'tr', $tag['tr']);
                $this->addTranslation($tagId, 'en', $tag['en']);
            }
        });

        echo "Tags seeded successfully! Total: " . count($tags) . "\n";
    }

    private function addTranslation(int $tagId, string $lang, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $tagId,
            'translatable_type' => 'App\\Models\\Tag',
            'language' => $lang,
            'key' => 'name',
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
