<?php

namespace App\Services;

/**
 * Tum scraper kaynaklarinin merkezi metadata kaydi.
 *
 * 2026-06-04: Onceden bu bilgi run-all.sh + ProductSourceMapping.source_name +
 * scraper dosya adlari arasinda dagilmisti. Bu sinif tek kanonik kayna.
 *
 * Yeni kaynak eklendiginde sadece burayi guncelle; admin dashboard ve
 * health-check otomatik yeni kaynagi tanir.
 */
class ScraperSourceRegistry
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_PASSIVE = 'passive';

    /**
     * @return array<int, array{
     *   name: string,
     *   platform: string,
     *   site_url: string,
     *   status: string,
     *   notes: ?string,
     *   db_source_name: string
     * }>
     */
    public static function all(): array
    {
        return [
            // === Aktif kaynaklar ===
            ['name' => 'eprotein',            'platform' => 'IdeaSoft (Cloudflare, Scrapling)', 'site_url' => 'https://www.eprotein.com.tr',           'status' => self::STATUS_PASSIVE, 'db_source_name' => 'eprotein',            'notes' => '2026-06-25 PASIF (kullanici karari): scraper pratikte olu — CF/IdeaSoft yerel stealth surekli HTTP 500, basarili gunlerde bile 570/570 varyant 14+ gun donmus (zararina satis riski). Store#69 status=0 + tum varyant stok=0. run-all.sh eprotein satiri comment. Calisir scraper yazilinca geri ACTIVE.'],
            ['name' => 'everlast',            'platform' => 'Shopify',                            'site_url' => 'https://www.everlast.com.tr',          'status' => self::STATUS_ACTIVE, 'db_source_name' => 'everlast',            'notes' => null],
            ['name' => 'swan',                'platform' => 'Shopify (variants stok)',            'site_url' => 'https://swansport.com',                 'status' => self::STATUS_PASSIVE, 'db_source_name' => 'swan',                'notes' => null],
            ['name' => 'norfolk',             'platform' => 'Shopify',                            'site_url' => 'https://norfolk.com.tr',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'norfolk',             'notes' => null],
            ['name' => 'superstacy',          'platform' => 'Shopify',                            'site_url' => 'https://superstacy.com',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'superstacy',          'notes' => null],
            ['name' => 'floky',               'platform' => 'Shopify',                            'site_url' => 'https://floky.tr',                      'status' => self::STATUS_PASSIVE, 'db_source_name' => 'floky',               'notes' => 'Floky Socks (2026-06-17 eklendi). 2026-06-25 PASIF: store#74 + urunleri 2026-06-18 SOFT-DELETE (deleted_at dolu) — gorunur urun yok, 290/290 missing alarmi uretiyordu. Silme bilerek miydi belirsiz; restore edilirse geri ACTIVE.'],
            ['name' => 'grandgiftstore',      'platform' => 'WooCommerce Store API',              'site_url' => 'https://grandgiftstore.com',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'grandgiftstore',      'notes' => 'API native is_in_stock'],
            ['name' => 'dekomum',             'platform' => 'WooCommerce Store API',              'site_url' => 'https://dekomum.com',                   'status' => self::STATUS_ACTIVE, 'db_source_name' => 'dekomum',             'notes' => 'INT stok native'],
            ['name' => 'maskotmeyvepresleri', 'platform' => 'WooCommerce',                        'site_url' => 'https://www.maskotmeyvepresleri.com',  'status' => self::STATUS_ACTIVE, 'db_source_name' => 'maskotmeyvepresleri', 'notes' => null],
            ['name' => 'ayakkabi',            'platform' => 'OpenCart',                           'site_url' => 'https://www.ayakkabimalzememarket.com', 'status' => self::STATUS_ACTIVE, 'db_source_name' => 'ayakkabi',            'notes' => null],
            ['name' => 'provitanya',          'platform' => 'OpenCart',                           'site_url' => 'https://www.provitanya.com',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'provitanya',          'notes' => 'Sitemap recursive (2026-06-04 fix)'],
            ['name' => 'proteinmax',          'platform' => 'OpenCart',                           'site_url' => 'https://www.proteinmax.com.tr',         'status' => self::STATUS_ACTIVE, 'db_source_name' => 'proteinmax',          'notes' => '.ekle_button_stokta_yok detection'],
            ['name' => 'linktech',            'platform' => 'Odoo',                               'site_url' => 'https://www.linktech.com.tr',           'status' => self::STATUS_ACTIVE, 'db_source_name' => 'linktech',            'notes' => '/shop OOS listing tarama'],
            ['name' => 'herbinatura',         'platform' => 'IdeaSoft',                           'site_url' => 'https://www.herbinatura.com',           'status' => self::STATUS_ACTIVE, 'db_source_name' => 'herbinatura',         'notes' => null],
            ['name' => 'dropick',             'platform' => 'OpenCart',                           'site_url' => 'https://www.dropick.com.tr',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'dropick',             'notes' => null],
            ['name' => 'speedwa',             'platform' => 'OpenCart',                           'site_url' => 'https://speedwa.com.tr',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'speedwa',             'notes' => null],
            ['name' => 'ceysport',            'platform' => 'WooCommerce',                        'site_url' => 'https://ceysport.com',                  'status' => self::STATUS_ACTIVE, 'db_source_name' => 'ceysport',            'notes' => null],
            ['name' => 'bodyfitshop',         'platform' => 'WooCommerce',                        'site_url' => 'https://bodyfitshop.com.tr',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'bodyfitshop',         'notes' => null],
            ['name' => 'eyb',                 'platform' => 'WooCommerce',                        'site_url' => 'https://eyb.com.tr',                    'status' => self::STATUS_ACTIVE, 'db_source_name' => 'eyb',                 'notes' => null],
            ['name' => 'crestaofficial',      'platform' => 'WooCommerce',                        'site_url' => 'https://crestaofficial.com',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'crestaofficial',      'notes' => null],
            ['name' => 'musullu',             'platform' => 'WooCommerce',                        'site_url' => 'https://musullu.com',                   'status' => self::STATUS_ACTIVE, 'db_source_name' => 'musullu',             'notes' => null],
            ['name' => 'compexturkiye',       'platform' => 'WooCommerce (Cloudflare)',           'site_url' => 'https://compexturkiye.com',             'status' => self::STATUS_PASSIVE, 'db_source_name' => 'compexturkiye',       'notes' => '2026-06-25 PASIF (CF sert duvar): yerel scraper fast=403 "Just a moment", dynamic+solve_cloudflare 102s yine gecemiyor. 1 haftadir FAIL (7/8). Store API CF arkasinda HTTP 500. Gercek cozum residential proxy. Veri 06-22 son-iyi halde donar; Faz1/30dk-net/escrow-guard oversell korur. Proxy gelince ACTIVE.'],
            ['name' => 'rovabatarya',         'platform' => 'WooCommerce',                        'site_url' => 'https://rovabatarya.com',               'status' => self::STATUS_ACTIVE, 'db_source_name' => 'rovabatarya',         'notes' => null],
            ['name' => 'proteinavm',          'platform' => 'Ticimax (Cloudflare, Scrapling)',    'site_url' => 'https://proteinavm.com',                'status' => self::STATUS_PASSIVE, 'db_source_name' => 'proteinavm',          'notes' => '2026-06-25 PASIF (CF sert duvar, compexturkiye ile ayni): yerel scraper CF gecemiyor (fast 403, dynamic+solve_cloudflare basarisiz), 1 haftadir FAIL. Gercek cozum residential proxy. Veri son-iyi halde donar; Faz1/net/guard korur. Proxy gelince ACTIVE.'],
            ['name' => 'protein7',            'platform' => 'Custom',                             'site_url' => 'https://protein7.com.tr',               'status' => self::STATUS_PASSIVE, 'db_source_name' => 'protein7',           'notes' => '2026-06-17 PASIF: 45 urun RESIMSIZ oldugu icin store#33 pasif + urunler soft-delete edildi (kullanici karari). Kaynak resim URLleri (all_image_urls) CALISIYOR — resimler re-import edilip urunler restore edilince tekrar ACTIVE yapilir. Health-check "missing" alarmini bu yuzden GORMEZDEN GEL, RESTORE ETME.'],
            ['name' => 'yesilmarka',          'platform' => 'Custom',                             'site_url' => 'https://yesilmarka.com',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'yesilmarka',          'notes' => null],
            ['name' => 'animalturkiye',       'platform' => 'Custom (JSON-LD, Cloudflare)',       'site_url' => 'https://www.animalturkiye.com',         'status' => self::STATUS_ACTIVE, 'db_source_name' => 'animalturkiye',       'notes' => 'Animal/Universal Nutrition resmi distributor. store#75. JSON-LD onarimi (tirnaksiz URL) + base64 aciklama temizligi. 2026-06-22 eklendi.'],
            ['name' => 'musclepump',          'platform' => 'Custom (bool in_stock)',             'site_url' => 'https://musclepump.com',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'musclepump_import',   'notes' => null],

            // === Pasif (Cloudflare 1010, proxy bekliyor) ===
            ['name' => 'maraton',  'platform' => 'Scrapling (Cloudflare 1010)', 'site_url' => 'https://www.maraton.com.tr',  'status' => self::STATUS_PASSIVE, 'db_source_name' => 'maraton_import', 'notes' => 'CF 1010 IP bani 2026-06-02'],
            ['name' => 'powertec', 'platform' => 'Cloudflare 1010',             'site_url' => 'https://www.powertec.com.tr', 'status' => self::STATUS_PASSIVE, 'db_source_name' => 'powertec',       'notes' => 'CF 1010 IP bani 2026-06-02'],
            ['name' => 'raketspor','platform' => 'Cloudflare 1010',             'site_url' => 'https://raketspor.com',       'status' => self::STATUS_PASSIVE, 'db_source_name' => 'raketspor',      'notes' => 'CF 1010 IP bani 2026-06-02'],
        ];
    }

    public static function find(string $name): ?array
    {
        foreach (self::all() as $src) {
            if ($src['name'] === $name || $src['db_source_name'] === $name) {
                return $src;
            }
        }
        return null;
    }

    public static function activeNames(): array
    {
        return array_values(array_map(fn ($s) => $s['name'],
            array_filter(self::all(), fn ($s) => $s['status'] === self::STATUS_ACTIVE)));
    }

    /** scraper'in JSON dosyasi yolu (data/source-products/{name}_products.json). */
    public static function jsonPath(string $name): string
    {
        return rtrim(config('scrapers.data_dir', '/var/www/quikecommerce/data/source-products'), '/')
            . "/{$name}_products.json";
    }
}
