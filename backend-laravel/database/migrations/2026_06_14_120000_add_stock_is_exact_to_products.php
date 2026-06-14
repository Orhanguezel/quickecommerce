<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Gercek (int) miktar veren kaynaklardan (provitanya, swan) gelen urunlerde
     * frontend "Stokta (N)" gosterir. Bool-only kaynaklarda (stok=1/0 sembolik)
     * sayi YANLIS olur -> sadece "Stokta". Flag products:flag-preorder komutu
     * (config/preorder.php exact_stock_sources listesine gore) set eder.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'stock_is_exact')) {
                $table->boolean('stock_is_exact')->default(0)->after('is_preorder');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'stock_is_exact')) {
                $table->dropColumn('stock_is_exact');
            }
        });
    }
};
