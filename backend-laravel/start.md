# Tüm DB restore
gzip -dc /root/db-backups/sportoonline_${ts}.sql.gz | mysql -u quick_user -p sportoonline

# Sadece translations restore
gzip -dc /root/db-backups/translations_${ts}.sql.gz | mysql -u quick_user -p sportoonline

### veritabani seed calistir. 
mysql -u quick_user -p sportoonline < /var/www/quikecommerce/backend-laravel/database/90_banners_tr_translations.seed.sql



### temizle
cd /home/orhan/Documents/quikecommerce/backend-laravel
php artisan optimize:clear




sudo tail -n 250 /var/www/quikecommerce/backend-laravel/install/install-error.log


set -euo pipefail
APP_DIR="/var/www/quikecommerce/backend-laravel"


####
sudo mysql

sudo mysql -e "SELECT 1;"
sudo mysql -e "USE sportoonline; SELECT 1;"



### migrasyon
php artisan optimize:clear
php artisan db:seed --force



# Yeni şifreyi buraya yaz
NEW_PASS='Engin1000145'

HASH="$(php -r "echo password_hash('$NEW_PASS', PASSWORD_BCRYPT);")"
echo "HASH=$HASH"

mysql -uquick_user -p'Engin10001453.' quick_ecommerce -e "
UPDATE users
SET password='${HASH}'
WHERE email='seller@gmail.com';
SELECT id,email,status FROM users WHERE email='seller@gmail.com';
"

seller@gmail.com
Engin10001453.



set -euo pipefail
APP_DIR="/var/www/quikecommerce/backend-laravel"

# Yeni şifreyi buraya yaz
NEW_PASS='Engin1000145'

HASH="$(php -r "echo password_hash('$NEW_PASS', PASSWORD_BCRYPT);")"
echo "HASH=$HASH"

mysql -uquick_user -p'12345678' quick_ecommerce -e "
UPDATE users
SET password='${HASH}'
WHERE email='orhanguzell@gmail.com';
SELECT id,email,status FROM users WHERE email='orhanguzell@gmail.com';
"

seller@gmail.com
Engin10001453.


stty echo
reset


cd /var/www/quikecommerce/backend-laravel

php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear


sudo systemctl enable nginx
sudo systemctl enable php8.2-fpm   # sürüm neyse
sudo systemctl enable mariadb      # veya mysql
sudo systemctl enable redis-server # kullanıyorsan

cd /var/www/quikecommerce/backend-laravel
php artisan migrate --force


###
## Tek dosya import: 


php artisan db:sql-import database/sql/tables_demo/.part_00046_pages.sql --force


## Klasördeki tüm dosyaları sırayla import: 
php artisan db:sql-import --dir=database/sql/tables_demo

### Tek dosya:

php artisan db:sql-import database/sql/tables_demo/.part_00015_customers.sql --force



### Klasör:

php artisan db:sql-import database/sql/tables_demo --force

### İstersen baştan:

php artisan db:sql-import database/sql/tables_demo --force --fresh=truncate
# veya
php artisan db:sql-import database/sql/tables_demo --force --fresh=drop


## Kontrol
mysql -u quick_user -p -e "USE quick_ecommerce; SELECT id,title FROM banners ORDER BY id;"



cat > /var/www/quikecommerce/backend-laravel/database/sql/tables_demo/.part_00002_blogs_en.sql <<'SQL'
-- paste the SQL above here
SQL


cd /var/www/quikecommerce/backend-laravel
php artisan db:sql-import database/sql/tables_demo/.part_00049_permissions.sql --force
SELECT translatable_id, `key`, value
FROM translations
WHERE language='tr'
  AND translatable_type='App\\Models\\Banner'
ORDER BY translatable_id;






### zip dosyasini cikarma
unzip "backend-laravel.zip"


### izinler
cd /var/www/quikecommerce/backend-laravel

# 1) Sahiplik
sudo chown -R www-data:www-data storage bootstrap/cache Modules 2>/dev/null || true

# 2) Dizin / dosya izinleri
sudo find storage bootstrap/cache Modules -type d -exec chmod 775 {} \; 2>/dev/null || true
sudo find storage bootstrap/cache Modules -type f -exec chmod 664 {} \; 2>/dev/null || true

# 3) storage/app/public yoksa oluştur (installer kontrol ediyor)
sudo mkdir -p storage/app/public
sudo chown -R www-data:www-data storage/app/public
sudo chmod 775 storage/app/public




pm2 stop quickecommerce-admin
pm2 delete quickecommerce-admin
pm2 save



### local laravel calistirma
cd /home/orhan/Documents/quikecommerce/backend-laravel
php artisan serve --host=0.0.0.0  --port=8000




cd /var/www/quikecommerce/backend-laravel
php artisan config:clear
php artisan config:cache


sudo systemctl reload php8.4-fpm
sudo systemctl reload nginx



cd /var/www/quikecommerce/admin-panel
npm run build
pm2 restart quickecommerce-admin



### yeniden build
rm -rf dist .tsbuildinfo
npm run build


pm2 start ecosystem.config.cjs



### cache temizligi

cd /home/orhan/Documents/quikecommerce/backend-laravel
php artisan optimize:clear

### seed 
php artisan db:seed --class=Database\\Seeders\\ProductCategorySeedSeeder

php artisan db:seed --class=Database\\Seeders\\StoreTypesSeeder

php artisan db:seed --class=Database\\Seeders\\StoreSeeder

php artisan db:seed --class=Database\\Seeders\\PermissionAdminSeeder

php artisan db:seed --class=Database\\Seeders\\PermissionStoreSeeder





### temiz install

rm -rf .next build deploy
npm run build
bun run dev





cd /home/orhan/Documents/quickecommerce/customer-app-and-web-flutter
flutter clean
flutter pub get
flutter run -d web-server --web-renderer html --web-hostname 127.0.0.1 --web-port 3001




### upload klasörünü simlik yapar. 

cd /home/orhan/Documents/quickecommerce/backend-laravel
mv public/storage public/storage.bak
php artisan storage:link

###  flutter acma
cd /home/orhan/Documents/quickecommerce/customer-app-and-web-flutter
flutter run -d web-server --web-hostname 127.0.0.1 --web-port 3001





cd /var/www/quikecommerce/backend-laravel

php artisan optimize:clear

# prod’da config cache kullanıyorsan tekrar cachele
php artisan config:cache
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true


Tamam. Bu, sorunun **permission seed + cache** kaynaklı olduğunu doğruluyor. Mevcut durum için kısa bir özet ve kalıcı öneriyi net şekilde bırakıyorum.

## Ne oldu (kök neden)

* `PermissionAdminSeeder` **çalıştırılmadan** sadece SQL import ile ilerlenmişti.
* Admin route’ları (`permission:/admin/dashboard`) **PermissionKey enum** değerlerini bekliyor.
* Bu permission’lar **seed içinde üretiliyor** (sadece tabloya bakmak yetmiyor).
* Üretim ortamında `php artisan db:seed` **interactive prompt (stty)** yüzünden patlıyordu.
* `--force` ile seed çalışınca:

  * `/admin/dashboard` permission’ı doğru isimle oluştu,
  * role ↔ permission bağlandı,
  * Spatie cache temizlenince 403 kalktı.

## Bundan sonra aynı hataya düşmemek için

### 1) Demo / SQL import sonrası **zorunlu adım**

```bash
php artisan db:seed --class=PermissionAdminSeeder --force
php artisan permission:cache-reset || true
php artisan optimize:clear


php artisan db:seed --class=PermissionAdminSeeder --force
php artisan permission:cache-reset || true
php artisan optimize:clear
```

### 2) Tüm sistem kurulumu için doğru sıra

Eğer sıfırdan veya demo SQL ile kurulum yapacaksan:

```bash
# SQL import
mysql -u... -p... quick_ecommerce < demo_db.sql

# Seed (kritik olanlar)
php artisan db:seed --class=RolesSeeder --force
php artisan db:seed --class=PermissionAdminSeeder --force
php artisan db:seed --class=PermissionStoreSeeder --force
php artisan db:seed --class=PermissionDeliverymanSeeder --force

# Cache temizliği
php artisan permission:cache-reset || true
php artisan optimize:clear


###  Migrasyon
cd /var/www/quikecommerce/backend-laravel
sudo -u www-data php artisan migrate:fresh --seed --force --no-interaction
sudo -u www-data php artisan optimize:clear
 --no-interaction


sudo -u www-data php artisan cache:table
sudo -u www-data php artisan migrate --force




###   Tinker

php artisan tinker



```

### 3) Kontrol komutları (debug checklist)

Biri “403 – User does not have the right permissions” derse **ilk bakılacaklar**:

```bash
# Permission var mı?
SELECT id FROM permissions WHERE name='/admin/dashboard';

# User role almış mı?
SELECT * FROM model_has_roles WHERE model_id=<user_id>;

# Role permission dolu mu?
SELECT COUNT(*) FROM role_has_permissions WHERE role_id=<role_id>;
```

## Sonuç

* Sistem **doğru çalışıyor**.
* Sorun **kod değil**, **seed zinciri + cache** idi.
* SQL import tek başına yeterli değil; bu projede **seed mantığın parçası**.

İstersen bir sonraki adımda sana:

* “tek komutluk production setup scripti”
* veya “demo.sql + seed uyumlu installer flow” çıkarabilirim.






Tamam. **SIFIRDAN**, **TEMİZ**, **ALTER / UPDATE / DELETE YOK**.
Sadece **DROP → CREATE → INSERT**. Başka hiçbir şey yok.
Bunu birebir uygula, tartışma yok.

Aşağıda verdiğim akış **tek doğru yol**.

---

# 0) MySQL’e root ile gir

```bash
mysql -u root -p
```

---

# 1) Veritabanını TAMAMEN sil ve yeniden oluştur

```sql
DROP DATABASE IF EXISTS quick_ecommerce;
CREATE DATABASE quick_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE quick_ecommerce;
```

---

# 11) Laravel cache temizle

```bash
cd /var/www/quikecommerce/backend-laravel
php artisan optimize:clear
php artisan permission:cache-reset || true
systemctl restart php8.4-fpm
systemctl restart nginx
```

---

#####


4) Prod’da yeniden çalıştırma adımları (Laravel + Next)

Aşağıdaki sırayla ilerleyin.

Laravel backend
cd /var/www/.../backend-laravel   # sizdeki gerçek path
php artisan down || true

php artisan optimize:clear

composer install --no-dev -o

php artisan migrate --force

php artisan config:cache
php artisan route:cache

php artisan up
sudo systemctl reload php8.*-fpm || true
sudo systemctl reload nginx

###








root@srv1275633:/var/www/quikecommerce/backend-laravel# cd /var/www/quikecommerce/backend-laravel

php artisan about | sed -n '1,160p'
php artisan tinker --execute="dump(config('database.default')); dump(config('database.connections.mysql.database'));"
php -r "require 'vendor/autoload.php'; \$app=require 'bootstrap/app.php'; \$kernel=\$app->make(Illuminate\Contracts\Console\Kernel::class); \$kernel->bootstrap(); echo 'default='.config('database.default').PHP_EOL; echo 'db='.config('database.connections.mysql.database').PHP_EOL;"

  Environment ...................................................................................................................  
  Application Name ............................................................................................... quickecommerce  
  Laravel Version ....................................................................................................... 12.47.0  
  PHP Version ............................................................................................................ 8.4.11  
  Composer Version ........................................................................................................ 2.8.8  
  Environment ........................................................................................................ production  
  Debug Mode ................................................................................................................ OFF  
  URL ................................................................................................... api.guezelwebdesign.com  
  Maintenance Mode .......................................................................................................... OFF  
  Timezone .................................................................................................................. UTC  
  Locale ..................................................................................................................... tr  

  Cache .........................................................................................................................  
  Config ............................................................................................................. NOT CACHED  
  Events ............................................................................................................. NOT CACHED  
  Routes ............................................................................................................. NOT CACHED  
  Views .............................................................................................................. NOT CACHED  

  Drivers .......................................................................................................................  
  Broadcasting ............................................................................................................. null  
  Cache .................................................................................................................... file  
  Database ................................................................................................................ mysql  
  Logs ........................................................................................................... stack / single  
  Mail ...................................................................................................................... log  
  Queue ................................................................................................................ database  
  Session .............................................................................................................. database  

  Storage .......................................................................................................................  
  public/storage ......................................................................................................... LINKED  

  Laravel-Modules ...............................................................................................................  
  Version .............................................................................................................. v11.1.10  

  Spatie Permissions ............................................................................................................  
  Features Enabled ...................................................................................................... Default  
  Version ................................................................................................................ 6.24.0  

"mysql" // vendor/psy/psysh/src/ExecutionClosure.php(41) : eval()'d code:1
"quick_ecommerce" // vendor/psy/psysh/src/ExecutionClosure.php(41) : eval()'d code:2
default=mysql
db=quick_ecommerce
root@srv1275633:/var/www/quikecommerce/backend-laravel# 
