# Backend Laravel - Geliştirici Rehberi

## Gereksinimler

- PHP 8.2+
- Composer 2.x
- MySQL 8.0+ / MariaDB 10.6+
- Redis (opsiyonel, cache için)

---

## Local Kurulum

### 1. Veritabanı Oluşturma

```bash
# MySQL'e root ile gir
sudo mysql

# Veritabanı ve kullanıcı oluştur
CREATE DATABASE quick_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qe'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON quick_ecommerce.* TO 'qe'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Proje Kurulumu

```bash
cd /home/orhan/Documents/quickecommerce/backend-laravel

# Bağımlılıkları yükle
composer install

# .env dosyasını oluştur
cp .env.example .env

# Uygulama anahtarı oluştur
php artisan key:generate

# Storage link oluştur
php artisan storage:link
```

### 3. .env Ayarları

```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=quick_ecommerce
DB_USERNAME=qe
DB_PASSWORD=StrongPass123!
```

### 4. Veritabanı Migration ve Seed

```bash
# Migration çalıştır
php artisan migrate

# Temel seedleri çalıştır (sırasıyla)
php artisan db:seed --class=RolesSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=PermissionAdminSeeder
php artisan db:seed --class=StoreTypeSeeder
```

### 5. Sunucuyu Başlat

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

API şu adreste çalışacak: `http://127.0.0.1:8000/api`




---

## Sık Kullanılan Komutlar

### Cache Temizleme

```bash
# Tüm cache temizle
php artisan optimize:clear

# Ayrı ayrı temizleme
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### Migration Komutları

```bash
# Yeni migration oluştur
php artisan make:migration create_table_name_table

# Migration çalıştır
php artisan migrate

# Son migration'ı geri al
php artisan migrate:rollback

# Tüm tabloları sil ve yeniden oluştur (DİKKAT: Veri kaybı!)
php artisan migrate:fresh --seed
```

### Seeder Komutları

```bash
# Tüm seedleri çalıştır
php artisan db:seed

# Belirli seeder çalıştır
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=PermissionAdminSeeder
php artisan db:seed --class=RolesSeeder
```

### Route Listesi

```bash
# Tüm API route'ları listele
php artisan route:list --path=api

# Login/auth route'larını filtrele
php artisan route:list --path=api | grep -E "token|login|auth"
```

### Tinker (REPL)

```bash
php artisan tinker

# Örnek: Tabloları listele
>>> DB::select('show tables');

# Örnek: Kullanıcıları listele
>>> User::select('id', 'email', 'activity_scope')->get();

# Örnek: Şifre değiştir
>>> $u = User::where('email', 'admin@sportoonline.com')->first();
>>> $u->password = Hash::make('YeniSifre123!');
>>> $u->save();
```

---

## Hata Ayıklama

### Log Dosyası

```bash
# Son 100 satır log
tail -100 storage/logs/laravel.log

# Canlı log takibi
tail -f storage/logs/laravel.log
```

### İzin Sorunları

```bash
# Storage ve cache izinlerini düzelt
sudo chown -R $USER:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Veritabanı Bağlantı Testi

```bash
php artisan tinker --execute="dump(DB::connection()->getPdo());"
```

---

## Varsayılan Admin Kullanıcısı

| Alan | Değer |
|------|-------|
| Email | admin@sportoonline.com |
| Şifre | Admin123! |
| Scope | system_level |

---

## Modül Yapısı

```
backend-laravel/
├── app/
│   ├── Enums/           # Enum sınıfları
│   ├── Http/
│   │   ├── Controllers/ # API Controller'ları
│   │   ├── Requests/    # Form Request'leri
│   │   └── Resources/   # API Resource'ları
│   ├── Models/          # Eloquent modelleri
│   └── Repositories/    # Repository pattern
├── config/              # Konfigürasyon dosyaları
├── database/
│   ├── migrations/      # Veritabanı migration'ları
│   └── seeders/         # Veritabanı seedleri
├── Modules/             # Laravel modülleri
│   ├── Blog/
│   ├── Chat/
│   ├── PaymentGateways/
│   ├── Pos/
│   ├── SmsGateway/
│   ├── Subscription/
│   └── Wallet/
├── routes/
│   ├── api.php          # Admin API route'ları
│   ├── customer-api.php # Müşteri API route'ları
│   └── seller-api.php   # Satıcı API route'ları
└── storage/             # Log, cache, upload dosyaları
```
