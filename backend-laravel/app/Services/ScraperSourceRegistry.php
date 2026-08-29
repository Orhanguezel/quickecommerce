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
            ['name' => 'eprotein',            'platform' => 'Ticimax (Cloudflare, Scrapling)',  'site_url' => 'https://www.eprotein.com.tr',           'status' => self::STATUS_ACTIVE,  'db_source_name' => 'eprotein',            'notes' => '2026-07-27 GERI ACTIVE + kapsam daraltildi: CF asilamiyor sanilan sorun eksik bayrakmis — solve_cloudflare=true ile site HTTP 200 doruyor. Artik SADECE /spor-outdoor kategorisi cekilir (176 urun: ekipman/direnc lastigi/mat/aksesuar), supplement CEKILMEZ. Sayfalama parametresi "?sayfa=N" (?page= sessizce yok sayilir!). Urunler multiprice store#41 altina import edildi; eProtein magazasi#69 pasif kalir.'],
            ['name' => 'animaljoy',           'platform' => 'ikas (JSON-LD, CF yok)',             'site_url' => 'https://animaljoy.com.tr',              'status' => self::STATUS_ACTIVE,  'db_source_name' => 'animaljoy',           'notes' => '2026-07-27 EKLENDI. Animal Joy — yeni nesil sporcu gidalari, 50 urun. CF YOK: duz HTTP, stealth servise gerek yok (tam katalog 9 saniye). STOK TESPITI DOGRULANDI: 50 urunluk taramada 48 InStock / 1 OutOfStock (MCT OIL) — availability gercek deger uretiyor. Parser fail-CLOSED (alan okunamazsa stokta SAYILMAZ).'],
            ['name' => 'everlast',            'platform' => 'Shopify',                            'site_url' => 'https://www.everlast.com.tr',          'status' => self::STATUS_ACTIVE, 'db_source_name' => 'everlast',            'notes' => null],
            ['name' => 'swan',                'platform' => 'Shopify (variants stok)',            'site_url' => 'https://swansport.com',                 'status' => self::STATUS_PASSIVE, 'db_source_name' => 'swan',                'notes' => null],
            ['name' => 'norfolk',             'platform' => 'Shopify',                            'site_url' => 'https://norfolk.com.tr',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'norfolk',             'notes' => null],
            ['name' => 'superstacy',          'platform' => 'Shopify',                            'site_url' => 'https://superstacy.com',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'superstacy',          'notes' => null],
            // floky (Floky Socks) 2026-06-25 SILINDI: store#74 + urunleri soft-delete,
            // 290 mapping + scraper + JSON kaldirildi (kullanici karari). 0 siparis etkilendi.
            ['name' => 'grandgiftstore',      'platform' => 'WooCommerce Store API',              'site_url' => 'https://grandgiftstore.com',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'grandgiftstore',      'notes' => 'API native is_in_stock'],
            ['name' => 'dekomum',             'platform' => 'WooCommerce Store API',              'site_url' => 'https://dekomum.com',                   'status' => self::STATUS_ACTIVE, 'db_source_name' => 'dekomum',             'notes' => 'INT stok native. 2026-08-29 STOK TESPITI DOGRULANDI: WooCommerce Store API is_in_stock alanini gercekten okuyor (dekomum_scraper.py:193). \"stock_status=outofstock\" sorgusu 0 urun donuyor — magazada su an gercekten tukenmis urun yok, parser fail-open DEGIL. Health-check FAIL-OPEN SUPHESI alarmi bu yuzden bu kaynak icin beklenen bir durum; ilk tukenmis urun ciktiginda kendiliginden susar.'],
            ['name' => 'maskotmeyvepresleri', 'platform' => 'WooCommerce',                        'site_url' => 'https://www.maskotmeyvepresleri.com',  'status' => self::STATUS_ACTIVE, 'db_source_name' => 'maskotmeyvepresleri', 'notes' => null],
            ['name' => 'ayakkabi',            'platform' => 'OpenCart',                           'site_url' => 'https://www.ayakkabimalzememarket.com', 'status' => self::STATUS_ACTIVE, 'db_source_name' => 'ayakkabi',            'notes' => null],
            ['name' => 'provitanya',          'platform' => 'OpenCart',                           'site_url' => 'https://www.provitanya.com',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'provitanya',          'notes' => 'Sitemap recursive (2026-06-04 fix)'],
            ['name' => 'proteinmax',          'platform' => 'OpenCart',                           'site_url' => 'https://www.proteinmax.com.tr',         'status' => self::STATUS_ACTIVE, 'db_source_name' => 'proteinmax',          'notes' => '.ekle_button_stokta_yok detection'],
            ['name' => 'linktech',            'platform' => 'Odoo',                               'site_url' => 'https://www.linktech.com.tr',           'status' => self::STATUS_ACTIVE, 'db_source_name' => 'linktech',            'notes' => '/shop OOS listing tarama'],
            ['name' => 'herbinatura',         'platform' => 'IdeaSoft',                           'site_url' => 'https://www.herbinatura.com',           'status' => self::STATUS_ACTIVE,  'db_source_name' => 'herbinatura',         'notes' => '2026-07-27 ACTIVE (once yanlis gerekceyle pasife alinmisti). DUZELTME: availability alani yok teshisi hataliydi — test JSON-LD ariyordu, herbinatura IdeaSoft MICRODATA kullaniyor (link itemprop=availability href=schema.org/InStock). Parser herbinatura_scraper.py:154 zaten bunu okuyor. 51 urunluk TAM tarama: 50 InStock, 1 fetch-fail, 0 OutOfStock — yani 45/45 mapping stok>0 olmasi parser koru degil, katalogda gercekten tukenmis urun olmamasi. 2026-07-27 parser fail-CLOSED yapildi: alan okunamazsa artik stokta SAYILMIYOR.'],
            ['name' => 'dropick',             'platform' => 'OpenCart',                           'site_url' => 'https://www.dropick.com.tr',            'status' => self::STATUS_PASSIVE, 'db_source_name' => 'dropick',             'notes' => '2026-07-27 PASIF (kullanici kurali: stok sorunu olacak kaynagi acma). KANIT: 14 urun sayfasinin 11inde JSON-LD availability alani YOK; dropick_scraper.py:90 available = "outofstock" not in availability -> alan bosken STOKTA sayiyor. product_source_mappings gecmisi: 57 kaydin 57si de stok>0, hic 0 uretilmemis. Kalici cozum: sepete-ekle/tukendi gostergesinden fail-closed tespit.'],
            ['name' => 'speedwa',             'platform' => 'OpenCart',                           'site_url' => 'https://speedwa.com.tr',                'status' => self::STATUS_PASSIVE, 'db_source_name' => 'speedwa',             'notes' => '2026-07-27 PASIF (kullanici kurali: stok sorunu olacak kaynagi acma). KANIT: urun sayfalarinda HIC stok sinyali yok — ne JSON-LD availability ne tukendi metni (5/5 test). speedwa_scraper.py:232 sayfa metninde tukendi ariyor, bulamayinca available=True yaziyor -> 272 urun daima stokta. Gecmis: 272 kaydin 272si stok>0. Kalici cozum: gercek stok gostergesi bulunup fail-closed parser yazilmali.'],
            ['name' => 'ceysport',            'platform' => 'WooCommerce',                        'site_url' => 'https://ceysport.com',                  'status' => self::STATUS_ACTIVE, 'db_source_name' => 'ceysport',            'notes' => null],
            ['name' => 'bodyfitshop',         'platform' => 'WooCommerce',                        'site_url' => 'https://bodyfitshop.com.tr',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'bodyfitshop',         'notes' => null],
            ['name' => 'eyb',                 'platform' => 'WooCommerce',                        'site_url' => 'https://eyb.com.tr',                    'status' => self::STATUS_ACTIVE, 'db_source_name' => 'eyb',                 'notes' => null],
            ['name' => 'crestaofficial',      'platform' => 'WooCommerce',                        'site_url' => 'https://crestaofficial.com',            'status' => self::STATUS_ACTIVE, 'db_source_name' => 'crestaofficial',      'notes' => null],
            ['name' => 'musullu',             'platform' => 'WooCommerce',                        'site_url' => 'https://musullu.com',                   'status' => self::STATUS_ACTIVE, 'db_source_name' => 'musullu',             'notes' => null],
            ['name' => 'compexturkiye',       'platform' => 'WooCommerce (Cloudflare)',           'site_url' => 'https://compexturkiye.com',             'status' => self::STATUS_ACTIVE,  'db_source_name' => 'compexturkiye',       'notes' => '2026-07-27 GERI ACTIVE: CF gecilemiyor sanilan sorun eksik solve_cloudflare bayragiydi — site HTTP 200 doruyor. STOK TESPITI GUVENILIR: WooCommerce Store API native is_in_stock alani (woocommerce_scraper.py:140); DB gecmisinde 160 varyantin 27si stoksuz kayitli, yani False deger uretebiliyor.'],
            ['name' => 'rovabatarya',         'platform' => 'WooCommerce',                        'site_url' => 'https://rovabatarya.com',               'status' => self::STATUS_ACTIVE, 'db_source_name' => 'rovabatarya',         'notes' => null],
            ['name' => 'proteinavm',          'platform' => 'Ticimax (Cloudflare, Scrapling)',    'site_url' => 'https://proteinavm.com',                'status' => self::STATUS_ACTIVE,  'db_source_name' => 'proteinavm',          'notes' => '2026-07-27 GERI ACTIVE: CF sorunu eksik solve_cloudflare bayragiydi — HTTP 200. STOK TESPITI GUVENILIR: 10 urunluk testte 9 OutOfStock / 1 InStock dogru okundu (JSON-LD availability alani mevcut).'],
            ['name' => 'protein7',            'platform' => 'Custom',                             'site_url' => 'https://protein7.com.tr',               'status' => self::STATUS_PASSIVE, 'db_source_name' => 'protein7',           'notes' => '2026-06-17 PASIF: 45 urun RESIMSIZ oldugu icin store#33 pasif + urunler soft-delete edildi (kullanici karari). Kaynak resim URLleri (all_image_urls) CALISIYOR — resimler re-import edilip urunler restore edilince tekrar ACTIVE yapilir. Health-check "missing" alarmini bu yuzden GORMEZDEN GEL, RESTORE ETME.'],
            ['name' => 'yesilmarka',          'platform' => 'Custom',                             'site_url' => 'https://yesilmarka.com',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'yesilmarka',          'notes' => null],
            ['name' => 'animalturkiye',       'platform' => 'Custom (vitafy.com.tr klonu)',       'site_url' => 'https://www.animalturkiye.com',         'status' => self::STATUS_PASSIVE, 'db_source_name' => 'animalturkiye',       'notes' => 'Animal/Universal Nutrition. store#75. 2026-07-01 PASIF: animalturkiye.com/sitemap.xml artik kaynak site vitafy.com.tr /urun/ URL lerini listeliyor + vitafy sayfalari JSON-LD DEGIL custom HTML (span.price + Stok Var/TUKENDI, H1 yok, sayfada 24 fiyat). URL kesfi duzeltildi (/urun/ kabul) ama guvenli fiyat-scope parser gerek (yanlis fiyat riski). Vitafy HTML parser yazilinca ACTIVE. 24 urun.'],
            ['name' => 'musclepump',          'platform' => 'Custom (bool in_stock)',             'site_url' => 'https://musclepump.com',                'status' => self::STATUS_ACTIVE, 'db_source_name' => 'musclepump_import',   'notes' => null],

            // === Pasif (Cloudflare 1010, proxy bekliyor) ===
            ['name' => 'maraton',  'platform' => 'Scrapling (Cloudflare 1010)', 'site_url' => 'https://www.maraton.com.tr',  'status' => self::STATUS_PASSIVE, 'db_source_name' => 'maraton_import', 'notes' => 'CF 1010 IP bani 2026-06-02'],
            ['name' => 'powertec', 'platform' => 'Ticimax (powertecshop.com)',             'site_url' => 'https://www.powertec.com.tr', 'status' => self::STATUS_PASSIVE, 'db_source_name' => 'powertec',       'notes' => '2026-07-27 PASIF KALIYOR (kullanici karari: stok sorunu olacak kaynaklari acma). CF 1010 artik sorun degil (HTTP 200) AMA iki engel var: (1) powertec_scraper.py:181 avail boslugunda "stokta" varsayiyor (in_stock = "instock" in avail or avail == "") -> oversell riski; (2) powertecshop katalogu fon/tiras makinesi gibi kisisel bakim urunleri, spor katalogu ile alakasiz. Once stok tespiti fail-closed yapilmali.'],
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
