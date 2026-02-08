Laravel Eloquent model oluştur: $ARGUMENTS

## Model Oluşturma

### Artisan Komutu

```bash
php artisan make:model ModelName -mfsc
# -m: migration
# -f: factory
# -s: seeder
# -c: controller
```

### Temel Model Template

```php
// app/Models/ModelName.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ModelName extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    /**
     * The table associated with the model.
     */
    protected $table = 'table_name';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        'status',
        'user_id',
    ];

    /**
     * The attributes that should be hidden for arrays.
     */
    protected $hidden = [
        'deleted_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'status' => 'boolean',
        'meta' => 'array',
        'settings' => 'json',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'formatted_date',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeOfUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    public function getFormattedDateAttribute(): string
    {
        return $this->created_at->format('d M Y');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('images');
    }

    // ============================================
    // MEDIA COLLECTIONS
    // ============================================

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->singleFile();

        $this->addMediaCollection('gallery');
    }

    // ============================================
    // BOOT METHOD
    // ============================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Auto-generate slug, etc.
        });

        static::deleting(function ($model) {
            // Clean up related data
        });
    }
}
```

### İlişki Tipleri

```php
// BelongsTo (Many-to-One)
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

// HasMany (One-to-Many)
public function posts(): HasMany
{
    return $this->hasMany(Post::class);
}

// HasOne (One-to-One)
public function profile(): HasOne
{
    return $this->hasOne(Profile::class);
}

// BelongsToMany (Many-to-Many)
public function tags(): BelongsToMany
{
    return $this->belongsToMany(Tag::class)
        ->withTimestamps()
        ->withPivot('order');
}

// HasManyThrough
public function posts(): HasManyThrough
{
    return $this->hasManyThrough(Post::class, User::class);
}

// Polymorphic
public function comments(): MorphMany
{
    return $this->morphMany(Comment::class, 'commentable');
}
```

### Scope Örnekleri

```php
// Status scope
public function scopeActive($query)
{
    return $query->where('status', true);
}

// Date range scope
public function scopeBetweenDates($query, $start, $end)
{
    return $query->whereBetween('created_at', [$start, $end]);
}

// Search scope
public function scopeSearch($query, $term)
{
    return $query->where('name', 'like', "%{$term}%");
}

// Order scope
public function scopeLatest($query)
{
    return $query->orderBy('created_at', 'desc');
}
```

### Factory

```php
// database/factories/ModelNameFactory.php
<?php

namespace Database\Factories;

use App\Models\ModelName;
use Illuminate\Database\Eloquent\Factories\Factory;

class ModelNameFactory extends Factory
{
    protected $model = ModelName::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => fake()->boolean(80),
            'user_id' => \App\Models\User::factory(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => true,
        ]);
    }
}
```

### Seeder

```php
// database/seeders/ModelNameSeeder.php
<?php

namespace Database\Seeders;

use App\Models\ModelName;
use Illuminate\Database\Seeder;

class ModelNameSeeder extends Seeder
{
    public function run(): void
    {
        ModelName::factory()->count(50)->create();
    }
}
```

## Kontrol Listesi

- [ ] Model oluşturuldu
- [ ] $fillable tanımlandı
- [ ] $casts tanımlandı
- [ ] İlişkiler yazıldı
- [ ] Scope'lar eklendi
- [ ] Accessor/mutator'lar (gerekiyorsa)
- [ ] Media collections (gerekiyorsa)
- [ ] Factory oluşturuldu
- [ ] Seeder oluşturuldu
