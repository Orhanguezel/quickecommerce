Laravel migration oluştur: $ARGUMENTS

## Migration Oluşturma

### Artisan Komutu

```bash
php artisan make:migration create_[table_name]_table
```

### Temel Migration Template

```php
// database/migrations/YYYY_MM_DD_HHMMSS_create_[table_name]_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('[table_name]', function (Blueprint $table) {
            $table->id();

            // Temel alanlar
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);

            // İlişkiler
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // İndeksler
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('[table_name]');
    }
};
```

### Yaygın Alan Tipleri

```php
// Strings
$table->string('name', 255);           // VARCHAR(255)
$table->text('description');            // TEXT
$table->longText('content');            // LONGTEXT
$table->char('code', 10);               // CHAR(10)

// Numbers
$table->integer('quantity');            // INT
$table->bigInteger('amount');           // BIGINT
$table->decimal('price', 10, 2);        // DECIMAL(10,2)
$table->float('rating');                // FLOAT
$table->unsignedInteger('views');       // UNSIGNED INT

// Boolean
$table->boolean('status')->default(true);
$table->boolean('is_active')->default(false);

// Dates
$table->date('birth_date');
$table->dateTime('published_at');
$table->timestamp('verified_at')->nullable();
$table->timestamps();                    // created_at, updated_at

// JSON
$table->json('meta')->nullable();
$table->jsonb('settings');

// Files/Media
$table->string('image')->nullable();
$table->string('file_path')->nullable();

// Enums
$table->enum('type', ['type1', 'type2', 'type3']);

// Foreign Keys
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

// Polymorphic
$table->morphs('taggable');             // taggable_id, taggable_type
$table->nullableMorphs('commentable');

// UUID
$table->uuid('uuid')->unique();

// Soft Deletes
$table->softDeletes();
```

### İlişki Tablosu (Pivot)

```php
// database/migrations/YYYY_MM_DD_create_product_tag_table.php
Schema::create('product_tag', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
    $table->timestamps();

    $table->unique(['product_id', 'tag_id']);
});
```

### Kolon Ekleme Migration

```php
// database/migrations/YYYY_MM_DD_add_column_to_table.php
public function up(): void
{
    Schema::table('[table_name]', function (Blueprint $table) {
        $table->string('new_column')->nullable()->after('existing_column');
    });
}

public function down(): void
{
    Schema::table('[table_name]', function (Blueprint $table) {
        $table->dropColumn('new_column');
    });
}
```

### Kolon Değiştirme

```php
// doctrine/dbal paketi gerekli
// composer require doctrine/dbal

public function up(): void
{
    Schema::table('[table_name]', function (Blueprint $table) {
        $table->string('name', 500)->change();
        $table->text('description')->nullable()->change();
    });
}
```

### İndeks Ekleme

```php
Schema::table('[table_name]', function (Blueprint $table) {
    $table->index('status');
    $table->index(['user_id', 'status']);
    $table->unique('email');
    $table->fullText('content');
});
```

### Migration Çalıştırma

```bash
# Migrate
php artisan migrate

# Rollback
php artisan migrate:rollback

# Refresh (rollback all + migrate)
php artisan migrate:refresh

# Fresh (drop all + migrate)
php artisan migrate:fresh

# Status
php artisan migrate:status
```

## Kontrol Listesi

- [ ] Tablo ismi çoğul (products, users, categories)
- [ ] Foreign key constraints doğru
- [ ] Nullable alanlar belirtildi
- [ ] Default değerler mantıklı
- [ ] İndeksler eklendi
- [ ] Soft delete (gerekiyorsa)
- [ ] Timestamps mevcut
- [ ] down() metodu yazıldı
- [ ] `php artisan migrate` çalıştırıldı
