<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * E-posta dogrulama kodlari (tek tablo, iki amac):
 *  - purpose='account'        -> uyelik e-posta dogrulamasi (kayit sonrasi)
 *  - purpose='guest_checkout' -> misafir siparis oncesi e-posta dogrulamasi
 *
 * customers.email_verify_token ALANI KULLANILMIYOR: o alan sifre sifirlama ile
 * paylasimliydi (forgetPassword ayni kolona yaziyordu), bu yuzden sifre
 * sifirlama kodu ayni zamanda e-postayi dogruluyordu. Ayri tablo o cakismayi
 * bitirir ve son kullanma / deneme sayaci gibi alanlari tasiyabilir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email', 191);
            $table->string('purpose', 32)->default('account');
            // Kod HASH'lenmis tutulur (DB sizsa kodlar dogrudan kullanilamasin).
            $table->string('code_hash');
            $table->timestamp('expires_at');
            // Yanlis deneme sayaci -> brute force korumasi (6 hane = 1M kombinasyon).
            $table->unsignedTinyInteger('attempts')->default(0);
            // Ayni e-postaya saatte kac kod gitti (spam/mail kotasi korumasi).
            $table->unsignedTinyInteger('send_count')->default(1);
            $table->timestamp('last_sent_at')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->unique(['email', 'purpose']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_verification_codes');
    }
};
