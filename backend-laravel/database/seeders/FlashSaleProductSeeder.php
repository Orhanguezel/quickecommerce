<?php

namespace Database\Seeders;

use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use Illuminate\Database\Seeder;

class FlashSaleProductSeeder extends Seeder
{
    /**
     * Seed flash sale products for testing.
     */
    public function run(): void
    {
        $this->command->info('Starting Flash Sale Products seeding...');

        // İlk flash sale'i al
        $flashSale = FlashSale::first();

        if (!$flashSale) {
            $this->command->warn('No flash sale found. Please create a flash sale first.');
            return;
        }

        $this->command->info("Adding products to Flash Sale: {$flashSale->title}");

        // Mevcut flash sale ürünlerini temizle (opsiyonel)
        FlashSaleProduct::where('flash_sale_id', $flashSale->id)->delete();

        // Rastgele 10 ürün al (status: approved)
        $products = Product::where('status', 'approved')
            ->with('variants')
            ->inRandomOrder()
            ->limit(10)
            ->get();

        if ($products->isEmpty()) {
            $this->command->warn('No approved products found.');
            return;
        }

        $count = 0;
        foreach ($products as $product) {
            // Flash sale ürünü oluştur (sadece ilişki tablosu)
            FlashSaleProduct::create([
                'flash_sale_id' => $flashSale->id,
                'product_id' => $product->id,
                'store_id' => $product->store_id,
                'status' => 'approved',
            ]);

            $count++;
            $this->command->info("  ✓ Added: {$product->name} (ID: {$product->id})");
        }

        $this->command->info("✅ Successfully added {$count} products to flash sale!");
    }
}
