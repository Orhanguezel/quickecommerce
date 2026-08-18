<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductSourceMapping;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class CacheRemoteImages extends Command
{
    protected $signature = 'images:cache-remote
        {source : Source name (compex, dropick, linktech etc.)}
        {--store_id= : Limit to one store}
        {--product_ids= : Comma-separated product IDs to process}
        {--limit=0 : Maximum number of products (0 = all)}
        {--timeout=300 : Per-image download timeout in seconds}
        {--apply : Download, create Media rows and update products}';

    protected $description = 'Safely cache remote product images locally; dry-run unless --apply is provided.';

    public function handle(): int
    {
        $source = $this->normalizeSource((string) $this->argument('source'));
        $limit = max(0, (int) $this->option('limit'));
        $apply = (bool) $this->option('apply');
        $timeout = max(30, (int) $this->option('timeout'));

        $productIds = collect(explode(',', (string) $this->option('product_ids')))
            ->map(fn (string $id) => (int) trim($id))
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values();
        /** @var Collection<int, Product> $products */
        $products = ($productIds->isNotEmpty()
            ? Product::withoutGlobalScopes()
                ->whereIn('id', $productIds)
                ->when($this->option('store_id'), fn ($query) => $query->where('store_id', (int) $this->option('store_id')))
                ->orderBy('id')
                ->get()
            : ProductSourceMapping::query()
                ->with(['product' => fn ($query) => $query->withoutGlobalScopes()])
                ->where('source_name', $source)
                ->when($this->option('store_id'), fn ($query) => $query->where('store_id', (int) $this->option('store_id')))
                ->orderBy('id')
                ->get()
                ->pluck('product'))
            ->filter()
            ->unique('id')
            ->filter(fn (Product $product) => $this->remoteUrls($product)->isNotEmpty())
            ->when($limit > 0, fn (Collection $items) => $items->take($limit))
            ->values();

        $this->table(['Source', 'Store', 'Remote products', 'Mode'], [[
            $source,
            $this->option('store_id') ?: 'all',
            $products->count(),
            $apply ? 'APPLY' : 'DRY-RUN',
        ]]);

        if (! $apply || $products->isEmpty()) {
            if (! $apply) {
                $this->comment('No files or database rows changed. Add --apply after reviewing the count.');
            }
            return self::SUCCESS;
        }

        $script = base_path('../scrapers/_scrapling_client.py');
        if (! is_file($script)) {
            $this->error("Downloader not found: {$script}");
            return self::FAILURE;
        }

        $stats = ['products' => 0, 'images' => 0, 'failed' => 0, 'reused' => 0];
        foreach ($products as $product) {
            $images = $this->imageValues($product);
            $resolved = [];
            foreach ($images as $index => $value) {
                if (! $this->isRemote($value)) {
                    $resolved[] = $value;
                    continue;
                }
                try {
                    [$mediaId, $reused] = $this->cacheUrl($script, $source, $product, $value, $index, $timeout);
                    $resolved[] = (string) $mediaId;
                    $stats[$reused ? 'reused' : 'images']++;
                } catch (\Throwable $exception) {
                    $resolved[] = $value;
                    $stats['failed']++;
                    Log::warning('Remote product image cache failed', [
                        'source' => $source,
                        'product_id' => $product->id,
                        'url_host' => parse_url($value, PHP_URL_HOST),
                        'error' => $exception->getMessage(),
                    ]);
                    $this->warn("#{$product->id} image " . ($index + 1) . ': ' . $exception->getMessage());
                }
            }

            $product->forceFill([
                'image' => $resolved[0] ?? $product->image,
                'gallery_images' => count($resolved) > 1 ? implode(',', array_slice($resolved, 1)) : null,
            ])->save();
            $stats['products']++;
        }

        $this->table(['Processed products', 'New images', 'Reused', 'Failed'], [[
            $stats['products'], $stats['images'], $stats['reused'], $stats['failed'],
        ]]);

        return $stats['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /** @return array{0:int,1:bool} */
    private function cacheUrl(string $script, string $source, Product $product, string $url, int $index, int $timeout): array
    {
        $localMedia = $this->localMediaFromUrl($url);
        if ($localMedia) {
            return [(int) $localMedia->id, true];
        }

        $baseName = Str::slug($source . '-' . ($product->slug ?: $product->id) . '-' . ($index + 1));
        $relativePrefix = 'uploads/media-uploader/default/' . $baseName;
        $existing = Media::query()->where('path', 'like', $relativePrefix . '.%')->first();
        if ($existing && is_file(storage_path('app/public/' . $existing->path))) {
            return [(int) $existing->id, true];
        }

        $temporary = tempnam(sys_get_temp_dir(), 'remote-image-');
        if ($temporary === false) {
            throw new \RuntimeException('Could not create temporary file');
        }

        try {
            $process = new Process(['python3', $script, $url, '--output', $temporary, '--timeout', (string) $timeout]);
            $process->setTimeout($timeout + 15);
            $process->run();
            if (! $process->isSuccessful()) {
                $error = json_decode(trim($process->getErrorOutput()), true);
                throw new \RuntimeException((string) ($error['error'] ?? trim($process->getErrorOutput()) ?: 'download failed'));
            }

            $info = @getimagesize($temporary);
            if (! is_array($info) || empty($info['mime']) || ! str_starts_with($info['mime'], 'image/')) {
                throw new \RuntimeException('Downloaded payload is not a valid image');
            }
            $extension = match ($info['mime']) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/avif' => 'avif',
                default => 'webp',
            };
            $relativePath = $relativePrefix . '.' . $extension;
            $absolutePath = storage_path('app/public/' . $relativePath);
            if (! is_dir(dirname($absolutePath))) {
                mkdir(dirname($absolutePath), 0755, true);
            }
            if (! is_file($absolutePath) && ! copy($temporary, $absolutePath)) {
                throw new \RuntimeException('Could not copy image into public storage');
            }

            $bytes = filesize($absolutePath) ?: 0;
            $media = Media::query()->firstOrCreate(
                ['path' => $relativePath],
                [
                    'user_id' => $product->store_id,
                    'user_type' => \App\Models\Store::class,
                    'format' => $extension,
                    'name' => basename($relativePath),
                    'file_size' => number_format($bytes / 1024, 2) . ' KB',
                    'alt_text' => $product->name,
                    'dimensions' => $info[0] . ' x ' . $info[1] . ' pixels',
                ]
            );

            return [(int) $media->id, false];
        } finally {
            if (is_file($temporary)) {
                @unlink($temporary);
            }
        }
    }

    private function localMediaFromUrl(string $url): ?Media
    {
        $urlHost = strtolower((string) parse_url($url, PHP_URL_HOST));
        $appHost = strtolower((string) parse_url((string) config('app.url'), PHP_URL_HOST));
        if ($urlHost === '' || $appHost === '' || $urlHost !== $appHost) {
            return null;
        }

        $path = rawurldecode(ltrim((string) parse_url($url, PHP_URL_PATH), '/'));
        if (! str_starts_with($path, 'storage/')) {
            return null;
        }

        $relativePath = substr($path, strlen('storage/'));
        $media = Media::query()->where('path', $relativePath)->first();

        return $media && is_file(storage_path('app/public/' . $relativePath)) ? $media : null;
    }

    private function remoteUrls(Product $product): Collection
    {
        return collect($this->imageValues($product))->filter(fn (string $value) => $this->isRemote($value));
    }

    /** @return array<int,string> */
    private function imageValues(Product $product): array
    {
        $values = [(string) $product->image];
        if (is_string($product->gallery_images) && trim($product->gallery_images) !== '') {
            array_push($values, ...array_map('trim', explode(',', $product->gallery_images)));
        }
        return array_values(array_filter($values, fn (string $value) => $value !== ''));
    }

    private function isRemote(string $value): bool
    {
        return str_starts_with($value, 'https://') || str_starts_with($value, 'http://');
    }

    private function normalizeSource(string $source): string
    {
        $normalized = Str::of($source)->lower()->replace(['_products', '-products'], '')->slug('_')->toString();
        return ['compex' => 'compexturkiye'][$normalized] ?? $normalized;
    }
}
