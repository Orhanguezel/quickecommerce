<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('banners', 'display_order')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->unsignedInteger('display_order')
                    ->default(0)
                    ->after('type')
                    ->comment('Banner display ordering within the same section/type');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('banners', 'display_order')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->dropColumn('display_order');
            });
        }
    }
};
