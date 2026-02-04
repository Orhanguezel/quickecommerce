<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->string('page_type')->default('dynamic_page')->after('id'); // adjust 'after' as needed
            $table->unsignedBigInteger('page_parent')->nullable()->after('page_type');
            $table->integer('page_order')->default(0)->after('page_parent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['page_type', 'page_parent', 'page_order']);
        });
    }
};
