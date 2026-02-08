Kod tabanında kapsamlı bir inceleme yap. Aşağıdaki kontrol listesini sırasıyla uygula:

## 1. Kod Kalitesi

### Laravel Backend
- [ ] PSR-12 coding standard uyumu
- [ ] Controller'lar single responsibility prensibine uyuyor mu?
- [ ] FormRequest validation kullanılıyor mu?
- [ ] N+1 query problemi var mı?
- [ ] Eager loading doğru kullanılıyor mu?
- [ ] Repository pattern tutarlı mı?
- [ ] Service layer gerekli yerlerde kullanılıyor mu?

### Next.js Admin Panel
- [ ] TypeScript strict mode hataları
- [ ] ESLint hataları/uyarıları
- [ ] Unused imports/variables
- [ ] Component dosya boyutları (300+ satır?)
- [ ] Tanstack Query cache stratejisi doğru mu?
- [ ] Zod schema'lar backend ile uyumlu mu?

## 2. Güvenlik Kontrolleri

### Backend
- [ ] SQL injection koruması (Eloquent kullanımı)
- [ ] Mass assignment koruması ($fillable/$guarded)
- [ ] Authentication middleware tüm admin route'larda
- [ ] Authorization (Spatie Permission) kontrolleri
- [ ] Rate limiting aktif mi?
- [ ] CORS ayarları doğru mu?
- [ ] Sensitive data response'larda gizleniyor mu?

### Frontend
- [ ] API token güvenli saklanıyor mu?
- [ ] XSS koruması (React default)
- [ ] Sensitive bilgiler console.log'da yok
- [ ] Environment variables doğru kullanılıyor mu?

## 3. Performans

### Backend
- [ ] Database indexes tanımlı mı?
- [ ] Pagination kullanılıyor mu?
- [ ] Caching stratejisi var mı?
- [ ] Heavy operations queue'da mı?
- [ ] Media optimization (Spatie)

### Frontend
- [ ] Bundle size makul mü?
- [ ] Lazy loading kullanılıyor mu?
- [ ] Image optimization
- [ ] Tanstack Query caching etkin mi?

## 4. Kod Organizasyonu

### Laravel
```
app/
├── Http/Controllers/Api/
│   ├── Admin/          ← Admin controller'lar
│   ├── V1/             ← Public API
│   └── Seller/         ← Seller API
├── Models/             ← Eloquent modeller
├── Repositories/       ← Repository layer
├── Services/           ← Business logic
└── Http/Requests/      ← Form validations
```

### Next.js
```
src/
├── modules/admin-section/[name]/
│   ├── [name].action.ts
│   ├── [name].schema.ts
│   ├── [name].service.ts
│   └── [name].type.ts
├── endpoints/          ← API endpoint tanımları
├── components/         ← UI components
└── app/[locale]/admin/ ← Page components
```

## 5. API Tutarlılığı

- [ ] Response format tutarlı mı?
```json
{
  "status": true,
  "message": "...",
  "data": { ... }
}
```
- [ ] HTTP status codes doğru mu?
- [ ] Error response format tutarlı mı?
- [ ] Endpoint naming convention tutarlı mı?

## 6. Test Coverage

- [ ] Unit testler var mı?
- [ ] Feature testler var mı?
- [ ] API testler var mı?
- [ ] Frontend testler var mı?

## 7. Dokümantasyon

- [ ] API documentation (Postman/Swagger)
- [ ] README güncel mi?
- [ ] Environment variables documented
- [ ] Deployment instructions

## İnceleme Raporu Formatı

```markdown
## Kod İnceleme Raporu

### Özet
- Toplam incelenen dosya: X
- Kritik sorun: X
- Uyarı: X
- Öneri: X

### Kritik Sorunlar
1. [Dosya:satır] - Açıklama

### Uyarılar
1. [Dosya:satır] - Açıklama

### İyileştirme Önerileri
1. Öneri açıklaması

### Sonuç
Genel değerlendirme ve öneriler
```
