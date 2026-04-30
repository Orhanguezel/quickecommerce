# Swan Fiyat/Stok Sync Operasyon Notu

Tarih: 2026-04-24

Bu not, Swan Uniform urunlerinde fiyat/stok degisikliklerini guvenli takip etmek ve yeni oturumlarda baglami kaybetmemek icin hazirlandi.

## Mevcut Karar

- Faz 1 sadece `price`, `special_price`, `stock_quantity` alanlarini kapsar.
- Urun adi, aciklama, gorsel, kategori ve yeni urun importu otomatik degistirilmeyecek.
- Canlida otomatik `--apply` cron'u yoktur.
- Gunluk cron sadece Swan kaynak verisini ceker ve dry-run raporu uretir.
- Fiyat `0` veya gecersiz gelirse senkron varsayilan olarak bunu uygulamaz.
- Buyuk fiyat degisimleri `--max-change-percent` korumasina takilir.

## Canli Durum

- Canli backend path: `/var/www/quikecommerce/backend-laravel`
- Swan store ID: `46`
- Source name: `swan`
- Eslestirme tablosu: `product_source_mappings`
- Eslestirilmis varyant sayisi: `2094`
- Son canli kontrol: `2094` varyant kontrol edildi, `19` stok guncellemesi uygulandi.
- Son dry-run sonucu: `0` guncellenecek, `2094` degismeyen.
- Son kontrol edilen 0 fiyatli aktif Swan varyant sayisi: `0`
- Son uygulamada fiyat degisikligi yapilmadi; sadece stok guncellendi.

## Gunluk Cron

Canlida `.env` uzerinden aktif:

```env
SWAN_SYNC_STORE_ID=46
SWAN_SYNC_JSON_PATH=storage/app/source-sync/swan_products_latest.json
```

Zamanlama:

- `02:10` Swan kaynak verisi cekilir.
- `02:30` Swan fiyat/stok sync dry-run calisir.

Loglar:

- `storage/logs/swan-source-fetch.log`
- `storage/logs/swan-source-sync-dry-run.log`

Onemli: Bu cron DB'ye fiyat/stok yazmaz. Yazma islemi sadece elle `--apply` ile yapilir.

## Yarin Kontrol Edilecekler

1. Fetch logunda hata var mi kontrol et.

```bash
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && tail -80 storage/logs/swan-source-fetch.log'
```

2. Dry-run logunda fiyat anomalisi var mi kontrol et.

```bash
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && tail -120 storage/logs/swan-source-sync-dry-run.log'
```

3. Anomali sayaclari sifir mi bak.

Beklenen saglikli durum:

- `Gecersiz/0 fiyat`: `0`
- `Fiyat degisim limiti`: `0`
- `Hata`: `0`
- `Kaynakta bulunamayan`: `0`

4. Guncellenecek sayisi varsa once verbose dry-run ile detay gor.

```bash
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan sync:source-prices swan storage/app/source-sync/swan_products_latest.json --store_id=46 -v'
```

5. Sadece makul stok degisimleri varsa apply dusunulebilir. Fiyat degisimi varsa once kaynak sitedeki gercek fiyat elle dogrulanmadan apply yapma.

```bash
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan sync:source-prices swan storage/app/source-sync/swan_products_latest.json --store_id=46 --apply'
```

6. Apply sonrasi mutlaka tekrar dry-run calistir.

```bash
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan sync:source-prices swan storage/app/source-sync/swan_products_latest.json --store_id=46'
```

Beklenen apply sonrasi:

- `Guncellenecek`: `0`
- `Gecersiz/0 fiyat`: `0`
- `Fiyat degisim limiti`: `0`
- `Hata`: `0`

## Fiyat Anomalisi Gorulurse

Fiyat anomalisi su durumlardan biridir:

- Kaynak fiyat `0`, bos veya parse edilemez geliyor.
- Fiyat bir onceki degere gore belirlenen yuzde limitini asiyor.
- Kaynakta ayni slug/SKU icin beklenmeyen farkli fiyat gorunuyor.
- Site fiyatinda kampanya/indirim var ama sistemde beklenen `price` / `special_price` ayrimi net degil.

Bu durumda izlenecek sira:

1. `--apply` calistirma.
2. `-v` dry-run ile hangi varyantlarda fark oldugunu cikar.
3. Ilgili urunu Swan sitesinde manuel ac.
4. Admin panelde mevcut fiyatla karsilastir.
5. Gercek fiyat net degilse fiyat yazma; sadece not al.
6. Gerekirse komutu daha dusuk `--max-change-percent` ile tekrar dry-run calistir.

## Guvenlik Kontrolleri

0 fiyatli aktif Swan varyant kontrolu:

```bash
ssh vps-sportoonline "cd /var/www/quikecommerce/backend-laravel && php artisan tinker --execute='\$count = DB::table(\"product_variants as pv\")
    ->join(\"products as p\", \"p.id\", \"=\", \"pv.product_id\")
    ->where(\"p.store_id\", 46)
    ->whereNull(\"p.deleted_at\")
    ->whereNull(\"pv.deleted_at\")
    ->where(\"pv.status\", 1)
    ->whereRaw(\"coalesce(pv.price,0) <= 0 and coalesce(pv.special_price,0) <= 0\")
    ->count();
echo \$count;'"
```

Mapping durum ozeti:

```bash
ssh vps-sportoonline "cd /var/www/quikecommerce/backend-laravel && php artisan tinker --execute='
echo DB::table(\"product_source_mappings\")
    ->select(\"last_sync_status\", DB::raw(\"count(*) as total\"))
    ->where(\"source_name\", \"swan\")
    ->where(\"store_id\", 46)
    ->groupBy(\"last_sync_status\")
    ->get()
    ->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
'"
```

## Yeni Oturum Icin Kisa Ozet

- Swan otomasyonu Faz 1 olarak kuruldu.
- Kaynak veri `source:swan-fetch` komutu ile cekiliyor.
- Sync komutu `sync:source-prices swan ... --store_id=46`.
- Canlida schedule sadece dry-run yapiyor; otomatik apply yok.
- 0/gecersiz fiyatlar uygulanmiyor.
- Buyuk fiyat degisimleri guard ile durduruluyor.
- Yarin once loglar ve dry-run sonucu kontrol edilecek.
- Fiyat anomalisi varsa kaynak sitedeki gercek fiyat manuel dogrulanmadan canliya yazilmayacak.
