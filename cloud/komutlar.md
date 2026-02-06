Bunlar zaten Claude Code oturumunun içinde yazılan komutlar — terminalde ayrıca bir şey çalıştırmanıza gerek yok.

## QuickEcommerce Komut Listesi

### Geliştirme Komutları

| Komut | Açıklama |
|-------|----------|
| `/quickecommerce:feature <özellik>` | Yeni özellik geliştir |
| `/quickecommerce:api <endpoint>` | Laravel API endpoint oluştur |
| `/quickecommerce:module <modül>` | Admin panel modülü oluştur |
| `/quickecommerce:controller <isim>` | Laravel controller oluştur |
| `/quickecommerce:migrate <tablo>` | Laravel migration oluştur |
| `/quickecommerce:model <isim>` | Eloquent model oluştur |

### Kod Kalitesi Komutları

| Komut | Açıklama |
|-------|----------|
| `/quickecommerce:review` | Kapsamlı kod incelemesi yap |
| `/quickecommerce:scan <kapsam>` | Proje prensiplerine aykırı durumları tara |
| `/quickecommerce:refactor <kod>` | Belirtilen kodu refactor et |
| `/quickecommerce:architect <konu>` | Mimari analiz veya tasarım |

### Git Komutları

| Komut | Açıklama |
|-------|----------|
| `/quickecommerce:commit` | Conventional commit oluştur |
| `/quickecommerce:push` | Hızlı commit ve push |
| `/quickecommerce:branch <isim>` | Yeni feature branch oluştur |
| `/quickecommerce:pr` | Pull request oluştur |

## Örnek Kullanımlar

```
/quickecommerce:feature sipariş takip sistemi
/quickecommerce:api /admin/reports endpoint'i
/quickecommerce:module wishlist modülü
/quickecommerce:controller WishlistController
/quickecommerce:migrate wishlists tablosu
/quickecommerce:model Wishlist
/quickecommerce:review
/quickecommerce:scan admin-panel/src/modules
/quickecommerce:refactor OrderController optimize et
/quickecommerce:commit
```

## Proje Yapısı Özeti

```
quickecommerce/
├── admin-panel/              ← Next.js 16 + React 19 Admin Panel
│   └── src/
│       ├── modules/          ← Feature modülleri
│       │   ├── admin-section/
│       │   ├── seller-section/
│       │   └── common/
│       ├── components/       ← UI bileşenleri
│       ├── endpoints/        ← API endpoint tanımları
│       ├── redux/            ← Redux store
│       └── lib/              ← Utilities
│
├── backend-laravel/          ← Laravel 12 + PHP 8.2 Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   └── Services/
│   ├── Modules/              ← Laravel Modules (Chat, Blog, etc.)
│   ├── routes/
│   │   ├── admin-api.php
│   │   ├── customer-api.php
│   │   ├── seller-api.php
│   │   └── deliveryman-api.php
│   └── database/migrations/
│
└── customer-app-and-web-flutter/  ← Flutter Customer App
```

## Hızlı Referans

### Admin Panel (Next.js)
- **Framework**: Next.js 16 + React 19
- **State**: Redux Toolkit + Tanstack Query + Zustand
- **UI**: shadcn-ui + Tailwind CSS + Radix UI
- **Forms**: react-hook-form + Zod
- **i18n**: next-intl
- **HTTP**: Axios

### Backend (Laravel)
- **Framework**: Laravel 12
- **PHP**: 8.2+
- **Auth**: Laravel Sanctum
- **Modules**: nwidart/laravel-modules
- **Media**: Spatie Media Library
- **Permissions**: Spatie Permission
- **Query Builder**: Spatie Query Builder
