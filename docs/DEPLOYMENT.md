# Production Deployment Rehberi

## Sunucu Gereksinimleri

- Ubuntu 22.04+ / Debian 12+
- PHP 8.2+ (php-fpm)
- Node.js 20+ (Next.js 16 için gerekli)
- MySQL 8.0+ / MariaDB 10.6+
- Nginx
- PM2
- Git

---

## CI/CD Akışı

Local'de commit & push yaptığınızda GitHub Actions otomatik olarak:

1. `.env` dosyalarını yedekler
2. `git pull` yapar
3. `.env` dosyalarını geri yükler
4. Laravel: `composer install`, migration, cache
5. Admin Panel: `npm install`, build, PM2 reload
6. Customer Web: `npm install`, build, PM2 reload
7. Seederleri çalıştırır

---

## Manuel Deployment

### Backend Laravel

```bash
cd /var/www/quikecommerce/backend-laravel

# Maintenance mode
php artisan down

# Git pull
git pull origin main

# Composer
composer install --no-dev --optimize-autoloader --no-interaction

# Migration
php artisan migrate --force

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Seeders (gerekirse)
php artisan db:seed --class=RolesSeeder --force
php artisan db:seed --class=UserSeeder --force
php artisan db:seed --class=PermissionAdminSeeder --force

# İzinler
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Maintenance mode kapat
php artisan up

# PHP-FPM yeniden başlat
sudo systemctl reload php8.4-fpm
```

### Admin Panel

```bash
cd /var/www/quikecommerce/admin-panel

# Git pull
git pull origin main

# Bağımlılıklar
npm ci --legacy-peer-deps

# Build
npm run build

# PM2 reload
pm2 reload quickecommerce-admin
```

### Customer Web (Next.js)

```bash
cd /var/www/quikecommerce/customer-web-nextjs

# Git pull
git pull origin main

# Bağımlılıklar
npm ci

# Build
npm run build

# PM2 reload
pm2 reload quickecommerce-customer
```

---

## Nginx Konfigürasyonu

### Ana Domain (API + Maintenance)

`/etc/nginx/sites-available/sportoonline.com.conf`:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name sportoonline.com www.sportoonline.com;
    return 301 https://sportoonline.com$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name sportoonline.com www.sportoonline.com;

    ssl_certificate     /etc/letsencrypt/live/sportoonline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sportoonline.com/privkey.pem;

    client_max_body_size 64m;

    root /var/www/quikecommerce/backend-laravel/public;
    index index.php;

    # API -> Laravel
    location ^~ /api/ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
        fastcgi_param SCRIPT_NAME /index.php;
        fastcgi_param REQUEST_URI $request_uri;
        fastcgi_param DOCUMENT_ROOT $document_root;
        fastcgi_read_timeout 120s;
    }

    # Storage dosyaları
    location ^~ /storage/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Ana sayfa (bakım modu)
    location / {
        return 503;
    }

    error_page 503 /index.html;
    location = /index.html {
        root /var/www/quikecommerce/maintenance;
    }
}
```

### Admin Panel Subdomain

`/etc/nginx/sites-available/panel.sportoonline.com.conf`:

```nginx
server {
    listen 80;
    server_name panel.sportoonline.com;
    return 301 https://panel.sportoonline.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name panel.sportoonline.com;

    ssl_certificate     /etc/letsencrypt/live/sportoonline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sportoonline.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Nginx Test ve Reload

```bash
# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## PM2 Yönetimi

### Başlatma

```bash
cd /var/www/quikecommerce/admin-panel
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Sistem başlangıcında otomatik başlat
```

### Günlük Komutlar

```bash
# Durum
pm2 status

# Loglar
pm2 logs quickecommerce-admin

# Yeniden başlat
pm2 restart quickecommerce-admin

# Zero-downtime reload
pm2 reload quickecommerce-admin

# Tüm logları temizle
pm2 flush
```

---

## SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# Sertifika al
sudo certbot --nginx -d sportoonline.com -d www.sportoonline.com -d panel.sportoonline.com

# Otomatik yenileme test
sudo certbot renew --dry-run
```

---

## Veritabanı Backup

### Manuel Backup

```bash
# Backup al
mysqldump -u quick_user -p quick_ecommerce > backup_$(date +%Y%m%d).sql

# Sıkıştır
gzip backup_$(date +%Y%m%d).sql
```

### Cron ile Otomatik Backup

```bash
# Crontab düzenle
crontab -e

# Her gün 03:00'te backup
0 3 * * * mysqldump -u quick_user -pPASSWORD quick_ecommerce | gzip > /root/db-backups/backup_$(date +\%Y\%m\%d).sql.gz
```

---

## Sorun Giderme

### Laravel 500 Hatası

```bash
# Log kontrol
tail -50 /var/www/quikecommerce/backend-laravel/storage/logs/laravel.log

# İzin düzelt
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Cache temizle
php artisan optimize:clear
```

### PM2 Başlamıyor

```bash
# Log kontrol
pm2 logs quickecommerce-admin --err

# Süreci sil ve yeniden başlat
pm2 delete quickecommerce-admin
pm2 start ecosystem.config.cjs
```

### Nginx 502 Bad Gateway

```bash
# PHP-FPM çalışıyor mu?
systemctl status php8.4-fpm

# PM2 çalışıyor mu?
pm2 status

# Socket izinleri
ls -la /run/php/php8.4-fpm.sock
```

---

## Servis Yönetimi

```bash
# Nginx
sudo systemctl start|stop|restart|reload|status nginx

# PHP-FPM
sudo systemctl start|stop|restart|reload|status php8.4-fpm

# MySQL
sudo systemctl start|stop|restart|status mysql

# Tüm servisleri etkinleştir (başlangıçta otomatik)
sudo systemctl enable nginx php8.4-fpm mysql
```

---

## Güvenlik Kontrol Listesi

- [ ] SSH root login kapalı
- [ ] Güçlü şifreler kullanılıyor
- [ ] UFW/Firewall aktif (80, 443, 22)
- [ ] SSL sertifikası aktif
- [ ] `.env` dosyaları git'te yok
- [ ] Debug mode production'da kapalı
- [ ] Rate limiting aktif
- [ ] Günlük backup alınıyor
