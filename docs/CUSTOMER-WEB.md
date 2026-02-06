# Customer Web (Flutter) - Geliştirici Rehberi

## Gereksinimler

- Flutter SDK 3.19+
- Dart 3.3+
- Chrome (web geliştirme için)
- Backend API çalışıyor olmalı

---

## Flutter Kurulumu (Ubuntu)

```bash
# Snap ile Flutter kurulumu
sudo snap install flutter --classic

# Flutter Doctor ile kontrol
flutter doctor

# Web desteğini etkinleştir
flutter config --enable-web
```

---

## Local Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd /home/orhan/Documents/quickecommerce/customer-app-and-web-flutter

# Cache temizle (opsiyonel)
flutter clean

# Paketleri indir
flutter pub get
```

### 2. Konfigürasyon

`lib/core/utils/app_constants.dart` dosyasında API URL'i ayarla:

```dart
class AppConstants {
  static const String baseUrl = 'http://127.0.0.1:8000';
  // ...
}
```

### 3. Web Sunucusu Başlat

```bash
# Chrome'da aç
flutter run -d chrome

# veya web-server modunda (headless)
flutter run -d web-server --web-hostname 127.0.0.1 --web-port 3001

# HTML renderer ile (daha hızlı)
flutter run -d web-server --web-renderer html --web-hostname 127.0.0.1 --web-port 3001



```

Müşteri sitesi şu adreste çalışacak: `http://127.0.0.1:3001`

---

## Sık Kullanılan Komutlar

### Geliştirme

```bash
# Web'de çalıştır
flutter run -d chrome

# Hot reload ile debug
flutter run -d chrome --debug

# Belirli portta çalıştır
flutter run -d web-server --web-port 3001
```

### Build

```bash
# Web build (production)
flutter build web --release

# HTML renderer ile (daha küçük boyut)
flutter build web --release --web-renderer html

# CanvasKit ile (daha iyi performans)
flutter build web --release --web-renderer canvaskit
```

Build çıktısı: `build/web/` klasöründe

### Temizlik

```bash
# Tüm cache temizle
flutter clean

# Paketleri yeniden indir
flutter pub get

# Build klasörünü sil
rm -rf build/
```

### Paket Yönetimi

```bash
# Paketleri güncelle
flutter pub upgrade

# Outdated paketleri kontrol et
flutter pub outdated

# pubspec.lock'u yenile
rm pubspec.lock && flutter pub get
```

---

## Proje Yapısı

```
customer-app-and-web-flutter/
├── lib/
│   ├── core/
│   │   ├── api/              # API client ve interceptor'lar
│   │   ├── constants/        # Sabitler
│   │   ├── theme/            # Tema ayarları
│   │   └── utils/            # Yardımcı fonksiyonlar
│   ├── features/
│   │   ├── auth/             # Kimlik doğrulama
│   │   ├── cart/             # Sepet
│   │   ├── checkout/         # Ödeme
│   │   ├── home/             # Ana sayfa
│   │   ├── orders/           # Siparişler
│   │   ├── product/          # Ürün detay
│   │   ├── profile/          # Kullanıcı profili
│   │   └── search/           # Arama
│   ├── models/               # Veri modelleri
│   ├── providers/            # State yönetimi (Provider/Riverpod)
│   ├── widgets/              # Paylaşılan widget'lar
│   └── main.dart             # Uygulama giriş noktası
├── assets/
│   ├── images/               # Görseller
│   ├── icons/                # İkonlar
│   └── fonts/                # Fontlar
├── web/
│   ├── index.html            # Web giriş noktası
│   └── manifest.json         # PWA manifest
├── pubspec.yaml              # Paket bağımlılıkları
└── l10n.yaml                 # Lokalizasyon ayarları
```

---

## Production Deployment

### 1. Build Al

```bash
cd /home/orhan/Documents/quickecommerce/customer-app-and-web-flutter

flutter clean
flutter pub get
flutter build web --release --web-renderer html
```

### 2. Nginx ile Sunma

Build çıktısını web sunucusuna kopyala:

```bash
# Sunucuya kopyala
scp -r build/web/* user@server:/var/www/customer-web/
```

Nginx konfigürasyonu:

```nginx
server {
    listen 80;
    server_name customer.example.com;

    root /var/www/customer-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Flutter assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Hata Ayıklama

### Flutter Doctor

```bash
flutter doctor -v
```

### Paket Sorunları

```bash
# Cache temizle
flutter pub cache clean

# Yeniden indir
flutter pub get
```

### Web Build Sorunları

```bash
# Detaylı build
flutter build web --release --verbose

# Source map ile build (debug için)
flutter build web --source-maps
```

### CORS Sorunları

Backend'de CORS ayarlarını kontrol et. Flutter web localhost'tan API'ye istek atarken CORS hatası alabilir.

---

## Web Renderer Karşılaştırması

| Özellik | HTML | CanvasKit |
|---------|------|-----------|
| Boyut | Küçük (~2MB) | Büyük (~4MB) |
| İlk yükleme | Hızlı | Yavaş |
| Performans | Orta | Yüksek |
| Metin kalitesi | Native | Tutarlı |
| SEO | İyi | Kötü |

**Öneri:** Genel kullanım için `--web-renderer html` tercih edin.

---

## Ortam Değişkenleri

`--dart-define` ile build-time değişkenler:

```bash
flutter build web --release \
  --dart-define=API_URL=https://api.example.com \
  --dart-define=ENV=production
```

Kod içinde kullanım:

```dart
const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:8000');
```
