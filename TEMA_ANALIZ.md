# 🎨 QuickEcommerce Tema Sistemi Analizi

## Backend Tema Yapısı

### Tema Kayıt Yeri
- **Tablo**: `setting_options`
- **Format**: JSON (option_value sütununda)
- **Seeder**: `/backend-laravel/database/seeders/ThemeSeeder.php`
- **Config**: `/backend-laravel/config/themes.php`

### Mevcut Temalar

#### 1. Theme One (Premium Theme)
**Slug**: `theme_one`

**Stil Ayarları**:
```json
{
  "colors": {
    "primary": "#1A73E8",
    "secondary": "#0e5abc"
  }
}
```

**Header**:
- `header_number`: "01"

**Footer**:
```json
{
  "background_color": "#0d166d",
  "text_color": "#ffffff",
  "layout_columns": 3
}
```

#### 2. Theme Two (Classic Theme)
**Slug**: `theme_two`

**Stil Ayarları**:
```json
{
  "colors": {
    "primary": "#10B981",
    "secondary": "#059669"
  }
}
```

**Header**:
- `header_number`: "02"

**Footer**:
```json
{
  "background_color": "#1e293b",
  "text_color": "#ffffff",
  "layout_columns": 4
}
```

---

## Tema Sayfaları Yapısı (Her İki Tema İçin Ortak)

### 1. Ana Sayfa (`theme_home_page`)

```json
{
  "slider": [{"enabled_disabled": "on"}],
  "category": [{"title": "Kategoriler", "enabled_disabled": "on"}],
  "flash_sale": [{"title": "Fırsat Ürünleri", "enabled_disabled": "on"}],
  "product_featured": [{"title": "Öne Çıkan Ürünler", "enabled_disabled": "on"}],
  "banner_section": [{"enabled_disabled": "on"}],
  "product_top_selling": [{"title": "En Çok Satanlar", "enabled_disabled": "on"}],
  "product_latest": [{"title": "Yeni Ürünler", "enabled_disabled": "on"}],
  "popular_product_section": [{"title": "Popüler Ürünler", "enabled_disabled": "on"}],
  "top_stores_section": [{"title": "Popüler Mağazalar", "enabled_disabled": "on"}],
  "newsletters_section": [{
    "title": "Bültene Abone Olun",
    "subtitle": "En yeni ürünler ve kampanyalardan haberdar olun.",
    "enabled_disabled": "on"
  }]
}
```

### 2. Giriş Sayfası (`theme_login_page`)

**Müşteri Girişi**:
```json
{
  "customer": [{
    "title": "Giriş Yap",
    "subtitle": "Alışverişe Devam Et",
    "enabled_disabled": "on",
    "image_id": null,
    "img_url": ""
  }],
  "admin": [{
    "title": "Yönetici Girişi",
    "subtitle": "Kontrol Paneli",
    "image_id": null,
    "img_url": ""
  }]
}
```

### 3. Kayıt Sayfası (`theme_register_page`)

```json
{
  "title": "Hemen Kayıt Olun!",
  "subtitle": "Harika Bir Alışveriş Deneyimi İçin Katılın",
  "description": "Birçok mağazadan geniş ürün yelpazesini keşfedin, güvenli alışveriş yapın.",
  "terms_page_title": "Kullanım Koşulları",
  "terms_page_url": "/kullanim-kosullari",
  "social_login_enable_disable": "on",
  "image_id": null,
  "img_url": ""
}
```

### 4. Ürün Detay Sayfası (`theme_product_details_page`)

```json
{
  "delivery_title": "Ücretsiz Kargo",
  "delivery_subtitle": "Türkiye genelinde ücretsiz kargo.",
  "delivery_url": null,
  "delivery_enabled_disabled": "on",
  "refund_title": "Kolay İade & Değişim",
  "refund_subtitle": "30 gün içinde iade hakkı.",
  "refund_url": null,
  "refund_enabled_disabled": "on",
  "related_title": "Benzer Ürünler"
}
```

### 5. Blog Sayfası (`theme_blog_page`)

```json
{
  "popular_title": "Popüler Yazılar",
  "related_title": "İlgili Yazılar"
}
```

---

## Backend API Endpoint'leri

### Admin Panel API'leri
```
GET  /v1/admin/system-management/themes/list      → Tüm temaları listele
GET  /v1/admin/system-management/themes/details   → Tema detayları
POST /v1/admin/system-management/themes/store     → Tema güncelle
POST /v1/admin/system-management/themes/activate  → Temayı aktif et
```

### Frontend API
```
GET /v1/theme → Aktif tema verilerini getir (Customer web için)
```

**Controller**: `App\Http\Controllers\Api\V1\Admin\ThemeManageController::activeThemeData()`

**Response Formatı**:
```json
{
  "theme_data": {
    "name": "Premium Theme",
    "slug": "theme_one",
    "description": "Complete premium e-commerce theme",
    "version": "2.0",
    "theme_style": [...],
    "theme_header": [...],
    "theme_footer": [...],
    "theme_pages": [...]
  },
  "translations": [...]
}
```

---

## Customer Web (Next.js) Tema Entegrasyonu

### Mevcut Yapı

#### 1. Tema Tipleri
**Dosya**: `/customer-web-nextjs/src/modules/theme/theme.type.ts`

```typescript
export interface ThemeColors {
  primary: string;
  secondary: string;
}

export interface ThemeStyle {
  colors: ThemeColors[];
}

export interface ThemeHeader {
  header_number: string;
}

export interface ThemeFooter {
  background_color: string;
  text_color: string;
  layout_columns: number;
}

export interface ThemeData {
  name: string;
  slug: string;
  description?: string;
  version?: string;
  theme_style: ThemeStyle[];
  theme_header: ThemeHeader[];
  theme_footer: ThemeFooter[];
  theme_pages?: any[];
}

export interface ThemeResponse {
  theme_data: ThemeData;
  translations?: any;
}
```

#### 2. Tema Servisi
**Dosya**: `/customer-web-nextjs/src/modules/theme/theme.service.ts`

```typescript
export function useThemeQuery() {
  return useQuery({
    queryKey: ["theme"],
    queryFn: async () => {
      const res = await api.get<ThemeResponse>(API_ENDPOINTS.THEME);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
}
```

#### 3. Tema Provider
**Dosya**: `/customer-web-nextjs/src/components/providers/theme-provider.tsx`

**Görevleri**:
- Backend'den aktif tema verilerini çeker
- Hex renkleri HSL formatına dönüştürür
- CSS custom properties olarak root element'e ekler

**CSS Variables**:
```css
--primary             → Primary color (HSL)
--ring                → Primary color (HSL)
--primary-foreground  → Primary text color
--accent              → Secondary color (HSL)
--accent-foreground   → Accent text color
--header-nav-bg       → Header navigation background
--header-nav-text     → Header navigation text
--header-topbar-bg    → Header topbar background (sabit)
--header-topbar-text  → Header topbar text (sabit)
--footer-background   → Footer background
--footer-foreground   → Footer text
```

---

## Customer Web İçin Yapılması Gerekenler

### 1. Tema Page Ayarlarını Kullanma

#### TypeScript Tipleri Genişletme
`theme.type.ts` dosyasına eklenecek:

```typescript
export interface ThemeHomePageSection {
  title?: string;
  subtitle?: string;
  enabled_disabled: "on" | "off";
}

export interface ThemeHomePage {
  slider?: ThemeHomePageSection[];
  category?: ThemeHomePageSection[];
  flash_sale?: ThemeHomePageSection[];
  product_featured?: ThemeHomePageSection[];
  banner_section?: ThemeHomePageSection[];
  product_top_selling?: ThemeHomePageSection[];
  product_latest?: ThemeHomePageSection[];
  popular_product_section?: ThemeHomePageSection[];
  top_stores_section?: ThemeHomePageSection[];
  newsletters_section?: ThemeHomePageSection[];
}

export interface ThemeLoginPage {
  customer?: Array<{
    title: string;
    subtitle: string;
    enabled_disabled: "on" | "off";
    image_id?: number | null;
    img_url?: string;
  }>;
  admin?: Array<{
    title: string;
    subtitle: string;
    image_id?: number | null;
    img_url?: string;
  }>;
}

export interface ThemeRegisterPage {
  title: string;
  subtitle: string;
  description: string;
  terms_page_title: string;
  terms_page_url: string;
  social_login_enable_disable: "on" | "off";
  image_id?: number | null;
  img_url?: string;
}

export interface ThemeProductDetailsPage {
  delivery_title: string;
  delivery_subtitle: string;
  delivery_url?: string | null;
  delivery_enabled_disabled: "on" | "off";
  refund_title: string;
  refund_subtitle: string;
  refund_url?: string | null;
  refund_enabled_disabled: "on" | "off";
  related_title: string;
}

export interface ThemeBlogPage {
  popular_title: string;
  related_title: string;
}

export interface ThemePages {
  theme_home_page?: ThemeHomePage[];
  theme_login_page?: ThemeLoginPage[];
  theme_register_page?: ThemeRegisterPage[];
  theme_product_details_page?: ThemeProductDetailsPage[];
  theme_blog_page?: ThemeBlogPage[];
}

// ThemeData interface'ini güncelle
export interface ThemeData {
  name: string;
  slug: string;
  description?: string;
  version?: string;
  theme_style: ThemeStyle[];
  theme_header: ThemeHeader[];
  theme_footer: ThemeFooter[];
  theme_pages?: ThemePages[];
}
```

### 2. Hook Oluşturma (Tema Verilerine Kolay Erişim)

**Yeni dosya**: `/customer-web-nextjs/src/modules/theme/use-theme-config.ts`

```typescript
"use client";

import { useThemeQuery } from "./theme.service";

export function useThemeConfig() {
  const { data, isLoading, error } = useThemeQuery();

  const themeData = data?.theme_data;
  const themePages = themeData?.theme_pages?.[0];

  return {
    // Genel tema bilgileri
    themeName: themeData?.name,
    themeSlug: themeData?.slug,

    // Stil bilgileri
    colors: themeData?.theme_style?.[0]?.colors?.[0],

    // Header/Footer
    header: themeData?.theme_header?.[0],
    footer: themeData?.theme_footer?.[0],

    // Sayfa ayarları
    homePage: themePages?.theme_home_page?.[0],
    loginPage: themePages?.theme_login_page?.[0],
    registerPage: themePages?.theme_register_page?.[0],
    productDetailsPage: themePages?.theme_product_details_page?.[0],
    blogPage: themePages?.theme_blog_page?.[0],

    // State
    isLoading,
    error,
  };
}
```

### 3. Kullanım Örnekleri

#### Ana Sayfa Bileşenleri
```typescript
"use client";

import { useThemeConfig } from "@/modules/theme/use-theme-config";

export function HomePage() {
  const { homePage } = useThemeConfig();

  return (
    <>
      {/* Slider gösterimi kontrolü */}
      {homePage?.slider?.[0]?.enabled_disabled === "on" && (
        <HeroSlider />
      )}

      {/* Kategoriler */}
      {homePage?.category?.[0]?.enabled_disabled === "on" && (
        <CategoriesSection title={homePage.category[0].title} />
      )}

      {/* Fırsat Ürünleri */}
      {homePage?.flash_sale?.[0]?.enabled_disabled === "on" && (
        <FlashSaleSection title={homePage.flash_sale[0].title} />
      )}

      {/* Öne Çıkan Ürünler */}
      {homePage?.product_featured?.[0]?.enabled_disabled === "on" && (
        <FeaturedProducts title={homePage.product_featured[0].title} />
      )}

      {/* Banner Bölümü */}
      {homePage?.banner_section?.[0]?.enabled_disabled === "on" && (
        <BannerSection />
      )}

      {/* En Çok Satanlar */}
      {homePage?.product_top_selling?.[0]?.enabled_disabled === "on" && (
        <TopSellingProducts title={homePage.product_top_selling[0].title} />
      )}

      {/* Yeni Ürünler */}
      {homePage?.product_latest?.[0]?.enabled_disabled === "on" && (
        <LatestProducts title={homePage.product_latest[0].title} />
      )}

      {/* Popüler Ürünler */}
      {homePage?.popular_product_section?.[0]?.enabled_disabled === "on" && (
        <PopularProducts title={homePage.popular_product_section[0].title} />
      )}

      {/* Popüler Mağazalar */}
      {homePage?.top_stores_section?.[0]?.enabled_disabled === "on" && (
        <TopStores title={homePage.top_stores_section[0].title} />
      )}

      {/* Newsletter */}
      {homePage?.newsletters_section?.[0]?.enabled_disabled === "on" && (
        <Newsletter
          title={homePage.newsletters_section[0].title}
          subtitle={homePage.newsletters_section[0].subtitle}
        />
      )}
    </>
  );
}
```

#### Giriş Sayfası
```typescript
"use client";

import { useThemeConfig } from "@/modules/theme/use-theme-config";

export function LoginPage() {
  const { loginPage } = useThemeConfig();

  const customerLogin = loginPage?.customer?.[0];

  return (
    <div className="login-container">
      {customerLogin?.enabled_disabled === "on" && (
        <>
          <h1>{customerLogin.title}</h1>
          <p>{customerLogin.subtitle}</p>
          {customerLogin.img_url && (
            <img src={customerLogin.img_url} alt="Login" />
          )}
          {/* Login form */}
        </>
      )}
    </div>
  );
}
```

#### Kayıt Sayfası
```typescript
"use client";

import { useThemeConfig } from "@/modules/theme/use-theme-config";

export function RegisterPage() {
  const { registerPage } = useThemeConfig();

  return (
    <div className="register-container">
      <h1>{registerPage?.title}</h1>
      <p className="subtitle">{registerPage?.subtitle}</p>
      <p className="description">{registerPage?.description}</p>

      {/* Register form */}

      {registerPage?.social_login_enable_disable === "on" && (
        <SocialLoginButtons />
      )}

      <a href={registerPage?.terms_page_url}>
        {registerPage?.terms_page_title}
      </a>
    </div>
  );
}
```

#### Ürün Detay Sayfası
```typescript
"use client";

import { useThemeConfig } from "@/modules/theme/use-theme-config";

export function ProductDetailsPage() {
  const { productDetailsPage } = useThemeConfig();

  return (
    <div className="product-details">
      {/* Product info */}

      {/* Delivery info */}
      {productDetailsPage?.delivery_enabled_disabled === "on" && (
        <div className="delivery-info">
          <h3>{productDetailsPage.delivery_title}</h3>
          <p>{productDetailsPage.delivery_subtitle}</p>
        </div>
      )}

      {/* Refund info */}
      {productDetailsPage?.refund_enabled_disabled === "on" && (
        <div className="refund-info">
          <h3>{productDetailsPage.refund_title}</h3>
          <p>{productDetailsPage.refund_subtitle}</p>
        </div>
      )}

      {/* Related products */}
      <RelatedProducts title={productDetailsPage?.related_title} />
    </div>
  );
}
```

---

## Özet: Customer Web İçin Yapılacaklar

### ✅ Tamamlanmış
1. ✅ Backend API endpoint (`/v1/theme`)
2. ✅ Tema servisi (React Query)
3. ✅ Tema provider (CSS variables)
4. ✅ Temel tip tanımları

### 🔨 Yapılacaklar
1. [ ] `theme.type.ts` dosyasını genişlet (page types ekle)
2. [ ] `use-theme-config.ts` hook'unu oluştur
3. [ ] Ana sayfa bileşenlerinde tema ayarlarını kullan
4. [ ] Giriş/kayıt sayfalarında tema ayarlarını kullan
5. [ ] Ürün detay sayfasında tema ayarlarını kullan
6. [ ] Blog sayfasında tema ayarlarını kullan
7. [ ] Header bileşeninde `header_number` kontrolü ekle
8. [ ] Footer bileşeninde `layout_columns` kontrolü ekle

---

## Notlar

- **Çoklu dil desteği**: Backend'den `translations` objesi de geliyor, gerekirse kullanılabilir
- **Cache stratejisi**: Tema verileri 5 dakika cache'leniyor
- **Admin panel**: Tema yönetimi `http://localhost:3000/tr/admin/system-management/themes` adresinde
- **Aktif tema**: `config/themes.php` dosyasında `active_theme` ile belirleniyor
