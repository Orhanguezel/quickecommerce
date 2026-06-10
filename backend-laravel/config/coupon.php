<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Müşteri başına tek kullanımlık kupon kodları
    |--------------------------------------------------------------------------
    | Sistem normalde GENEL kuponlarda (customer_id = null) müşteri-başına
    | kullanım takibi tutmaz; yalnızca toplam usage_limit'e bakar. Bu listedeki
    | kodlar istisnadır: her müşteri yalnızca BİR KEZ kullanabilir. Kontrol,
    | müşterinin ödenmiş (paid) bir siparişinde bu kodu daha önce kullanıp
    | kullanmadığına bakılarak yapılır (order_masters.coupon_code).
    |
    | AYRILMA5: sepetten ayrılma (exit-intent) popup'ında sunulan %5 kuponu.
    */
    'once_per_customer_codes' => [
        'AYRILMA5',
    ],
];
