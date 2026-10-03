<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BlogAuthorMigrationTest extends TestCase
{
    public function test_existing_blog_attribution_and_menu_are_moved_to_blog_authors(): void
    {
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');

        Schema::create('product_authors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('slug')->nullable();
            $table->string('bio')->nullable();
            $table->integer('status')->default(0);
            $table->timestamps();
        });
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
        });
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('translatable_id');
            $table->string('translatable_type');
            $table->string('language');
            $table->string('key');
            $table->text('value');
            $table->timestamps();
        });
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('available_for');
            $table->string('name');
            $table->string('parent_id')->nullable();
            $table->string('perm_title')->nullable();
        });
        DB::table('blogs')->insert(['id' => 1, 'title' => 'Mevcut yazı']);
        DB::table('permissions')->insert([
            ['id' => 10, 'available_for' => 'system_level', 'name' => 'Blogs', 'parent_id' => '9'],
            ['id' => 11, 'available_for' => 'system_level', 'name' => '/admin/product/author/list', 'parent_id' => '5'],
        ]);

        $migration = require database_path('migrations/2026_10_03_000000_connect_blog_authors.php');
        $migration->up();

        $author = DB::table('product_authors')->where('slug', 'engin-eser')->first();
        $this->assertNotNull($author);
        $this->assertSame($author->id, DB::table('blogs')->value('author_id'));
        $this->assertSame('10', DB::table('permissions')->where('id', 11)->value('parent_id'));
        $this->assertTrue(Schema::hasColumn('product_authors', 'linkedin_url'));
        $this->assertSame(1, DB::table('translations')->where('translatable_id', $author->id)->where('language', 'en')->where('key', 'bio')->count());
    }
}
