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
Schedule::command('analytics:prune-funnel-events --days=' . env('FUNNEL_EVENTS_RETENTION_DAYS', 180))->dailyAt('04:30')->withoutOverlapping();
Schedule::command('orders:prune-unpaid --hours=' . env('ORDER_UNPAID_RETENTION_HOURS', 6) . ' --force')
    ->hourly()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/order-prune-unpaid.log'));

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

