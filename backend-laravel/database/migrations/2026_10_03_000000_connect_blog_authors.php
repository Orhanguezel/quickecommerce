<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_authors', function (Blueprint $table) {
            $table->string('title')->nullable();
            $table->string('email')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('website_url')->nullable();
        });
        Schema::table('blogs', function (Blueprint $table) {
            $table->foreignId('author_id')->nullable()->after('admin_id')->constrained('product_authors')->nullOnDelete();
        });
        // The existing public site attributes its blog posts to Engin Eser.
        // Keep that attribution during the move to per-post authors.
        if (DB::table('blogs')->exists()) {
            $author = DB::table('product_authors')->where('slug', 'engin-eser')->first();
            $authorId = $author?->id ?? DB::table('product_authors')->insertGetId([
                'name' => 'Engin Eser', 'slug' => 'engin-eser',
                'bio' => "Engin Eser, Sportoonline'da spor ekipmanları, sporcu beslenmesi, koşu, fitness ve online alışveriş rehberleri hazırlar. İçeriklerde ürün seçimi, kullanım senaryoları ve tüketici kararlarını sade, kaynaklı ve pratik bir dille aktarmaya odaklanır.",
                'title' => 'Sportoonline spor ekipmanları ve e-ticaret içerik yazarı', 'status' => 1,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            if (!DB::table('translations')->where('translatable_type', \App\Models\ProductAuthor::class)
                ->where('translatable_id', $authorId)->where('language', 'en')->where('key', 'bio')->exists()) {
                DB::table('translations')->insert([
                    'translatable_type' => \App\Models\ProductAuthor::class,
                    'translatable_id' => $authorId, 'language' => 'en', 'key' => 'bio',
                    'value' => 'Engin Eser writes Sportoonline guides on sports equipment, sports nutrition, running, fitness, and online shopping. His content focuses on product selection, usage scenarios, and practical buying decisions.',
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
            DB::table('blogs')->whereNull('author_id')->update(['author_id' => $authorId]);
        }
        $blogGroup = DB::table('permissions')->where('available_for', 'system_level')->where('name', 'Blogs')->first();
        if ($blogGroup) {
            DB::table('permissions')->where('available_for', 'system_level')
                ->where('name', '/admin/product/author/list')
                ->update(['parent_id' => (string) $blogGroup->id, 'perm_title' => 'Authors']);
        }
    }

    public function down(): void
    {
        Schema::table('blogs', fn (Blueprint $table) => $table->dropConstrainedForeignId('author_id'));
        Schema::table('product_authors', fn (Blueprint $table) => $table->dropColumn([
            'title', 'email', 'linkedin_url', 'twitter_url', 'facebook_url', 'instagram_url', 'website_url',
        ]));
        $productGroup = DB::table('permissions')->where('available_for', 'system_level')
            ->where('name', 'Product management')->first();
        if ($productGroup) {
            DB::table('permissions')->where('available_for', 'system_level')
                ->where('name', '/admin/product/author/list')
                ->update(['parent_id' => (string) $productGroup->id]);
        }
        // Author rows remain because their profiles may be used elsewhere.
    }
};
