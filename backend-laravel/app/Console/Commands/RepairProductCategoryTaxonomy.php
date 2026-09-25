<?php

namespace App\Console\Commands;

use App\Models\ProductCategory;
use App\Models\Translation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class RepairProductCategoryTaxonomy extends Command
{
    protected $signature = 'categories:repair-taxonomy {--apply : Degisiklikleri veritabanina yaz}';

    protected $description = 'Sportoonline kategori agacini veri kaybetmeden kanonik spor kategorileri altinda toplar';

    /** @var array<int, int> child category id => canonical parent category id */
    private const PARENT_RULES = [
        // Spor beslenmesi
        711 => 367, 790 => 367, 733 => 367, 735 => 369, 736 => 369,
        737 => 367, 741 => 372, 781 => 368,

        // Fitness, egzersiz ve elektro-stimulasyon
        686 => 373, 697 => 373, 793 => 373, 794 => 373, 795 => 373,
        796 => 373, 797 => 373, 798 => 373, 799 => 373, 801 => 373,
        804 => 373, 805 => 373, 812 => 373, 814 => 373,

        // Outdoor
        665 => 378, 792 => 378,

        // Takim ve bireysel sporlar
        660 => 809, 661 => 809, 664 => 387, 682 => 389, 683 => 389,
        684 => 389, 696 => 389, 698 => 389, 699 => 389, 702 => 389,
        714 => 384, 715 => 384, 716 => 384, 803 => 385, 809 => 384,
        811 => 386, 813 => 384, 815 => 384, 817 => 389,
        802 => 805, 806 => 639, 807 => 809, 808 => 807, 810 => 387,
        816 => 639, 818 => 809, 819 => 809, 820 => 387,

        // Spor giyim ve ayakkabi
        662 => 393, 667 => 393, 668 => 393, 669 => 393, 670 => 393,
        671 => 393, 672 => 393, 673 => 393, 674 => 393, 675 => 393,
        677 => 393, 678 => 393, 679 => 393, 680 => 393, 700 => 394,
        701 => 393, 708 => 393, 709 => 393,

        // Canta ve aksesuar
        681 => 403, 703 => 403, 706 => 403, 707 => 403, 738 => 403,
    ];

    /** @var array<int, string> HTML breadcrumb artigi tasiyan gorunen adlar */
    private const NAME_FIXES = [
        802 => 'Crossfit Aksesuarları',
        803 => 'Futbol Fileleri',
        804 => 'Evde Spor',
        806 => 'Voleybol Dizlikleri',
        807 => 'Masa Tenisi',
        808 => 'Ağdemirler',
        810 => 'Tenis Aksesuarları',
        811 => 'Basketbol Antrenman Ekipmanları',
        812 => 'Antrenman Destek Ürünleri',
        814 => 'Atlama İpleri',
        816 => 'Plaj Voleybol Ekipmanları',
        818 => 'Badminton',
        819 => 'Pickleball',
        820 => 'Tenis Direkleri ve Fileleri',
    ];

    /** @var array<int, int> canonical root id => navigation order */
    private const ROOT_ORDER = [
        367 => 1,
        373 => 2,
        378 => 3,
        384 => 4,
        393 => 5,
        398 => 6,
        403 => 7,
        408 => 8,
        441 => 9,
        612 => 10,
    ];

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $affectedIds = array_values(array_unique(array_merge(
            array_keys(self::PARENT_RULES),
            array_values(self::PARENT_RULES),
            array_keys(self::NAME_FIXES),
            array_keys(self::ROOT_ORDER),
            [777]
        )));
        $categories = ProductCategory::query()
            ->whereIn('id', $affectedIds)
            ->get()
            ->keyBy('id');

        $changes = [];
        foreach (self::PARENT_RULES as $categoryId => $parentId) {
            $category = $categories->get($categoryId);
            $parent = $categories->get($parentId) ?? ProductCategory::find($parentId);
            if (! $category || ! $parent || (int) $category->parent_id === $parentId) {
                continue;
            }
            $changes[] = [$categoryId, $category->category_name, 'parent_id', $category->parent_id, $parentId];
        }

        foreach (self::NAME_FIXES as $categoryId => $name) {
            $category = $categories->get($categoryId);
            if ($category && $category->category_name !== $name) {
                $changes[] = [$categoryId, $category->category_name, 'category_name', $category->category_name, $name];
            }
        }

        foreach (self::ROOT_ORDER as $categoryId => $order) {
            $category = $categories->get($categoryId);
            if ($category && (int) $category->display_order !== $order) {
                $changes[] = [$categoryId, $category->category_name, 'display_order', $category->display_order, $order];
            }
        }

        $duplicate = $categories->get(777);
        if ($duplicate && (int) $duplicate->status === 1) {
            $changes[] = [777, $duplicate->category_name, 'duplicate_slug', $duplicate->category_slug, 'pasif:kadin-giyim-eski-777'];
        }

        $this->table(['ID', 'Kategori', 'Alan', 'Eski', 'Yeni'], $changes);
        $this->info(sprintf('%d degisiklik bulundu. Mod: %s', count($changes), $apply ? 'APPLY' : 'DRY-RUN'));

        if (! $apply || $changes === []) {
            return self::SUCCESS;
        }

        $backupPath = $this->writeBackup($affectedIds);
        $this->info("Yedek: {$backupPath}");

        DB::transaction(function () use ($categories): void {
            foreach (self::PARENT_RULES as $categoryId => $parentId) {
                $category = $categories->get($categoryId);
                if (! $category || ! ProductCategory::whereKey($parentId)->exists()) {
                    continue;
                }
                $category->parent_id = $parentId;
                $category->save();
            }

            // Parent zincirlerinin tamamı yazıldıktan sonra seviyeleri hesapla;
            // böylece 3+ seviyeli dallarda eski parent durumu kullanılmaz.
            foreach (array_keys(self::PARENT_RULES) as $categoryId) {
                $category = ProductCategory::find($categoryId);
                if (! $category || $category->parent_id === null) {
                    continue;
                }
                $category->category_level = $this->categoryLevel((int) $category->parent_id) + 1;
                $category->save();
            }

            foreach (self::NAME_FIXES as $categoryId => $name) {
                $category = $categories->get($categoryId);
                if (! $category) {
                    continue;
                }
                $category->category_name = $name;
                $category->save();
                Translation::query()
                    ->where('translatable_type', ProductCategory::class)
                    ->where('translatable_id', $categoryId)
                    ->where('key', 'category_name')
                    ->update(['value' => $name]);
            }

            foreach (self::ROOT_ORDER as $categoryId => $order) {
                $category = $categories->get($categoryId);
                if (! $category) {
                    continue;
                }
                $category->display_order = $order;
                $category->save();
            }

            $duplicate = $categories->get(777);
            if ($duplicate) {
                $hasProducts = DB::table('products')->where('category_id', 777)->exists();
                $hasChildren = ProductCategory::where('parent_id', 777)->exists();
                if (! $hasProducts && ! $hasChildren) {
                    $duplicate->status = 0;
                    $duplicate->category_slug = 'kadin-giyim-eski-777';
                    $duplicate->save();
                } else {
                    $this->warn('Kategori #777 bos degil; duplicate otomatik pasif yapilmadi.');
                }
            }
        });

        Cache::forget('public_product_category_list');
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info('Kategori taksonomisi uygulandi ve public katalog cache versiyonu yenilendi.');

        return self::SUCCESS;
    }

    private function categoryLevel(int $categoryId): int
    {
        $level = 1;
        $seen = [];
        $category = ProductCategory::find($categoryId);
        while ($category && $category->parent_id !== null && ! isset($seen[$category->id])) {
            $seen[$category->id] = true;
            $level++;
            $category = ProductCategory::find($category->parent_id);
        }

        return $level;
    }

    private function writeBackup(array $categoryIds): string
    {
        $directory = storage_path('app/category-taxonomy-backups');
        File::ensureDirectoryExists($directory);
        $path = $directory . '/category-taxonomy-' . now()->format('Ymd-His') . '.json';
        $payload = [
            'created_at' => now()->toIso8601String(),
            'categories' => ProductCategory::query()->whereIn('id', $categoryIds)->get()->toArray(),
            'translations' => Translation::query()
                ->where('translatable_type', ProductCategory::class)
                ->whereIn('translatable_id', $categoryIds)
                ->get()
                ->toArray(),
            'product_counts' => DB::table('products')
                ->whereIn('category_id', $categoryIds)
                ->selectRaw('category_id, COUNT(*) as count')
                ->groupBy('category_id')
                ->get()
                ->toArray(),
        ];
        File::put($path, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $path;
    }
}
