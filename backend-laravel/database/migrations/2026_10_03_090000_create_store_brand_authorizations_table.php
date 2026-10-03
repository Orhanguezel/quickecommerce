<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Yetkili Satici" rozeti. Yetki magaza ile marka arasindadir: brand_id bos ise
 * magazanin tum urunleri, dolu ise yalniz o markanin urunleri rozet alir.
 * Rozet yalniz admin onayli ve tarih araligi gecerli kayitla gorunur; belgesiz
 * "yetkili satici" beyani Google Merchant "yanlis beyan" riskidir.
 * product_brands.seller_relation_with_brand marka seviyesinde (global) oldugu
 * icin pazar yerinde magaza bazli yetkiyi ifade edemiyordu.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('store_brand_authorizations')) {
            return;
        }

        Schema::create('store_brand_authorizations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('store_id');
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->string('evidence', 500)->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['store_id', 'brand_id']);
            $table->index('brand_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_brand_authorizations');
    }
};
