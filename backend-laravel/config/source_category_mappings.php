<?php

/*
 * Scraper kategori guvenlik politikasi.
 *
 * Her ScraperSourceRegistry kaynagi burada TANIMLI olmak zorundadir. Import
 * sirasinda kaynak kategori adi once `mappings` icinde aranir; bulunamazsa
 * kaynagin kanonik `fallback_category_id` degeri kullanilir. Import komutu
 * artik scraper metninden kategori olusturmaz. Boylece bozuk breadcrumb veya
 * yeni bir kaynak etiketi katalogda yeni root kategori uretemez.
 */
return [
    'eprotein' => ['fallback_category_id' => 1088],
    'animaljoy' => ['fallback_category_id' => 367],
    'everlast' => ['fallback_category_id' => 393],
    'swan' => ['fallback_category_id' => 393],
    'norfolk' => ['fallback_category_id' => 393],
    'superstacy' => ['fallback_category_id' => 393],
    'grandgiftstore' => ['fallback_category_id' => 384],
    'dekomum' => ['fallback_category_id' => 724],
    'maskotmeyvepresleri' => ['fallback_category_id' => 724],
    'ayakkabi' => [
        'fallback_category_id' => 421,
        'mappings' => [
            'ayak-sagligi-urunleri' => 421,
            'ayakkabi-ic-tabanliklar' => 421,
        ],
    ],
    'provitanya' => ['fallback_category_id' => 367],
    'proteinmax' => ['fallback_category_id' => 367],
    'linktech' => ['fallback_category_id' => 824],
    'herbinatura' => ['fallback_category_id' => 367],
    'dropick' => ['fallback_category_id' => 384],
    'speedwa' => ['fallback_category_id' => 373],
    'ceysport' => ['fallback_category_id' => 373],
    'bodyfitshop' => ['fallback_category_id' => 367],
    'eyb' => ['fallback_category_id' => 724],
    'crestaofficial' => ['fallback_category_id' => 378],
    'musullu' => ['fallback_category_id' => 724],
    'compexturkiye' => [
        'fallback_category_id' => 373,
        'mappings' => [
            'chattanooga' => 612,
            'compex-fitness-fit' => 373,
            'compex-spor-sp' => 373,
        ],
    ],
    'rovabatarya' => ['fallback_category_id' => 800],
    'proteinavm' => ['fallback_category_id' => 367],
    'protein7' => ['fallback_category_id' => 367],
    'yesilmarka' => ['fallback_category_id' => 367],
    'animalturkiye' => ['fallback_category_id' => 367],
    'musclepump' => ['fallback_category_id' => 367],
    'maraton' => ['fallback_category_id' => 393],
    'powertec' => ['fallback_category_id' => 1070],
    'raketspor' => ['fallback_category_id' => 384],
];
