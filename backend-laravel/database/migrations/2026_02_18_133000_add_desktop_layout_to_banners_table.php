<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            if (!Schema::hasColumn('banners', 'desktop_row')) {
                $table->unsignedInteger('desktop_row')
                    ->default(1)
                    ->after('display_order')
                    ->comment('Desktop row index for banner placement');
            }
            if (!Schema::hasColumn('banners', 'desktop_columns')) {
                $table->unsignedTinyInteger('desktop_columns')
                    ->default(3)
                    ->after('desktop_row')
                    ->comment('Desktop column count for the row (1,2,3)');
            }
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            if (Schema::hasColumn('banners', 'desktop_columns')) {
                $table->dropColumn('desktop_columns');
            }
            if (Schema::hasColumn('banners', 'desktop_row')) {
                $table->dropColumn('desktop_row');
            }
        });
    }
};
