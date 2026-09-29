<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Symfony\Component\Process\Process;

/**
 * Urun gorsellerini Google Merchant / Googlebot icin guvenilir hale getirir.
 *
 * Canli veri olcumu (2026-09-29): media.path hicbir satirda dis URL tutmuyor.
 * Dis baglantilar iki bicimde yasiyor:
 *
 *  1) external — products.image / products.gallery_images alanina media ID
 *     yerine HAM dis URL yazilmis (import:products indirme basarisiz olunca
 *     URL'yi yaziyor; source-images:backfill dogrudan URL yaziyor). Bu URL'ler
 *     indirilir, WebP'ye cevrilir, yeni bir media satiri acilir ve urun
 *     alanindaki URL, media ID ile degistirilir.
 *
 *  2) local — media satiri yerel ama dosya uzantisi standart degil
 *     (Sygenix `.ashx`, uzantisiz adlar). Nginx bunlari
 *     application/octet-stream olarak sunar, feed uzanti filtresi eler, dosyalar
 *     1-2 MB PNG. Dosya WebP'ye cevrilip yeni adla yazilir, media.path guncellenir.
 *     Eski dosya SILINMEZ; media ID degismedigi icin urun alanlarina dokunulmaz.
 *
 * Idempotent: dis URL'nin dosya adi URL'nin sha1'inden turetilir; ikinci kosuda
 * ayni media satiri yeniden kullanilir. Yerel satirlar zaten standart uzantiya
 * gectigi icin ikinci kosuda secilmez.
 */
class LocalizeExternalMedia extends Command
{
    protected $signature = 'media:localize-external
        {--host=* : Yalniz bu dis host(lar) (orn. compexturkiye.com). Bos = tum dis hostlar}
        {--limit= : En fazla N gorsel isle (dis URL + yerel dosya toplami)}
        {--scope=all : external | local | all}
        {--dry-run : Hicbir sey indirme/yazma; ne yapilacagini listele}
        {--yes : Onay sorusunu atla (etkilesimsiz kosu icin zorunlu)}
        {--via-scraper : HTTP basarisiz olursa scrapers/_scrapling_client.py ile dene (yavas)}
        {--rollback= : Verilen rollback JSON dosyasini geri uygula ve cik}';

    protected $description = 'Urunlerin dis hostlardan hot-link edilen / standart disi uzantili gorsellerini yerel WebP media dosyalarina cevirir.';

    private const MAX_EDGE = 1600;
    private const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
    private const WEB_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    private const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv', 'ogv'];
    private const FOLDER = 'uploads/media-uploader/default';
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    private bool $dryRun = false;
    private ?string $rollbackFile = null;
    /** @var array{created_at:string, products:array<int,array{image:?string,gallery_images:?string}>, media:array<int,array<string,mixed>>, created_media_ids:array<int,int>} */
    private array $rollback;
    /** @var array<string,int> url => media id (bu kosuda) */
    private array $urlCache = [];
    /** @var array<string,int> */
    private array $stats = [
        'external_urls' => 0, 'external_localized' => 0, 'external_reused' => 0,
        'local_files' => 0, 'local_converted' => 0,
        'failed' => 0, 'skipped_video' => 0, 'products_updated' => 0,
    ];

    public function handle(): int
    {
        if ($this->option('rollback')) {
            return $this->applyRollback((string) $this->option('rollback'));
        }

        $scope = (string) $this->option('scope');
        if (! in_array($scope, ['external', 'local', 'all'], true)) {
            $this->error('--scope external|local|all olmali');
            return self::INVALID;
        }
        $this->dryRun = (bool) $this->option('dry-run');
        $limit = $this->option('limit') !== null ? max(0, (int) $this->option('limit')) : 0;
        $hosts = array_values(array_filter(array_map(
            fn ($h) => strtolower(trim((string) $h)),
            (array) $this->option('host')
        )));

        [$externalByProduct, $localMedia] = $this->collect($scope, $hosts);

        $this->printPlan($externalByProduct, $localMedia);

        if ($this->dryRun) {
            $this->comment('DRY-RUN: dosya indirilmedi, disk ve veritabani degismedi.');
            return self::SUCCESS;
        }
        if ($externalByProduct === [] && $localMedia === []) {
            $this->info('Islenecek gorsel yok.');
            return self::SUCCESS;
        }
        if (! $this->option('yes') && ! $this->confirm('Yukaridaki plan uygulansin mi?', false)) {
            $this->comment('Iptal edildi (degisiklik yok). Etkilesimsiz kosu icin --yes ekleyin.');
            return self::SUCCESS;
        }

        if (! function_exists('imagewebp')) {
            $this->warn('GD WebP destegi yok: JPEG olarak yazilacak.');
        }

        $this->rollback = [
            'created_at' => now()->toIso8601String(),
            'products' => [],
            'media' => [],
            'created_media_ids' => [],
        ];
        $this->rollbackFile = storage_path('app/media-localize-rollback-' . now()->format('Ymd-His') . '.json');
        $this->flushRollback();

        $budget = $limit > 0 ? $limit : PHP_INT_MAX;

        foreach ($externalByProduct as $productId => $urls) {
            if ($budget <= 0) {
                break;
            }
            $budget -= $this->localizeProduct((int) $productId, $budget);
        }

        foreach ($localMedia as $media) {
            if ($budget <= 0) {
                break;
            }
            $budget--;
            $this->convertLocalMedia($media);
        }

        // Media satiri degisiklikleri model observer tetiklemez; katalog cache'ini tazele.
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->flushRollback();

        $this->table(array_keys($this->stats), [array_values($this->stats)]);
        $this->info('Rollback dosyasi: ' . $this->rollbackFile);
        $this->line('Geri almak icin: php artisan media:localize-external --rollback=' . $this->rollbackFile);

        return self::SUCCESS;
    }

    // ------------------------------------------------------------------ toplama

    /**
     * @return array{0: array<int, array<int,string>>, 1: array<int, Media>}
     */
    private function collect(string $scope, array $hosts): array
    {
        $externalByProduct = [];
        $mediaIds = [];

        Product::withoutGlobalScopes()
            ->whereNull('deleted_at')
            ->select(['id', 'image', 'gallery_images'])
            ->orderBy('id')
            ->chunkById(1000, function ($products) use (&$externalByProduct, &$mediaIds, $scope, $hosts) {
                foreach ($products as $product) {
                    foreach ($this->imageValues($product) as $value) {
                        if ($this->isUrl($value)) {
                            if ($scope !== 'local' && $this->isTargetExternal($value, $hosts)) {
                                $externalByProduct[$product->id][] = $value;
                            }
                        } elseif (ctype_digit($value)) {
                            $mediaIds[(int) $value] = true;
                        }
                    }
                }
            });

        $localMedia = [];
        if ($scope !== 'external' && $hosts === []) {
            foreach (array_chunk(array_keys($mediaIds), 2000) as $chunk) {
                foreach (Media::query()->whereIn('id', $chunk)->get() as $media) {
                    if ($this->isNonStandardLocal((string) $media->path)) {
                        $localMedia[] = $media;
                    }
                }
            }
        }

        return [$externalByProduct, $localMedia];
    }

    private function printPlan(array $externalByProduct, array $localMedia): void
    {
        $byHost = [];
        foreach ($externalByProduct as $productId => $urls) {
            foreach ($urls as $url) {
                $host = $this->host($url);
                $byHost[$host]['urls'] = ($byHost[$host]['urls'] ?? 0) + 1;
                $byHost[$host]['products'][$productId] = true;
            }
        }
        $rows = [];
        foreach ($byHost as $host => $row) {
            $rows[] = [$host, $row['urls'], count($row['products'])];
        }
        usort($rows, fn ($a, $b) => $b[1] <=> $a[1]);
        $this->info('Dis URL (urun alanlarinda ham URL):');
        $this->table(['Host', 'URL', 'Urun'], $rows ?: [['-', 0, 0]]);

        $byExt = [];
        foreach ($localMedia as $media) {
            $ext = $this->extension((string) $media->path) ?: '(yok)';
            $key = strlen($ext) > 12 ? '(uzantisiz ad)' : $ext;
            $byExt[$key] = ($byExt[$key] ?? 0) + 1;
        }
        $this->info('Standart disi uzantili yerel media:');
        $this->table(['Uzanti', 'Media'], collect($byExt)->map(fn ($c, $e) => [$e, $c])->values()->all() ?: [['-', 0]]);

        if ($this->dryRun && $this->output->isVerbose()) {
            foreach ($externalByProduct as $productId => $urls) {
                foreach ($urls as $url) {
                    $this->line("  product #{$productId}: {$url} -> " . $this->externalTargetPath($url));
                }
            }
            foreach ($localMedia as $media) {
                $this->line("  media #{$media->id}: {$media->path} -> " . $this->localTargetPath($media));
            }
        }
    }

    // ------------------------------------------------------------ dis URL akisi

    /** Urunun dis URL'lerini isler; tuketilen butce (gorsel sayisi) doner. */
    private function localizeProduct(int $productId, int $budget): int
    {
        $product = Product::withoutGlobalScopes()->find($productId);
        if (! $product) {
            return 0;
        }
        $original = ['image' => $product->image, 'gallery_images' => $product->gallery_images];
        $hosts = array_values(array_filter(array_map(fn ($h) => strtolower(trim((string) $h)), (array) $this->option('host'))));

        $used = 0;
        $changed = false;
        $replace = function (?string $field) use (&$used, &$changed, $budget, $product, $hosts): ?string {
            if ($field === null || trim($field) === '') {
                return $field;
            }
            $parts = array_map('trim', explode(',', $field));
            foreach ($parts as $i => $value) {
                if (! $this->isUrl($value) || ! $this->isTargetExternal($value, $hosts) || $used >= $budget) {
                    continue;
                }
                $used++;
                $this->stats['external_urls']++;
                $mediaId = $this->localizeUrl($value, $product);
                if ($mediaId !== null) {
                    $parts[$i] = (string) $mediaId;
                    $changed = true;
                }
            }
            return implode(',', array_values(array_filter($parts, fn ($p) => $p !== '')));
        };

        $newImage = $replace($product->image);
        $newGallery = $replace($product->gallery_images);

        if ($changed) {
            // Once rollback, sonra yazma: yarida kesilen kosu da geri alinabilir.
            $this->rollback['products'][$productId] ??= $original;
            $this->flushRollback();
            $product->forceFill(['image' => $newImage, 'gallery_images' => $newGallery])->save();
            $this->stats['products_updated']++;
        }

        return max(1, $used);
    }

    private function localizeUrl(string $url, Product $product): ?int
    {
        if (isset($this->urlCache[$url])) {
            $this->stats['external_reused']++;
            return $this->urlCache[$url];
        }

        if (in_array($this->extension($url), self::VIDEO_EXTENSIONS, true)) {
            $this->stats['skipped_video']++;
            $this->recordFailure('video_not_image', ['url' => $url, 'product_id' => $product->id]);
            return null;
        }

        $relative = $this->externalTargetPath($url);
        $existing = Media::query()->where('path', $relative)->first();
        if ($existing && is_file($this->absolute($relative))) {
            $this->stats['external_reused']++;
            return $this->urlCache[$url] = (int) $existing->id;
        }

        try {
            $bytes = $this->download($url);
            [$width, $height, $format] = $this->writeConverted($bytes, $relative);
            $media = $existing ?: Media::query()->create([
                'user_id' => $product->store_id,
                'user_type' => Store::class,
                'format' => $format,
                'name' => basename($relative),
                'file_size' => formatBytes(filesize($this->absolute($relative)) ?: 0),
                'alt_text' => Str::limit((string) $product->name, 250, ''),
                'path' => $relative,
                'dimensions' => "{$width} x {$height} pixels",
            ]);
            if (! $existing) {
                $this->rollback['created_media_ids'][] = (int) $media->id;
            }
            $this->stats['external_localized']++;
            Log::info('media_localized', [
                'event' => 'media_localized', 'kind' => 'external', 'media_id' => $media->id,
                'product_id' => $product->id, 'host' => $this->host($url), 'path' => $relative,
            ]);
            return $this->urlCache[$url] = (int) $media->id;
        } catch (\Throwable $e) {
            $this->recordFailure($e->getMessage(), ['url' => $url, 'product_id' => $product->id]);
            return null;
        }
    }

    private function download(string $url): string
    {
        $scheme = parse_url($url, PHP_URL_SCHEME) ?: 'https';
        $referer = $scheme . '://' . $this->host($url) . '/';
        $error = 'download failed';

        try {
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
                'Referer' => $referer,
                'Accept' => 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language' => 'tr-TR,tr;q=0.9,en;q=0.8',
            ])->timeout(30)->connectTimeout(10)->get($url);

            $body = $response->body();
            if ($response->successful() && $body !== '' && strlen($body) <= self::MAX_DOWNLOAD_BYTES) {
                return $body;
            }
            $error = 'http_' . $response->status()
                . ($response->header('cf-mitigated') ? '_cf_' . $response->header('cf-mitigated') : '');
        } catch (\Throwable $e) {
            $error = 'http_exception: ' . Str::limit($e->getMessage(), 200);
        }

        if ($this->option('via-scraper')) {
            $script = base_path('../scrapers/_scrapling_client.py');
            if (is_file($script)) {
                $tmp = tempnam(sys_get_temp_dir(), 'media-localize-');
                try {
                    $process = new Process(['python3', $script, $url, '--output', $tmp, '--timeout', '150']);
                    $process->setTimeout(170);
                    $process->run();
                    if ($process->isSuccessful() && is_file($tmp) && filesize($tmp) > 0) {
                        return (string) file_get_contents($tmp);
                    }
                    $error .= '; scraper: ' . Str::limit(trim($process->getErrorOutput() ?: $process->getOutput()), 200);
                } finally {
                    @unlink($tmp);
                }
            }
        }

        throw new \RuntimeException($error);
    }

    // ------------------------------------------------------------ yerel akis

    private function convertLocalMedia(Media $media): void
    {
        $this->stats['local_files']++;
        $oldPath = (string) $media->path;
        $source = $this->absolute($oldPath);
        $target = $this->localTargetPath($media);

        try {
            if (! is_file($source)) {
                throw new \RuntimeException('source_file_missing');
            }
            $bytes = (string) file_get_contents($source);
            [$width, $height, $format] = is_file($this->absolute($target))
                ? $this->dimensionsOf($this->absolute($target))
                : $this->writeConverted($bytes, $target);

            $this->rollback['media'][(int) $media->id] ??= [
                'path' => $oldPath,
                'format' => $media->format,
                'name' => $media->name,
                'file_size' => $media->file_size,
                'dimensions' => $media->dimensions,
            ];
            $this->flushRollback();

            $media->forceFill([
                'path' => $target,
                'format' => $format,
                'name' => basename($target),
                'file_size' => formatBytes(filesize($this->absolute($target)) ?: 0),
                'dimensions' => "{$width} x {$height} pixels",
            ])->save();

            $this->stats['local_converted']++;
            Log::info('media_localized', [
                'event' => 'media_localized', 'kind' => 'local', 'media_id' => $media->id,
                'old_path' => $oldPath, 'path' => $target,
            ]);
        } catch (\Throwable $e) {
            $this->recordFailure($e->getMessage(), ['media_id' => $media->id, 'path' => $oldPath]);
        }
    }

    // ------------------------------------------------------------ gorsel isleme

    /**
     * Baytlari icerikten koklar (Content-Type'a guvenmez), en uzun kenari
     * MAX_EDGE'e indirir, WebP (yoksa JPEG) olarak yazar.
     *
     * @return array{0:int,1:int,2:string} genislik, yukseklik, format
     */
    private function writeConverted(string $bytes, string $relative): array
    {
        $info = @getimagesizefromstring($bytes);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes) ?: '';
        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/x-ms-bmp'];
        if (! is_array($info) || ! in_array($info['mime'] ?? '', $allowed, true) || ! str_starts_with($mime, 'image/')) {
            throw new \RuntimeException('not_an_image (sniffed ' . ($mime ?: 'unknown') . ')');
        }

        $image = Image::make($bytes);
        if (max($image->width(), $image->height()) > self::MAX_EDGE) {
            $image->resize(self::MAX_EDGE, self::MAX_EDGE, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        $webp = function_exists('imagewebp');
        $format = $webp ? 'webp' : 'jpg';
        if (! $webp) {
            // JPEG seffafligi desteklemez: beyaz zemine oturt.
            $image = Image::canvas($image->width(), $image->height(), '#ffffff')->insert($image);
        }

        $absolute = $this->absolute($relative);
        if (! is_dir(dirname($absolute))) {
            File::makeDirectory(dirname($absolute), 0755, true);
        }
        // Once gecici dosyaya yaz, sonra atomik tasi: yarim dosya asla sunulmaz.
        $tmp = $absolute . '.tmp-' . getmypid();
        // Format acikca verilir: aksi halde Intervention uzantiyi (.tmp-*) format sanir.
        $image->save($tmp, $webp ? 82 : 85, $format);
        if (! @rename($tmp, $absolute)) {
            @unlink($tmp);
            throw new \RuntimeException('write_failed');
        }

        return [$image->width(), $image->height(), $format];
    }

    /** @return array{0:int,1:int,2:string} */
    private function dimensionsOf(string $absolute): array
    {
        $info = @getimagesize($absolute);
        if (! is_array($info)) {
            throw new \RuntimeException('existing_target_not_image');
        }
        return [(int) $info[0], (int) $info[1], $this->extension($absolute)];
    }

    // ------------------------------------------------------------ rollback

    private function flushRollback(): void
    {
        if ($this->rollbackFile === null) {
            return;
        }
        File::put($this->rollbackFile, json_encode($this->rollback, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    private function applyRollback(string $file): int
    {
        if (! is_file($file)) {
            $this->error("Rollback dosyasi yok: {$file}");
            return self::FAILURE;
        }
        $data = json_decode((string) file_get_contents($file), true);
        if (! is_array($data)) {
            $this->error('Rollback dosyasi okunamadi.');
            return self::FAILURE;
        }
        $products = (array) ($data['products'] ?? []);
        $media = (array) ($data['media'] ?? []);
        $this->table(['Urun', 'Media'], [[count($products), count($media)]]);
        if ($this->option('dry-run')) {
            $this->comment('DRY-RUN: rollback uygulanmadi.');
            return self::SUCCESS;
        }
        if (! $this->option('yes') && ! $this->confirm('Rollback uygulansin mi?', false)) {
            return self::SUCCESS;
        }

        foreach ($products as $id => $old) {
            $product = Product::withoutGlobalScopes()->find((int) $id);
            $product?->forceFill(['image' => $old['image'] ?? null, 'gallery_images' => $old['gallery_images'] ?? null])->save();
        }
        foreach ($media as $id => $old) {
            Media::query()->whereKey((int) $id)->update(array_intersect_key(
                (array) $old,
                array_flip(['path', 'format', 'name', 'file_size', 'dimensions'])
            ));
        }
        // Olusturulan media satirlari ve yeni dosyalar kasten silinmez (baska urun kullaniyor olabilir).
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info('Rollback uygulandi.');
        return self::SUCCESS;
    }

    // ------------------------------------------------------------ yardimcilar

    private function recordFailure(string $reason, array $context): void
    {
        $this->stats['failed']++;
        Log::warning('media_localize_failed', ['event' => 'media_localize_failed', 'reason' => $reason] + $context);
        $this->warn('ATLANDI ' . json_encode($context, JSON_UNESCAPED_SLASHES) . " — {$reason}");
    }

    /** @return array<int,string> */
    private function imageValues($product): array
    {
        $values = [(string) $product->image];
        if (is_string($product->gallery_images) && trim($product->gallery_images) !== '') {
            array_push($values, ...explode(',', $product->gallery_images));
        }
        return array_values(array_filter(array_map('trim', $values), fn ($v) => $v !== ''));
    }

    private function isUrl(string $value): bool
    {
        return (bool) preg_match('#^https?://#i', $value);
    }

    private function isTargetExternal(string $url, array $hosts): bool
    {
        $host = $this->host($url);
        if ($host === '' || $this->isOwnHost($host)) {
            return false;
        }
        return $hosts === [] || in_array($host, $hosts, true);
    }

    private function isOwnHost(string $host): bool
    {
        $own = strtolower((string) parse_url((string) config('app.url'), PHP_URL_HOST));
        $strip = fn (string $h) => preg_replace('/^www\./', '', $h);
        return $own !== '' && $strip($host) === $strip($own);
    }

    private function isNonStandardLocal(string $path): bool
    {
        if ($path === '' || $this->isUrl($path)) {
            return false;
        }
        $ext = $this->extension($path);
        return ! in_array($ext, self::WEB_EXTENSIONS, true) && ! in_array($ext, self::VIDEO_EXTENSIONS, true);
    }

    private function host(string $url): string
    {
        return strtolower((string) parse_url($url, PHP_URL_HOST));
    }

    private function extension(string $pathOrUrl): string
    {
        $path = parse_url($pathOrUrl, PHP_URL_PATH) ?: $pathOrUrl;
        return strtolower(pathinfo(rawurldecode((string) $path), PATHINFO_EXTENSION));
    }

    private function externalTargetPath(string $url): string
    {
        $webp = function_exists('imagewebp');
        $slug = Str::slug(Str::limit(pathinfo(rawurldecode((string) parse_url($url, PHP_URL_PATH)), PATHINFO_FILENAME), 60, '')) ?: 'image';
        $hostSlug = Str::slug(preg_replace('/^www\./', '', $this->host($url)));
        return self::FOLDER . "/ext-{$hostSlug}-{$slug}-" . substr(sha1($url), 0, 12) . '.' . ($webp ? 'webp' : 'jpg');
    }

    private function localTargetPath(Media $media): string
    {
        $webp = function_exists('imagewebp');
        $base = pathinfo(rawurldecode(basename((string) $media->path)), PATHINFO_FILENAME);
        $slug = Str::slug(Str::limit($base, 80, '')) ?: 'media';
        return self::FOLDER . "/{$slug}-m{$media->id}." . ($webp ? 'webp' : 'jpg');
    }

    private function absolute(string $relative): string
    {
        return storage_path('app/public/' . ltrim($relative, '/'));
    }
}
