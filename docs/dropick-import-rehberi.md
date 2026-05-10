# Dropick Urun Import Rehberi — Canli Sunucu

## Onkosullar

1. SSH ile sunucuya baglan
2. Proje dizinine gec: `cd /var/www/quickecommerce/backend-laravel` (ya da canli path neyse)
3. Asagidaki dosyalarin sunucuda olmasi gerekir:
   - `data/source-products/dropick_products.json` (74 urun verisi — scraper ciktisi)
   - `assets/source-images/dropick_images/` klasoru (248 gorsel, ~200 MB)
   - `app/Console/Commands/ImportDropickProducts.php` (artisan komutu)

## Adim 1: Dosyalari Sunucuya Yukle

```bash
# Lokaldeki dosyalari sunucuya kopyala
scp data/source-products/dropick_products.json kullanici@sunucu:/var/www/quickecommerce/data/source-products/
rsync -az assets/source-images/dropick_images/ kullanici@sunucu:/var/www/quickecommerce/assets/source-images/dropick_images/

# Import komut dosyasi zaten git'te — deploy ettiysen otomatik gelir
# Degilse elle kopyala:
scp backend-laravel/app/Console/Commands/ImportDropickProducts.php \
    kullanici@sunucu:/var/www/quickecommerce/backend-laravel/app/Console/Commands/
```

## Adim 2: Store ID'yi Belirle

```bash
cd /var/www/quickecommerce/backend-laravel

php artisan tinker --execute="echo App\Models\Store::select('id','name','store_type')->get()->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);"
```

Ciktisindan Dropick urunlerini eklemek istedigin magazanin ID'sini not al.

## Adim 3: Dry-Run (Onizleme)

Gercek import oncesi mutlaka dry-run yap:

```bash
php artisan import:dropick ../data/source-products/dropick_products.json {STORE_ID} --dry-run --status=approved --type=sports --lang=tr
```

Beklenen cikti:
- 73 urun import edilecek
- 5 kategori olusturulacak
- 0 hata

## Adim 4: Gercek Import

```bash
php artisan import:dropick ../data/source-products/dropick_products.json {STORE_ID} --status=approved --type=sports --lang=tr
```

Bu komut su islemleri yapar:
- **5 kategori** olusturur (Pickleball Raketleri, Toplari, Giyim, Aksesuarlar, Portatif Fileler)
- **73 urun** olusturur (isim, slug, HTML aciklama, status)
- **73 variant** olusturur (fiyat, indirimli fiyat, stok=100, SKU)
- **~248 gorsel** indirir ve Media tablosuna kaydeder (ana gorsel + galeri)
- **Ozellikler** kaydeder (malzeme, kalinlik, seviye vs.)
- **Turkce ceviriler** ekler

Sure: ~2-3 dakika (gorsel indirme dahil)

## Parametreler

| Parametre | Varsayilan | Aciklama |
|-----------|-----------|----------|
| `--status` | approved | Urun statusu: pending, approved, inactive |
| `--type` | sports | Store type: sports, general, clothing vs. |
| `--lang` | tr | Ceviri dili |
| `--dry-run` | - | DB'ye yazmadan onizleme |
| `--skip-images` | - | Gorsel indirmeyi atla |

## Import Sonrasi Kontrol

```bash
# Urun sayisini dogrula
php artisan tinker --execute="echo App\Models\Product::where('store_id', {STORE_ID})->count();"

# Gorselleri dogrula
php artisan tinker --execute="echo App\Models\Media::where('user_id', {STORE_ID})->where('user_type','App\Models\Store')->count();"

# Kategorileri dogrula
php artisan tinker --execute="echo App\Models\ProductCategory::where('type','sports')->latest()->take(10)->get(['id','category_name'])->toJson(JSON_UNESCAPED_UNICODE);"
```

## Onemli Uyarilar

- **Duplicate kontrolu**: Slug bazli — ayni slug varsa atlar, tekrar calistirmak guvenlidir
- **Gorseller**: `storage/app/public/uploads/media-uploader/default/` altina kaydedilir
- **Storage link**: `php artisan storage:link` daha once calistirilmis olmali (gorsellerin web'den gorunmesi icin)
- **Dosya izinleri**: Gorsel klasorlerinin yazilabilir oldugundan emin ol: `chmod -R 775 storage/app/public/uploads/`
- **Geri alma**: Bir sorun olursa asagidaki sorgu ile temizlenebilir (DIKKATLI KULLAN):

```bash
php artisan tinker --execute="
\$ids = App\Models\Product::where('store_id', {STORE_ID})->where('slug','like','dropick-%')->pluck('id');
App\Models\ProductVariant::whereIn('product_id', \$ids)->delete();
App\Models\ProductSpecification::whereIn('product_id', \$ids)->delete();
App\Models\Translation::where('translatable_type','App\Models\Product')->whereIn('translatable_id', \$ids)->delete();
App\Models\Product::whereIn('id', \$ids)->forceDelete();
echo count(\$ids).' urun silindi';
"
```
