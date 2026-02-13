export interface ThemeColors {
  primary: string;
  secondary: string;
}

export interface ThemeStyle {
  colors: ThemeColors[];
}

export interface ThemeHeader {
  header_number: string;
  // Light mode
  row1_bg?: string;
  row1_text?: string;
  row2_bg?: string;
  row3_bg?: string;
  row3_text?: string;
  row3_button_bg?: string;
  row3_button_text?: string;
  // Dark mode
  dark_row1_bg?: string;
  dark_row1_text?: string;
  dark_row2_bg?: string;
  dark_row3_bg?: string;
  dark_row3_text?: string;
  dark_row3_button_bg?: string;
  dark_row3_button_text?: string;
}

export interface ThemeFooter {
  background_color: string;
  text_color: string;
  dark_background_color?: string;
  dark_text_color?: string;
  layout_columns: number;
}

// Ana Sayfa Bölüm Konfigürasyonu
export interface ThemeSectionConfig {
  title?: string;
  subtitle?: string;
  enabled_disabled: "on" | "off";
}

export interface ThemeSliderSection {
  enabled_disabled: "on" | "off";
}

export interface ThemeBannerSection {
  enabled_disabled: "on" | "off";
}

// Ana Sayfa
export interface ThemeHomePage {
  slider: [ThemeSliderSection];
  category: [ThemeSectionConfig];
  flash_sale: [ThemeSectionConfig];
  product_featured: [ThemeSectionConfig];
  banner_section: [ThemeBannerSection];
  product_top_selling: [ThemeSectionConfig];
  product_latest: [ThemeSectionConfig];
  popular_product_section: [ThemeSectionConfig];
  top_stores_section: [ThemeSectionConfig];
  newsletters_section: [ThemeSectionConfig];
}

// Giriş Sayfası
export interface ThemeLoginCustomer {
  title: string;
  subtitle: string;
  enabled_disabled: "on" | "off";
  image_id: number | null;
  img_url: string;
}

export interface ThemeLoginAdmin {
  title: string;
  subtitle: string;
  image_id?: number | null;
  img_url?: string;
}

export interface ThemeLoginPage {
  customer: [ThemeLoginCustomer];
  admin: [ThemeLoginAdmin];
}

// Kayıt Sayfası
export interface ThemeRegisterPage {
  title: string;
  subtitle: string;
  description: string;
  terms_page_title: string;
  terms_page_url: string;
  social_login_enable_disable: "on" | "off";
  image_id: number | null;
  img_url: string;
}

// Ürün Detay Sayfası
export interface ThemeProductDetailsPage {
  delivery_title: string;
  delivery_subtitle: string;
  delivery_url: string | null;
  delivery_enabled_disabled: "on" | "off";
  refund_title: string;
  refund_subtitle: string;
  refund_url: string | null;
  refund_enabled_disabled: "on" | "off";
  related_title: string;
}

// Blog Sayfası
export interface ThemeBlogPage {
  popular_title: string;
  related_title: string;
}

// Ana Theme Pages Interface
export interface ThemePages {
  theme_home_page: [ThemeHomePage];
  theme_login_page: [ThemeLoginPage];
  theme_register_page: [ThemeRegisterPage];
  theme_product_details_page: [ThemeProductDetailsPage];
  theme_blog_page: [ThemeBlogPage];
}

export interface ThemeData {
  name: string;
  slug: string;
  description?: string;
  version?: string;
  theme_style: ThemeStyle[];
  theme_header: ThemeHeader[];
  theme_footer: ThemeFooter[];
  theme_pages: [ThemePages];
}

export interface ThemeResponse {
  theme_data: ThemeData;
  translations?: any;
}
