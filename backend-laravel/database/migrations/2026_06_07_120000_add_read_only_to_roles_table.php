<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Read-only (salt-okunur) roles can browse the whole admin panel but are
     * blocked from any mutating request (POST/PUT/PATCH/DELETE) by
     * RestrictReadOnlyAdmin middleware.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $rolesTable = $tableNames['roles'] ?? 'roles';

        Schema::table($rolesTable, function (Blueprint $table) {
            if (!Schema::hasColumn($table->getTable(), 'read_only')) {
                $table->boolean('read_only')->default(0)->after('status');
            }
        });
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $rolesTable = $tableNames['roles'] ?? 'roles';

        Schema::table($rolesTable, function (Blueprint $table) {
            if (Schema::hasColumn($table->getTable(), 'read_only')) {
                $table->dropColumn('read_only');
            }
        });
    }
};
