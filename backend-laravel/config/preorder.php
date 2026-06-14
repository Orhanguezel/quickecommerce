<?php

return [
    /*
    |--------------------------------------------------------------------------
    | On siparis (KALDIRILDI — 2026-06-14)
    |--------------------------------------------------------------------------
    |
    | "On Siparis / Tedarik Sureli" etiketi kullanici deneyimini bozuyordu
    | (stokta olan urun "3-5 gun" gibi gorununce donusum dusuyordu). Etiket
    | kaldirildi: bool_sources artik BOS -> products:flag-preorder tum
    | urunlerde is_preorder=0 yapar, frontend "Ön Siparis" gostermez.
    |
    | NOT: is_preorder=0 olunca PostOrderStockCheckJob iade-muafiyeti de kalkar
    | -> bool kaynak siparis sonrasi stok-out olursa otomatik iade edilir
    | (eskiden "tedarik bekle" idi). Bilincli karar.
    |
    | Tekrar acmak gerekirse: bool_sources'a kaynak adlarini ekle + flag komutu.
    |
    */
    'bool_sources' => [],

    /*
    |--------------------------------------------------------------------------
    | Gercek (int) miktar veren kaynaklar
    |--------------------------------------------------------------------------
    |
    | Bu kaynaklardan gelen urunler scraper'da GERCEK adet dondurur (bool 1/0
    | degil). Frontend bunlarda "Stokta (N)" gosterebilir. products:flag-preorder
    | bu listeye gore products.stock_is_exact=1 yapar; diger kaynaklar bool
    | (sembolik 1) oldugu icin sadece "Stokta" gosterir (yanlis "(1)" olmaz).
    |
    | Ampirik tespit (2026-06-14): JSON ciktilarinda stock_quantity>1 olan tek
    | kaynaklar provitanya (API /api/products) ve swan (Shopify int envanter).
    | Yeni gercek-miktar kaynagi eklendikce buraya yazilir.
    |
    */
    'exact_stock_sources' => [
        'provitanya',
        'swan',
    ],
];
