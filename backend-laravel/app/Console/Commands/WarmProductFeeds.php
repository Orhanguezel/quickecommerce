<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\V1\ProductFeedController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class WarmProductFeeds extends Command
{
    protected $signature = 'feeds:warm
                            {--feed= : Yalniz belirli feed (google|cimri); bos ise hepsi}';

    protected $description = 'Google ve Cimri urun feed cache\'lerini onceden olusturur — HTTP istegi cache miss ile yavasligin onune gecer.';

    public function handle(): int
    {
        $only = $this->option('feed');
        $feeds = [
            'google' => ['cache' => 'google_product_feed_v2', 'method' => 'google'],
            'cimri'  => ['cache' => 'cimri_product_feed_v3',  'method' => 'cimri'],
        ];

        if ($only && !isset($feeds[$only])) {
            $this->error("Bilinmeyen feed: {$only}. Gecerli: google, cimri.");
            return self::FAILURE;
        }
        if ($only) {
            $feeds = [$only => $feeds[$only]];
        }

        $controller = app(ProductFeedController::class);
        $exitCode = self::SUCCESS;

        foreach ($feeds as $name => $info) {
            $this->line("[{$name}] cache siliniyor...");
            Cache::forget($info['cache']);

            $started = microtime(true);
            try {
                $response = $controller->{$info['method']}();
                $body = (string) $response->getContent();
                $items = substr_count($body, '<item>');
                $duration = round(microtime(true) - $started, 2);
                $size = number_format(strlen($body) / 1024, 0) . ' KB';
                $this->info("[{$name}] OK — {$items} urun, {$size}, {$duration} sn (cache dolduruldu)");
            } catch (\Throwable $e) {
                $exitCode = self::FAILURE;
                $this->error("[{$name}] HATA: " . $e->getMessage());
            }
        }

        return $exitCode;
    }
}
