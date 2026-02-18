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
  slider_number?: string;
}

export interface ThemeBannerSection {
  enabled_disabled: "on" | "off";
}

export type ThemeHomeBlockType =
  | "slider"
  | "flash_sale"
  | "category"
  | "product_featured"
  | "banner_section"
  | "product_top_selling"
  | "product_latest"
  | "popular_product_section"
  | "blog_section"
  | "top_stores_section"
  | "newsletters_section";

export interface ThemeHomeLayoutBlock {
  id?: string;
  type: ThemeHomeBlockType;
  instance?: number;
  enabled_disabled?: "on" | "off";
  config?: {
    banner_span?: 4 | 6 | 12;
    flash_sale_span?: 4 | 6 | 12;
    blog_span?: 4 | 6 | 12;
    top_stores_span?: 4 | 6 | 12;
  };
}

// Ana Sayfa
export interface ThemeHomePage {
  layout_blocks?: ThemeHomeLayoutBlock[];
  section_order?: string[];
  slider: [ThemeSliderSection];
  category: [ThemeSectionConfig];
  flash_sale: [ThemeSectionConfig];
  product_featured: [ThemeSectionConfig];
  banner_section: [ThemeBannerSection];
  product_top_selling: [ThemeSectionConfig];
  product_latest: [ThemeSectionConfig];
  popular_product_section: [ThemeSectionConfig];
  blog_section: [ThemeSectionConfig];
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
  popular_posts_section?: Array<{
    enabled_disabled: "on" | "off";
    column_span?: 4 | 6 | 12;
  }>;
  related_posts_section?: Array<{
    enabled_disabled: "on" | "off";
    column_span?: 4 | 6 | 12;
  }>;
  list_toolbar_section?: Array<{
    enabled_disabled: "on" | "off";
  }>;
  posts_grid_section?: Array<{
    enabled_disabled: "on" | "off";
    column_span?: 4 | 6 | 12;
  }>;
}

export interface ThemePopupSettingsPage {
  id?: string;
  enabled_disabled: "on" | "off";
  title: string;
  subtitle?: string;
  button_text?: string;
  button_url?: string;
  image_id?: number | string | null;
  image_id_url?: string;
  img_url?: string;
  image_url?: string;
  coupon_code?: string;
  sort_order?: number;
  delay_seconds?: number;
  frequency_days?: number;
  page_target?: "all" | "home";
  display_type?: "modal_center" | "top_bar" | "bottom_bar";
  text_behavior?: "static" | "marquee";
  popup_bg_color?: string;
  popup_text_color?: string;
  popup_button_bg_color?: string;
  popup_button_text_color?: string;
}

export interface ThemeSideBannerSettingsPage {
  id?: string;
  enabled_disabled: "on" | "off";
  title?: string;
  link_url?: string;
  open_in_new_tab?: "on" | "off";
  page_target?: "all" | "home" | "product";
  width_px?: number;
  top_offset_px?: number;
  banner_order?: number;
  dismissible?: "on" | "off";
  dismiss_policy?: "always" | "session" | "days";
  dismiss_days?: number;
}

// Ana Theme Pages Interface
export interface ThemePages {
  theme_home_page: [ThemeHomePage];
  theme_login_page: [ThemeLoginPage];
  theme_register_page: [ThemeRegisterPage];
  theme_product_details_page: [ThemeProductDetailsPage];
  theme_blog_page: [ThemeBlogPage];
  theme_popup_settings?: ThemePopupSettingsPage[];
  theme_side_banner_settings?: ThemeSideBannerSettingsPage[];
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
  translations?: Record<string, { theme_data: ThemeData }>;
}
