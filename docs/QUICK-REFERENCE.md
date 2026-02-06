# Quick Reference - Hızlı Komut Rehberi

## Local Geliştirme (Hızlı Başlangıç)

### Tüm Servisleri Başlat

```bash
# Terminal 1: Backend
cd /home/orhan/Documents/quickecommerce/backend-laravel
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Admin Panel
cd /home/orhan/Documents/quickecommerce/admin-panel
npm run dev

# Terminal 3: Customer Web
cd /home/orhan/Documents/quickecommerce/customer-app-and-web-flutter
flutter run -d web-server --web-hostname 127.0.0.1 --web-port 3001
```

### Erişim Adresleri

| Servis | Local URL |
|--------|-----------|
| Backend API | http://127.0.0.1:8000/api |
| Admin Panel | http://localhost:3000/tr |
| Customer Web | http://127.0.0.1:3001 |

---

## Backend (Laravel)

```bash
cd /home/orhan/Documents/quickecommerce/backend-laravel

# Sunucu başlat
php artisan serve --host=127.0.0.1 --port=8000

# Cache temizle
php artisan optimize:clear

# Migration
php artisan migrate

# Seed
php artisan db:seed --class=UserSeeder

# Tinker (REPL)
php artisan tinker

# Route listesi
php artisan route:list --path=api
```

---

## Admin Panel (Next.js)

```bash
cd /home/orhan/Documents/quickecommerce/admin-panel

# Dev server
npm run dev

# Build
npm run build

# Temiz kurulum
rm -rf node_modules .next && npm install --legacy-peer-deps
```

---

## Customer Web (Flutter)

```bash
cd /home/orhan/Documents/quickecommerce/customer-app-and-web-flutter

# Paketleri indir
flutter pub get

# Web'de çalıştır
flutter run -d chrome

# Headless web server
flutter run -d web-server --web-hostname 127.0.0.1 --web-port 3001

# Temiz başlangıç
flutter clean && flutter pub get
```

---

## Git İşlemleri

```bash
cd /home/orhan/Documents/quickecommerce

# Değişiklikleri görüntüle
git status
git diff

# Commit ve push (CI/CD tetikler)
git add -A
git commit -m "feat: açıklama"
git push origin main
```

---

## Veritabanı

### MySQL Giriş

```bash
# Local
mysql -u qe -p quick_ecommerce

# veya
sudo mysql
```

### Sık Kullanılan SQL

```sql
-- Tabloları listele
SHOW TABLES;

-- Kullanıcıları listele
SELECT id, email, activity_scope, status FROM users;

-- Şifre güncelle
UPDATE users SET password='$2y$10$...' WHERE email='admin@sportoonline.com';
```

### Tinker ile

```bash
php artisan tinker

# Kullanıcıları listele
>>> User::select('id','email','activity_scope')->get();

# Şifre değiştir
>>> $u = User::where('email','admin@sportoonline.com')->first();
>>> $u->password = Hash::make('YeniSifre');
>>> $u->save();
```

---

## Production (VPS)

### SSH Bağlantı

```bash
ssh vps-76
```

### Hızlı Deployment

```bash
# Backend
cd /var/www/quikecommerce/backend-laravel
git pull && composer install --no-dev -o && php artisan migrate --force && php artisan optimize:clear

# Admin Panel
cd /var/www/quikecommerce/admin-panel
git pull && npm ci --legacy-peer-deps && npm run build && pm2 reload quickecommerce-admin
```

### Log Takibi

```bash
# Laravel log
tail -f /var/www/quikecommerce/backend-laravel/storage/logs/laravel.log

# PM2 log
pm2 logs quickecommerce-admin

# Nginx log
tail -f /var/log/nginx/error.log
```

### Servis Kontrolü

```bash
# Durum
systemctl status nginx php8.4-fpm mysql
pm2 status

# Yeniden başlat
systemctl reload nginx
systemctl reload php8.4-fpm
pm2 reload quickecommerce-admin
```

---

## Varsayılan Giriş Bilgileri

| Uygulama | Email | Şifre |
|----------|-------|-------|
| Admin Panel | admin@sportoonline.com | Admin123! |

---

## Sık Karşılaşılan Hatalar

### 500 Internal Server Error

```bash
tail -50 storage/logs/laravel.log
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 403 Forbidden (Permission)

```bash
php artisan db:seed --class=PermissionAdminSeeder --force
php artisan optimize:clear
```

### CORS Hatası

Laravel'de CORS middleware aktif mi kontrol et.
Nginx'te CORS header ekleme (Laravel yönetiyor).

### PM2 Başlamıyor

```bash
pm2 delete quickecommerce-admin
cd /var/www/quikecommerce/admin-panel
npm run build
pm2 start ecosystem.config.cjs
```
