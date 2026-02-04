Aşağıdaki yol haritası, Sportoonline/Laravel yapınızda “EN var, TR eklenecek” yaklaşımını **admin permission’ı riske atmadan** ve **idempotent** seed mantığıyla ilerletmek için pratik bir çerçevedir.

## 1) En kritik tasarım kararı: “Çeviri nereye yazılıyor?”

Sizde halihazırda `translations` tablosu var ve `translatable_type` üzerinden polymorphic çalışıyor. Bu iyi; şu prensibi netleştirin:

* **Kaynak dil (source of truth):** Genelde `en` (modelin kendi kolonlarında).
* **Çeviri katmanı:** `translations` (language=tr, key=value).
* Model kolonlarını TR’ye çevirmeyin; TR sadece translations’da dursun. Böylece uygulama dili değişince veri karışmaz.

## 2) Her tablo için “i18n uygunluk” kontrol listesi

Bir tabloyu TR’ye eklemeden önce şu soruları cevaplayın:

1. **Hangi alanlar kullanıcıya görünen metin?**
   Örn. `title`, `name`, `description`, `short_description`, `button_text`, `meta_title`, `meta_description`, `slug` vb.

2. **Bu alanlar kod/iş mantığı için anahtar mı?**

   * `slug`, `code`, `sku`, `handle`, `type`, `status` gibi alanlar genelde **çevirilmez**.
   * `type` gibi alanlar bazen “enum” mantığında; kesinlikle çevirmeyin.

3. **Arama / filtreleme / SEO ile ilişkisi var mı?**

   * Çok dilli slug gerekiyorsa ayrı strateji gerekir (locale bazlı route). Aksi halde slug’ı tek dilde sabit bırakın.

4. **Frontend bu veriyi nasıl okuyor?**

   * “DB’den text al + locale’a göre çeviri çek” mi?
   * Yoksa backend response içinde “resolved translation” mı dönüyor?
     Uygulamada standart bir “resolve” katmanı olmalı.

## 3) Duplicate ve idempotency kuralı (sizde en önemli konu)

Sizde `translations` tablosunda **unique constraint yok**. Bu şu demek:

* “Aynı seed dosyası tekrar çalışırsa” **duplikasyon üretir**.
* Çözüm: Her seed’de TR eklemeden önce ilgili satırları **DELETE** edip sonra **INSERT** etmek.

Standart kural:

* `DELETE FROM translations WHERE translatable_type=? AND translatable_id IN (...) AND language='tr' AND key IN (...)`
* Sonra `INSERT ...`

Bu yaklaşımı her tabloda birebir uygulayın.

## 4) `translatable_type` isimleri standart olmalı

Sizde Banner için `App\Models\Banner` çıktı. Diğer modellerde de kesinleştirin:

Örn. kategori, ürün, sayfa, blog:

```sql
SELECT DISTINCT translatable_type
FROM translations
ORDER BY translatable_type;
```

Her model için hangi `translatable_type` kullanılıyor netleşmeden seed yazmayın. Yanlış type ile insert ederseniz “veri var ama UI’da yok” olur.

## 5) Hangi alanlar çevrilecek, hangileri çevrilmeyecek?

Genel kılavuz:

**Çevrilecekler**

* `name`, `title`, `description`, `short_description`, `content`
* Görsel alt metinleri: `alt`, `caption`
* CTA metinleri: `button_text`
* SEO metinleri: `meta_title`, `meta_description`

**Çevrilmeyecekler**

* `slug`, `sku`, `code`, `type`, `status`, `currency`, `country_code`
* Sistem mesaj anahtarları (örn. event adı, template key)

## 6) Türkçe karakter, escape ve charset riskleri

* DB zaten `utf8mb4` olduğu için karakter seti iyi.
* SQL seed içinde `'` geçen yerlerde **escape** şart:
  `%50''ye` gibi.
* “—” (em dash), akıllı tırnaklar, özel karakterler sorun yaratabilir; mümkünse düzleştirin veya doğru encode edin.

## 7) Admin permission güvenliği: Neyi asla yapmıyoruz?

Bu süreçte şu tablolara **dokunmuyoruz**:

* `roles`, `permissions`
* `model_has_roles`, `model_has_permissions`, `role_has_permissions`
* `users` (özellikle admin kullanıcıları)

Kural: i18n seed dosyaları sadece içerik tabloları + `translations` ile sınırlı kalacak.

## 8) Kademeli rollout planı (önerilen sıra)

1. **UI kritik**: banners, site_settings (hero/footer/about), categories
2. **Katalog**: products, product_attributes, tags
3. **CMS**: pages, blog posts, blog categories
4. **Transactional** (daha dikkatli): emails/templates, notifications (anahtarları çevirmeden sadece görünen metinleri)

Her modül için:

* önce “resolve” backend/FE’de çalışıyor mu test
* sonra seed ile TR ekle
* sonra doğrulama sorguları

## 9) Her seed dosyası için standart “doğrulama sorguları”

Her import sonrası şu iki kontrol zorunlu olsun:

**Var mı?**

```sql
SELECT COUNT(*) 
FROM translations
WHERE translatable_type='...'
  AND language='tr';
```

**Dupe var mı?**

```sql
SELECT translatable_id, `key`, COUNT(*) c
FROM translations
WHERE translatable_type='...'
  AND language='tr'
GROUP BY translatable_id, `key`
HAVING c > 1;
```

## 10) Uzun vadede yapılacak iyileştirme (opsiyonel ama güçlü)

`translations` için unique index eklemek dupe sorununu kökten çözer; fakat canlı sistemde önce dupe temizliği gerekir.

Hedef indeks:

* `(translatable_type, translatable_id, language, key)` UNIQUE

Bunu yapmadan da yol alabiliriz; ama çok tablo çevrileceği için orta vadede ciddi fayda sağlar.

---

İsterseniz bir sonraki adım olarak ben size “hangi tabloları çevireceğiz” listesini Sportoonline yapınıza göre çıkarayım: siz sadece içerik tablolarını söyleyin (products, categories, pages, blog vs.) veya `SHOW TABLES;` çıktısını paylaşın; ben modül bazında bir “TR seed backlog” (önceliklendirilmiş) planı yazayım.
