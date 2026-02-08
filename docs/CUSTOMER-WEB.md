# Customer Web (Next.js) - Geliştirici Rehberi

## Gereksinimler

- Node.js 20.9.0+
- npm 10+ veya yarn 4+
- Backend API çalışıyor olmalı

---

## Node.js Kurulumu (Ubuntu)

```bash
# nvm ile Node.js kurulumu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js 22 kur
nvm install 22
nvm use 22

# Versiyonları kontrol et
node --version  # v22.x.x
npm --version   # 10.x.x
```

---

## Local Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd /home/orhan/Documents/quickecommerce/customer-web-nextjs

# Cache temizle (opsiyonel)
rm -rf .next node_modules

# Paketleri indir
npm install
```

### 2. Konfigürasyon

`.env.local` dosyasında API URL'i ayarla:

```env
# API
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3003

# Language
NEXT_PUBLIC_DEFAULT_LANGUAGE=tr
NEXT_PUBLIC_AVAILABLE_LANGUAGES=tr,en

# Image Host
NEXT_IMAGE_HOST=sportoonline.com
```

### 3. Development Server Başlat

```bash
# Dev mode (Turbopack ile - daha hızlı)
npm run dev

# veya Turbopack olmadan
npm run dev:no-turbo
```

Müşteri sitesi şu adreste çalışacak: `http://localhost:3003`

---

## Sık Kullanılan Komutlar

### Geliştirme

```bash
# Dev server başlat (port 3003)
npm run dev

# Type checking
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### Build

```bash
# Production build
npm run build

# Production build'i lokal test et
npm run start
```

Build çıktısı: `.next/` klasöründe

### Temizlik

```bash
# Tüm cache temizle
rm -rf .next node_modules

# Paketleri yeniden indir
npm install

# Next.js cache temizle
rm -rf .next
```

### Paket Yönetimi

```bash
# Paketleri güncelle
npm update

# Outdated paketleri kontrol et
npm outdated

# Yeni paket ekle
npm install package-name
```

---

## Proje Yapısı

```
customer-web-nextjs/
├── src/
│   ├── app/
│   │   ├── [locale]/              # i18n route grubu
│   │   │   ├── (auth)/            # Auth route grubu
│   │   │   │   ├── giris/         # Login sayfası
│   │   │   │   └── kayit/         # Register sayfası
│   │   │   ├── sepet/             # Cart sayfası
│   │   │   ├── urun/[slug]/       # Product detail
│   │   │   ├── kategori/[slug]/   # Category
│   │   │   └── layout.tsx         # Locale layout
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles + CSS variables
│   ├── components/
│   │   ├── layout/                # Header, Footer, MobileNav
│   │   ├── ui/                    # Shadcn UI components
│   │   ├── providers/             # ThemeProvider, Toaster
│   │   └── shared/                # Paylaşılan componentler
│   ├── modules/
│   │   ├── site/                  # Site info, menu, categories
│   │   ├── auth/                  # Authentication
│   │   ├── product/               # Product queries
│   │   └── [module]/
│   │       ├── [module].action.ts    # React Query hooks
│   │       ├── [module].service.ts   # API calls
│   │       ├── [module].type.ts      # TypeScript types
│   │       └── [module].schema.ts    # Zod schemas
│   ├── stores/
│   │   ├── cart-store.ts          # Zustand cart store
│   │   └── auth-store.ts          # Zustand auth store
│   ├── lib/
│   │   ├── base-service.ts        # Base API service
│   │   └── utils.ts               # Utility functions
│   ├── config/
│   │   └── routes.ts              # Route constants
│   ├── endpoints/
│   │   └── api-endpoints.ts       # API endpoint constants
│   └── i18n/
│       └── routing.ts             # next-intl routing config
├── public/
│   └── locales/
│       ├── tr.json                # Turkish translations
│       └── en.json                # English translations
├── tailwind.config.ts             # Tailwind config + theme
├── next.config.ts                 # Next.js config
└── package.json
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand (cart, auth) + Redux Toolkit
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: react-hook-form + Zod validation
- **i18n**: next-intl (TR, EN)
- **Icons**: Lucide React
- **HTTP**: Axios

---

## Production Deployment

### 1. Build Al

```bash
cd /home/orhan/Documents/quickecommerce/customer-web-nextjs

# Production build
npm run build

# Build'i test et
npm run start
```

### 2. PM2 ile Çalıştırma

```bash
# PM2 ile başlat
pm2 start npm --name "customer-web" -- start

# Auto-restart enable
pm2 startup
pm2 save

# Logs
pm2 logs customer-web
```

### 3. Nginx Reverse Proxy

Nginx konfigürasyonu:

```nginx
server {
    listen 80;
    server_name sportoonline.com www.sportoonline.com;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js static assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3003;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Hata Ayıklama

### Type Errors

```bash
# TypeScript kontrol
npx tsc --noEmit

# veya
npm run type-check
```

### Build Hatası

```bash
# Detaylı build log
npm run build -- --debug

# Cache temizle
rm -rf .next
npm run build
```

### CORS Sorunları

Backend'de CORS ayarlarını kontrol et. Next.js client-side'da API'ye istek atarken CORS hatası alabilir.

`backend-laravel/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3003', 'https://sportoonline.com'],
```

---

## Environment Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| NEXT_PUBLIC_REST_API_ENDPOINT | Backend API URL | http://localhost:8000/api/v1 |
| NEXT_PUBLIC_SITE_URL | Site URL | http://localhost:3003 |
| NEXT_PUBLIC_DEFAULT_LANGUAGE | Varsayılan dil | tr |
| NEXT_PUBLIC_AVAILABLE_LANGUAGES | Aktif diller | tr,en |
| NEXT_IMAGE_HOST | next/image remote host | sportoonline.com |

---

## Dynamic Theme System

Header, footer ve diğer componentlerde CSS variables kullanılıyor:

```css
/* globals.css */
--primary: 214 82% 51%;        /* Backend'den geliyor */
--secondary: 210 90% 46%;
--header-topbar-bg: 222 84% 5%;
--header-nav-bg: 217 91% 60%;
```

**ThemeProvider** backend'den tema renklerini çekip bu CSS variables'ları dinamik ayarlıyor.

Backend'de tema ayarı: Admin Panel → Settings → Theme

---

## i18n (Çoklu Dil)

- **Static UI strings**: `public/locales/tr.json`, `public/locales/en.json`
- **Dynamic content**: Backend API `?language=tr|en` parametresi

Yeni key eklemek için:
1. `public/locales/tr.json` ve `en.json`'a ekle
2. Componentte kullan:
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations();
t('nav.all_categories'); // "Tüm Kategoriler"
```

---

## Module Pattern

Her module için 4 dosya:
- `[name].action.ts` - React Query hooks (useQuery, useMutation)
- `[name].service.ts` - API çağrıları (Axios)
- `[name].type.ts` - TypeScript types
- `[name].schema.ts` - Zod validation schemas

Örnek:
```
modules/product/
├── product.action.ts
├── product.service.ts
├── product.type.ts
└── product.schema.ts
```

---

## Sık Sorulan Sorular

### Hydration Error?

Zustand persist kullanıyorsanız:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return null; // veya skeleton
```

### Image CORS Error?

`next.config.ts`'de remote host ekle:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'sportoonline.com' }
  ]
}
```

### Build yavaş?

```bash
# Turbopack ile dev (daha hızlı)
npm run dev

# Production build parallel build kullanır
npm run build
```
