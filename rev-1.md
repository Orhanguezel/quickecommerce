# QuickEcommerce Revizyon 1 - Checklist

Tarih: 2026-03-24

> **UYARI:** Canli sunucuda `php artisan db:seed` (genel) ASLA calistirilmamali! Tum urunler, tema ayarlari ve mevcut veriler silinir. Sadece `--class=SeederAdi` ile spesifik seeder calistirilabilir. Detay: CLAUDE.md

## Durum

- [x] **1. Magaza ekleme akisi** — Komisyon/abonelik secimi sonrasi surec ilerlemiyor → TAMAMLANDI
- [x] **2. Kategori/ozellik ekleme kisitlamasi** — Seller menusunden kaldirildi → TAMAMLANDI
- [x] **3. Yazar listesi kaldirilacak** — Seller menusunden kaldirildi → TAMAMLANDI

### CANLIYA DEPLOY NOTU
Asagidaki SQL canlida calistirilacak (permission id'leri farkli olabilir, once kontrol et):
```sql
-- Seller menusunden Kategori, Ozellik, Yazar kaldirma
DELETE FROM role_has_permissions WHERE permission_id IN (
  SELECT id FROM permissions WHERE perm_title IN ('Categories','Attributes','Authors') AND available_for='store_level'
);
DELETE FROM permissions WHERE perm_title IN ('Categories','Attributes','Authors') AND available_for='store_level';
```
- [x] **4. Magazayi ziyaret et 404** — Link `/stores/details/` → `/{locale}/magaza/{slug}` olarak duzeltildi → TAMAMLANDI
- [x] **5. Cuzdan akisi eksikleri** — Wallet/deposit/transaction akisi kontrol edildi, store_id auto-select fix ile sorun cozuldu → TAMAMLANDI
- [x] **6. Para cekme talebi** — Withdraw request akisi kontrol edildi, store_id bazli calisiyor, sorun yok → TAMAMLANDI
- [x] **7. PayTR test modu bildirimi** — Canlida kapatilacak (asagidaki deploy notuna bak) → TAMAMLANDI

### CANLIYA DEPLOY NOTU — PayTR Test Modu
PayTR canli onay geldikten sonra:
1. `.env` dosyasinda `PAYTR_TEST_MODE=false` yap
2. Ya da admin panelden: Payment Settings → PayTR → "Test Mode" toggle'ini kapat
3. `php artisan db:seed --class=PaymentGatewaySeeder` (opsiyonel, .env degisikligi yeterli degilse)
- [x] **8. Kategori-varyant eslesmesi** — Incelendi: Varyantlar product_id'ye bagli, category_id yok. Bu yapisal bir tasarim, "EK" maddesiyle birlikte ele alinacak → ANALIZ TAMAMLANDI
- [x] **9. Sepete ekle butonu pozisyonu** — Mobilde sticky bottom bar eklendi (fiyat + sepete ekle), xl altinda gorunur → TAMAMLANDI
- [ ] **10. Kullanici sayfasi iyilestirmeleri** — Genel UI/UX iyilestirmeleri (spesifik detay bekleniyor)
- [x] **11. Banner/flash kart sayisi** — Kodda sabit limit yok, API tum bannerlari donuyor. Admin panelden yeni banner/flash deal eklenebilir → TAMAMLANDI (icerik ekleme isi)
- [x] **12. Kargo sistemi** — Incelendi: Gonderi/iade kodu ve kargo secimi calisiyor. Iade kargosu otomatik en ucuz seciliyor. Ilce hatasi adres NULL oldugunda fallback'te olusabilir, canlida test gerekiyor → ANALIZ TAMAMLANDI
- [x] **13. Tema rengi** — Tema rengi API'den dinamik geliyor (setting_options tablosu). Admin Panel → Theme Settings → Primary Color hex degerini logo tonundaki yesile degistir (ornek: #22C55E veya #16A34A) → TAMAMLANDI (admin islem)
- [ ] **14. Kullanici filtreleme** — Filtreleme kismi gozden gecirilecek (spesifik sorun detayi bekleniyor)
- [ ] **EK. Multi store type + varyant** — DB altyapisi hazir (store_store_types pivot tablosu mevcut). Frontend store_types array gonderiyor. Ture gore varyant filtreleme henuz implemente edilmedi, ayri planlama gerekiyor
