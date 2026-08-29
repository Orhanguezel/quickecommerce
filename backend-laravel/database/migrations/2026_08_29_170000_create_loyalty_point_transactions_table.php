<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sadakat puani DEFTERI.
 *
 * Musteri uzerinde ayri bir "bakiye" alani TUTULMAZ; bakiye her zaman bu
 * tablonun toplamidir. Boylece bakiye ile hareketler arasinda tutarsizlik
 * olusamaz ve her puanin nereden geldigi izlenebilir kalir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();

            // Kazanim pozitif, harcama/iptal negatif.
            $table->integer('points');

            // order  : teslim edilen siparis puani
            // review : onaylanan yorum bonusu
            // redeem : puan bozdurma (negatif)
            // revoke : iptal/iade sonrasi geri alma (negatif)
            // expire : suresi dolan puan (negatif)
            // manual : admin elle ekleme/silme
            $table->string('type', 20);

            // Hangi kayittan dogdu (Order / Review / CouponLine)
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->string('description')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'created_at'], 'lpt_customer_created_idx');
            $table->index(['expires_at'], 'lpt_expires_idx');

            // Ayni siparis/yorum icin ikinci kez puan yazilmasini VERITABANI
            // seviyesinde engeller. Iki kez tetiklenen bir job'a karsi tek
            // gercek koruma budur; uygulama katmanindaki kontrol yarisir.
            $table->unique(
                ['customer_id', 'type', 'reference_type', 'reference_id'],
                'lpt_unique_source'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_point_transactions');
    }
};
