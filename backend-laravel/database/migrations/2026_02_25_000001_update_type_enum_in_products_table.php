<?php

use App\Enums\StoreType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $values = implode("','", array_map(fn($e) => $e->value, StoreType::cases()));
        DB::statement("ALTER TABLE products MODIFY type ENUM('{$values}') NULL");
    }

    public function down(): void
    {
        $original = "'grocery','bakery','medicine','makeup','bags','clothing','furniture','books','gadgets','animals-pet','fish'";
        DB::statement("ALTER TABLE products MODIFY type ENUM({$original}) NULL");
    }
};
