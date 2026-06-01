<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->daily();

Schedule::command('subscription:expire')->everyMinute();
Schedule::command('currency:update-rates --base=USD')->hourly();
Schedule::command('recommendations:build-co-purchase')->dailyAt('03:00')->withoutOverlapping();
Schedule::command('abandoned-cart:dispatch-reminders')->everyFifteenMinutes()->withoutOverlapping();
Schedule::command('products:compute-velocity')->dailyAt('04:00')->withoutOverlapping();
Schedule::command('products:prune-stale --months=' . env('PRODUCT_STALE_RETENTION_MONTHS', 6) . ' --force')
    ->weeklyOn(0, '03:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/product-prune-stale.log'));
Schedule::command('analytics:prune-funnel-events --days=' . env('FUNNEL_EVENTS_RETENTION_DAYS', 180))->dailyAt('04:30')->withoutOverlapping();
Schedule::command('orders:prune-unpaid --hours=' . env('ORDER_UNPAID_RETENTION_HOURS', 6) . ' --force')
    ->hourly()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/order-prune-unpaid.log'));

// Google + Cimri urun feed'lerini her 4 saatte bir onceden uret: HTTP istek
// anindaki cache miss yerine cron'da kontrollu uretim. Cache 6 saat oldugu
// icin 4 saatlik aralik her zaman taze tutar; istek <1 sn'de servis edilir.
Schedule::command('feeds:warm')
    ->cron('15 */4 * * *')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/feeds-warm.log'));

$swanSyncStoreId = env('SWAN_SYNC_STORE_ID');
$swanSyncJsonPath = env('SWAN_SYNC_JSON_PATH', 'storage/app/source-sync/swan_products_latest.json');

if ($swanSyncStoreId) {
    Schedule::command("source:swan-fetch --output={$swanSyncJsonPath}")
        ->dailyAt('02:10')
        ->withoutOverlapping()
        ->appendOutputTo(storage_path('logs/swan-source-fetch.log'));

    Schedule::command("sync:source-prices swan {$swanSyncJsonPath} --store_id={$swanSyncStoreId}")
        ->dailyAt('02:30')
        ->withoutOverlapping()
        ->appendOutputTo(storage_path('logs/swan-source-sync-dry-run.log'));
}

