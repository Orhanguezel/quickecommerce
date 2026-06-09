<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Bool-only (tedarik sureli / on siparis) kaynaklar
    |--------------------------------------------------------------------------
    |
    | Bu kaynaklardan (product_source_mappings.source_name) gelen urunler
    | bool stok (1/0) dondurur; gercek miktar belli degildir ve gun ici
    | tukenebilir. Bu yuzden frontend'de "Stokta" yerine "On Siparis /
    | Tedarik Sureli" gosterilir ve products:flag-preorder komutu bu listeye
    | gore products.is_preorder=1 yapar.
    |
    | Liste duzenlenebilir: gercekten guvenilir/numeric stoklu bir kaynak
    | (orn. swan) buraya EKLENMEZ. Bir kaynagi cikarip komutu tekrar
    | calistirinca o kaynagin urunleri normal "Stokta"ya doner.
    |
    */
    // DAR LISTE (2026-06-09): Sadece analizde gercekten stok-out + otomatik iade
    // ureten hizli-donen takviye kaynaklari. Tum bool-only kaynaklari koymak
    // katalogun ~%95'ini "On Siparis" yapip donusumu bozuyordu — bilerek dar
    // tutuldu. Yeni sorunlu kaynak cikarsa buraya eklenir.
    'bool_sources' => [
        'provitanya',
        'proteinmax',
        'eprotein',
        'proteinavm',
        'protein7',
        'musclepump_import',
    ],

    // Musteriye gosterilecek tahmini tedarik suresi notu (gun).
    'supply_days_text' => '3-5 iş günü',
];
