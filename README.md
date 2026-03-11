# QuickEcommerce

QuickEcommerce, Laravel backend, Next.js tabanli web uygulamalari ve Flutter musteri uygulamasi iceren enterprise e-commerce workspace'idir. Bu checkout'ta marketplace ve multi-store akislarina yonelik moduller bulunur.

## Workspace Yapisi

- `backend-laravel/`: Laravel 12 tabanli backend
- `admin-panel/`: Next.js tabanli yonetim paneli
- `customer-web-nextjs/`: Next.js tabanli musteri web uygulamasi
- `customer-app-and-web-flutter/`: Flutter tabanli mobil uygulama
- `docs/`: ek dokumantasyon

## Dogrulanmis Teknoloji Yigini

- Backend: Laravel 12, PHP 8.2, Sanctum, Socialite, Stripe, Iyzipay
- Web: Next.js, React, TypeScript, Tailwind CSS
- Mobile: Flutter, Dart
- Veri ve altyapi: MySQL, JWT tabanli akislar, i18n, SEO

## Komutlar

Admin panel:

```bash
cd admin-panel
npm run dev
npm run build
npm run start
```

Customer web:

```bash
cd customer-web-nextjs
bun run dev
bun run build
bun run start
```

Laravel backend:

```bash
cd backend-laravel
npm run dev
npm run build
composer install
php artisan serve
```

Flutter app:

```bash
cd customer-app-and-web-flutter
flutter pub get
flutter run
```

## Canli Sistem

- Website: `https://sportoonline.com`
- Repo: `https://github.com/Orhanguezel/quickecommerce`

## Dokumantasyon Notu

Bu projede portfolio metadata kaynagi `project.portfolio.json`'dur. Yeni uygulama parcasi, stack degisikligi veya canli URL degisirse once bu dosya guncellenmelidir.
