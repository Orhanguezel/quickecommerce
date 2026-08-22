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
Schedule::command('orders:check-shipping-sla')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/orders-shipping-sla.log'));
Schedule::command('orders:report-shipping-sla --days=7 --notify')
    ->weeklyOn(1, '08:30')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/orders-shipping-sla-weekly.log'));
Schedule::command('commerce:refresh-readiness --apply')
    ->dailyAt('05:30')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/commerce-readiness.log'));
Schedule::command('commerce:enforce-product-quality --apply')
    ->dailyAt('06:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/commerce-quality-gate.log'));
Schedule::command('commerce:enforce-store-readiness --grace-days=7 --apply')
    ->dailyAt('08:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/store-readiness.log'));
Schedule::command('commerce:report-homepage-featured --days=7 --notify')
    ->weeklyOn(1, '08:15')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/homepage-featured-weekly.log'));
Schedule::command('abandoned-cart:audit-coverage --days=30 --notify')
    ->dailyAt('10:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/abandoned-cart-coverage.log'));
Schedule::command('payments:audit-integrity --days=2 --notify')
    ->dailyAt('07:30')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-integrity-audit.log'));
// Teslim edilen siparisler icin urun degerlendirme daveti — sadece gunduz (11:00-19:00 TR)
Schedule::command('orders:dispatch-review-requests')
    ->everyThirtyMinutes()
    ->between('11:00', '19:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping();
Schedule::command('orders:dispatch-replenishment-reminders --days=30 --limit=200')
    ->dailyAt('11:15')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/replenishment-reminders.log'));
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

// Suresi dolmus e-posta dogrulama kodlarini temizle. Kodlar 15 dk gecerli,
// 1 saatlik pencere sayaci icin biraz daha bekletilir (2 saat sonra silinir).
Schedule::call(function () {
    \App\Models\EmailVerificationCode::where('expires_at', '<', now()->subHours(2))->delete();
})->hourly()->name('prune-email-verification-codes')->withoutOverlapping();

// Google + Cimri urun feed'lerini her 2 saatte bir onceden uret: HTTP istek
// anindaki cache miss yerine cron'da kontrollu uretim. Cache 6 saat oldugu
// icin 2 saatlik aralik cache eviction olsa bile her zaman taze tutar.
// (4 saat aralikta arada eviction olursa bot 4-5 ardisik 500 alirdi)
Schedule::command('feeds:warm')
    ->cron('15 */2 * * *')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/feeds-warm.log'));

// 5xx alarmi: her saat son 1 saatlik hata sayisini kontrol et;
// esik (varsayilan 100/sa) asilirsa Telegram + Laravel ERROR log'una uyari.
Schedule::command('monitor:5xx-alarm --threshold=' . env('ALARM_5XX_THRESHOLD', 100))
    ->hourly()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/monitor-5xx.log'));
Schedule::command('monitor:commerce-health --notify')
    ->dailyAt('07:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/commerce-health.log'));

// Scraper saglik kontrolu: gunluk scrape cron'u 02:00 UTC'de basladigi icin
// ~7 saat sonra (TR 09:00) sonuclari rapor et. Sorun varsa Telegram'a digest.
// 2026-06-04: provitanya 10 gun sessizce 404 alip yok satisa sebep oldu;
// bu rapor sessiz fail'leri yakalamak icin.
Schedule::command('scrapers:health-check --quiet-when-ok')
    ->dailyAt('09:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scrapers-health.log'));
Schedule::command('scrapers:enforce-freshness --hours=36 --apply')
    ->hourlyAt(20)
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scrapers-freshness.log'));
Schedule::command('search:report-zero-results --hours=24 --min-count=2 --notify')
    ->dailyAt('09:15')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/search-zero-results.log'));
Schedule::command('search:reindex-products --apply')
    ->dailyAt('05:45')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/search-reindex.log'));

// Haftalik trafik raporu: her Pazartesi 08:00 (TR) son 7 gunluk
// trafik+hata raporunu storage/app/reports/ altina HTML olarak yazar.
Schedule::command('reports:weekly-traffic')
    ->weeklyOn(1, '08:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/reports-weekly.log'));

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
