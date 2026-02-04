-- =============================================================
-- FILE: 90_banners_tr_translations.seed.sql
-- SAFE SEED (sportoonline)
-- - Does NOT touch roles/permissions/admin tables
-- - Prevents translation duplication (translations has no unique key)
-- - Adds Turkish (tr) translations for Banner fields
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- -------------------------------------------------------------
-- OPTIONAL: banners upsert (ŞU AN KAPALI)
-- Çünkü ID’ler DB’de zaten var ve siz sadece TR istiyorsunuz.
-- Eğer banners tablosundaki EN metinleri de "kaynak" olarak güncellemek isterseniz açarız.
-- -------------------------------------------------------------
/*
-- Example:
-- UPDATE banners SET title='...', description='...' WHERE id=4;
*/

-- -------------------------------------------------------------
-- TRANSLATIONS: TR upsert via DELETE + INSERT
-- translatable_type confirmed: App\Models\Banner
-- -------------------------------------------------------------

-- 1) Önce ilgili TR kayıtlarını temizle (idempotent)
DELETE FROM translations
WHERE translatable_type = 'App\\Models\\Banner'
  AND translatable_id IN (4,7,10,13,14,15,17,18,19,20,21,22,23)
  AND language = 'tr'
  AND `key` IN ('title','description','button_text');

-- 2) Sonra TR kayıtlarını ekle
INSERT INTO translations
(translatable_id, translatable_type, language, `key`, `value`, created_at, updated_at)
VALUES

-- ID 4
(4,  'App\\Models\\Banner', 'tr', 'title',       'Günlük İhtiyaçlar, Her Zaman Taze', NOW(3), NOW(3)),
(4,  'App\\Models\\Banner', 'tr', 'description', 'Güvenilir yerel satıcılardan kaliteli market ürünlerini hızlı teslim alın.', NOW(3), NOW(3)),
(4,  'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 7
(7,  'App\\Models\\Banner', 'tr', 'title',       'Her Mevsim İçin Stili Yeniden Tanımla', NOW(3), NOW(3)),
(7,  'App\\Models\\Banner', 'tr', 'description', 'Modada %50''ye Varan İndirim', NOW(3), NOW(3)),
(7,  'App\\Models\\Banner', 'tr', 'button_text', 'Şimdi Satın Al', NOW(3), NOW(3)),

-- ID 10
(10, 'App\\Models\\Banner', 'tr', 'title',       'Alışveriş Tutkunları İçin Buradayız', NOW(3), NOW(3)),
(10, 'App\\Models\\Banner', 'tr', 'description', 'Ekstra %50 İndirim', NOW(3), NOW(3)),
(10, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 13 (button_text yok)
(13, 'App\\Models\\Banner', 'tr', 'title',       'Sağlık Desteği Artık Çok Kolay', NOW(3), NOW(3)),
(13, 'App\\Models\\Banner', 'tr', 'description', 'Güvenli, sertifikalı ilaçlar; size uygun hızlı teslimatla kapınızda.', NOW(3), NOW(3)),

-- ID 14
(14, 'App\\Models\\Banner', 'tr', 'title',       'Trend Görünüm, Gün Boyu Konfor', NOW(3), NOW(3)),
(14, 'App\\Models\\Banner', 'tr', 'description', 'Konfor ve özgüven için tasarlanmış geniş günlük kombin koleksiyonunu keşfedin.', NOW(3), NOW(3)),
(14, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 15 (description/button_text yok)
(15, 'App\\Models\\Banner', 'tr', 'title',       'Online Mağazanı Bugün Aç', NOW(3), NOW(3)),

-- ID 17
(17, 'App\\Models\\Banner', 'tr', 'title',       'Her Mevsim İçin Stili Yeniden Tanımla', NOW(3), NOW(3)),
(17, 'App\\Models\\Banner', 'tr', 'description', 'Modada %50''ye Varan İndirim', NOW(3), NOW(3)),
(17, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 18
(18, 'App\\Models\\Banner', 'tr', 'title',       'Konuşan Güzellik', NOW(3), NOW(3)),
(18, 'App\\Models\\Banner', 'tr', 'description', 'Cesur renkler ve kusursuz bitişleri keşfedin', NOW(3), NOW(3)),
(18, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 19
(19, 'App\\Models\\Banner', 'tr', 'title',       'Sezon Sonu İndirimi', NOW(3), NOW(3)),
(19, 'App\\Models\\Banner', 'tr', 'description', 'Sınırlı süreli fırsatlar — kaçırmayın', NOW(3), NOW(3)),
(19, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 20
(20, 'App\\Models\\Banner', 'tr', 'title',       'Günlük Lüks', NOW(3), NOW(3)),
(20, 'App\\Models\\Banner', 'tr', 'description', 'Premium görünüm, içeride özel fırsatlar', NOW(3), NOW(3)),
(20, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 21
(21, 'App\\Models\\Banner', 'tr', 'title',       'Zarafet Yeniden Tanımlandı', NOW(3), NOW(3)),
(21, 'App\\Models\\Banner', 'tr', 'description', 'Kadın elbiselerinde %40''a varan indirim – Stilin konuşsun', NOW(3), NOW(3)),
(21, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 22
(22, 'App\\Models\\Banner', 'tr', 'title',       'Şıklığını Yanında Taşı', NOW(3), NOW(3)),
(22, 'App\\Models\\Banner', 'tr', 'description', 'deneme', NOW(3), NOW(3)),
(22, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3)),

-- ID 23
(23, 'App\\Models\\Banner', 'tr', 'title',       'Sezona Şık Gir', NOW(3), NOW(3)),
(23, 'App\\Models\\Banner', 'tr', 'description', 'Şık kombinler %45''e varan indirimle', NOW(3), NOW(3)),
(23, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışverişe Başla', NOW(3), NOW(3));

COMMIT;
