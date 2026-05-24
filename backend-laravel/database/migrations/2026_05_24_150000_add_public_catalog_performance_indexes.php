<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->addIndexIfMissing(
            'products',
            'products_public_catalog_idx',
            'ALTER TABLE products ADD INDEX products_public_catalog_idx (status, deleted_at, category_id, store_id, created_at)'
        );

        $this->addIndexIfMissing(
            'products',
            'products_store_status_idx',
            'ALTER TABLE products ADD INDEX products_store_status_idx (store_id, status, deleted_at, created_at)'
        );

        $this->addIndexIfMissing(
            'product_variants',
            'product_variants_public_sellable_idx',
            'ALTER TABLE product_variants ADD INDEX product_variants_public_sellable_idx (product_id, status, deleted_at, stock_quantity, price, special_price)'
        );

        $this->addIndexIfMissing(
            'product_category',
            'product_category_public_idx',
            'ALTER TABLE product_category ADD INDEX product_category_public_idx (status, parent_id, type)'
        );

        $this->addIndexIfMissing(
            'stores',
            'stores_customer_view_idx',
            'ALTER TABLE stores ADD INDEX stores_customer_view_idx (status, deleted_at, subscription_type)'
        );
    }

    public function down(): void
    {
        $this->dropIndexIfExists('stores', 'stores_customer_view_idx');
        $this->dropIndexIfExists('product_category', 'product_category_public_idx');
        $this->dropIndexIfExists('product_variants', 'product_variants_public_sellable_idx');
        $this->dropIndexIfExists('products', 'products_store_status_idx');
        $this->dropIndexIfExists('products', 'products_public_catalog_idx');
    }

    private function addIndexIfMissing(string $table, string $index, string $statement): void
    {
        if (! $this->indexExists($table, $index)) {
            DB::statement($statement);
        }
    }

    private function dropIndexIfExists(string $table, string $index): void
    {
        if ($this->indexExists($table, $index)) {
            DB::statement("ALTER TABLE {$table} DROP INDEX {$index}");
        }
    }

    private function indexExists(string $table, string $index): bool
    {
        return ! empty(DB::select(
            'SHOW INDEX FROM ' . $table . ' WHERE Key_name = ?',
            [$index]
        ));
    }
};
