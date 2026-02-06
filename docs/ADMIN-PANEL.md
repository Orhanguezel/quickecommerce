# Admin Panel (Next.js) - Geliştirici Rehberi

## Gereksinimler

- Node.js 18+ (önerilen: 20.x)
- npm 9+ veya bun
- Backend API çalışıyor olmalı

---

## Local Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd /home/orhan/Documents/quickecommerce/admin-panel

# npm ile
npm install --legacy-peer-deps

# veya bun ile (daha hızlı)
bun install
```

### 2. .env.local Dosyası

```bash
cp .env.example .env.local
```

`.env.local` içeriği:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Geliştirme Sunucusu

```bash
# npm ile
npm run dev

# veya bun ile
bun run dev
```

Admin panel şu adreste çalışacak: `http://localhost:3000`

---

## Sık Kullanılan Komutlar

### Geliştirme

```bash
# Dev server başlat
npm run dev

# Lint kontrolü
npm run lint

# Type kontrolü
npm run type-check
```

### Build

```bash
# Production build
npm run build

# Build sonrası başlat
npm run start
```

### Temiz Kurulum

```bash
# node_modules ve build cache sil
rm -rf node_modules .next

# Yeniden yükle
npm install --legacy-peer-deps

# Build
npm run build
```

---

## Production (PM2)

### PM2 ile Başlatma

```bash
cd /home/orhan/Documents/quickecommerce/admin-panel

# Build al
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.cjs

# veya doğrudan
pm2 start npm --name "quickecommerce-admin" -- start
```

### PM2 Komutları

```bash
# Durumu kontrol et
pm2 status

# Logları izle
pm2 logs quickecommerce-admin

# Yeniden başlat
pm2 restart quickecommerce-admin

# Reload (zero-downtime)
pm2 reload quickecommerce-admin

# Durdur
pm2 stop quickecommerce-admin

# Sil
pm2 delete quickecommerce-admin

# Kaydet (sistem başlangıcında otomatik başlat)
pm2 save
pm2 startup
```

### ecosystem.config.cjs

```javascript
module.exports = {
  apps: [
    {
      name: 'quickecommerce-admin',
      cwd: '/var/www/quikecommerce/admin-panel/deploy',
      script: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: '450M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};
```

---

## Proje Yapısı

```
admin-panel/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── [lang]/          # Dil bazlı routing (tr, en)
│   │   │   ├── dashboard/   # Dashboard sayfası
│   │   │   ├── products/    # Ürün yönetimi
│   │   │   ├── orders/      # Sipariş yönetimi
│   │   │   ├── stores/      # Mağaza yönetimi
│   │   │   └── settings/    # Ayarlar
│   │   └── layout.tsx       # Ana layout
│   ├── components/          # React bileşenleri
│   │   ├── ui/              # UI bileşenleri
│   │   └── shared/          # Paylaşılan bileşenler
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Yardımcı fonksiyonlar
│   ├── services/            # API servisleri
│   ├── store/               # State yönetimi (Zustand)
│   └── types/               # TypeScript tipleri
├── public/                  # Statik dosyalar
├── .env.local               # Ortam değişkenleri
├── ecosystem.config.cjs     # PM2 konfigürasyonu
├── next.config.js           # Next.js konfigürasyonu
├── package.json
├── tailwind.config.js       # Tailwind CSS konfigürasyonu
└── tsconfig.json            # TypeScript konfigürasyonu
```

---

## Hata Ayıklama

### Build Hataları

```bash
# Cache temizle
rm -rf .next

# Type kontrolü
npm run type-check

# Yeniden build
npm run build
```

### API Bağlantı Sorunları

1. Backend çalışıyor mu kontrol et: `curl http://127.0.0.1:8000/api/health`
2. `.env.local` içindeki API URL'i doğru mu?
3. CORS ayarları doğru mu?

### PM2 Sorunları

```bash
# Hata loglarını kontrol et
pm2 logs quickecommerce-admin --err --lines 50

# Süreci yeniden başlat
pm2 restart quickecommerce-admin

# Tüm süreçleri sil ve yeniden başlat
pm2 delete all
pm2 start ecosystem.config.cjs
```

---

## Varsayılan Giriş Bilgileri

| Alan | Değer |
|------|-------|
| URL | http://localhost:3000/tr |
| Email | admin@sportoonline.com |
| Şifre | Admin123! |
