<?php
/*
 * Kategori alias mapping — taxonomy cleanup 2026-05-24 sonrasi.
 *
 * Amac: import:products scraperlardan gelen JSON'larda silinen/merge edilen
 * kategori isimleri varsa, findOrCreateCategory yeni duplicate yaratmasin —
 * burdaki canonical ID'ye yonelt.
 *
 * Format: 'silinen-slug' => canonical_category_id
 *
 * Yeni merge olunca buraya satir ekle. Build script:
 *   php /tmp/build_alias_map.php
 * (cleanup script backup CSV'lerini okur)
 */

return [
    'aksesuarlar' => 663,
    'saglik-sporcu-besinleri' => 711,
];
