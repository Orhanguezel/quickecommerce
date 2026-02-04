<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductCategorySeedSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            // Mevcut satırlar...
            [
                'id' => 1,
                'category_name' => 'Daily Needs',
                'category_slug' => 'daily needs',
                'type' => 'grocery',
                'category_name_paths' => null,
                'parent_path' => null,
                'parent_id' => null,
                'category_level' => 1,
                'is_featured' => 1,
                'admin_commission_rate' => 0,
                'category_thumb' => '1296',
                'category_banner' => '#EAF5E5',
                'meta_title' => 'Daily needs',
                'meta_description' => 'Daily needs',
                'display_order' => 1,
                'created_by' => null,
                'updated_by' => null,
                'status' => 1,
                'created_at' => '2025-03-10 01:43:04',
                'updated_at' => '2025-06-16 09:06:00',
            ],
            [
                'id' => 2,
                'category_name' => 'Fruits',
                'category_slug' => 'fruits',
                'type' => 'grocery',
                'category_name_paths' => 'Daily Needs',
                'parent_path' => '1',
                'parent_id' => 1,
                'category_level' => 2,
                'is_featured' => 1,
                'admin_commission_rate' => 0,
                'category_thumb' => '1296',
                'category_banner' => '#fff',
                'meta_title' => 'Fruits',
                'meta_description' => 'Fruits',
                'display_order' => 58,
                'created_by' => null,
                'updated_by' => null,
                'status' => 1,
                'created_at' => '2025-03-10 01:43:04',
                'updated_at' => '2025-06-17 10:46:41',
            ],

            // ✅ YENİ BENZERSİZ KATEGORİ (örnek)
            // - id: null => id’ye dokunmuyoruz (AUTO_INCREMENT varsayımı)
            // - category_slug: benzersiz seçildi
            // - type: yeni bir type değil, istersen mevcut bir type içinde de benzersiz olabilir
            [
                'id' => null,
                'category_name' => 'Outdoor & Camping',
                'category_slug' => 'outdoor-camping',
                'type' => 'grocery',
                'category_name_paths' => null,
                'parent_path' => null,
                'parent_id' => null,
                'category_level' => 1,
                'is_featured' => 0,
                'admin_commission_rate' => 0,
                'category_thumb' => null,
                'category_banner' => '#fff',
                'meta_title' => 'Outdoor & Camping',
                'meta_description' => 'Outdoor & Camping products',
                'display_order' => 999,
                'created_by' => null,
                'updated_by' => null,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::transaction(function () use ($rows) {
            // 1) Mevcut seed satırların (id) ile upsert’i varsa kalsın
            //    (istersen mevcutları update etmek istemiyorsan bunun yerine insertOrIgnore’a döneriz)
            $existingRows = array_values(array_filter($rows, fn ($r) => !empty($r['id'])));

            if (!empty($existingRows)) {
                DB::table('product_category')->upsert(
                    $existingRows,
                    ['id'],
                    [
                        'category_name',
                        'category_slug',
                        'type',
                        'category_name_paths',
                        'parent_path',
                        'parent_id',
                        'category_level',
                        'is_featured',
                        'admin_commission_rate',
                        'category_thumb',
                        'category_banner',
                        'meta_title',
                        'meta_description',
                        'display_order',
                        'created_by',
                        'updated_by',
                        'status',
                        'created_at',
                        'updated_at',
                    ]
                );
            }

            // 2) ✅ SADECE YENİ EKLE (varsa dokunma)
            $newOnlyRows = array_values(array_filter($rows, fn ($r) => empty($r['id'])));

            // upsert unique key: (type, category_slug)
            // updateColumns: [] => varsa update ETME
            if (!empty($newOnlyRows)) {
                DB::table('product_category')->upsert(
                    $newOnlyRows,
                    ['type', 'category_slug'],
                    []
                );
            }
        });
    }
}
