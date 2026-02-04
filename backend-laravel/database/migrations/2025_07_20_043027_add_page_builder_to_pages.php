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
            if (!Schema::hasColumn('pages', 'layout')) {
                $table->string('layout')->nullable()->default('default')->after('page_type');
            }
            if (!Schema::hasColumn('pages', 'page_class')) {
                $table->string('page_class')->nullable()->after('layout');
            }
            if (!Schema::hasColumn('pages', 'enable_builder')) {
                $table->boolean('enable_builder')->default(false)->after('page_class');
            }
            if (!Schema::hasColumn('pages', 'show_breadcrumb')) {
                $table->boolean('show_breadcrumb')->default(true)->after('enable_builder');
            }
            if (!Schema::hasColumn('pages', 'page_parent')) {
                $table->unsignedBigInteger('page_parent')->nullable()->after('show_breadcrumb');
            }
            if (!Schema::hasColumn('pages', 'page_order')) {
                $table->integer('page_order')->default(0)->after('page_parent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn([
                'layout',
                'page_class',
                'enable_builder',
                'show_breadcrumb',
                'page_parent',
                'page_order',
            ]);
        });
    }
};
