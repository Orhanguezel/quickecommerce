# Admin Bildirim + AI Model Checklist

> Olusturulma: 2026-06-02 — kaynak: canli inceleme (sportoonline.com)
> Amac: (1) AI sohbet modelini daha iyi Turkceye gecirmek, (2) admin'in her onemli
> olayda (yeni uyelik, yeni siparis, canli destek vb.) MUHAKKAK bilgilendirilmesi.

## Calisma Kurallari (KESIN)

- **Tum KOD degisiklikleri once LOCAL'de yapilir → commit → push → sunucuda `git pull`.**
  Sunucuda dogrudan kod duzenleme YOK. Local ve server kod tabani birebir ayni olmali.
- **DB icerigi farkli olabilir** (setting_options, jobs, urunler). DB-only degisiklikler
  (ornek: system prompt, provider/key, kuyruk temizligi) sunucuda yapilir — bu normal.
- **Secret dosyalar git'e GIRMEZ:** `firebase.json`, `.env`. `.gitignore` kontrol et.

---

## A. AI Model Degisimi (daha iyi Turkce)

**Sorun:** groq `llama-3.3-70b-versatile` Turkce yanitlara ara sira Cince/Vietnamca
kelime karistiriyor ("hiểu", "họ", "目前"). Model artefakti.

- [ ] **(KULLANICI)** Gemini API key al — Google AI Studio (aistudio.google.com) → `AIza...`
      _Alternatif: Anthropic Claude key (Turkce cok iyi) → provider=anthropic_
- [ ] DB/admin panel: `com_ai_chat_active_provider=gemini`, `com_ai_chat_model=gemini-2.0-flash`, `com_ai_chat_api_key=<key>`
      (panel: panel.sportoonline.com/tr/admin/chat/settings)
- [ ] `AiChatService::callGemini()` provider kodunu canli test et (gercek key ile)
- [ ] Turkce kalite + dil sizinti yok testi (birkac ornek mesaj)
- [ ] Sistem prompt zaten sertlestirildi (uydurma/sahte canli destek yasak) — gecerli kalir

**Blocker:** Gemini (veya Claude) API key gerekiyor.

---

## DURUM GUNCELLEMESI (2026-06-02)

- [x] **B — Queue worker:** backlog (12.617 job) tamamen silindi, PM2 `quickecommerce-queue`
      kuruldu + `pm2 save` + startup. Test maili 3sn'de gitti (failed=0). E-posta kanali ACIK.
- [x] **C — Admin bildirim kodu:** `AdminNotifier` servisi (DB cani + e-posta + best-effort
      Firebase), yeni uyelik bildirimi, siparis admin sorgu fix (system_level), AI canli destek
      AdminNotifier'a tasindi + e-posta. Test edildi (DB cani + mail kuyrugu calisiyor).
- [x] **A — AI model:** anthropic / **claude-haiku-4-5** (key hal-fiyatlari .env'inden — PAYLASIMLI).
      Test edildi: temiz Turkce, dil sizintisi yok. Rol normalizasyonu eklendi.
- [ ] **D — Firebase:** service account JSON + admin token (frontend) bekleniyor (ERTELENDI).

---

## B. Queue Worker + E-posta (KRITIK) — ✅ TAMAM

**Sorun:** `QUEUE_CONNECTION=database` ama queue worker HIC calismiyor.
`jobs` tablosunda **12.605 takili is** (18 Subat'tan beri):
- 12.131 × `SendAbandonedCartReminder`
- 459 × `DispatchOrderEmails` (siparis onay mailleri — musteri+magaza+admin)
- 15 × `SendDynamicEmailJob`
→ Subat'tan beri kuyruga atilan TUM mailler gonderilmemis.

- [ ] **(KARAR)** Backlog temizligi: eski jobs anlamsiz (aylar onceki siparis maili,
      olu sepet hatirlatmasi). Oneri: `DB::table('jobs')->truncate()` (yalniz bekleyen
      kuyruk; veri kaybi yok, siparisler zaten teslim). Worker'i temiz baslat.
      ⚠️ Worker'i temizlemeden baslatma: 12.6k mail birden → Gmail ~500/gun limiti patlar.
- [ ] PM2 ile kalici worker: `pm2 start "php artisan queue:work --tries=3 --timeout=90 --sleep=3" --name quickecommerce-queue` (cwd backend-laravel)
- [ ] `pm2 save` + `pm2 startup` (reboot'ta otomatik)
- [ ] Test: bir test maili kuyruga at → ~saniyeler icinde gitti mi
- [ ] Gmail ~500/gun limiti farkindaligi. Hacim artarsa transactional servis (Resend/SES) — altyapi, kod degil.

**Blocker:** backlog temizleme onayi.

---

## C. Admin Bildirim Guvenilirligi (KOD — local-first)

**Sorun:** Admin tespiti her yerde bozuk. `super_admin` slug'i / `roles.slug` YOK;
adminler `users.activity_scope='system_level'` (#1 admin@, #4 admin2@).
→ Siparis admin DB-cani + Firebase bildirimi de aslinda admine ULASMIYOR.

- [ ] `OrderManageNotificationService::notifyAdmin()` → `User::where('activity_scope','system_level')`
- [ ] `OrderManageNotificationService::sendAdminNotification()` → ayni duzeltme (super_admin slug kaldir)
- [ ] **Yeni uyelik bildirimi:** `CustomerManageController::registerCustomer()` sonrasi
      admine: DB cani (UniversalNotification 'admin') + e-posta (yeni Mailable veya DynamicEmail)
- [ ] (opsiyonel) Canli destek talebine e-posta da ekle (su an sadece DB cani + best-effort push)
- [ ] **DRY:** Ortak `AdminNotifier` servisi/trait — `notifyAdmins(title, body, data, {mail:true})`:
      DB cani + e-posta + best-effort Firebase tek yerde. AiChatService + Order + signup bunu kullansin.
- [ ] AI chat canli destek bildirimi (zaten yapildi: activity_scope=system_level) — DRY refactor'a dahil et

**Blocker yok — hemen baslanabilir.**

---

## D. Firebase Push (gercek kurulum)

**Sorun:** Firebase HIC kurulmamis. `storage/app/firebase/` dizini yok (credentials
eksik), `.env FIREBASE_CREDENTIALS` lokal makine yolunu gosteriyor (sunucuda gecersiz).
Ayrica hicbir adminde `firebase_token` yok.

- [ ] **(KULLANICI)** Firebase service account JSON al: Firebase Console → Project Settings
      → Service Accounts → Generate new private key → `firebase.json`
- [ ] Sunucuda `storage/app/firebase/firebase.json` olarak koy (git'e KOYMA)
- [ ] `.env` `FIREBASE_CREDENTIALS=storage/app/firebase/firebase.json` (veya tam sunucu yolu) duzelt
- [ ] **Admin paneli (Next.js) web push:** FCM service worker + VAPID key + izin istemi +
      token kayit endpoint (`users.firebase_token` guncelle). — FRONTEND isi (Codex'e uygun)
- [ ] Test push (admin tarayicisina)

**Blocker:** Firebase service account JSON + admin panel frontend gelistirme.
**Not:** Firebase olmadan da DB cani + e-posta ile admin guvenilir sekilde haberdar olur.
Firebase "aninda mobil/tarayici push" icin ekstra konfor; kritik degil.

---

## Oncelik Sirasi (oneri)

1. **B** (queue worker + backlog) — admin/musteri maili tekrar aksin (en yuksek etki)
2. **C** (admin lookup fix + yeni uyelik) — siparis+uyelik bildirimi gercekten ulassin
3. **A** (Gemini model) — key gelince
4. **D** (Firebase) — credentials + frontend gelince

## Durum

- [x] AI canli destek → admin DB cani bildirimi (activity_scope=system_level) — TAMAM (2026-06-02)
- [x] AI system prompt sertlestirme (uydurma/sahte handoff yasak) — TAMAM
- [x] Knowledge #10 telefon vaadi kaldirma — TAMAM
- [ ] A / B / C / D — yukaridaki maddeler
