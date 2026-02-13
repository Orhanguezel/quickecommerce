export const ROUTES = {
  HOME: "/",

  // Auth
  LOGIN: "/giris",
  REGISTER: "/kayit",
  FORGOT_PASSWORD: "/sifremi-unuttum",
  SELLER_REGISTER: "/satici-basvuru",

  // Products
  PRODUCTS: "/urunler",
  PRODUCT_DETAIL: (slug: string) => `/urun/${slug}`,
  CATEGORIES: "/kategoriler",
  CATEGORY: (slug: string) => `/kategori/${slug}`,
  BRAND: (slug: string) => `/marka/${slug}`,
  SEARCH: "/ara",

  // Blog
  BLOG: "/blog",
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,

  // Stores
  STORES: "/magazalar",
  STORE_DETAIL: (slug: string) => `/magaza/${slug}`,

  // Static Pages
  ABOUT: "/hakkimizda",
  CONTACT: "/iletisim",
  TERMS: "/kullanim-kosullari",
  PRIVACY: "/gizlilik-politikasi",
  COUPONS: "/kuponlar",

  // Customer (Protected)
  PROFILE: "/hesabim",
  ORDERS: "/siparislerim",
  ORDER_DETAIL: (id: string) => `/siparis/${id}`,
  WISHLIST: "/favorilerim",
  ADDRESSES: "/adreslerim",
  WALLET: "/cuzdan",
  SUPPORT: "/destek",

  // Cart & Checkout
  CART: "/sepet",
  CHECKOUT: "/odeme",
  ORDER_SUCCESS: "/siparis-basarili",
} as const;
