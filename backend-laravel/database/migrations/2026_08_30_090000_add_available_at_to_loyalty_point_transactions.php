<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Puanlarin BEKLEME SURESI.
 *
 * Neden: iade edilen bir siparisin puani geri alinabilmeli. Puan teslimat
 * aninda kullanilabilir olursa musteri onu ayni gun cheke cevirip harcayabilir;
 * 5 gun sonra gelen iadede geri alacak puan kalmaz ve bakiye eksiye duser.
 * Tuketicinin cayma hakki teslimattan itibaren 14 gundur -- puan da ayni sure
 * boyunca "beklemede" tutulur, iade penceresi kapandiktan sonra kullanima acilir.
 *
 * Yontem: durum alani + cron DEGIL, tarih. `available_at` gecmisse puan
 * kullanilabilir, gelecekse beklemededir. Boylece puanlari "olgunlastiran" bir
 * job'un calismamasi puanlarin sonsuza kadar askida kalmasina yol acamaz.
 *
 * NULL = aninda kullanilabilir. Harcama/iptal/manuel kayitlar ve bekleme
 * suresi 0 iken yazilan kazanimlar boyledir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loyalty_point_transactions', function (Blueprint $table) {
            $table->timestamp('available_at')->nullable()->after('expires_at');

            // Bakiye sorgusu her zaman (musteri + kullanilabilirlik) filtreler.
            $table->index(['customer_id', 'available_at'], 'lpt_customer_available_idx');
        });

        // Mevcut kayitlar NULL kalir = aninda kullanilabilir. Gecmise donuk
        // bekleme uygulamak, verilmis bir puani geri cekmek olurdu.
    }

    public function down(): void
    {
        Schema::table('loyalty_point_transactions', function (Blueprint $table) {
            $table->dropIndex('lpt_customer_available_idx');
            $table->dropColumn('available_at');
        });
    }
};
