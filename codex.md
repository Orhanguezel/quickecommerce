Bu dosyayı düzenle:

Amaç:
- Daha okunabilir
- Tek sorumluluk
- Duplicate logic kaldır

Kısıtlar:
- Davranış değişmesin
- API sözleşmesi bozulmasın
- Minimal diff



Bu repoda:
- ESLint hatalarını temizle
- TypeScript strict uyumlu hale getir
- Build hatası kalmasın

Bunu cloud task olarak yap.
Her adımı raporla.


### Build Fix
npm run build başarısız.

Önce:
1. Hatanın kök sebebini açıkla
2. En az dosya değişikliğiyle çözüm öner

Sonra onayımı bekle.

#### temizlik 
Bu klasörde:
- unused kodları kaldır
- gereksiz abstraction sil
- isimlendirmeleri netleştir

Davranış değişmesin.


#### Codex’e rol ver:

Bu projede sen:
- Dikkatli bir senior frontend developer’sın
- Regression riskinden kaçınıyorsun
- Küçük diff tercih ediyorsun

#### Codex’e açık talimat ver
Şimdi bu repoda şu komutları sırayla çalıştır:
1) npm run lint
2) npm run test (yoksa pas geç)
3) npm run build

Her komutun çıktısını özetle, hata varsa kök sebebi + minimal fix öner.
Komut çalıştırmadan önce benden onay iste.




#### yapilacaklar 

Aşağıdaki plan, **minimal değişiklik** prensibiyle hazırlanmıştır. Önce gereksinimleri netleştirip en küçük düzeltmelerle uyumsuzlukları kapatacağız; sonrasında test ve hata düzeltmeye geçeceğiz.

**Plan**
1. Protokol kararlarını netleştir (gerekli 3 konu).
1. Frontend’de minimum değişiklikle URL/method/parametre uyumsuzluklarını düzelt.
1. Multipart upload ve auth header davranışını stabilize et.
1. Gerekirse backend’de çok küçük uyumluluk yamaları yap.
1. Küçük smoke test listesiyle doğrula, hata varsa düzelt.

**Netleştirilmesi Gereken 3 Konu**
1. `platform` değeri web için ne olacak? (`web` mi, `desktop` mı?)
1. `theme_name` hangi değer? (örn. `default`, `theme_one`)
1. Logout için tercih: yeni `customer` logout endpoint mi yoksa mevcut `/api/logout` mu?

Bunları netleştirelim; sonra 2. adımdan başlayıp değişiklikleri tek tek uygulayacağız.


#### Sıradaki Adım (Step 5)
Smoke test listesi hazırlayıp birlikte çalıştırabiliriz. Önerilen kısa set:

Login → /api/v1/customer/login
Logout → /api/logout (token ile)
Banner list → /api/v1/banner-list?theme_name=default&language=...
Slider list → /api/v1/slider-list?platform=web&language=...
Top deal → /api/v1/top-deal-products?... (GET)
Product suggestion → /api/v1/product-suggestion?query=...
Keyword suggestion → /api/v1/keyword-suggestion?query=...
HMAC → /api/v1/customer/generate-hmac?order_id=...
Extra charge → /api/v1/get-check-out-page-extra-info?product_ids[]=...
Support ticket message dosyalı ve dosyasız
Devam edelim mi? İstersen önce smoke testleri birlikte planlayıp çalıştıra


customer: testcustomer@example.com / Test1234! (id 108, email_verified=1)
