<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedTinyInteger('homepage_featured_rank')
                ->nullable()
                ->after('is_featured')
                ->unique();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['homepage_featured_rank']);
            $table->dropColumn('homepage_featured_rank');
        });
    }
};
