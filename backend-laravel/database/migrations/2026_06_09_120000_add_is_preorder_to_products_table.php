<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bool-only (stok=1/0) tedarikci kaynaklarindan gelen urunler gun ici
     * tukenip "Stokta" gorunmeye devam edebiliyor -> siparis sonrasi otomatik
     * iade (satis kaybi + guven kaybi). Bu urunler frontend'de "Stokta" yerine
     * "On Siparis / Tedarik Sureli" gosterilir. Flag, products:flag-preorder
     * komutu ile (config/preorder.php bool_sources listesine gore) set edilir.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_preorder')) {
                $table->boolean('is_preorder')->default(0)->after('is_featured');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'is_preorder')) {
                $table->dropColumn('is_preorder');
            }
        });
    }
};
